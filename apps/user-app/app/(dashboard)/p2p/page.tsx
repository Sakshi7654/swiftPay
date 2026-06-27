import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { prisma } from "@repo/db/client";
import { SendCard } from "../../../components/SendCard";
import { P2PTxns } from "../../../components/P2PTxns";
//server component, securely can fetches data on load and renders 
//runs on backend server
// helper function to fetch P2P transfers
async function getP2PTransactions(userId: number) {
    const txns = await prisma.p2pTransfer.findMany({
        where: {
            OR: [
                { fromUserId: userId },
                { toUserId: userId }
            ]
        },
        orderBy: {
            timestamp: "desc" // show newest transfers first
        },
        include: {
            fromUser: {
                select: { number: true }
            },
            toUser: {
                select: { number: true }
            }
        }
    });

    return txns.map(t => ({
        time: t.timestamp,
        amount: t.amount,
        fromUserId: t.fromUserId,
        toUserId: t.toUserId,
        fromUserPhone: t.fromUser.number,
        toUserPhone: t.toUser.number
    }));
}

export default async function P2PPage() {
    const session = await getServerSession(authOptions);
    const userId = Number(session?.user?.id);

    if (!userId) {
        return (
            <div className="w-full flex justify-center items-center h-[80vh]">
                <p className="text-slate-500 font-medium">Please log in to view transfers.</p>
            </div>
        );
    }

    // fetch the structural data chunks in parallel
    const transactions = await getP2PTransactions(userId);

    return (
        <div className="w-full px-6 max-w-7xl mx-auto">
            <div className="text-4xl text-[#6a51a6] pt-8 mb-8 font-bold tracking-tight">
                Peer to Peer Transfer
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start w-full">
                <div className="w-full">
                    <SendCard />
                </div>

                <div className="w-full pt-25">
                    <P2PTxns transactions={transactions} currentUserId={userId} />
                </div>
            </div> 
        </div>
    );
}