"use client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { browserSupabase } from "@/lib/supabase/client";
export default function SignoutButton() {
  const router = useRouter();
  return <button className="flex items-center gap-2 w-full rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100" onClick={async()=>{
    await browserSupabase().auth.signOut(); router.replace("/login"); router.refresh();
  }}><LogOut size={17}/>退出登录</button>;
}
