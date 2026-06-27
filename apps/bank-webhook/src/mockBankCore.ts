// Think of this as a software program running inside HDFC Bank's IT department building. It has its own memory ledger, its own security rules, and its own endpoints.
import { Router } from "express";

export const mockBankRouter = Router();

//Without global: If you just use a normal variable (const bankDB = new Map()), every single time the file hot-reloads, JavaScript wipes out the old variable and creates a fresh, empty Map. Your mock bank would instantly "forget" every single pending or successful transaction you had created, completely breaking your cron worker testing.

// With global: When the file reloads, the script looks at the if check, notices that global.centralBankLedger already exists in Node's deep running memory from before the reload, and completely skips the initialization step. Your bank memory ledger stays completely safe and preserved across code changes!


// simple key-value storage room inside the bank,maps unique token directly to a status
if (!(global as any).centralBankLedger) {
    (global as any).centralBankLedger = new Map<string, { amount: number; status: "Processing" | "Success" | "Failure" }>(); //If it doesn't exist (which happens the exact millisecond your server boots up for the very first time), Node.js creates a brand new, empty JavaScript Map structure and anchors it directly to the global space
}
const bankDB = (global as any).centralBankLedger; //We create a local reference shortcut called bankDB so we don't have to type (global as any).centralBankLedger every single time we write an API endpoint.

// =========================================================================
// 1. BANK SYSTEM ENDPOINT: INITIALIZE PAYMENT INTENT
// Called by: createOnRampTransaction (Your Server Action)
// =========================================================================
// When a user types "₹500" on your wallet application and clicks "Add Money", your application server instantly jumps over to the bank's network and hits this endpoint.
mockBankRouter.post("/initialize", (req, res) => {
    const { token, amount } = req.body;
    if (!token) return res.status(400).json({ message: "Missing tracking token" });

    const cleanToken = token.trim();

    // bank records the payment intent as processing
    bankDB.set(cleanToken, { amount: Number(amount), status: "Processing" }); //Why this matters: HDFC Bank now officially recognizes that a user is about to attempt a checkout payment worth ₹500.
    console.log(`🏦 [BANK CORE LOG] Registered pending deposit intent for token: ${cleanToken.substring(0, 8)}...`);
    
    return res.status(200).json({ message: "Order placed on bank switch routing rails." });
});

// =========================================================================
// 2. BANK SYSTEM ENDPOINT: CONFIRM PAYMENT (USER CLICKS PROCEED)
// Called by: BankMockPage (The Bank UI Frontend)
// =========================================================================
//The user logs in and clicks the blue "Approve & Confirm Payment" button.

// The moment that button is clicked, the UI page shoots a network request directly to the bank server's /confirm endpoint.
// It physically debits the money from the user's real personal bank account balance.
// It flips its internal database status from Processing to Success
mockBankRouter.post("/confirm", async (req, res) => {
    const { token, userId } = req.body;
    const cleanToken = token?.trim();
    const order = bankDB.get(cleanToken);
    // const order = bankDB.get(token);

    if (!order) {
        console.log(`[BANK ERROR] Cannot confirm. Token "${cleanToken}" does not exist in bank memory.`);
        return res.status(404).json({ message: "Transaction record not found on banking network" });
    }

    // 1. Mark the money as successfully debited inside the Bank's internal core ledger
    bankDB.set(cleanToken, { ...order, status: "Success" });
    console.log(`🏦 [BANK CORE LOG] Cash debited! Token ${cleanToken.substring(0, 8)} flipped to SUCCESS.`);

    // 2. Fire the Outbound Webhook to your application server asynchronously
    // As soon as the bank switches update that row to Success, the bank server takes responsibility for telling your application that the funds have been safely captured.
    try {
        const applicationWebhookUrl = "http://localhost:3003/hdfcWebhook";
        
        // The bank sends a POST request out over the internet to your handler endpoint
        const response = await fetch(applicationWebhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                token: cleanToken,
                user_identifier: Number(userId),
                amount: order.amount
            })
        });

        if (!response.ok) {
            console.error("⚠️ [BANK CORE LOG] Webhook delivery failed or was rejected by your app server.");
        }
    } catch (err) {
        console.error("❌ [BANK CORE LOG] Network drop! Webhook could not reach your application server.");
    }

    // The bank returns success to the client UI browser tab regardless of whether your webhook was up.
    // The user's bank debit was finalized!
    return res.status(200).json({ status: "Success", message: "Bank payment authorization complete." });
});

