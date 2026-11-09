"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save, History, FileText, ChevronDown, ChevronUp } from "lucide-react";
import type { ResumeContent, ResumeRow, VersionRow } from "@/lib/resume-schema";

type Education = ResumeContent["education"][number];
type Experience = ResumeContent["experience"][number];
type Project = ResumeContent["projects"][number];
function FormField({title,value,onChange,placeholder="",type="text"}:{title:string;value:string;onChange:(x:string)=>void;placeholder?:string;type?:string}) {
  return <label className="block space-y-1"><span className="label">{title}</span><input type={type} className="field" value={value} maxLength={250} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/></label>;
}
function TextArea({title,value,onChange,placeholder="",rows=3}:{title:string;value:string;onChange:(x:string)=>void;placeholder?:string;rows?:number}) {
  return <label className="block space-y-1"><span className="label">{title}</span><textarea rows={rows} className="field" value={value} maxLength={2500} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/></label>;
}
function EntryHeader({title,onRemove}:{title:string;onRemove:()=>void}) {
  return <div className="flex justify-between items-center gap-3 border-b pb-3 mb-4"><p className="font-semibold text-slate-700">{title}</p><button type="button" className="btn-danger text-xs px-3 py-1.5" onClick={onRemove}><Trash2 size={14}/>移除</button></div>;
}
function DateRange({startDate,endDate,onStart,onEnd}:{startDate:string;endDate:string;onStart:(v:string)=>void;onEnd:(v:string)=>void}) {
  return <div className="grid sm:grid-cols-2 gap-3"><FormField title="开始时间" placeholder="2024.09" value={startDate} onChange={onStart}/><FormField title="结束时间" placeholder="至今 / 2025.02" value={endDate} onChange={onEnd}/></div>;
}
const blankEducation=():Education=>({id:crypto.randomUUID(),school:"",degree:"",major:"",startDate:"",endDate:"",details:""});
const blankExperience=():Experience=>({id:crypto.randomUUID(),company:"",role:"",startDate:"",endDate:"",bullets:[]});
const blankProject=():Project=>({id:crypto.randomUUID(),title:"",role:"",startDate:"",endDate:"",bullets:[]});
export default function ResumeEditor({resume,versions}:{resume:ResumeRow;versions:VersionRow[]}) {
  const router=useRouter();
  const [title,setTitle]=useState(resume.title);
  const [role,setRole]=useState(resume.target_role);
  const [content,setContent]=useState<ResumeContent>(resume.content);
  const [status,setStatus]=useState("");
  const [busy,setBusy]=useState(false);
  const [showOriginal,setShowOriginal]=useState(Boolean(resume.original_text));
  const [showVersions,setShowVersions]=useState(false);
  const setBasics=(field:keyof ResumeContent["basics"],value:string)=>setContent(c=>({...c,basics:{...c.basics,[field]:value}}));
  const setEdu=(id:string,field:keyof Education,value:string)=>setContent(c=>({...c,education:c.education.map(x=>x.id===id?{...x,[field]:value}:x)}));
  const setExp=(id:string,field:keyof Experience,value:string|string[])=>setContent(c=>({...c,experience:c.experience.map(x=>x.id===id?{...x,[field]:value}:x)}));
  const setProject=(id:string,field:keyof Project,value:string|string[])=>setContent(c=>({...c,projects:c.projects.map(x=>x.id===id?{...x,[field]:value}:x)}));
  async function save() {
    setBusy(true);setStatus("");
    try {
      const res=await fetch(`/api/resumes/${resume.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({title,target_role:role,content})});
      const data=await res.json();if(!res.ok)throw new Error(data.error||"保存失败");
      setStatus("保存成功，已自动创建新的历史版本。");router.refresh();
    }catch(e){setStatus(e instanceof Error?e.message:"保存失败");}finally{setBusy(false);}
  }
  async function remove() {
    if(!window.confirm("确认永久删除这份简历及其所有版本吗？此操作无法撤销。"))return;
    setBusy(true);setStatus("");
    try {
      const res=await fetch(`/api/resumes/${resume.id}`,{method:"DELETE"});
      const data=await res.json();if(!res.ok)throw new Error(data.error||"删除失败");
      router.push("/resumes");router.refresh();
    }catch(e){setStatus(e instanceof Error?e.message:"删除失败");setBusy(false);}
  }
  async function restore(version:VersionRow) {
    if(!window.confirm(`恢复到 V${version.version_no} 吗？未保存的编辑会丢失，恢复动作会留下一个新版本。`))return;
    setBusy(true);setStatus("");
    try {
      const res=await fetch(`/api/resumes/${resume.id}/restore`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({version_id:version.id})});
      const data=await res.json();if(!res.ok)throw new Error(data.error||"恢复失败");
      setStatus("历史版本已恢复。");router.refresh();
    }catch(e){setStatus(e instanceof Error?e.message:"恢复失败");}finally{setBusy(false);}
  }
  return <div className="max-w-6xl mx-auto space-y-5 pb-20">
    <div className="flex gap-3 items-start justify-between flex-wrap">
      <div><Link href="/resumes" className="inline-flex items-center gap-1 text-sm text-blue-700 mb-2"><ArrowLeft size={16}/>所有简历</Link><h1 className="text-3xl font-bold">编辑简历</h1><p className="text-sm text-slate-500 mt-2">只记录真实经历。点击“保存修改”时会自动创建历史版本。</p></div>
      <div className="flex gap-2 flex-wrap"><button disabled={busy} onClick={save} className="btn-primary"><Save size={17}/>{busy?"处理中...":"保存修改"}</button><button onClick={remove} disabled={busy} className="btn-danger"><Trash2 size={17}/>删除简历</button></div>
    </div>
    {status && <div role="status" className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800">{status}</div>}
    <div className="grid xl:grid-cols-[1fr_270px] gap-6 items-start">
      <div className="space-y-5">
        <section className="card p-5 md:p-6 space-y-4"><h2 className="text-lg font-bold">基本信息</h2>
          <div className="grid sm:grid-cols-2 gap-4"><FormField title="简历名称" value={title} onChange={setTitle}/><FormField title="目标岗位" value={role} onChange={setRole}/><FormField title="姓名" value={content.basics.fullName} onChange={v=>setBasics("fullName",v)}/><FormField title="所在城市" value={content.basics.location} onChange={v=>setBasics("location",v)}/><FormField title="邮箱" type="email" value={content.basics.email} onChange={v=>setBasics("email",v)}/><FormField title="电话" value={content.basics.phone} onChange={v=>setBasics("phone",v)}/></div>
          <TextArea title="个人简介" rows={4} value={content.basics.summary} onChange={v=>setBasics("summary",v)} placeholder="真实总结你的优势、技能与求职方向。"/>
        </section>
        <section className="card p-5 md:p-6 space-y-4"><div className="flex justify-between items-center"><h2 className="text-lg font-bold">教育背景</h2><button className="btn-secondary text-sm" onClick={()=>setContent(c=>({...c,education:[...c.education,blankEducation()]}))}><Plus size={16}/>添加</button></div>
          {content.education.length===0 && <p className="text-slate-400 text-sm">尚未添加教育经历</p>}
          {content.education.map((e,i)=><div className="bg-slate-50 border rounded-xl p-4 space-y-3" key={e.id}><EntryHeader title={`教育经历 ${i+1}`} onRemove={()=>setContent(c=>({...c,education:c.education.filter(x=>x.id!==e.id)}))}/><div className="grid sm:grid-cols-2 gap-3"><FormField title="学校" value={e.school} onChange={v=>setEdu(e.id,"school",v)}/><FormField title="学位" value={e.degree} onChange={v=>setEdu(e.id,"degree",v)}/></div><FormField title="专业" value={e.major} onChange={v=>setEdu(e.id,"major",v)}/><DateRange startDate={e.startDate} endDate={e.endDate} onStart={v=>setEdu(e.id,"startDate",v)} onEnd={v=>setEdu(e.id,"endDate",v)}/><TextArea title="课程 / 其他真实信息" value={e.details} onChange={v=>setEdu(e.id,"details",v)}/></div>)}
        </section>
        <section className="card p-5 md:p-6 space-y-4"><div className="flex justify-between items-center"><h2 className="text-lg font-bold">实习 / 工作经历</h2><button className="btn-secondary text-sm" onClick={()=>setContent(c=>({...c,experience:[...c.experience,blankExperience()]}))}><Plus size={16}/>添加</button></div>
          {content.experience.length===0 && <p className="text-slate-400 text-sm">尚未添加经历</p>}
          {content.experience.map((e,i)=><div className="bg-slate-50 border rounded-xl p-4 space-y-3" key={e.id}><EntryHeader title={`经历 ${i+1}`} onRemove={()=>setContent(c=>({...c,experience:c.experience.filter(x=>x.id!==e.id)}))}/><div className="grid sm:grid-cols-2 gap-3"><FormField title="公司 / 组织" value={e.company} onChange={v=>setExp(e.id,"company",v)}/><FormField title="职位" value={e.role} onChange={v=>setExp(e.id,"role",v)}/></div><DateRange startDate={e.startDate} endDate={e.endDate} onStart={v=>setExp(e.id,"startDate",v)} onEnd={v=>setExp(e.id,"endDate",v)}/><TextArea title="职责与成果（每行一条）" rows={5} placeholder="例如：整理每日运营数据并生成日报" value={e.bullets.join("\n")} onChange={v=>setExp(e.id,"bullets",v.split("\n").slice(0,20).map(x=>x.slice(0,600)))}/></div>)}
        </section>
        <section className="card p-5 md:p-6 space-y-4"><div className="flex justify-between items-center"><h2 className="text-lg font-bold">项目经历</h2><button className="btn-secondary text-sm" onClick={()=>setContent(c=>({...c,projects:[...c.projects,blankProject()]}))}><Plus size={16}/>添加</button></div>
          {content.projects.length===0 && <p className="text-slate-400 text-sm">尚未添加项目</p>}
          {content.projects.map((e,i)=><div className="bg-slate-50 border rounded-xl p-4 space-y-3" key={e.id}><EntryHeader title={`项目 ${i+1}`} onRemove={()=>setContent(c=>({...c,projects:c.projects.filter(x=>x.id!==e.id)}))}/><div className="grid sm:grid-cols-2 gap-3"><FormField title="项目名称" value={e.title} onChange={v=>setProject(e.id,"title",v)}/><FormField title="个人职责" value={e.role} onChange={v=>setProject(e.id,"role",v)}/></div><DateRange startDate={e.startDate} endDate={e.endDate} onStart={v=>setProject(e.id,"startDate",v)} onEnd={v=>setProject(e.id,"endDate",v)}/><TextArea title="项目成果（每行一条）" rows={4} value={e.bullets.join("\n")} onChange={v=>setProject(e.id,"bullets",v.split("\n").slice(0,20).map(x=>x.slice(0,600)))}/></div>)}
        </section>
        <section className="card p-5 md:p-6 space-y-4"><h2 className="text-lg font-bold">技能与证书</h2><TextArea rows={5} title="每行填写一项" value={content.skills.join("\n")} onChange={v=>setContent(c=>({...c,skills:v.split("\n").slice(0,80).map(x=>x.slice(0,120))}))} placeholder="例如：Excel 数据分析"/></section>
        <div className="flex justify-between flex-wrap gap-3"><button disabled={busy} className="btn-primary" onClick={save}><Save size={18}/>保存修改</button><p className="text-xs text-slate-500 self-center">第二阶段将加入 AI 优化、JD 分析及 Word/PDF 导出。</p></div>
      </div>
      <aside className="space-y-4 xl:sticky xl:top-6">
        <section className="card p-5"><button className="w-full flex justify-between items-center font-semibold" onClick={()=>setShowVersions(v=>!v)}><span className="flex items-center gap-2"><History size={19} className="text-blue-600"/>历史版本</span>{showVersions?<ChevronUp size={17}/>:<ChevronDown size={17}/>}</button>
          <p className="text-xs text-slate-500 mt-2">每次保存都会自动留下可恢复的快照。</p>
          {showVersions && <div className="mt-4 space-y-3 max-h-[350px] overflow-y-auto">{versions.map(v=><div key={v.id} className="border rounded-xl p-3"><div className="flex justify-between items-center"><p className="font-semibold text-sm">V{v.version_no}</p><button disabled={busy} className="text-xs text-blue-700 hover:underline" onClick={()=>restore(v)}>恢复</button></div><p className="text-xs text-slate-500 mt-1">{new Date(v.created_at).toLocaleString("zh-CN")}</p></div>)}{versions.length===0&&<p className="text-xs text-slate-400">暂无版本</p>}</div>}
        </section>
        {resume.original_text && <section className="card p-5"><button className="w-full flex items-center justify-between font-semibold" onClick={()=>setShowOriginal(v=>!v)}><span className="flex items-center gap-2"><FileText size={18} className="text-blue-600"/>原始简历文字</span>{showOriginal?<ChevronUp size={17}/>:<ChevronDown size={17}/>}</button><p className="text-xs text-slate-500 mt-2">{resume.source_file_name||"粘贴导入"}，用于对照录入。当前阶段不自动拆分信息。</p>{showOriginal&&<textarea readOnly value={resume.original_text} className="w-full mt-3 text-xs p-3 border rounded-xl bg-slate-50 min-h-52 max-h-96 resize-y" aria-label="原始简历文字"/>}</section>}
        <section className="rounded-xl bg-blue-50 text-blue-900 p-4 text-sm"><p className="font-semibold">隐私提示</p><p className="mt-2 leading-6">简历内容存储在你配置的 Supabase 项目中。上传文件只在服务端提取文字；原文件不持久保存。</p></section>
      </aside>
    </div>
  </div>;
}
