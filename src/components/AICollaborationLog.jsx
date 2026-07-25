import { useEffect, useMemo, useState } from "react";
import SectionHeader from "./SectionHeader.jsx";

const storageKey = "zhichuan-ai-collaboration-log";

const phases = [
  { id: "discover", title: "项目发现", agent: "AI学习导师", task: "识别学生兴趣方向", output: "推荐学习路径", ability: "传播理论能力 +1", next: "进入项目设计阶段", target: "agents" },
  { id: "design", title: "项目设计", agent: "AI项目策划", task: "生成项目方案", output: "研究主题、数据来源、成果形式", ability: "研究设计能力 +1", next: "进入数据分析阶段", target: "agents" },
  { id: "data", title: "数据分析", agent: "AI数据分析", task: "判断数据类型", output: "推荐分析方法", ability: "数据分析能力 +1", next: "进入研究设计阶段", target: "lab" },
  { id: "research", title: "研究设计", agent: "AI研究设计", task: "完善研究问题和方法路径", output: "RQ、理论、变量设计", ability: "研究设计能力 +1", next: "进入成果评价阶段", target: "agents" },
  { id: "evaluate", title: "成果评价", agent: "AI项目评价", task: "检查项目质量", output: "修改建议和评价反馈", ability: "项目实践能力 +1", next: "整理成果并提交学生项目档案", target: "studentProjects" }
];

export default function AICollaborationLog({ onNavigate }) {
  const [record, setRecord] = useState(loadRecord);
  const [logs, setLogs] = useState(loadLogs);
  const report = useMemo(() => buildReport(record, logs), [record, logs]);

  useEffect(() => {
    const nextLogs = syncLogs(record, logs);
    if (nextLogs.length !== logs.length) {
      setLogs(nextLogs);
      saveLogs(nextLogs);
    }
  }, [record, logs]);

  const refresh = () => setRecord(loadRecord());

  return (
    <div className="space-y-8">
      <SectionHeader eyebrow="ZhiChuan AI Collaboration" title="AI协同学习轨迹" subtitle="多个AI教育智能体围绕学生项目进行协同支持，实现从选题、分析、研究到评价的全过程智能陪伴。" />

      <section className="rounded-3xl border border-cyan/20 bg-panel/80 p-6 shadow-glow sm:p-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-semibold text-mint">AI 协同学习轨迹</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{record.projectName}</h2>
            <p className="mt-2 text-sm leading-7 text-slate-300">学习者：{record.identity?.name || "未创建学习身份"}｜当前项目阶段：{workflowStageName(record.workflow.currentStage)}</p>
          </div>
          <button onClick={refresh} className="rounded-xl border border-cyan/35 bg-cyan/10 px-4 py-3 text-sm font-semibold text-cyan transition hover:bg-cyan/20">同步最新学习行为</button>
        </div>
      </section>

      <section>
        <div className="mb-4"><p className="text-sm font-semibold text-cyan">Collaboration Flow</p><h2 className="mt-1 text-2xl font-semibold text-white">项目协同流程</h2></div>
        <div className="grid gap-4 xl:grid-cols-5">{phases.map((phase, index) => <PhaseCard key={phase.id} phase={phase} index={index} active={report.completedPhaseIds.includes(phase.id)} onClick={() => onNavigate(phase.target)} />)}</div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <article className="rounded-2xl border border-violet/25 bg-violet/10 p-6 shadow-glow">
          <p className="text-sm font-semibold text-violet">智能体协同报告</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">你的 AI 学习协同报告</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-slate-200">
            <p><span className="font-semibold text-mint">参与智能体数量：</span>{report.agents.length} 个（{report.agents.length ? report.agents.join("、") : "尚未产生智能体记录"}）</p>
            <p><span className="font-semibold text-mint">完成阶段：</span>{report.completedNames.length ? report.completedNames.join("、") : "尚未完成阶段"}</p>
            <p><span className="font-semibold text-mint">能力提升：</span>{report.abilityChange}</p>
            <p><span className="font-semibold text-mint">项目状态：</span>{report.projectStatus}</p>
            <p><span className="font-semibold text-mint">下一步推荐：</span>{report.next}</p>
          </div>
          <button onClick={() => onNavigate(report.nextTarget)} className="mt-6 w-full rounded-xl border border-violet/35 bg-ink/70 px-5 py-3 text-sm font-semibold text-violet transition hover:bg-violet/20">{report.nextAction}</button>
        </article>
        <article className="rounded-2xl border border-mint/25 bg-mint/10 p-6 shadow-glow">
          <p className="text-sm font-semibold text-mint">多智能体协同方式</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">从建议到行动的接力</h2>
          <ol className="mt-5 space-y-3 text-sm leading-7 text-slate-200"><li>1. 学习导师识别基础与兴趣，启动学习路径。</li><li>2. 项目策划将兴趣转为研究方案和成果目标。</li><li>3. 数据分析智能体结合实验室行为，匹配分析方法。</li><li>4. 研究设计智能体完善 RQ、理论和变量逻辑。</li><li>5. 项目评价智能体提供反馈，推动成果提交与下一轮成长。</li></ol>
        </article>
      </section>

      <section className="rounded-2xl border border-cyan/20 bg-panel/80 p-6 shadow-glow">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-semibold text-cyan">AI Collaboration Log</p><h2 className="mt-1 text-2xl font-semibold text-white">协同日志记录</h2></div><span className="text-sm text-slate-400">已保存 {logs.length} 条本地协同事件</span></div>
        <div className="mt-5 space-y-3">{logs.length ? logs.slice(0, 16).map((log) => <LogCard key={log.id} log={log} />) : <div className="rounded-xl border border-white/10 bg-ink/70 p-6 text-sm leading-7 text-slate-400">使用课程智能体、完成工作流或生成项目档案后，系统会在此自动记录智能体协同行为。</div>}</div>
      </section>
    </div>
  );
}

