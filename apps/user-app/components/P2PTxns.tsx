import { Card } from "@repo/ui/card"

export const P2PTxns = ({
    transactions,
    currentUserId
}: {
    transactions: {
        time: Date;
        amount: number;
        fromUserId: number;
        toUserId: number;
        fromUserPhone?: string;
        toUserPhone?: string;
    }[],
    currentUserId: number // pass the logged-in user's ID to determine direction
}) => {
    if (!transactions.length) {
        return (
            <Card title="Recent P2P Transfers">
                <div className="text-center pb-8 pt-8 text-slate-500 text-sm">
                    No Recent P2P transfers
                </div>
            </Card>
        )
    }

    return (
        <Card title="Recent P2P Transfers">
            <div className="pt-2 divide-y divide-slate-100">
                {transactions.map((t, index) => {
                    // if the logged-in user sent or received this transfer
                    const isSender = t.fromUserId === currentUserId;

                    return (
                        <div key={index} className="flex justify-between py-3 first:pt-1 last:pb-1">
                            <div>
                                <div className="text-sm font-medium">
                                    {isSender ? (
                                        <span className="text-slate-800">
                                            Sent to {t.toUserPhone || `User ${t.toUserId}`}
                                        </span>
                                    ) : (
                                        <span className="text-slate-800">
                                            Received from {t.fromUserPhone || `User ${t.fromUserId}`}
                                        </span>
                                    )}
                                </div>
                                <div className="text-slate-500 text-xs mt-0.5">
                                    {t.time.toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </div>
                            </div>
                            
                            <div className={`flex flex-col justify-center font-semibold text-sm ${
                                isSender ? "text-rose-600" : "text-emerald-600"
                            }`}>
                                {isSender ? "-" : "+"} Rs {t.amount / 100}
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    )
}