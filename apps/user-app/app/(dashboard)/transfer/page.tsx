import { prisma } from "@repo/db/client";
import { AddMoney } from "../../../components/AddMoneyCard";
import { BalanceCard } from "../../../components/BalanceCard";
import { OnRampTransactions } from "../../../components/OnRampTransactions";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { WithdrawCard } from "../../../components/WithdrawCard";

// 🚀 Fetches ONLY Bank transactions (Deposits and Withdrawals)
async function getBankTransactions(userId: number) {
    // Run both queries concurrently to maximize loading speed
    const [onRampTxns, offRampTxns] = await Promise.all([
        prisma.onRampTransaction.findMany({
            where: { userId },
            orderBy: { startTime: "desc" },
            take: 10
        }),
        prisma.offRampTransaction.findMany({
            where: { userId },
            orderBy: { startTime: "desc" },
            take: 10
        })
    ]);

    // Normalize OnRamp (Credits / Deposits from Bank)
    const normalizedOnRamp = onRampTxns.map(t => ({
        time: t.startTime,
        amount: t.amount,
        status: t.status,
        provider: t.provider,
        type: "credit" as const,
        title: `Deposited via ${t.provider}`
    }));

    // Normalize OffRamp (Debits / Withdrawals to Bank)
    const normalizedOffRamp = offRampTxns.map(t => ({
        time: t.startTime,
        amount: t.amount,
        status: t.status,
        provider: t.provider,
        type: "debit" as const,
        title: `Withdrawn to ${t.provider}`
    }));

    // Merge bank records together, sort chronologically (Newest first), and show top 10
    return [...normalizedOnRamp, ...normalizedOffRamp]
        .sort((a, b) => b.time.getTime() - a.time.getTime())
        .slice(0, 10);
}

async function getBalance(userId: number) {
    const balance = await prisma.balance.findFirst({
        where: { userId }
    });
    return {
        amount: balance?.amount || 0,
        locked: balance?.locked || 0
    }
}

export default async function TransferPage() {
    const session = await getServerSession(authOptions);
    const userId = Number(session?.user?.id);

    if (!userId) {
        return (
            <div className="w-full flex justify-center items-center h-[80vh]">
                <p className="text-slate-500 font-medium">Please log in to view transfers.</p>
            </div>
        );
    }

    // Fetch balances and banking ledger records concurrently
    const [balance, transactions] = await Promise.all([
        getBalance(userId),
        getBankTransactions(userId)
    ]);

    return (
        <div className="w-screen px-6 max-w-7xl mx-auto">
            <div className="text-4xl text-[#6a51a6] pt-8 mb-8 font-bold">
                Transfer & Dashboard
            </div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 p-4 items-start">
                {/* Left Side Column: Action Forms */}
                <div className="flex flex-col gap-6">
                    <AddMoney />
                    <WithdrawCard />
                </div>
                
                {/* Right Side Column: Banking Ledger */}
                <div className="flex flex-col gap-6">
                    <BalanceCard amount={balance.amount} locked={balance.locked} />
                    {/* Shows only deposits and withdrawals now */}
                    <OnRampTransactions transactions={transactions} />
                </div>
            </div>
        </div>
    );
}