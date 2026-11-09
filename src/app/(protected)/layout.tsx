import { redirect } from "next/navigation";
import { serverSupabase } from "@/lib/supabase/server";
import Sidebar from "@/components/sidebar";
export const dynamic = "force-dynamic";
export default async function ProtectedLayout({children}:{children:React.ReactNode}) {
  let supabase;
  try { supabase = await serverSupabase(); }
  catch { return <main className="max-w-xl mx-auto mt-24 p-8 card"><h1 className="font-bold text-xl">尚未配置 Supabase</h1><p className="mt-3 text-slate-600">请根据 README 创建 .env.local，填写 SUPABASE 项目地址及公开密钥，并运行数据库迁移。</p></main>; }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <div className="lg:flex min-h-screen"><Sidebar email={user.email||""}/><main className="flex-1 min-w-0 p-4 md:p-8 lg:p-10">{children}</main></div>;
}
