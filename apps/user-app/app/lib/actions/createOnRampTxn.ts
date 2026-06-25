"use server" //otherwise will be called inside the client only

//server action directly talking to databse 

import { getServerSession } from "next-auth"
import { authOptions } from "../auth"
import { prisma } from "@repo/db/client"

export async function createOnRampTransaction(amount:number, provider:string){ // we wont provide userid here as someone can send wrong userid here, so we would extract userid
    const session= await getServerSession(authOptions);
    const userId=session.user.id;
    if(!userId){
        return{
            success:false,
            message:"user not logged in"
        }
    }
    const token=Math.random().toString(); //in actual comes from a bank server

    //but not balance would be updated as its still processing
    try {
        await prisma.onRampTransaction.create({
            data: {
                userId: Number(userId),
                amount: amount, 
                status: "Processing",
                startTime: new Date(),
                provider,
                token: token
            }
        });

        // return the critical identifiers so the frontend can route to the bank simulator
        return {
            success: true,
            message: "On ramp txn added",
            token: token,
            userId: Number(userId)
        }
    } catch (error: any) {
        console.error("DB_ONRAMP_CREATION_ERROR:", error);
        return {
            success: false,
            message: "Failed to create transaction in database"
        }
    }
}