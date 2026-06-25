import { DashboardDashboard } from "../../../components/DashboardDashboard";
import { getServerSession } from "next-auth";
import { redirect } from 'next/navigation'
import { authOptions } from "../../lib/auth";
import { prisma } from "@repo/db/client";

// fetch only outgoing p2p transfers where the current user spent money
async function getOutgoingTransfers(userId: number) {
    return await prisma.p2pTransfer.findMany({
        where: {
            fromUserId: userId
        },
        orderBy: {
            timestamp: "desc"
        },
        select: {
            timestamp: true,
            amount: true
        }
    });
}

export default async function() {
  const session = await getServerSession(authOptions);
  const userId = Number(session?.user?.id);
  //safe redirect fallbacks if session parsing clears out as false
  if (!session || !userId) {
      redirect('/signin');
  }

    if (userId) {
        const rawTransactions = await getOutgoingTransfers(userId);
        
        const transactions = rawTransactions.map(t => ({
            time: t.timestamp,
            amount: t.amount
        }));

        return <DashboardDashboard user={session.user} transactions={transactions} />;
        // redirect('/dashboard')

    }
}