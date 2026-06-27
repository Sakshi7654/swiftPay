"use client";

import { Card } from "@repo/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface TxnData {
    time: Date;
    amount: number;
}

export function DashboardDashboard({ user, transactions }: { user: any; transactions: TxnData[] }) {
    const dailyDataMap: { [key: string]: number } = {};
    
    transactions.forEach(t => {
        const dateStr = t.time.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
        dailyDataMap[dateStr] = (dailyDataMap[dateStr] || 0) + t.amount / 100;
    });

    const chartData = Object.keys(dailyDataMap).map(date => ({
        date,
        amount: dailyDataMap[date]
    })).reverse(); // Reverse to keep chronological order (oldest to newest)

    return (
        <div className="w-full px-6 max-w-7xl mx-auto space-y-6 pt-8">
            <div className="text-3xl font-bold text-slate-800">
                Welcome back, <span className="text-[#6a51a6]">{user.name || "User"}</span> 👋
            </div>

            {/* Analytical Graph Row */}
            <div className="grid grid-cols-1 gap-6">
                <Card title="Your Spending Overview">
                    <p className="text-xs text-slate-500 font-medium mb-4">
                        Track how much money you've sent over recent days.
                    </p>
                    {chartData.length === 0 ? (
                        <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
                            No spending history data available to graph yet.
                        </div>
                    ) : (
                        <div className="h-64 w-full pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6a51a6" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#6a51a6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} unit=" ₹" />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                                        labelStyle={{ fontWeight: "bold", color: "#1e293b" }}
                                    />
                                    <Area type="monotone" dataKey="amount" stroke="#6a51a6" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}