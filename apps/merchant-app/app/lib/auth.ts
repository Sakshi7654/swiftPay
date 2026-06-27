import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { prisma } from "@repo/db/client";

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
        }),
        // GitHubProvider({
        //     clientId: process.env.GITHUB_CLIENT_ID || "",
        //     clientSecret: process.env.GITHUB_CLIENT_SECRET || ""
        // })
    ],
    callbacks: {
        async signIn({ user, account }: any) {
            if (!user.email) return false;

            try {
                const existingMerchant = await prisma.merchant.findUnique({
                    where: { email: user.email }
                });

                // if the merchant doesn't exist yet, register them and initialize their wallet ledger
                if (!existingMerchant) {
                    await prisma.$transaction(async (tx) => {
                        const newMerchant = await tx.merchant.create({
                            data: {
                                email: user.email!,
                                name: user.name || "Anonymous Business",
                                // auth_type: account.provider === "google" ? "Google" : "Github"
                                auth_type: "Google"

                            }
                        });

                        // INITIALIZE MERCHANT BALANCE: Set up their commercial escrow account at ₹0
                        await tx.merchantBalance.create({
                            data: {
                                merchantId: newMerchant.id,
                                amount: 0
                            }
                        });
                    });
                    console.log(`🏦 [MERCHANT REGISTRATION] New merchant registered via OAuth: ${user.email}`);
                }

                return true;
            } catch (error) {
                console.error("❌ Merchant sign-in execution hook crash:", error);
                return false;
            }
        },
        async session({ session, token }: any) {
            if (session.user && session.user.email) {
                // fetch the unique database sequential ID for this merchant to attach to the session
                const dbMerchant = await prisma.merchant.findUnique({
                    where: { email: session.user.email }
                });
                
                if (dbMerchant) {
                    session.user.id = dbMerchant.id;
                }
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET || "merchant_secret_key_123"
};