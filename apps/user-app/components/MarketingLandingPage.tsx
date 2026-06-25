"use client";

import { Card } from "@repo/ui/card";
import { signIn } from "next-auth/react";

export function MarketingLandingPage() {
    return (
        <div className="w-full px-6 max-w-9xl mx-auto min-h-[80vh] flex flex-row md:flex-row items-center justify-center gap-12 pt-12">
            {/* Left Hand: Hero Pitch Copy */}
            <div className="space-y-6 max-w-xl">
                <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    The Smart Way to <br />
                    <span className="text-[#6a51a6]">Fund, Send & Track</span> Money.
                </h1>
                <p className="text-lg text-slate-600 font-medium leading-relaxed">
                    Securely fund your digital wallet via mock bank webhooks, transfer money instantly to peers with row-level transaction protection, and analyze your daily spend trends right from your dashboard.
                </p>
                <div className="pt-2">
                    <button 
                        onClick={() => signIn()}
                        className="bg-[#6a51a6] text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:bg-[#56408f] transition-all cursor-pointer"
                    >
                        Get Started Now
                    </button>
                </div>
            </div>

            {/* Right Hand: Visual Illustration Section */}
            <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Micro-Card 1: OnRamp / Funding Preview */}
                <Card title="Instant Wallet Funding">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                        <div className="flex justify-between items-center">
                            <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                            <div className="h-5 w-12 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded flex items-center justify-center">
                                Bank
                            </div>
                        </div>
                        <div className="h-16 bg-gradient-to-r from-emerald-500/10 to-teal-500/5 rounded-xl flex flex-col items-center justify-center border border-emerald-500/10">
                            <span className="text-[11px] font-medium text-slate-400">Linked Bank Balance</span>
                            <span className="text-sm font-extrabold text-emerald-600 mt-0.5">+ ₹10,000.00</span>
                        </div>
                        <div className="h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                            <span className="text-[11px] font-bold text-white">Add Funds via Webhook</span>
                        </div>
                    </div>
                </Card>

                {/* Micro-Card 2: P2P Transfer Preview */}
                <Card title="Peer-to-Peer Sending">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                        <div className="flex justify-between items-center">
                            <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                            <div className="h-5 w-10 bg-purple-100 text-[#6a51a6] text-[10px] font-bold rounded flex items-center justify-center">
                                P2P
                            </div>
                        </div>
                        <div className="h-16 bg-gradient-to-r from-[#6a51a6]/10 to-[#7f64be]/5 rounded-xl flex flex-col items-center justify-center border border-[#6a51a6]/10">
                            <span className="text-[11px] font-medium text-slate-400">Instant Recipient Match</span>
                            <span className="text-sm font-extrabold text-[#6a51a6] mt-0.5">Secure Row-Locking</span>
                        </div>
                        <div className="h-8 bg-[#6a51a6] rounded-lg flex items-center justify-center">
                            <span className="text-[11px] font-bold text-white">Send Money Instantly</span>
                        </div>
                    </div>
                </Card>

            </div>
        </div>
    );
}