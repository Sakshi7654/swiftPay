"use server";

import { prisma } from "@repo/db/client";
import bcrypt from "bcrypt";

export async function signUpAction(formData: any) {
    const { name, email, number, password } = formData;

    if (!name || !email || !number || !password) {
        return { success: false, error: "All fields are required." };
    }

    try {
        // check duplication records
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ number }, { email }]
            }
        });

        if (existingUser) {
            return { success: false, error: "Phone number or email already in use." };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // transaction guarantees wallet entry is created alongside user profile account activation 
        await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    number,
                    password: hashedPassword,
                }
            });

            await tx.balance.create({
                data: {
                    userId: user.id,
                    amount: 0,
                    locked: 0
                }
            });
        });

        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message || "An unexpected registration failure occurred." };
    }
}