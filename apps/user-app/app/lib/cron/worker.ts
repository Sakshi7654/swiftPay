// import cron from "node-cron";
// import { prisma } from "@repo/db/client";

// export function initReconciliationCron() {
//     // Runs every 15 seconds to handle missing webhook events
//     cron.schedule("*/15 * * * * *", async () => {
//         console.log("🔄 [CRON RECONCILIATION] Sweeping for unconfirmed On-Ramp balances...");

//         try {
//             // Find any OnRamp records created more than 45 seconds ago that are stuck in "Processing"
//             const timeThreshold = new Date(Date.now() - 45 * 1000);

//             const pendingTransactions = await prisma.onRampTransaction.findMany({
//                 where: {
//                     status: "Processing",
//                     startTime: { lt: timeThreshold }
//                 }
//             });

//             for (const tx of pendingTransactions) {
//                 console.log(`🔎 Auditing transaction token: ${tx.token.substring(0,12)}...`);

//                 // Query the bank's core ledger status endpoint
//                 const bankResponse = await fetch(`http://localhost:3003/api/mock-bank-core/status?token=${tx.token}`);
//                 const bankData = await bankResponse.json();

//                 if (bankData.status === "Success") {
//                     // 🚀 EDGE CASE 1 FIXED: User paid, bank database shows Success, but our webhook crashed!
//                     // Recover the transaction safely using an atomic transaction balance credit
//                     await prisma.$transaction([
//                         prisma.balance.update({
//                             where: { userId: tx.userId },
//                             data: { amount: { increment: tx.amount } }
//                         }),
//                         prisma.onRampTransaction.update({
//                             where: { id: tx.id },
//                             data: { status: "Success" }
//                         })
//                     ]);
//                     console.log(`✅ [CRON RECOVERED] Successfully credited missed transaction token: ${tx.token}`);
//                 } 
//                 // else if (bankData.status === "Processing") {
//                 //     // 🚀 EDGE CASE 2 FIXED: User opened bank page but abandoned or closed the tab without clicking approve.
//                 //     // The bank engine confirms no money left the user's account. We safely mark it a Failure.
//                 //     await prisma.onRampTransaction.update({
//                 //         where: { id: tx.id },
//                 //         data: { status: "Failure" }
//                 //     });
//                 //     console.log(`❌ [CRON CLEANUP] Marked abandoned payment token as FAILURE: ${tx.token}`);
//                 // }
//                 else {
//                     // 🚀 FIXED: Captures "Processing", "Failure", or "Not_Found". 
//                     // If it isn't explicitly confirmed Success by the bank, close the loop!
//                     await prisma.onRampTransaction.update({
//                         where: { id: tx.id },
//                         data: { status: "Failure" }
//                     });
//                     console.log(`❌ [CRON CLEANUP] Fixed stuck transaction loop. Marked as FAILURE: ${tx.token}`);
//                 }
//             }
//         } catch (error) {
//             console.error("❌ Reconciliation worker execution exception:", error);
//         }
//     });
// }
import cron from "node-cron";
import { prisma } from "@repo/db/client";

export function initReconciliationCron() {
    cron.schedule("*/15 * * * * *", async () => {
        console.log("🔄 [CRON RECONCILIATION] Sweeping for unconfirmed On-Ramp balances...");

        try {
            const timeThreshold = new Date(Date.now() - 45 * 1000);

            const pendingTransactions = await prisma.onRampTransaction.findMany({
                where: {
                    status: "Processing",
                    startTime: { lt: timeThreshold }
                }
            });

            for (const tx of pendingTransactions) {
                console.log(`🔎 Auditing transaction token: ${tx.token}`);

                const bankResponse = await fetch(`http://localhost:3003/api/mock-bank-core/status?token=${tx.token}`);
                
                if (!bankResponse.ok) {
                    console.log(`⚠️ Bank API unavailable for token: ${tx.token}`);
                    continue;
                }

                const bankData = await bankResponse.json();
                console.log(`🏦 [CRON RECEIVED] Data for ${tx.token}:`, bankData);
                const normalizedStatus = bankData.status?.trim().toLowerCase();

                if (normalizedStatus === "success") {
                    console.log(`⚙️ Processing recovery logic for token: ${tx.token}`);
                    
                    try {
                        // 🚀 SAFE ATOMIC TRANSACTION USING AN UPSERT CONSTRUCT
                        await prisma.$transaction([
                            prisma.balance.upsert({
                                where: { userId: tx.userId },
                                update: { amount: { increment: tx.amount } },
                                create: { userId: tx.userId, amount: tx.amount, locked: 0 } // Standard default locked value
                            }),
                            prisma.onRampTransaction.update({
                                where: { id: tx.id },
                                data: { status: "Success" }
                            })
                        ]);
                        console.log(`✅ [CRON RECOVERED] Safely processed token: ${tx.token}`);
                    } catch (dbError) {
                        console.error(`❌ Database write failure for token ${tx.token}:`, dbError);
                    }
                } 
                else if (normalizedStatus === "processing") {
                    console.log(`⏳ User still checking out on Bank UI interface for token: ${tx.token.substring(0,8)}`);
                } 
                else {
                    // Fallback handles "failure" or "not_found"
                    await prisma.onRampTransaction.update({
                        where: { id: tx.id },
                        data: { status: "Failure" }
                    });
                    console.log(`❌ [CRON CLEANUP] Marked abandoned token as FAILURE: ${tx.token}`);
                }
            }
        } catch (error) {
            console.error("❌ Reconciliation worker execution exception:", error);
        }
    });
}