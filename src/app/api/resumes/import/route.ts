import { NextResponse } from "next/server";
import { serverSupabase } from "@/lib/supabase/server";
import { caught, fail } from "@/lib/api-helpers";
export const runtime="nodejs";
const MAX=5*1024*1024;
export async function POST(request:Request) {
  try {
    const supabase=await serverSupabase();const {data:{user}}=await supabase.auth.getUser();
    if(!user)return fail("请先登录",401);
    const form=await request.formData();const file=form.get("file");
    if(!(file instanceof File))return fail("请选择文件",400);
    if(file.size===0 || file.size>MAX)return fail("文件必须小于等于5MB且不能为空",413);
    const name=file.name.slice(0,255);
    const ext=name.toLowerCase().split(".").at(-1);
    if(!["txt","docx","pdf"].includes(ext||""))return fail("只支持DOCX、文本PDF与TXT文件",415);
    const bytes=Buffer.from(await file.arrayBuffer());
    let text="";
    if(ext==="txt"){
      text=new TextDecoder("utf-8",{fatal:true}).decode(bytes);
    } else if(ext==="docx"){
      if(bytes[0]!==0x50||bytes[1]!==0x4b)return fail("DOCX文件格式不正确",415);
      const mammoth=await import("mammoth");
      text=(await mammoth.extractRawText({buffer:bytes})).value;
    } else {
      if(bytes.subarray(0,5).toString("ascii")!=="%PDF-")return fail("PDF文件格式不正确",415);
      const pdf=(await import("pdf-parse")).default;
      const output=await pdf(bytes,{max:100});
      text=output.text;
    }
    text=text.replace(/\r\n/g,"\n").trim().slice(0,100000);
    if(!text)return fail("未检测到可复制文字；扫描PDF请先OCR，或直接粘贴简历文本。",422);
    return NextResponse.json({name,text});
  }catch(e){
    if(e instanceof TypeError || e instanceof RangeError)return fail("文件解码失败。请换用DOCX或粘贴文字。",422);
    return caught(e);
  }
}
