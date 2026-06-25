import { Button } from "./button";

interface AppbarProps {
    user?: {
        name?: string | null;
    } | null; // 🚀 NextAuth session user can also be null
    onSignin: () => void;
    onSignout: () => void;
}

export const Appbar = ({
    user,
    onSignin,
    onSignout
}: AppbarProps) => {
    return (
        <header className="w-full bg-[#7e68b1] border-b border-slate-200 px-12 h-16 flex items-center justify-between sticky top-0 z-50 ">
            {/* Left Hand: Brand Logo Styling */}
            <div className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2 select-none">
                <span className="w-2.5 h-5 bg-[#6e2fff] rounded-[3px]"></span>
                SwiftPay
            </div>

            {/* Right Hand: Action Buttons & User Profile */}
            <div className="flex items-center gap-4">
                {user && (
                    <span className="text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/50">
                        Hi, {user.name || "User"}
                    </span>
                )}
                
                <div className="flex items-center">
                    <Button onClick={user ? onSignout : onSignin}>
                        {user ? "Logout" : "Login"}
                    </Button>
                </div>
            </div>
        </header>
    );
};