function PhaseCard({ phase, index, active, onClick }) {
  return <article className={`rounded-2xl border p-4 shadow-glow transition hover:-translate-y-1 ${active ? "border-mint/40 bg-mint/10" : "border-white/10 bg-panel/80"}`}><div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold text-cyan">阶段 {index + 1}</span><span className={`rounded-full px-2 py-1 text-xs ${active ? "bg-mint/15 text-mint" : "bg-white/[.06] text-slate-400"}`}>{active ? "已参与" : "待协同"}</span></div><h3 className="mt-3 text-lg font-semibold text-white">{phase.title}</h3><Info title="参与智能体" text={phase.agent} /><Info title="任务" text={phase.task} /><Info title="输出" text={phase.output} /><button onClick={onClick} className="mt-4 w-full rounded-lg border border-cyan/25 bg-cyan/10 px-3 py-2 text-xs font-semibold text-cyan transition hover:bg-cyan/20">打开对应工具</button></article>;
}

function LogCard({ log }) { return <article className="grid gap-3 rounded-xl border border-white/10 bg-ink/70 p-4 md:grid-cols-[125px_1fr_auto]"><div className="text-xs leading-6 text-slate-400">{formatTime(log.time)}<br /><span className="text-cyan">{log.phase}</span></div><div><p className="text-xs text-violet">项目：{log.project}</p><h3 className="mt-1 font-semibold text-white">{log.agent} · {log.task}</h3><p className="mt-1 text-sm text-mint">能力变化：{log.ability}</p><p className="mt-1 text-sm leading-6 text-slate-300">下一步：{log.next}</p></div><span className="self-start rounded-full border border-mint/25 bg-mint/10 px-3 py-1 text-xs text-mint">已协同</span></article>; }
function Info({ title, text }) { return <div className="mt-3"><p className="text-xs font-semibold text-cyan">{title}</p><p className="mt-1 text-xs leading-5 text-slate-400">{text}</p></div>; }

function buildReport(record, logs) {
  const completedPhaseIds = Array.from(new Set(logs.map((log) => log.phaseId)));
  const completedNames = phases.filter((phase) => completedPhaseIds.includes(phase.id)).map((phase) => phase.title);
  const agents = Array.from(new Set(logs.map((log) => log.agent)));
  const currentIndex = phases.findIndex((phase) => !completedPhaseIds.includes(phase.id));
  const nextPhase = phases[currentIndex === -1 ? phases.length - 1 : currentIndex];
  const abilityChange = logs.length ? Array.from(new Set(logs.map((log) => log.ability))).join("；") : "等待第一条学习行为记录";
  return { agents, completedPhaseIds, completedNames, abilityChange, projectStatus: record.project ? "已生成学生项目档案" : record.workflow.completed.length ? "项目正在推进，尚未生成成果档案" : "尚未启动项目档案", next: currentIndex === -1 ? "已完成完整协同链，建议进入学生项目中心提交成果并复盘能力成长。" : `建议${nextPhase.next}。`, nextTarget: currentIndex === -1 ? "studentProjects" : nextPhase.target, nextAction: currentIndex === -1 ? "提交项目成果" : `进入${nextPhase.title}` };
}

