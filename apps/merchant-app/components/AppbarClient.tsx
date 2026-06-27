"use client"
import { signIn, signOut, useSession } from "next-auth/react";
import { Appbar } from "@repo/ui/appbar";
import { redirect } from 'next/navigation'
import { useRouter } from "next/navigation";

export function AppbarClient() {
  const session = useSession();
  const router = useRouter();

  return (
   <div>
      <Appbar onSignin={signIn} onSignout={async () => {
        await signOut({ callbackUrl: "/"})
        // router.push("/api/auth/signin")
        // redirect('/')
        
      }} user={session.data?.user} />
   </div>
  );
}