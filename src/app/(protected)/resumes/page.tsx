import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { serverSupabase } from "@/lib/supabase/server";
import ResumeCreateForm from "@/components/resume-create-form";
export default async function Resumes() {
  const supabase=await serverSupabase();
  const {data:{user}}=await supabase.auth.getUser();
  const {data,error}=await supabase.from("resumes").select("id,title,target_role,source_file_name,updated_at").eq("user_id",user!.id).order("updated_at",{ascending:false}).limit(100);
  return <div className="max-w-7xl space-y-6"><header><h1 className="text-3xl font-bold">我的简历</h1><p className="text-slate-500 mt-2">保存多个方向的简历，所有修改都会自动建立版本快照。</p></header>
    <div className="grid lg:grid-cols-[380px_1fr] gap-6 items-start"><ResumeCreateForm/><section className="card p-6"><h2 className="text-xl font-bold mb-3">简历列表</h2>
      {error ? <p className="text-red-700">读取失败：{error.message}。请先运行数据库迁移。</p> : !data?.length ? <div className="text-center py-16 text-slate-500"><FileText size={42} className="mx-auto mb-3"/><p>还没有创建简历</p></div> : <div className="divide-y divide-slate-100">{data.map(r=><Link key={r.id} href={`/resumes/${r.id}`} className="flex gap-3 py-4 items-center hover:text-blue-700"><div className="bg-blue-50 rounded-xl p-3 text-blue-600"><FileText/></div><div className="min-w-0 flex-1"><p className="font-semibold truncate">{r.title}</p><p className="text-sm text-slate-500 truncate">{r.target_role || "未设置目标岗位"} · 更新于 {new Date(r.updated_at).toLocaleDateString("zh-CN")}</p></div><ArrowRight size={18}/></Link>)}</div>}
    </section></div>
  </div>;
}
