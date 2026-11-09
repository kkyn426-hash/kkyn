import { NextResponse } from "next/server";
import { serverSupabase } from "@/lib/supabase/server";
import { caught, fail } from "@/lib/api-helpers";
import { resumeUpsertSchema } from "@/lib/resume-schema";
export async function GET() {
  try {
    const supabase=await serverSupabase();const {data:{user}}=await supabase.auth.getUser();
    if(!user)return fail("请先登录",401);
    const {data,error}=await supabase.from("resumes").select("id,title,target_role,created_at,updated_at").eq("user_id",user.id).order("updated_at",{ascending:false});
    if(error)throw error;
    return NextResponse.json({resumes:data});
  }catch(e){return caught(e);}
}
export async function POST(request:Request) {
  try {
    const supabase=await serverSupabase();const {data:{user}}=await supabase.auth.getUser();
    if(!user)return fail("请先登录",401);
    const body=resumeUpsertSchema.parse(await request.json());
    const {data,error}=await supabase.from("resumes").insert({...body,user_id:user.id}).select("id,title").single();
    if(error)throw error;
    return NextResponse.json({resume:data},{status:201});
  }catch(e){return caught(e);}
}
