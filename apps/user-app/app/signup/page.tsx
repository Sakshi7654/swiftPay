"use client";

import { useState } from "react";
import { signUpAction } from "../lib/actions/signup";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [number, setNumber] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const result = await signUpAction({ name, email, number, password });
        
        if (result.success) {
            await signIn("credentials", {
                number,
                password,
                callbackUrl: "/dashboard",
            });
        } else {
            setError(result.error || "Signup failed");
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-4 border border-slate-200">
                <div className="text-center space-y-1">
                    <h2 className="text-3xl font-extrabold text-[#6a51a6]">Create Account</h2>
                    <p className="text-sm text-slate-500 font-medium">Join SwiftPay and manage your wallet seamlessly</p>
                </div>
                
                {error && <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2.5 rounded-lg border border-rose-100">{error}</p>}
                
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1">Full Name</label>
                        <input className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:outline-[#6a51a6]" placeholder="John Doe" type="text" onChange={e => setName(e.target.value)} required />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1">Email Address</label>
                        <input className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:outline-[#6a51a6]" placeholder="john@example.com" type="email" onChange={e => setEmail(e.target.value)} required />
                    </div>
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
                    {loading ? "Creating Account..." : "Sign Up"}
                </button>
                
                <p className="text-xs text-center text-slate-500 font-medium pt-1">
                    Already have an account? <Link href="/signin" className="text-[#6a51a6] font-bold hover:underline">Sign In</Link>
                </p>
            </form>
        </div>
    );
}