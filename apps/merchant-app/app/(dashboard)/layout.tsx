import { SidebarItem } from "../../components/SidebarItem";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex overflow-x-hidden max-w-screen">
      {/* Merchant Sidebar Console */}
      <div className="w-72 border-r border-slate-300 min-h-screen mr-4 pt-28 bg-white">
        <div className="flex flex-col gap-2">
          {/* 🚀 Changed to Business Relevant Routes */}
          <SidebarItem href={"/dashboard"} icon={<HomeIcon />} title="Home Console" />
          <SidebarItem href={"/payouts"} icon={<PayoutIcon />} title="Revenue Payouts" />
        </div>
      </div>
      
      {/* Live Business Viewport Area */}
      <div className="flex-1 bg-slate-50 min-h-screen">
        {children}
      </div>
    </div>
  );
}

function HomeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function PayoutIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a6.002 6.002 0 0 1 11.601-2.466M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3.75h-3.75a.75.75 0 0 0-.75.75v3.75m0 0H18A2.25 2.25 0 0 1 15.75 18v-3.75a2.25 2.25 0 0 1 2.25-2.25h3.75a2.25 2.25 0 0 1 2.25 2.25V15a2.25 2.25 0 0 1-2.25 2.25Z" />
    </svg>
  );
}