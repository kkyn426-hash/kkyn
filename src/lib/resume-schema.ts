import { z } from "zod";
const s = (max = 240) => z.string().max(max).default("");
const bulletList = z.array(s(600)).max(20).default([]);
const dates = { startDate: s(30), endDate: s(30) };
export const resumeContentSchema = z.object({
  basics: z.object({
    fullName: s(100), email: s(180), phone: s(50), location: s(150), summary: s(2500),
  }).default({ fullName: "", email: "", phone: "", location: "", summary: "" }),
  education: z.array(z.object({ id: z.string().uuid(), school: s(160), degree: s(100), major: s(150), ...dates, details: s(1500) })).max(20).default([]),
  experience: z.array(z.object({ id: z.string().uuid(), company: s(160), role: s(140), ...dates, bullets: bulletList })).max(30).default([]),
  projects: z.array(z.object({ id: z.string().uuid(), title: s(160), role: s(140), ...dates, bullets: bulletList })).max(30).default([]),
  skills: z.array(s(120)).max(80).default([]),
});
export type ResumeContent = z.infer<typeof resumeContentSchema>;
export function emptyResume(): ResumeContent {
  return { basics: { fullName: "", email: "", phone: "", location: "", summary: "" }, education: [], experience: [], projects: [], skills: [] };
}
export const resumeUpsertSchema = z.object({
  title: z.string().trim().min(1).max(120),
  target_role: z.string().max(160).default(""),
  content: resumeContentSchema,
  original_text: z.string().max(100000).default(""),
  source_file_name: z.string().max(255).nullable().default(null),
});
export const resumeEditSchema = resumeUpsertSchema.pick({ title: true, target_role: true, content: true });
export type ResumeRow = {
  id: string; user_id: string; title: string; target_role: string;
  content: ResumeContent; original_text: string; source_file_name: string | null;
  created_at: string; updated_at: string;
};
export type VersionRow = { id: string; resume_id: string; version_no: number; content: ResumeContent; title: string; target_role: string; created_at: string };
