import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { prisma } from "@repo/db/client";

// fetch business revenue streams concurrently
async function getMerchantMetrics(merchantId: number) {
    const [balanceRecord, salesHistory] = await Promise.all([
        prisma.merchantBalance.findUnique({
            where: { merchantId }
        }),
        prisma.b2CPurchase.findMany({
            where: { merchantId },
            orderBy: { timestamp: "desc" },
            take: 5,
            include: {
                user: {
                    select: { name: true, number: true }
                }
            }
        })
    ]);

    return {
        revenue: balanceRecord?.amount || 0,
        sales: salesHistory
    };
}

export default async function MerchantDashboardPage() {
    const session = await getServerSession(authOptions);
    const merchantId = Number(session?.user?.id);

    if (!merchantId) {
        return (
            <div className="flex items-center justify-center h-[70vh]">
                <p className="text-slate-500 font-medium text-sm">Please sign in to view business metrics.</p>
            </div>
        );
    }

    const { revenue, sales } = await getMerchantMetrics(merchantId);

    return (
        <div className="w-full max-w-6xl mx-auto px-6 py-8">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Merchant Control Console</h1>
            <p className="text-sm text-slate-500 font-medium mb-8">Welcome back, {session.user?.name || "Partner"}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Commercial Inflow Revenue Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Settled Outlays</span>
                        <h2 className="text-4xl font-extrabold text-indigo-600 mt-2">₹{(revenue / 100).toFixed(2)}</h2>
                    </div>
                    <div className="text-[11px] text-emerald-600 font-semibold mt-4 flex items-center gap-1">
                        <span>●</span> Live POS terminal balances available for dispatch payout.
                    </div>
                </div>
            </div>

            {/* Sales Collection Ledger */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Recent B2C Incoming Retail Settlements</h3>
                
                {!sales.length ? (
                    <p className="text-slate-400 text-sm text-center py-8">No incoming retail transactions captured yet.</p>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {sales.map((item) => (
                            <div key={item.id} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">Payment from {item.user.name || "Customer"}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{item.user.number}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-emerald-600">+ ₹{(item.amount / 100).toFixed(2)}</p>
                                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                        {item.timestamp.toLocaleDateString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}