function syncLogs(record, logs) {
  const existing = new Set(logs.map((log) => log.id));
  const additions = [];
  const add = (id, phaseId, task, time = new Date().toISOString()) => {
    if (existing.has(id)) return;
    const phase = phases.find((item) => item.id === phaseId);
    if (!phase) return;
    additions.push({ id, time, project: record.projectName, agent: phase.agent, phase: phase.title, phaseId, task, ability: phase.ability, next: phase.next });
  };
  if (record.identity) add("collab-discover-identity", "discover", "识别学生学习身份与兴趣方向", record.identity.createdAt || new Date().toISOString());
  record.agents.forEach((agent) => {
    if (agent.includes("学习导师")) add("collab-discover-agent", "discover", "依据学习阶段生成学习路径");
    if (agent.includes("项目策划")) add("collab-design-agent", "design", "完成研究方案与项目设计");
    if (agent.includes("数据分析")) add("collab-data-agent", "data", "判断数据类型并匹配分析方法");
    if (agent.includes("研究设计")) add("collab-research-agent", "research", "完善研究问题、理论与变量设计");
    if (agent.includes("项目评价")) add("collab-evaluate-agent", "evaluate", "检查项目质量并生成修改建议");
  });
  if (record.labUsage) add(`collab-data-lab-${record.labUsage}`, "data", "完成文本数据的词频、情感或主题试分析");
  record.workflow.completed.forEach((id) => {
    const phaseId = id === "method" ? "research" : id;
    add(`collab-workflow-${id}`, phaseId, `完成 AI工作流中的${workflowStageName(id)}任务`);
  });
  if (record.project) add(`collab-project-${record.project.savedAt || record.project.name}`, "evaluate", "生成学生项目档案并进入成果复盘", record.project.savedAt || new Date().toISOString());
  return additions.length ? [...additions.reverse(), ...logs].slice(0, 80) : logs;
}

function loadRecord() { const parse = (key, fallback) => { try { return JSON.parse(window.localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; } }; const identity = parse("zhichuan-learning-identity", null); const workflow = parse("zhichuan-ai-workflow-profile", {}); const courseAgents = parse("zhichuan-course-agent-usage", []); const workflowAgents = Array.isArray(workflow.usedAgents) ? workflow.usedAgents : []; const project = parse("zhichuan-student-project", null); return { identity, workflow: { currentStage: workflow.currentStage || "noIdea", completed: Array.isArray(workflow.completed) ? workflow.completed : [] }, agents: Array.from(new Set([...workflowAgents, ...(Array.isArray(courseAgents) ? courseAgents : [])])), labUsage: Number(window.localStorage.getItem("zhichuan-analysis-lab-usage") || "0"), project, projectName: project?.name || identity?.interest ? `${project?.name || identity?.interest || "我的"}计算传播学项目` : "我的计算传播学项目" }; }
function loadLogs() { try { const saved = JSON.parse(window.localStorage.getItem(storageKey) || "[]"); return Array.isArray(saved) ? saved : []; } catch { return []; } }
function saveLogs(logs) { try { window.localStorage.setItem(storageKey, JSON.stringify(logs.slice(0, 80))); } catch { /* 本地存储不可用时保留当前页面日志。 */ } }
function workflowStageName(id) { return { noIdea: "项目发现阶段", topic: "项目设计阶段", data: "数据分析阶段", paper: "研究设计阶段", finish: "成果评价阶段", growth: "能力成长阶段", discover: "项目发现", design: "项目设计", method: "方法分析", evaluate: "成果评价" }[id] || "项目发现阶段"; }
function formatTime(time) { const date = new Date(time); return Number.isNaN(date.getTime()) ? "刚刚" : `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`; }
