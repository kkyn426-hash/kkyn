import Link from "next/link";
import { FileText, Target, CalendarClock, ArrowRight } from "lucide-react";
import { serverSupabase } from "@/lib/supabase/server";
export default async function Dashboard() {
  const supabase = await serverSupabase();
  const {data:{user}} = await supabase.auth.getUser();
  const {data:resumes,error} = await supabase.from("resumes").select("id,title,target_role,updated_at").eq("user_id",user!.id).order("updated_at",{ascending:false}).limit(5);
  return <div className="max-w-6xl space-y-7">
    <div><p className="text-blue-700 text-sm font-semibold">PERSONAL CAREER SPACE</p><h1 className="text-3xl font-bold mt-1">你好，欢迎使用 CareerOS</h1><p className="text-slate-500 mt-2">从一份可信的基础简历开始，建立自己的求职资料库。</p></div>
    <div className="grid sm:grid-cols-3 gap-4">
      {[{title:"我的简历",value:resumes?.length||0,icon:FileText,note:"最近五份记录"},{title:"岗位分析",value:"即将开放",icon:Target,note:"第二阶段"},{title:"投递追踪",value:"即将开放",icon:CalendarClock,note:"第三阶段"}].map(x=><div key={x.title} className="card p-5"><x.icon className="text-blue-600 mb-3"/><p className="text-sm text-slate-500">{x.title}</p><p className="text-2xl font-bold mt-1">{x.value}</p><p className="text-xs text-slate-400 mt-2">{x.note}</p></div>)}
    </div>
    <div className="card p-6"><div className="flex justify-between items-center gap-3"><h2 className="font-bold text-xl">最近简历</h2><Link className="text-blue-600 text-sm flex items-center gap-1" href="/resumes">前往简历中心 <ArrowRight size={16}/></Link></div>
      {error ? <p className="text-red-700 mt-4">读取简历失败，请检查 SQL migration 是否已运行：{error.message}</p> : resumes?.length ? <div className="divide-y mt-4">{resumes.map(r=><Link className="flex items-center justify-between py-4 hover:text-blue-700" href={`/resumes/${r.id}`} key={r.id}><div><p className="font-semibold">{r.title}</p><p className="text-sm text-slate-500">{r.target_role||"尚未设置目标岗位"}</p></div><ArrowRight size={18}/></Link>)}</div> : <p className="text-slate-500 text-sm py-8">还没有简历。请先创建第一份基础简历。</p>}
      <Link href="/resumes" className="btn-primary mt-4">开始管理简历 <ArrowRight size={16}/></Link>
    </div>
  </div>;
}
