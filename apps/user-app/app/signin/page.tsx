"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SigninPage() {
    const [number, setNumber] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const res = await signIn("credentials", {
            number,
            password,
            redirect: false, // prevents nextjs from throwing generic crash redirects so we can show dynamic error updates
        });
        console.log("NextAuth Response Object:", res); // 👈 Temporary debug log

        if (res?.error || !res?.ok) {
            setError("Invalid credentials. Please verify your phone number and password.");
            setLoading(false);
        } else {
            console.log("success")
           // using this,we can completely bypasses nextjs client-router caching issues
            window.location.href = "/dashboard";
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-5 border border-slate-200">
                <div className="text-center space-y-1">
                    <h2 className="text-3xl font-extrabold text-[#6a51a6]">Welcome Back</h2>
                    <p className="text-sm text-slate-500 font-medium">Log into your digital wallet dashboard portal</p>
                </div>

                {error && <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2.5 rounded-lg border border-rose-100">{error}</p>}

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1">Phone Number</label>
                        <input className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:outline-[#6a51a6]" placeholder="9999999999" type="text" onChange={e => setNumber(e.target.value)} required />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1">Password</label>
                        <input className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:outline-[#6a51a6]" placeholder="••••••••" type="password" onChange={e => setPassword(e.target.value)} required />
                    </div>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-[#6a51a6] text-white p-3 rounded-xl font-bold hover:bg-[#56408f] transition-all text-sm disabled:opacity-50 cursor-pointer pt-3.5">
                    {loading ? "Authenticating..." : "Sign In"}
                </button>
                
                <p className="text-xs text-center text-slate-500 font-medium pt-1">
                    Don't have an account? <Link href="/signup" className="text-[#6a51a6] font-bold hover:underline">Sign Up</Link>
                </p>
            </form>
        </div>
    );
}