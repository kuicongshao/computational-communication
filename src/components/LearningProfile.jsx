import { useEffect, useMemo, useState } from "react";
import SectionHeader from "./SectionHeader.jsx";

const identityKey = "zhichuan-learning-identity";
const growthLogKey = "zhichuan-ai-growth-log";
const demoStorageKeys = [
  "zhichuan-learning-identity",
  "zhichuan-knowledge-progress",
  "zhichuan-ai-workflow-profile",
  "zhichuan-course-agent-usage",
  "zhichuan-analysis-lab-usage",
  "zhichuan-student-project",
  "zhichuan-ai-growth-log",
  "zhichuan-ai-collaboration-log",
  "zhichuan-teacher-class-data"
];
const stages = ["初学者", "课程学习中", "项目实践阶段", "论文研究阶段"];
const interests = ["新媒体传播", "国际传播", "文化传播", "品牌传播", "舆情分析", "AI传播", "其他"];
const goals = ["掌握计算传播方法", "完成课程项目", "完成论文研究", "提升数据分析能力", "提升AI应用能力"];
const emptyIdentity = { name: "", major: "", grade: "", stage: "初学者", interest: "新媒体传播", goals: [] };

export default function LearningProfile({ onNavigate }) {
  const [identity, setIdentity] = useState(loadIdentity);
  const [form, setForm] = useState(() => loadIdentity() || emptyIdentity);
  const [editing, setEditing] = useState(!identity);
  const [record, setRecord] = useState(loadRecord);
  const insight = useMemo(() => buildInsight(record), [record]);
  const [logs, setLogs] = useState(loadGrowthLogs);

  useEffect(() => {
    if (!identity) return;
    if (!identity.baseline) {
      const nextIdentity = { ...identity, baseline: Object.fromEntries(insight.abilities.map((item) => [item.name, item.stars])), createdAt: identity.createdAt || new Date().toISOString() };
      try { window.localStorage.setItem(identityKey, JSON.stringify(nextIdentity)); } catch { /* 本地存储不可用时保留当前会话状态。 */ }
      setIdentity(nextIdentity);
      return;
    }
    const nextLogs = syncGrowthLogs(identity, record, insight, logs);
    if (nextLogs.length !== logs.length) {
      setLogs(nextLogs);
      saveGrowthLogs(nextLogs);
    }
  }, [identity, record, insight, logs]);

  const save = () => {
    if (!form.name.trim()) return;
    const baseline = identity?.baseline || Object.fromEntries(insight.abilities.map((item) => [item.name, item.stars]));
    const next = { ...form, name: form.name.trim(), baseline, createdAt: identity?.createdAt || new Date().toISOString() };
    try { window.localStorage.setItem(identityKey, JSON.stringify(next)); } catch { /* 本地存储不可用时仍显示当前身份。 */ }
    setIdentity(next);
    if (!identity) {
      const creationLog = createLog("identity-created", next.createdAt, "创建学习档案", "AI学习档案", "建立五维能力初始基线", "建议从知识图谱第 1 章开始，完成第一个学习节点。");
      const nextLogs = [creationLog, ...logs];
      setLogs(nextLogs);
      saveGrowthLogs(nextLogs);
    }
    setEditing(false);
  };

  const resetDemoData = () => {
    if (!window.confirm("是否清除当前本地学习记录？此操作会重置学习档案、进度、工作流、智能体记录和项目展示卡片。")) return;
    try {
      demoStorageKeys.forEach((key) => window.localStorage.removeItem(key));
    } catch {
      // localStorage 不可用时仍重置当前页面会话状态。
    }
    setIdentity(null);
    setForm(emptyIdentity);
    setRecord(loadRecord());
    setLogs([]);
    setEditing(true);
  };

  if (editing) return <IdentityForm form={form} setForm={setForm} onSave={save} hasIdentity={Boolean(identity)} />;

  return (
    <div className="space-y-8">
      <SectionHeader eyebrow="ZhiChuan AI Learning Identity" title="我的 AI 学习档案" subtitle="你的学习身份、行为记录与项目进度都保存在当前浏览器本地，用于生成个性化学习建议。" />

      <section className="rounded-3xl border border-cyan/20 bg-panel/80 p-6 shadow-glow sm:p-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-semibold text-mint">AI 学习身份</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">{identity.name}，欢迎继续你的计算传播学学习</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">{identity.major || "未填写专业"} · {identity.grade || "未填写年级"} · {identity.stage} · 兴趣方向：{identity.interest}</p>
            <div className="mt-4 flex flex-wrap gap-2">{identity.goals.length ? identity.goals.map((item) => <span key={item} className="rounded-full border border-violet/30 bg-violet/10 px-3 py-1 text-xs text-violet">{item}</span>) : <span className="text-sm text-slate-400">尚未设置学习目标</span>}</div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => { setForm(identity); setEditing(true); }} className="rounded-xl border border-white/10 bg-white/[.05] px-4 py-3 text-sm text-slate-300 transition hover:border-cyan/50 hover:text-cyan">编辑档案</button>
            <button onClick={() => setRecord(loadRecord())} className="rounded-xl border border-cyan/35 bg-cyan/10 px-4 py-3 text-sm font-semibold text-cyan transition hover:bg-cyan/20">刷新学习记录</button>
            <button onClick={resetDemoData} className="rounded-xl border border-amber/35 bg-amber/10 px-4 py-3 text-sm font-semibold text-amber transition hover:bg-amber/20">重置教学演示数据</button>
          </div>
        </div>
        <p className="mt-6 border-t border-white/10 pt-4 text-xs leading-6 text-slate-400">当前版本学习档案保存在本地浏览器，未来版本可接入账号系统实现跨设备同步。</p>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <article className="rounded-2xl border border-violet/25 bg-ink/80 p-6 shadow-glow">
          <p className="text-sm font-semibold text-violet">能力画像展示</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">五维能力星级</h2>
          <div className="mt-5 space-y-4">{insight.abilities.map((item) => <AbilityRow key={item.name} item={item} />)}</div>
        </article>
        <article className="rounded-2xl border border-cyan/20 bg-panel/80 p-6 shadow-glow">
          <p className="text-sm font-semibold text-cyan">学习状态</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">行为记录摘要</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Metric label="知识图谱完成度" value={`${record.chapters.length} / 10 章`} />
            <Metric label="项目完成状态" value={record.project ? "已生成项目档案" : "尚未生成项目档案"} />
            <Metric label="AI 智能体使用" value={`${record.agents.length} 类`} />
            <Metric label="当前学习阶段" value={stageLabel(record.workflow.currentStage)} />
          </div>
          <div className="mt-5 rounded-xl border border-mint/20 bg-mint/10 p-4 text-sm leading-7 text-slate-200">
            <span className="font-semibold text-mint">项目工作流：</span>已完成 {record.workflow.completed.length} / 5 个阶段；当前推荐从“{stageLabel(record.workflow.currentStage)}”继续推进。
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        <article className="rounded-2xl border border-mint/25 bg-mint/10 p-6 shadow-glow">
          <p className="text-sm font-semibold text-mint">能力成长变化</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">初始能力 → 当前能力</h2>
          <div className="mt-5 space-y-3">{insight.abilities.map((item) => <GrowthChange key={item.name} name={item.name} initial={identity.baseline?.[item.name] || item.stars} current={item.stars} />)}</div>
        </article>
        <article className="rounded-2xl border border-cyan/20 bg-panel/80 p-6 shadow-glow">
          <p className="text-sm font-semibold text-cyan">AI 成长总结</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">你的计算传播学习成长报告</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-slate-200">
            <p><span className="font-semibold text-mint">学习阶段：</span>{identity.stage}；当前工作流处于{stageLabel(record.workflow.currentStage)}。</p>
            <p><span className="font-semibold text-mint">当前优势：</span>{insight.strengths[0]}</p>
            <p><span className="font-semibold text-mint">能力提升：</span>{growthSummary(identity.baseline, insight.abilities)}</p>
            <p><span className="font-semibold text-mint">下一阶段建议：</span>{insight.next[0]}</p>
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-violet/25 bg-violet/10 p-6 shadow-glow">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-sm font-semibold text-violet">AI 成长日志</p><h2 className="mt-1 text-2xl font-semibold text-white">学习行为与能力变化记录</h2></div>
          <span className="text-sm text-slate-300">已记录 {logs.length} 条本地成长事件</span>
        </div>
        <div className="mt-5 space-y-3">{logs.length ? logs.slice(0, 12).map((log) => <GrowthLogCard key={log.id} log={log} />) : <div className="rounded-xl border border-white/10 bg-ink/65 p-5 text-sm leading-7 text-slate-400">创建学习档案或完成学习行为后，系统会自动在此生成成长记录。</div>}</div>
      </section>

      <section className="rounded-2xl border border-cyan/20 bg-panel/80 p-6 shadow-glow">
        <p className="text-sm font-semibold text-cyan">你的 AI 学习报告</p>
        <h2 className="mt-1 text-2xl font-semibold text-white">个性化学习诊断</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <ReportCard title="当前优势" tone="mint" items={insight.strengths} />
          <ReportCard title="当前不足" tone="amber" items={insight.gaps} />
          <ReportCard title="推荐下一步" tone="cyan" items={insight.next} button="进入知识图谱" onClick={() => onNavigate("knowledge")} />
          <ReportCard title="推荐实践项目" tone="violet" items={projectSuggestions(identity.interest)} button="进入学生项目" onClick={() => onNavigate("studentProjects")} />
          <ReportCard title="推荐智能体" tone="cyan" items={insight.agentAdvice} button="进入课程智能体" onClick={() => onNavigate("agents")} />
          <ReportCard title="学习数据来源" tone="violet" items={["知识图谱章节完成情况", "AI 工作流当前阶段与完成步骤", "课程智能体与智能分析实验室使用记录", "学生项目展示卡片状态"]} button="进入 AI 工作流" onClick={() => onNavigate("workflow")} />
        </div>
      </section>

      <section className="rounded-2xl border border-mint/20 bg-mint/10 p-6 shadow-glow">
        <p className="text-sm font-semibold text-mint">我的 AI 成长路径</p>
        <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">{["开始学习", "项目设计", "数据分析", "研究设计", "成果评价", "能力成长"].map((item, index) => <div key={item} className="rounded-xl border border-white/10 bg-ink/70 p-4 text-center text-sm font-semibold text-white transition hover:-translate-y-1 hover:border-mint/45"><span className="block text-xs text-cyan">{String(index + 1).padStart(2, "0")}</span><span className="mt-2 block">{item}</span></div>)}</div>
        <button onClick={() => onNavigate("workflow")} className="mt-5 rounded-xl border border-mint/35 bg-ink/65 px-5 py-3 text-sm font-semibold text-mint transition hover:bg-mint/15">继续我的项目成长路径</button>
      </section>
    </div>
  );
}

