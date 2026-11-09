// Dependency-free structural smoke checks. These do NOT replace runtime/integration tests.
import { readFileSync, existsSync } from "node:fs";
const requireFiles=[
  "src/app/login/page.tsx", "src/app/(protected)/resumes/page.tsx", "src/components/resume-editor.tsx",
  "src/app/api/resumes/route.ts", "src/app/api/resumes/[id]/route.ts",
  "src/app/api/resumes/import/route.ts", "src/app/api/resumes/[id]/restore/route.ts",
  "supabase/migrations/202611090001_init.sql", "src/lib/supabase/middleware.ts",
];
for (const f of requireFiles) { if (!existsSync(f)) throw new Error(`Missing ${f}`); }
const sql=readFileSync("supabase/migrations/202611090001_init.sql","utf8");
for (const table of ["resumes","resume_versions","jobs","applications"]) {
  if (!sql.includes(`create table public.${table}`) || !sql.includes(`alter table public.${table} enable row level security`)) {
    throw new Error(`Missing RLS/table: ${table}`);
  }
}
const api=readFileSync("src/app/api/resumes/route.ts","utf8");
if(!api.includes("auth.getUser()"))throw new Error("API must authenticate");
console.log("PASS: file structure, four RLS tables, authenticated resume API");
console.log("NOTE: npm install && npm run typecheck && npm run build && live Supabase RLS tests are still required.");
