"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { browserSupabase } from "@/lib/supabase/client";
import { BriefcaseBusiness, LockKeyhole, Sparkles } from "lucide-react";
function LoginForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const supabase = browserSupabase();
      const result = mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
      if (result.error) throw result.error;
      if (mode === "signup" && !result.data.session) {
        setMessage("注册成功，请查收确认邮件并完成验证，然后登录。待验证时无法进入工作台。");
      } else {
        router.replace(safeNext); router.refresh();
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : "登录失败"); }
    finally { setBusy(false); }
  }
  return <main className="min-h-screen grid place-items-center px-4 py-10 bg-[radial-gradient(circle_at_top_left,#dceaff,#f6f8fc_50%)]">
    <section className="card w-full max-w-md p-8 space-y-6">
      <div className="flex items-center gap-3"><span className="bg-blue-600 text-white rounded-2xl p-3"><BriefcaseBusiness /></span><div><h1 className="text-2xl font-bold">CareerOS</h1><p className="text-slate-500 text-sm">个人求职工作台 · 第一阶段</p></div></div>
      <div><h2 className="text-xl font-semibold">{mode === "login" ? "欢迎回来" : "创建个人账号"}</h2><p className="text-sm text-slate-500 mt-1">只有你能查看自己的简历和求职资料。</p></div>
      <form onSubmit={submit} className="space-y-4">
        <div><label className="label" htmlFor="email">邮箱地址</label><input className="field mt-1" id="email" type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com" /></div>
        <div><label className="label" htmlFor="password">密码</label><input className="field mt-1" id="password" type="password" minLength={6} required autoComplete={mode==="login"?"current-password":"new-password"} value={password} onChange={e=>setPassword(e.target.value)} /></div>
        {message && <p role="status" className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">{message}</p>}
        <button disabled={busy} className="btn-primary w-full" type="submit"><LockKeyhole size={17}/>{busy?"请稍候...":mode==="login"?"登录工作台":"注册账号"}</button>
      </form>
      <button type="button" className="text-sm text-blue-700 hover:underline" onClick={()=>{setMode(mode==="login"?"signup":"login");setMessage("");}}>{mode==="login"?"还没有账号？立即注册":"已有账号？返回登录"}</button>
      <div className="border-t pt-4 flex gap-2 text-xs text-slate-500"><Sparkles className="shrink-0" size={16}/><span>当前版本仅支持简历管理。AI分析、导出与投递看板将在后续阶段逐步上线。</span></div>
    </section>
  </main>;
}

export default function Login() { return <Suspense fallback={<main className="min-h-screen grid place-items-center">正在加载登录页面...</main>}><LoginForm/></Suspense>; }
