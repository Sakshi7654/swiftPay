import NextAuth from "next-auth"
import { authOptions } from "../../../lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
//any post or get request on this route will be handled by this handler 