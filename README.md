# CareerOS — AI 个人求职工作台

**当前状态：Phase 1 源码（待在联网的 Node.js 环境安装依赖并做运行验证）**。本阶段实现邮箱登录、私有简历 CRUD、DOCX/文本 PDF/TXT 文字提取、结构化手动编辑和自动版本快照。**AI 优化、JD 匹配、Word/PDF 导出、投递看板暂未实现**，不可将页面中的“即将开放”误认为真实功能。

## 技术栈

Next.js 15 App Router + React 19 + TypeScript + Tailwind CSS 3 + Supabase Auth/Postgres + Zod。后续阶段通过**服务端**接入 OpenAI Responses API。

## Windows 快速启动

1. 安装 **Node.js LTS** 和 Git。建议使用 Windows PowerShell。
2. 克隆仓库的 Phase 1 开发分支（或解压源代码）：

   ```powershell
   git clone -b feature/careeros-mvp-phase1 https://github.com/kkyn426-hash/kkyn.git careeros
   cd careeros
   npm install
   ```

3. 访问 [supabase.com/dashboard](https://supabase.com/dashboard) 创建项目。
4. 在 Supabase 的 **SQL Editor** 运行 `supabase/migrations/202611090001_init.sql`（首次运行一次）。这会创建 `resumes`、`resume_versions`、`jobs`、`applications` 四张表、所有 RLS policies、索引及版本触发器。
5. 在 **Authentication → Providers → Email** 中启用邮箱认证。为本地调试设置 **Site URL** 为 `http://localhost:3000`，并在 Redirect URLs 中添加 `http://localhost:3000/auth/callback`。推荐启用邮箱确认。
6. 项目根目录复制环境变量文件，填入 **Project URL** 和 **publishable/anon public key**：

   ```powershell
   Copy-Item .env.example .env.local
   notepad .env.local
   ```

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_KEY
   ```

   不要把 Supabase **service_role/secret key** 填到 `NEXT_PUBLIC_` 变量中，不要上传真实简历和 API 密钥到公开 GitHub。
7. 启动：

   ```powershell
   npm run dev
   ```

8. 打开 <http://localhost:3000>，注册、确认邮箱、登录、创建简历、编辑/保存、查看版本历史、恢复历史、删除简历。

## 检查与验收

在项目目录执行：

```powershell
npm run test:smoke
npm run lint
npm run typecheck
npm run build
```

结构检查不等于成功部署。**真实 Supabase 功能需要配置项目并使用两个测试账号验证 RLS 隔离**，具体如下：

- A 用户创建简历，刷新页面确认保留；保存后版本数增加，并可恢复旧版本。
- B 用户不能通过猜测 A 的 UUID 读取、更改、删除 A 的简历；B 也不能创建指向 A 简历的版本快照或投递引用。
- 上传 `.docx`、含可复制文字 `.pdf`、`.txt` 并确认文本提取；上传超过 5MB、非支持类型或扫描 PDF 应显示错误信息。
- 删除时提示确认，删除后历史版本级联清除。
- 未登录的页面/API 请求不能访问真实数据；注销后刷新依然无法访问。

## 数据与隐私

- `resumes` 存储结构化 JSON、导入的原始文字及源文件名；**不存储原始上传文件字节**。
- 文件上传前校验大小（最大 5MB）和扩展名，服务端验证基本文件头、限制 PDF 提取页数（100 页）及可存储文本长度。**这是 MVP 级防护，投产前还需安全扫描、限流和请求总大小限制**。
- 所有数据库操作使用登录用户会话与 PostgreSQL RLS，**不使用 service role 代替用户权限**。
- 每次更新简历自动触发新历史版本；版本仅可由简历所有者查看、恢复，不支持直接修改旧版本。
- 导入原文需要人工对照整理为结构化经历；此阶段不会假装“AI 已提取经历”。
- `.env.local` 不纳入 Git。生产部署请在 Vercel 控制台设置环境变量，并正确配置 Supabase 域名回调地址。

## 文件结构

```text
src/app/login                     邮箱注册登录
src/app/(protected)/dashboard     工作台首页
src/app/(protected)/resumes       简历管理与编辑
src/app/api/resumes               列表/创建/修改/删除接口
src/app/api/resumes/import        文件文字提取（不存储字节）
src/app/api/resumes/[id]/restore  历史版本恢复
src/lib/resume-schema.ts          输入验证、数据结构
src/lib/supabase                 SSR Cookie 会话
supabase/migrations              SQL、RLS、触发器
```

## 下一阶段待办

1. 增加基于真实简历和 JD 的 AI 分析 API（OpenAI Responses API + Structured Outputs + 服务端密钥）。
2. 增加修改建议差异展示与逐条确认，不得编造单位、时间、数字、证书。
3. 增加 DOCX 导出和浏览器打印 PDF 样式。
4. 增加岗位与投递管理页面。
5. 增加自动化集成测试、生产级限流与错误监控。

## 已知限制

开发环境在当前会话中无法联网到 npm registry，因此没有执行 `npm install`，也没有运行 Next.js 编译、真实 Supabase 注册或跨用户测试。需要在联网 Windows 设备运行上述检查后修复任何平台差异。此仓库开发分支属于 MVP 源码交付，**尚未经过可上线验收**。