// =========================================================================
// 3. BANK SYSTEM ENDPOINT: AUDIT STATUS REPORT LOOKUP
// Called by: worker.ts (Your Background Reconciliation Cron Worker)
// =========================================================================
// This endpoint sits there silently and is only ever touched by your background Next.js Cron Worker daemon process.
// Every 15 seconds, if your cron worker detects a transaction that has been stuck in a local Processing loop for too long, it sends an outbound query directly to this route: GET /api/mock-bank-core/status?token=token_abc123.
mockBankRouter.get("/status", (req, res) => {
    const token = req.query.token as string;
    const cleanToken = token?.trim();
    if (!cleanToken) return res.status(400).json({ message: "Token parameter required" });

    const bankRecord = bankDB.get(cleanToken);
    console.log(`🔍 [BANK STATUS CHECK] Cron checked: "${cleanToken}". Found:`, bankRecord);

    // If the transaction is not found in bank memory, it means it never reached the bank switches
    if (!bankRecord) {
        return res.status(200).json({ cleanToken, status: "Failure" });
    }

    // Return the absolute truth directly from the bank's core memory ledger
    return res.status(200).json({
        token:cleanToken,
        status: bankRecord.status.toLowerCase() // Returns "processing", "success", or "failure"
    });
});

// =========================================================================
// 4. BANK SYSTEM ENDPOINT: INITIALIZE PAYOUT DISBURSEMENT INTENT
// Called by: createOffTxnx (Your Server Action)
// =========================================================================
mockBankRouter.post("/payout", (req, res) => {
    const { token, amount, userId } = req.body;
    if (!token) return res.status(400).json({ message: "Missing payout tracking reference token" });

    const cleanToken = token.trim();

    // The Bank tracks this withdrawal request as pending internal confirmation processing
    bankDB.set(cleanToken, { amount: Number(amount), status: "Processing" });
    console.log(`🏦 [BANK PAYOUT ENGINE] Queued withdrawal disbursement intent for token: "${cleanToken}"`);

    // Simulate real-world asynchronous industrial clearing-houses (NEFT/IMPS processing delay)
    // After 8 seconds, the bank processing terminal flips the internal status to Success completely on its own!
    setTimeout(() => {
        const order = bankDB.get(cleanToken);
        if (order && order.status === "Processing") {
            bankDB.set(cleanToken, { ...order, status: "Success" });
            console.log(`✅ [BANK MASTER LEDGER] Funds successfully cleared and paid out for token: "${cleanToken}"`);
        }
    }, 8000);

    return res.status(200).json({ message: "Payout added to clearing house distribution pipelines." });
});

// =========================================================================
// 5. BANK SYSTEM ENDPOINT: AUDIT OFFRAMP STATUS Lookups
// Called by: offRampWorker.ts (Your Upcoming Withdrawal Cron Background daemon)
// =========================================================================
mockBankRouter.get("/offramp-status", (req, res) => {
    const token = req.query.token as string;
    const cleanToken = token?.trim();

    if (!cleanToken) return res.status(400).json({ message: "Token parameter required" });

    const bankRecord = bankDB.get(cleanToken);
    console.log(`🔍 [BANK AUDIT LOOKUP] Querying withdrawal status for token: "${cleanToken}". Found:`, bankRecord);

    if (!bankRecord) {
        return res.status(200).json({ token: cleanToken, status: "processing" });
    }

    return res.status(200).json({
        token: cleanToken,
        status: bankRecord.status.toLowerCase() // Sends "success" or "processing"
    });
});