function IdentityForm({ form, setForm, onSave, hasIdentity }) {
  const toggleGoal = (goal) => setForm((current) => ({ ...current, goals: current.goals.includes(goal) ? current.goals.filter((item) => item !== goal) : [...current.goals, goal] }));
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <SectionHeader eyebrow="Create Local Learning Identity" title={hasIdentity ? "更新你的 AI 学习档案" : "创建你的 AI 学习档案"} subtitle="这不是传统账号登录。档案仅保存于当前浏览器，用于生成个性化学习画像、智能推荐和项目管理记录。" />
      <section className="rounded-3xl border border-cyan/20 bg-panel/85 p-6 shadow-glow sm:p-8">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="姓名" value={form.name} onChange={(value) => setForm({ ...form, name: value })} placeholder="请输入你的姓名" />
          <Input label="专业" value={form.major} onChange={(value) => setForm({ ...form, major: value })} placeholder="例如：新闻传播学" />
          <Input label="年级" value={form.grade} onChange={(value) => setForm({ ...form, grade: value })} placeholder="例如：2024级" />
          <Select label="学习阶段" value={form.stage} options={stages} onChange={(value) => setForm({ ...form, stage: value })} />
          <Select label="兴趣方向" value={form.interest} options={interests} onChange={(value) => setForm({ ...form, interest: value })} />
        </div>
        <div className="mt-6"><p className="mb-3 text-sm font-semibold text-cyan">学习目标</p><div className="grid gap-3 sm:grid-cols-2">{goals.map((goal) => <label key={goal} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm transition ${form.goals.includes(goal) ? "border-cyan/60 bg-cyan/10 text-white" : "border-white/10 bg-ink/65 text-slate-300 hover:border-cyan/35"}`}><input type="checkbox" checked={form.goals.includes(goal)} onChange={() => toggleGoal(goal)} className="h-4 w-4 accent-cyan" />{goal}</label>)}</div></div>
        <button disabled={!form.name.trim()} onClick={onSave} className="mt-7 w-full rounded-xl border border-cyan/40 bg-cyan/15 px-5 py-3 text-sm font-semibold text-cyan shadow-glow transition hover:bg-cyan/25 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[.04] disabled:text-slate-500">{hasIdentity ? "保存学习档案" : "创建学习档案"}</button>
      </section>
    </div>
  );
}

function AbilityRow({ item }) { return <div className="rounded-xl border border-white/10 bg-white/[.035] p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold text-white">{item.name}</h3><p className="mt-1 text-xs text-slate-400">{item.reason}</p></div><span className="text-lg tracking-wider text-amber">{"★".repeat(item.stars)}<span className="text-slate-600">{"☆".repeat(5 - item.stars)}</span></span></div></div>; }
function GrowthChange({ name, initial, current }) { return <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-ink/70 p-4"><span className="font-semibold text-white">{name}</span><span className="text-sm tracking-wider text-slate-400">{"★".repeat(initial)}{"☆".repeat(5 - initial)} <span className="mx-2 text-cyan">→</span> <span className="text-amber">{"★".repeat(current)}</span>{"☆".repeat(5 - current)}</span></div>; }
function GrowthLogCard({ log }) { return <article className="grid gap-3 rounded-xl border border-white/10 bg-ink/70 p-4 md:grid-cols-[130px_1fr_auto]"><div className="text-xs leading-6 text-slate-400">{formatTime(log.time)}<br /><span className="text-cyan">{log.module}</span></div><div><h3 className="font-semibold text-white">{log.action}</h3><p className="mt-1 text-sm text-mint">能力变化：{log.change}</p><p className="mt-1 text-sm leading-6 text-slate-300">AI建议：{log.advice}</p></div><span className="self-start rounded-full border border-violet/25 bg-violet/10 px-3 py-1 text-xs text-violet">已记录</span></article>; }
function Metric({ label, value }) { return <div className="rounded-xl border border-white/10 bg-ink/70 p-4"><p className="text-xs text-slate-400">{label}</p><p className="mt-2 text-sm font-semibold text-mint">{value}</p></div>; }
function ReportCard({ title, tone, items, button, onClick }) { const styles = { mint: "border-mint/25 bg-mint/10 text-mint", amber: "border-amber/25 bg-amber/10 text-amber", cyan: "border-cyan/25 bg-cyan/10 text-cyan", violet: "border-violet/25 bg-violet/10 text-violet" }; return <article className={`rounded-2xl border p-5 ${styles[tone]}`}><h3 className="text-lg font-semibold">{title}</h3><ul className="mt-3 space-y-2 text-sm leading-7 text-slate-200">{items.map((item) => <li key={item}>• {item}</li>)}</ul>{button && <button onClick={onClick} className="mt-4 rounded-xl border border-white/15 bg-ink/65 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-white/40">{button}</button>}</article>; }
function Input({ label, value, onChange, placeholder }) { return <label className="block"><span className="mb-2 block text-sm font-semibold text-cyan">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-white/10 bg-ink/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan focus:shadow-glow" /></label>; }
function Select({ label, value, options, onChange }) { return <label className="block"><span className="mb-2 block text-sm font-semibold text-cyan">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-white/10 bg-ink/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan focus:shadow-glow">{options.map((option) => <option key={option}>{option}</option>)}</select></label>; }

function buildInsight(record) {
  const hasChapter = (number) => record.chapters.includes(`chapter-${number}`);
  const completed = (id) => record.workflow.completed.includes(id);
  const used = (name) => record.agents.some((agent) => agent.includes(name));
  const abilities = [
    { name: "传播理论能力", stars: scoreToStars((hasChapter(1) ? 2 : 0) + (hasChapter(2) ? 1 : 0) + (hasChapter(3) ? 1 : 0) + (completed("discover") ? 1 : 0)), reason: "由导论、平台传播与问题表达学习记录计算" },
    { name: "数据分析能力", stars: scoreToStars((hasChapter(5) ? 1 : 0) + (hasChapter(6) ? 1 : 0) + (hasChapter(7) ? 1 : 0) + (record.labUsage ? 2 : 0) + (used("AI数据分析") ? 1 : 0)), reason: "由数据章节、实验室和数据分析智能体记录计算" },
    { name: "Python实践能力", stars: scoreToStars((hasChapter(4) ? 2 : 0) + (hasChapter(5) ? 1 : 0) + (hasChapter(6) ? 1 : 0) + (record.labUsage ? 1 : 0)), reason: "由 Python、清洗、可视化和实验室实践记录计算" },
    { name: "研究设计能力", stars: scoreToStars((hasChapter(3) ? 1 : 0) + (hasChapter(8) ? 1 : 0) + (hasChapter(9) ? 1 : 0) + (used("AI项目策划") ? 1 : 0) + (used("AI研究设计") ? 1 : 0)), reason: "由研究问题、文本方法和设计智能体记录计算" },
    { name: "项目实践能力", stars: scoreToStars((completed("design") ? 1 : 0) + (completed("evaluate") ? 1 : 0) + (record.project ? 2 : 0) + (used("AI项目评价") ? 1 : 0)), reason: "由工作流、项目卡片和项目评价记录计算" }
  ];
  const low = abilities.slice().sort((a, b) => a.stars - b.stars)[0];
  const strengths = abilities.filter((item) => item.stars >= 3).map((item) => `${item.name}基础较好（${"★".repeat(item.stars)}）。`);
  const gaps = abilities.filter((item) => item.stars < 3).map((item) => `${item.name}仍需加强，建议优先完成一项对应章节或实践任务。`);
  return {
    abilities,
    strengths: strengths.length ? strengths : ["你已建立本地学习身份；完成知识章节、使用智能体和生成项目后，系统将形成更清晰的优势画像。"],
    gaps: gaps.length ? gaps : ["五项能力均已达到基础课程项目水平，可挑战跨平台比较或更完整的论文研究。"],
    next: nextAdvice(low.name),
    agentAdvice: agentAdvice(low.name)
  };
}

function nextAdvice(ability) { return { "传播理论能力": ["建议学习第 1-3 章：导论、平台传播效果、问题数据化表达。", "练习：用一个平台案例写出“现象—对象—研究问题”。"], "数据分析能力": ["建议学习第 5-7 章：数据清洗、可视化、情感分析。", "练习：在智能分析实验室完成一次评论文本试分析。"], "Python实践能力": ["建议学习第 4-6 章：Python 基础、数据清洗、可视化。", "练习：读取一份 CSV 并完成基础统计与趋势图。"], "研究设计能力": ["建议学习第 3、8-9 章：问题表达、主题模型与文本分类。", "练习：为项目写出 RQ1-RQ3、变量表和方法表。"], "项目实践能力": ["建议进入 AI 工作流完成项目设计与成果评价。", "练习：在学生项目中心生成项目展示卡片。"] }[ability]; }
function agentAdvice(ability) { return { "传播理论能力": ["推荐 AI学习导师智能体：诊断概念基础并规划学习路径。", "推荐 AI项目策划智能体：把兴趣转化为项目主题。"], "数据分析能力": ["推荐 AI数据分析智能体：根据数据类型匹配方法。", "推荐智能分析实验室：完成词频、情感和主题试分析。"], "Python实践能力": ["推荐 AI学习导师智能体：安排 Python 与数据处理练习。", "推荐 AI数据分析智能体：确认数据清洗和分析步骤。"], "研究设计能力": ["推荐 AI研究设计智能体：生成理论框架、变量与方法逻辑。", "推荐 AI项目策划智能体：压缩项目边界。"], "项目实践能力": ["推荐 AI项目评价智能体：获取教师视角的项目反馈。", "推荐 AI项目策划智能体：补齐成果方案与实践路径。"] }[ability]; }
function projectSuggestions(interest) { return { "品牌传播": ["品牌传播项目：分析品牌笔记评论中的情感、主题与互动表现。"], "文化传播": ["文化传播项目：研究国风或文旅内容的叙事主题与受众评价。"], "国际传播": ["国际传播项目：分析海外平台中中国文化内容的评论与国家形象表达。"], "舆情分析": ["舆情分析项目：追踪公共事件的讨论主题、情感变化与议题演化。"], "AI传播": ["AI传播项目：比较 AI 话题内容中的风险认知、态度与传播框架。"], "新媒体传播": ["新媒体传播项目：比较短视频内容类型、评论主题与互动效果。"], "其他": ["自定义项目：从熟悉的平台和可获得的数据开始，完成小样本试分析。"] }[interest] || ["选择一个熟悉平台，完成从数据采集到图表展示的小型课程项目。 "]; }
function loadIdentity() { try { const item = JSON.parse(window.localStorage.getItem(identityKey) || "null"); return item && item.name ? { ...emptyIdentity, ...item, goals: Array.isArray(item.goals) ? item.goals : [] } : null; } catch { return null; } }
function loadRecord() { const parse = (key, fallback) => { try { return JSON.parse(window.localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; } }; const workflow = parse("zhichuan-ai-workflow-profile", {}); const workflowAgents = Array.isArray(workflow.usedAgents) ? workflow.usedAgents : []; const courseAgents = parse("zhichuan-course-agent-usage", []); return { chapters: parse("zhichuan-knowledge-progress", []), workflow: { currentStage: workflow.currentStage || "noIdea", completed: Array.isArray(workflow.completed) ? workflow.completed : [] }, agents: Array.from(new Set([...workflowAgents, ...(Array.isArray(courseAgents) ? courseAgents : [])])), labUsage: Number(window.localStorage.getItem("zhichuan-analysis-lab-usage") || "0"), project: parse("zhichuan-student-project", null) }; }
function loadGrowthLogs() { try { const logs = JSON.parse(window.localStorage.getItem(growthLogKey) || "[]"); return Array.isArray(logs) ? logs : []; } catch { return []; } }
function saveGrowthLogs(logs) { try { window.localStorage.setItem(growthLogKey, JSON.stringify(logs.slice(0, 80))); } catch { /* 保留当前页面日志。 */ } }
function syncGrowthLogs(identity, record, insight, logs) {
  const existing = new Set(logs.map((item) => item.id));
  const additions = [];
  const add = (id, action, module, change, advice, time = new Date().toISOString()) => { if (!existing.has(id)) additions.push(createLog(id, time, action, module, change, advice)); };
  add("identity-created", "创建学习档案", "AI学习档案", "建立五维能力初始基线", "从知识图谱第 1 章开始，逐步形成学习记录。", identity.createdAt || new Date().toISOString());
  record.chapters.forEach((id) => {
    const number = Number(id.replace("chapter-", ""));
    add(`chapter-${number}-completed`, `完成知识图谱第 ${number} 章`, "知识图谱", chapterChange(number), chapterAdvice(number));
  });
  record.agents.forEach((agent) => add(`agent-${agent}`, `使用${agent}`, "课程智能体", agentChange(agent), agentAdviceForLog(agent)));
  record.workflow.completed.forEach((id) => add(`workflow-${id}`, `完成工作流阶段：${workflowName(id)}`, "AI工作流", workflowChange(id), workflowAdvice(id)));
  if (record.labUsage > 0) add(`analysis-lab-${record.labUsage}`, `完成第 ${record.labUsage} 次文本试分析`, "智能分析实验室", "数据分析能力获得实践记录", "结合代表文本核验词频、情感或主题结果，再写出一条研究发现。");
  if (record.project) add(`student-project-${record.project.savedAt || record.project.name}`, "生成学生项目档案", "学生项目中心", "项目实践能力获得成果记录", "使用 AI项目评价智能体检查选题、数据、方法与实践价值。", record.project.savedAt || new Date().toISOString());
  return additions.length ? [...additions.reverse(), ...logs].slice(0, 80) : logs;
}
function createLog(id, time, action, module, change, advice) { return { id, time, action, module, change, advice }; }
function chapterChange(number) { if (number <= 3) return "传播理论与问题意识提升"; if (number <= 6) return "Python实践与数据处理能力提升"; if (number <= 9) return "数据分析与研究设计能力提升"; return "研究设计与项目表达能力提升"; }
function chapterAdvice(number) { if (number <= 3) return "尝试把一个传播现象写成研究对象、数据字段和研究问题。"; if (number <= 6) return "用一份小型 CSV 数据重复完成读取、清洗和可视化练习。"; return "将本章方法用于课程项目的小样本试分析，并保存结果截图。"; }
function agentChange(agent) { if (agent.includes("学习导师")) return "学习路径与理论基础获得支持"; if (agent.includes("数据分析")) return "数据分析方法选择能力提升"; if (agent.includes("研究设计") || agent.includes("项目策划")) return "研究设计能力获得支持"; return "项目实践与评价意识获得支持"; }
function agentAdviceForLog(agent) { if (agent.includes("学习导师")) return "根据推荐章节完成一个学习节点，再回到档案刷新画像。"; if (agent.includes("数据分析")) return "用智能分析实验室对 20-30 条文本进行一次试分析。"; if (agent.includes("研究设计")) return "把生成的研究问题进一步对应到变量、数据字段和方法。"; if (agent.includes("项目策划")) return "补齐项目设计报告中的平台、数据类型和成果形式。"; return "根据项目评价建议修改方案，并生成学生项目展示卡片。"; }
function workflowName(id) { return { discover: "项目发现", design: "项目设计", data: "数据处理", method: "方法分析", evaluate: "成果评价" }[id] || id; }
function workflowChange(id) { return { discover: "传播理论与项目意识提升", design: "研究设计与项目实践能力提升", data: "数据分析与Python实践能力提升", method: "方法选择与研究设计能力提升", evaluate: "项目实践与成果反思能力提升" }[id] || "学习能力获得阶段性提升"; }
function workflowAdvice(id) { return { discover: "进入 AI项目策划智能体，将兴趣转化为可执行项目。", design: "完成 20-30 条样本试采，验证数据字段是否可获得。", data: "进入方法工具箱，比对研究问题与分析方法。", method: "使用 AI研究设计智能体整理研究问题、变量和论文结构。", evaluate: "在学生项目中心提交成果，并进行下一轮能力复盘。" }[id] || "继续推进下一阶段学习任务。"; }
function growthSummary(baseline, abilities) { const changes = abilities.map((item) => ({ name: item.name, delta: item.stars - (baseline?.[item.name] || item.stars) })).filter((item) => item.delta > 0); return changes.length ? changes.map((item) => `${item.name}提升 ${item.delta} 星`).join("；") : "当前能力基线已建立；完成章节、使用智能体或生成项目后将显示具体成长变化。"; }
function formatTime(time) { const date = new Date(time); return Number.isNaN(date.getTime()) ? "刚刚" : `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`; }
function scoreToStars(score) { return Math.max(1, Math.min(5, score)); }
function stageLabel(id) { return { noIdea: "项目发现阶段", topic: "项目设计阶段", data: "数据分析阶段", paper: "研究设计阶段", finish: "成果评价阶段", growth: "能力成长阶段" }[id] || "项目发现阶段"; }
