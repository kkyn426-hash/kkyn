import Link from "next/link";
import { notFound } from "next/navigation";
import { serverSupabase } from "@/lib/supabase/server";
import type { ResumeRow, VersionRow } from "@/lib/resume-schema";
import { resumeContentSchema } from "@/lib/resume-schema";
import ResumeEditor from "@/components/resume-editor";
export default async function ResumeDetail({params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  const supabase=await serverSupabase();
  const {data:{user}}=await supabase.auth.getUser();
  const {data:resume,error}=await supabase.from("resumes").select("*").eq("id",id).eq("user_id",user!.id).single();
  if(error || !resume) notFound();
  const {data:versions}=await supabase.from("resume_versions").select("id,resume_id,version_no,title,target_role,created_at").eq("resume_id",id).eq("user_id",user!.id).order("version_no",{ascending:false}).limit(30);
  const parsed=resumeContentSchema.safeParse(resume.content);
  if(!parsed.success) return <div className="card p-7"><h1 className="font-bold">简历内容结构不兼容</h1><p className="text-sm text-slate-600 mt-2">数据未删除。请检查导入数据或数据库版本。</p><Link className="text-blue-600" href="/resumes">返回</Link></div>;
  return <ResumeEditor key={resume.updated_at} resume={{...resume,content:parsed.data} as ResumeRow} versions={(versions||[]) as VersionRow[]}/>;
}
