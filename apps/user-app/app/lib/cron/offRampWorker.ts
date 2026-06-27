import cron from "node-cron";
import { prisma } from "@repo/db/client";

export function initOffRampReconciliationCron() {
    // Runs every 15 seconds to handle asynchronous withdrawal clearing windows
    cron.schedule("*/15 * * * * *", async () => {
        console.log("🔄 [CRON OFF-RAMP] Sweeping for processing withdrawal requests...");

        try {
            // Audit transactions created more than 20 seconds ago that are stuck in "Processing"
            const timeThreshold = new Date(Date.now() - 20 * 1000);

            const pendingWithdrawals = await prisma.offRampTransaction.findMany({
                where: {
                    status: "Processing",
                    startTime: { lt: timeThreshold }
                }
            });

            for (const tx of pendingWithdrawals) {
                console.log(`🔎 Auditing off-ramp transaction token: ${tx.token}`);

                // Call the specialized off-ramp status node on the bank core server
                const bankResponse = await fetch(`http://localhost:3003/api/mock-bank-core/offramp-status?token=${tx.token}`);
                
                if (!bankResponse.ok) {
                    console.log(`⚠️ Payout API network drop on bank rails for token: ${tx.token}`);
                    continue;
                }

                const bankData = await bankResponse.json();
                const normalizedStatus = bankData.status?.trim().toLowerCase();

                console.log(`🏦 [CRON OFF-RAMP STATE] Bank reports status for ${tx.token.substring(0, 16)}: "${normalizedStatus}"`);

                if (normalizedStatus === "success") {
                    console.log(`⚙️ Executing final ledger adjustment block for token: ${tx.token}`);
                    
                    // 🚀 CASE 1: BANK COMPLETED PAYOUT -> Permanently subtract from locked escrow pool
                    await prisma.$transaction([
                        prisma.balance.update({
                            where: { userId: tx.userId },
                            data: { locked: { decrement: tx.amount } }
                        }),
                        prisma.offRampTransaction.update({
                            where: { id: tx.id },
                            data: { status: "Success" }
                        })
                    ]);
                    console.log(`✅ [OFF-RAMP SETTLED] Cleared locked funds permanently for token: ${tx.token}`);
                } 
                else if (normalizedStatus === "processing") {
                    // Bank clearing engines are still moving money, do nothing and keep it locked
                    console.log(`⏳ Bank network clearing house is still processing settlement for token: ${tx.token}`);
                } 
                else {
                    // 🚀 CASE 2: BANK FAILED/REJECTED -> Execute automated escrow refund sequence
                    console.log(`🚨 Bank settlement failed or rejected. Initiating automated refund to spendable wallet pool...`);
                    
                    await prisma.$transaction([
                        prisma.balance.update({
                            where: { userId: tx.userId },
                            data: { 
                                locked: { decrement: tx.amount },
                                amount: { increment: tx.amount } // Return back to active spendable balance
                            }
                        }),
                        prisma.offRampTransaction.update({
                            where: { id: tx.id },
                            data: { status: "Failure" }
                        })
                    ]);
                    console.log(`❌ [OFF-RAMP REFUNDED] Safe rollback complete. Funds returned to user balance for token: ${tx.token}`);
                }
            }
        } catch (error) {
            console.error("❌ Off-ramp reconciliation worker exception caught:", error);
        }
    });
}