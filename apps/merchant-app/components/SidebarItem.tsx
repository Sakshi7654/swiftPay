"use client"
import { usePathname, useRouter } from "next/navigation";
import React from "react";

export const SidebarItem = ({ href, title, icon }: { href: string; title: string; icon: React.ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname();
    const selected = pathname === href;

    return (
        <div 
            className={`flex items-center gap-3 cursor-pointer py-3 pl-8 transition-colors duration-150 border-l-4 ${
                selected 
                    ? "text-[#6a51a6] bg-violet-50/50 border-[#6a51a6]" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 border-transparent"
            }`} 
            onClick={() => {
                router.push(href);
            }}
        >
            <div className={`${selected ? "text-[#6a51a6]" : "text-slate-400"}`}>
                {icon}
            </div>
            <div className="font-bold text-sm tracking-wide">
                {title}
            </div>
        </div>
    );
};