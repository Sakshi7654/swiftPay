import { prisma } from "@repo/db/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
// this file handles credential validation (checking phone no and pw against the DB) and points NextAuth to your custom page route


export const authOptions = {
    providers: [
      CredentialsProvider({
          name: 'Credentials',
          credentials: {
            number: { label: "Phone number", type: "text", placeholder: "9876543210", required: true },
            password: { label: "Password", type: "password", required: true }
          },
           //any time we click on submit, this triggers
//           //phone and pw we typed, reach this credentials
          async authorize(credentials: any) {
            console.log("=== SIGNIN ATTEMPT ===");
            
            if (!credentials?.number || !credentials?.password) {
                return null;
            }

            // 1. Fetch user profile record
            const existingUser = await prisma.user.findFirst({
                where: {
                    number: String(credentials.number)
                }
            });

            // if the user profile isn't found, stop and return null immediately
            if (!existingUser) {
                console.log("Sign-in Denied: User number does not exist.");
                return null;
            }

            // 2. Validate password hash match
            const passwordValidation = await bcrypt.compare(credentials.password, existingUser.password);
            console.log("Password Matches Database Record?:", passwordValidation);

            if (passwordValidation) {
                return {
                    id: existingUser.id.toString(),
                    name: existingUser.name,
                    email: existingUser.number
                };
            }

            // credentials  not match
            return null;
          },
        })
    ],
    secret: process.env.JWT_SECRET || "secret", 
    pages: { 
        signIn: "/signin",
    },
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.id = token.id;
            }
            return session;
        }
    }
};