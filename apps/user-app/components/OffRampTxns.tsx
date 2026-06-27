import { Card } from "@repo/ui/card"

interface OffRampTxnsProps {
    transactions: {
        id: number;
        time: Date;
        amount: number;
        status: "Success" | "Failure" | "Processing";
        provider: string;
    }[]
}

export const OffRampTxns = ({ transactions }: OffRampTxnsProps) => {
    if (!transactions.length) {
        return (
            <Card title="Recent Withdrawals">
                <div className="text-center pb-8 pt-8 text-slate-500 text-sm">
                    No recent withdrawal requests
                </div>
            </Card>
        )
    }

    return (
        <Card title="Recent Withdrawals">
            <div className="pt-2 divide-y divide-slate-100">
                {transactions.map((t) => {
                    return (
                        <div key={t.id} className="flex justify-between py-3 first:pt-1 last:pb-1">
                            <div>
                                <div className="text-sm font-medium text-slate-800">
                                    Withdrawn to {t.provider}
                                </div>
                                <div className="text-slate-500 text-xs mt-0.5">
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
                                <div className="font-semibold text-sm text-rose-600">
                                    - Rs {t.amount / 100}
                                </div>
                                {/* Status Badge */}
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                                    t.status === "Success" ? "bg-emerald-100 text-emerald-800" :
                                    t.status === "Processing" ? "bg-amber-100 text-amber-800" : 
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
    )
}