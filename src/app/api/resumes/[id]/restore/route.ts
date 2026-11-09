import { NextResponse } from "next/server";
import { z } from "zod";
import { serverSupabase } from "@/lib/supabase/server";
import { caught, fail } from "@/lib/api-helpers";
import { resumeContentSchema } from "@/lib/resume-schema";
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}) {
  try {
    const {id}=await params;const {version_id}=z.object({version_id:z.string().uuid()}).parse(await request.json());
    const supabase=await serverSupabase();const {data:{user}}=await supabase.auth.getUser();
    if(!user)return fail("请先登录",401);
    const {data:version,error:e1}=await supabase.from("resume_versions").select("title,target_role,content").eq("id",version_id).eq("resume_id",id).eq("user_id",user.id).maybeSingle();
    if(e1)throw e1;if(!version)return fail("历史版本不存在",404);
    const safeContent=resumeContentSchema.parse(version.content);
    const {data,error:e2}=await supabase.from("resumes").update({title:version.title,target_role:version.target_role,content:safeContent}).eq("id",id).eq("user_id",user.id).select("id").maybeSingle();
    if(e2)throw e2;if(!data)return fail("简历不存在",404);
    return NextResponse.json({ok:true}); // trigger creates a new snapshot for the restored content.
  }catch(e){return caught(e);}
}
