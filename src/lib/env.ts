export function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key || url.includes("YOUR_PROJECT") || key.startsWith("YOUR_")) {
    throw new Error("Supabase 尚未配置：请填写 .env.local 中的真实项目地址与公开密钥。");
  }
  return { url, key };
}
