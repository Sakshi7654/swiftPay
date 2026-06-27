// We will change your atomic Prisma transaction block. Instead of just decrementing amount, it will simultaneously increment locked. We will also fire a request to initialize the payout intent with your Express bank routing core server.
"use server"
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { prisma } from "@repo/db/client";

export async function createOffTxnx(amountInRupees: number, provider: string) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
        return {
            status: "error",
            message: "Authentication required.."
        };
    }

    if (amountInRupees <= 0) {
        return {
            status: "error",
            message: "Please enter a valid amount greater than zero."
        };
    }

    const amountInPaisa = amountInRupees * 100;
    const senderId = Number(userId);
    
    // generate a unique tracking token for this off-ramp settlement sequence
    const uniqueToken = "offramp_token_" + Math.random().toString(36).substring(2, 15);

    try {
        await prisma.$transaction(async (tx) => {
            // CONCURRENCY SECURITY: Row-Level Lock
            // Freeze the balance row for this specific user so no other thread can read/write to it 
            // until this transaction block commits or rolls back.
            await tx.$queryRaw`SELECT * FROM "Balance" WHERE "userId" = ${senderId} FOR UPDATE`;

            const currentBalance = await tx.balance.findUnique({
                where: { userId: senderId }
            });

            // DATA INTEGRITY CHECK: Insufficient Budget Warning Guard
            if (!currentBalance || currentBalance.amount < amountInPaisa) {
                throw new Error("Insufficient funds");
            }

            // Deduct the funds from the user's active wallet balance immediately
            // FUND-LOCKING TRANSITION: Move money from spendable to locked holding escrow state

            await tx.balance.update({
                where: { userId: senderId },
                data: { 
                    amount: { decrement: amountInPaisa },
                    locked: { increment: amountInPaisa } // Park money safely
                }
            });

            // Create a tracking ledger entry log marked as "Processing"
            await tx.offRampTransaction.create({
                data: {
                    userId: senderId,
                    amount: amountInPaisa,
                    status: "Processing",
                    provider: provider,
                    token: uniqueToken,
                    startTime: new Date()
                }
            });
        });

        // Notify the external Bank Core server of the payout processing intent
        try {
            const bankResponse = await fetch("http://localhost:3003/api/mock-bank-core/payout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token: uniqueToken,
                    amount: amountInPaisa,
                    userId: senderId
                })
            });

            if (!bankResponse.ok) {
                console.error("⚠️ Bank Core server rejected the payout registration handshake request.");
            }
        } catch (fetchErr) {
            console.error("❌ Outbound banking communication rail offline. Relying on Cron reconciliation fallback.");
        }

        return {
            status: "success",
            message: "Withdrawal request initiated successfully!"
        };

    } catch (error: any) {
        return {
            status: "error",
            message: error.message === "Insufficient funds" 
                ? "You do not have enough money in your wallet balance to complete this withdrawal."
                : "Transaction failed due to an unexpected server processing error."
        };
    }
}