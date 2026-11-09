import { NextResponse } from "next/server";
import { serverSupabase } from "@/lib/supabase/server";
import { caught, fail } from "@/lib/api-helpers";
import { resumeEditSchema } from "@/lib/resume-schema";
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}) {
  try {
    const {id}=await params; const supabase=await serverSupabase();const {data:{user}}=await supabase.auth.getUser();
    if(!user)return fail("请先登录",401);
    const {data,error}=await supabase.from("resumes").select("*").eq("id",id).eq("user_id",user.id).maybeSingle();
    if(error)throw error;if(!data)return fail("简历不存在",404);
    return NextResponse.json({resume:data});
  }catch(e){return caught(e);}
}
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}) {
  try {
    const {id}=await params; const supabase=await serverSupabase();const {data:{user}}=await supabase.auth.getUser();
    if(!user)return fail("请先登录",401);
    const body=resumeEditSchema.parse(await request.json());
    const {data,error}=await supabase.from("resumes").update(body).eq("id",id).eq("user_id",user.id).select("id,updated_at").maybeSingle();
    if(error)throw error;if(!data)return fail("简历不存在或没有权限",404);
    return NextResponse.json({resume:data});
  }catch(e){return caught(e);}
}
export async function DELETE(_:Request,{params}:{params:Promise<{id:string}>}) {
  try {
    const {id}=await params; const supabase=await serverSupabase();const {data:{user}}=await supabase.auth.getUser();
    if(!user)return fail("请先登录",401);
    const {data,error}=await supabase.from("resumes").delete().eq("id",id).eq("user_id",user.id).select("id").maybeSingle();
    if(error)throw error;if(!data)return fail("简历不存在或没有权限",404);
    return NextResponse.json({ok:true});
  }catch(e){return caught(e);}
}
