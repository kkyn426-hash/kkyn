import { NextResponse } from "next/server";
import { ZodError } from "zod";
export function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}
export function caught(error: unknown) {
  if (error instanceof ZodError) return fail("输入字段有误：" + error.issues.map((i) => i.path.join(".") + " " + i.message).join("；"), 422);
  console.error("API error:", error);
  return fail("服务暂时不可用，请检查配置或稍后重试。", 500);
}
