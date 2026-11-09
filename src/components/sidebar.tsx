"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness, LayoutDashboard, FileUser, ScanSearch, KanbanSquare, Mic2, Settings } from "lucide-react";
import SignoutButton from "@/components/signout-button";
const links = [
  { to: "/dashboard", label: "工作台", icon: LayoutDashboard, enabled: true },
  { to: "/resumes", label: "我的简历", icon: FileUser, enabled: true },
  { to: "#", label: "岗位匹配", icon: ScanSearch, enabled: false },
  { to: "#", label: "投递管理", icon: KanbanSquare, enabled: false },
  { to: "#", label: "AI 模拟面试", icon: Mic2, enabled: false },
  { to: "#", label: "设置", icon: Settings, enabled: false },
];
export default function Sidebar({ email }: { email: string }) {
  const path = usePathname();
  return <aside className="bg-white border-r border-slate-200 lg:min-h-screen w-full lg:w-64 lg:shrink-0 flex flex-col">
    <div className="p-5 border-b flex gap-3 items-center"><div className="rounded-xl bg-blue-600 text-white p-2"><BriefcaseBusiness size={23}/></div><div><div className="font-bold text-xl">CareerOS</div><div className="text-xs text-slate-400">AI 智能求职工作台</div></div></div>
    <nav className="flex lg:flex-col overflow-x-auto gap-1 p-3 flex-1" aria-label="主导航">
      {links.map(({to,label,icon:Icon,enabled})=> enabled ?
        <Link key={label} href={to} className={`flex items-center gap-2.5 rounded-xl px-3 py-3 whitespace-nowrap text-sm ${path===to || (to==="/resumes" && path.startsWith("/resumes")) ? "bg-blue-50 text-blue-700 font-semibold":"text-slate-600 hover:bg-slate-100"}`}><Icon size={18}/>{label}</Link>
        : <span key={label} aria-disabled="true" title="后续阶段开放" className="flex items-center gap-2.5 rounded-xl px-3 py-3 whitespace-nowrap text-sm text-slate-400 cursor-not-allowed"><Icon size={18}/>{label}<span className="text-[10px]">即将开放</span></span>
      )}
    </nav>
    <div className="border-t p-4 hidden lg:block"><p className="text-xs text-slate-400 truncate mb-2" title={email}>{email}</p><SignoutButton/></div>
  </aside>;
}
