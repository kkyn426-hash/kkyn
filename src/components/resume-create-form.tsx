"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FilePlus2, Upload } from "lucide-react";
import { emptyResume } from "@/lib/resume-schema";
export default function ResumeCreateForm() {
  const router=useRouter();
  const [title,setTitle]=useState("我的基础简历");
  const [role,setRole]=useState("");
  const [source,setSource]=useState("");
  const [fileName,setFileName]=useState<string|null>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const input=useRef<HTMLInputElement>(null);
  async function readFile(file:File) {
    setBusy(true);setError("");
    try {
      const form=new FormData();form.set("file",file);
      const result=await fetch("/api/resumes/import",{method:"POST",body:form});
      const data=await result.json(); if(!result.ok) throw new Error(data.error||"导入失败");
      setSource(data.text);setFileName(file.name);
      if(title==="我的基础简历") setTitle(file.name.replace(/\.(docx|pdf|txt)$/i,""));
    } catch(e) {setError(e instanceof Error?e.message:"读取失败");}
    finally {setBusy(false);}
  }
  async function create() {
    setBusy(true);setError("");
    try {
      const result=await fetch("/api/resumes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title,target_role:role,content:emptyResume(),original_text:source,source_file_name:fileName})});
      const data=await result.json();if(!result.ok)throw new Error(data.error||"创建失败");
      router.push(`/resumes/${data.resume.id}`);router.refresh();
    } catch(e) {setError(e instanceof Error?e.message:"创建失败");} finally {setBusy(false);}
  }
  return <div className="card p-6 space-y-4">
    <h2 className="text-lg font-bold flex items-center gap-2"><FilePlus2 size={20} className="text-blue-600"/>创建新简历</h2>
    <div><label htmlFor="title" className="label">简历名称</label><input id="title" className="field mt-1" maxLength={120} value={title} onChange={e=>setTitle(e.target.value)} /></div>
    <div><label htmlFor="role" className="label">目标岗位（可选）</label><input id="role" className="field mt-1" maxLength={160} placeholder="例如：酒店运营管培生" value={role} onChange={e=>setRole(e.target.value)}/></div>
    <div><label className="label">导入原始简历（可选）</label><input ref={input} type="file" accept=".docx,.pdf,.txt" className="hidden" onChange={e=>{const f=e.currentTarget.files?.[0];if(f)void readFile(f);}}/>
      <button type="button" className="btn-secondary mt-2 w-full" disabled={busy} onClick={()=>input.current?.click()}><Upload size={17}/>上传 DOCX / 文本 PDF / TXT（最大 5MB）</button>
      {fileName && <p className="text-sm text-green-700 mt-2">已提取文字：{fileName}</p>}
      <p className="text-xs text-slate-500 mt-2">扫描版 PDF 可能无法识别。当前阶段仅提取原文，尚不通过AI自动生成虚构经历。</p>
    </div>
    <div><label htmlFor="raw" className="label">或粘贴已有简历原文</label><textarea id="raw" className="field mt-1 min-h-32" placeholder="将现有简历文字粘贴到这里；创建后可参照原文填写结构化内容。" value={source} maxLength={100000} onChange={e=>{setSource(e.target.value);setFileName(null);}}/></div>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    <button type="button" disabled={busy || !title.trim()} className="btn-primary w-full" onClick={create}>{busy?"处理中...":"创建简历并开始编辑"}</button>
  </div>;
}
