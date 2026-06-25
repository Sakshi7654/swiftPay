"use server"
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { prisma } from "@repo/db/client";

export async function p2pTransfer(to: string, amount: number) { // to is phone number
    const session = await getServerSession(authOptions);
    const from = session?.user?.id;
    if (!from) {
        return {
            message: "Error while sending"
        }
    }
    const toUser = await prisma.user.findFirst({
        where: {
            number: to
        }
    });

    if (!toUser) {
        return {
            message: "User not found"
        }
    }
    await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT * FROM "Balance" WHERE "userId" = ${Number(from)} FOR UPDATE`; //locking
        // in mongodb if some another request comes, then it will revert it back automatically, so no locking in mongodb
        // types of lock read only, two person can read but not write

        const fromBalance = await tx.balance.findUnique({
            where: { userId: Number(from) },
          });

          // that above request may take some time in finding in databse and lets say, we click two times
          // lets say money is 2000, in both threads 2000 will be shown, and both will be able to debit and credit which led to negative balance of sender

          // so we need to lock this row so that only one db call can access at a time
          // for same person we want it to happen sequentially, but if different person are sending then can happen parallely
          // second request will happen after first one finishes

          if (!fromBalance || fromBalance.amount < amount) {
            throw new Error('Insufficient funds');
          }

          await tx.balance.update({
            where: { userId: Number(from) },
            data: { amount: { decrement: amount } },
          });

          await tx.balance.update({
            where: { userId: toUser.id },
            data: { amount: { increment: amount } },
          });

          // make a data entry also

          await tx.p2pTransfer.create({
            data: {
                fromUserId: Number(from),
                toUserId: toUser.id,
                amount,
                timestamp: new Date()
            }
          })
    });
}