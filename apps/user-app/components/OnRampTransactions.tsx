"use client";
import { Card } from "@repo/ui/card"
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const OnRampTransactions = ({
    transactions
}: {
    transactions: {
        time: Date,
        amount: number,
        status: string,
        provider: string,
        type: "credit" | "debit", 
        title: string 
    }[]
}) => {
    const router = useRouter();
    // any active transactions stuck in "Processing" on the ui?
    const hasPending = transactions.some(tx => tx.status === "Processing");

    // polling loop triggers automatically ONLY if a pending record exists
    useEffect(() => {
        if (!hasPending) return;

        console.log("♻️ [POLLING DETECTED] Processing transaction active on screen. Initializing live refresh heartbeat...");
        
        const interval = setInterval(() => {
            console.log("🔄 [POLLING HEARTBEAT] Requesting updated ledger data logs...");
            router.refresh(); // Tells Next.js to quietly refetch server components and update variables
        }, 4000); // Check for database updates every 4 seconds

        return () => clearInterval(interval); // Cleanup listener block if component unmounts
    }, [hasPending, router]);
    if (!transactions.length) {
        return <Card title="Recent Transactions">
            <div className="text-center pb-8 pt-8 text-slate-500 text-sm">
                No Recent transactions
            </div>
        </Card>
    }

    return (
        <Card title="Recent Transactions">
            <div className="pt-2 divide-y divide-slate-100 max-h-[450px] overflow-y-auto pr-1">
                {transactions.map((t, index) => {
                    const isCredit = t.type === "credit";

                    return (
                        <div key={index} className="flex justify-between py-3 first:pt-1 last:pb-1 items-center">
                            <div>
                                <div className="text-sm font-semibold text-slate-800">
                                    {t.title}
                                </div>
                                <div className="text-slate-400 text-xs mt-0.5 font-medium">
                                    {t.time.toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    })}
                                </div>
                            </div>

                            <div className="flex flex-col items-end justify-center">
                                <div className={`font-bold text-sm ${
                                    isCredit ? "text-emerald-600" : "text-rose-600"
                                }`}>
                                    {isCredit ? "+" : "-"} ₹{(t.amount / 100).toFixed(2)}
                                </div>
                                
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full mt-1 tracking-wide ${
                                    t.status === "Success" ? "bg-emerald-100 text-emerald-800" :
                                    t.status === "Processing" ? "bg-amber-100 text-amber-800 animate-pulse" : 
                                    "bg-rose-100 text-rose-800"
                                }`}>
                                    {t.status}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};