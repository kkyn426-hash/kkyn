import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "CareerOS | AI 个人求职工作台", description: "简历管理、岗位匹配与个人求职管理" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
