"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function BankMockPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    // 1. extract transaction parameters from the URL query string
    const token = searchParams.get("token");
    const userId = searchParams.get("user_identifier");
    const amount = searchParams.get("amount");

    const handleApprovePayment = async () => {
        setStatus("loading");

        try {
            // 2. automatically hit our bank-webhook backend directly from the browser
            const response = await fetch("http://localhost:3003/hdfcWebhook", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token: token,
                    user_identifier: userId,
                    amount: amount
                }),
            });

            if (response.ok) {
                setStatus("success");
                // 3. take the user back to their active wallet dashboard automatically
                setTimeout(() => {
                    router.push("/transfer");
                }, 1500);
            } else {
                setStatus("error");
            }
        } catch (err) {
            console.error("Webhook redirection failure:", err);
            setStatus("error");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-200 text-center space-y-6">
                <div className="border-b pb-4">
                    <h1 className="text-2xl font-black text-blue-700 tracking-tight">HDFC BANK</h1>
                    <p className="text-xs text-slate-400 font-bold tracking-wider mt-0.5">NETBANKING SIMULATOR PORTAL</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-left text-sm font-medium text-slate-600">
                    <div className="flex justify-between"><span>User ID Reference:</span><span className="font-bold text-slate-900">{userId}</span></div>
                    <div className="flex justify-between"><span>Transaction Token:</span><span className="font-mono text-xs text-slate-500">{token?.substring(0, 12)}...</span></div>
                    <div className="flex justify-between border-t pt-2 mt-2"><span>Total Amount:</span><span className="font-extrabold text-emerald-600 text-base">₹{(Number(amount) / 100).toFixed(2)}</span></div>
                </div>

                {status === "idle" && (
                    <button 
                        onClick={handleApprovePayment}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-xl transition-all cursor-pointer text-sm"
                    >
                        Approve & Confirm Payment
                    </button>
                )}

                {status === "loading" && <p className="text-sm font-bold text-amber-500 animate-pulse">Communicating with SwiftPay Core Servers...</p>}
                {status === "success" && <p className="text-sm font-bold text-emerald-600 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">✅ Payment Captured! Redirecting back to wallet...</p>}
                {status === "error" && <p className="text-sm font-bold text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">❌ Webhook Connection Refused. Ensure port 3003 is running.</p>}
            </div>
        </div>
    );
}