import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { prisma } from "@repo/db/client";
import { redirect } from "next/navigation";
import { Card } from "@repo/ui/card"; 

export type TransactionType = "ON_RAMP" | "OFF_RAMP" | "P2P_SENT" | "P2P_RECEIVED";

export interface UnifiedTransaction {
  id: string;
  type: TransactionType;
  title: string;
  subtitle: string;
  amount: number; 
  timestamp: Date;
  status?: "Success" | "Failure" | "Processing";
  isCredit: boolean;
}

async function getAllTransactions(userId: number): Promise<UnifiedTransaction[]> {
  const [onRampTxns, offRampTxns, sentP2P, receivedP2P] = await Promise.all([
    // 1. OnRamp (Deposits)
    prisma.onRampTransaction.findMany({
      where: { userId },
      orderBy: { startTime: "desc" }
    }),
    // 2. OffRamp (Withdrawals)
    prisma.offRampTransaction.findMany({
      where: { userId },
      orderBy: { startTime: "desc" }
    }),
    // 3. P2P Sent
    prisma.p2pTransfer.findMany({
      where: { fromUserId: userId },
      include: { toUser: true },
      orderBy: { timestamp: "desc" }
    }),
    // 4. P2P Received
    prisma.p2pTransfer.findMany({
      where: { toUserId: userId },
      include: { fromUser: true },
      orderBy: { timestamp: "desc" }
    })
  ]);

  // Normalize OnRamp
  const normalizedOnRamp: UnifiedTransaction[] = onRampTxns.map((t) => ({
    id: `onramp-${t.id}`,
    type: "ON_RAMP",
    title: `Deposited via ${t.provider}`,
    subtitle: `Bank Add-Money Token: ${t.token.slice(0, 12)}...`,
    amount: t.amount,
    timestamp: t.startTime,
    status: t.status,
    isCredit: true
  }));

  // Normalize OffRamp
  const normalizedOffRamp: UnifiedTransaction[] = offRampTxns.map((t) => ({
    id: `offramp-${t.id}`,
    type: "OFF_RAMP",
    title: `Withdrawn to ${t.provider}`,
    subtitle: `Bank Withdrawal Token: ${t.token.slice(0, 12)}...`,
    amount: t.amount,
    timestamp: t.startTime,
    status: t.status,
    isCredit: false
  }));

  // Normalize Sent P2P
  const normalizedSentP2P: UnifiedTransaction[] = sentP2P.map((t) => ({
    id: `p2p-sent-${t.id}`,
    type: "P2P_SENT",
    title: `Sent to ${t.toUser.name || t.toUser.number}`,
    subtitle: `Peer Transfer`,
    amount: t.amount,
    timestamp: t.timestamp,
    status: "Success",
    isCredit: false
  }));

  // Normalize Received P2P
  const normalizedReceivedP2P: UnifiedTransaction[] = receivedP2P.map((t) => ({
    id: `p2p-received-${t.id}`,
    type: "P2P_RECEIVED",
    title: `Received from ${t.fromUser.name || t.fromUser.number}`,
    subtitle: `Peer Transfer`,
    amount: t.amount,
    timestamp: t.timestamp,
    status: "Success",
    isCredit: true
  }));

  // Combine and sort chronologically (Newest first)
  return [
    ...normalizedOnRamp,
    ...normalizedOffRamp,
    ...normalizedSentP2P,
    ...normalizedReceivedP2P
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  const userId = Number(session?.user?.id);

  if (!session || !userId) {
    redirect("/signin");
  }

  const transactions = await getAllTransactions(userId);

  return (
    <div className="w-screen px-6 max-w-7xl mx-auto pb-10">
      <div className="text-4xl text-[#6a51a6] pt-8 mb-8 font-bold">
        Transactions
      </div>

      <div className="w-full">
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white border border-slate-200 rounded-xl shadow-sm">
            No transactions recorded yet.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {transactions.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Left Side: Indicator Icon + Details */}
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-full ${
                      t.isCredit
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {t.isCredit ? <ArrowDownLeftIcon /> : <ArrowUpRightIcon />}
                  </div>

                  <div>
                    <div className="font-semibold text-slate-800 text-base">
                      {t.title}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {t.timestamp.toDateString()} at{" "}
                      {t.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Side: Status Badge + Amount */}
                <div className="flex items-center gap-6">
                  {t.status && (
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        t.status === "Success"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : t.status === "Processing"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {t.status}
                    </span>
                  )}

                  <div
                    className={`font-bold text-lg ${
                      t.isCredit ? "text-green-600" : "text-slate-800"
                    }`}
                  >
                    {t.isCredit ? "+" : "-"} ₹{(t.amount / 100).toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Icon Components
function ArrowDownLeftIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2.5"
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m19.5 4.5-15 15m0 0h11.25m-11.25 0V8.25"
      />
    </svg>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2.5"
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m4.5 19.5 15-15m0 0H9.75m9.75 0v11.25"
      />
    </svg>
  );
}