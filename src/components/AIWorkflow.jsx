import { useEffect, useMemo, useState } from "react";
import SectionHeader from "./SectionHeader.jsx";

const storageKey = "zhichuan-ai-workflow-profile";

const stageOptions = [
  {
    id: "noIdea",
    label: "我还没有想法",
    stage: "项目发现阶段",
    agents: ["AI学习导师智能体", "AI项目策划智能体"],
    reason: "先识别你的学习基础与兴趣方向，再把模糊想法转成可执行的传播项目。",
    next: "进入课程智能体，生成一个项目兴趣方向和初步项目方案。",
    target: "agents",
    action: "开始项目发现"
  },
  {
    id: "topic",
    label: "我有研究主题",
    stage: "项目设计阶段",
    agents: ["AI项目策划智能体"],
    reason: "已有主题后，需要明确平台、对象、数据类型、方法任务和成果形式。",
    next: "进入课程智能体，生成《计算传播学项目设计报告》。",
    target: "agents",
    action: "完善项目设计"
  },
  {
    id: "data",
    label: "我已经有数据",
    stage: "数据分析阶段",
    agents: ["AI数据分析智能体"],
    reason: "已有文本或互动数据时，应先判断数据类型，再选择词频、情感、主题或可视化分析。",
    next: "进入智能分析实验室，完成词频、情感和主题的试分析。",
    target: "lab",
    action: "开始数据分析"
  },
  {
    id: "paper",
    label: "我正在设计论文",
    stage: "研究设计阶段",
    agents: ["AI研究设计智能体"],
    reason: "论文设计需要让研究问题、理论框架、变量和方法形成同一条逻辑链。",
    next: "进入课程智能体，生成研究问题、变量与方法设计。",
    target: "agents",
    action: "设计论文研究"
  },
  {
    id: "finish",
    label: "我完成了项目",
    stage: "成果评价阶段",
    agents: ["AI项目评价智能体"],
    reason: "项目完成后需回看选题、数据、方法、创新性和实践价值，形成可修改的评价意见。",
    next: "进入课程智能体进行项目评价，再提交学生项目档案。",
    target: "agents",
    action: "获取项目评价"
  },
  {
    id: "growth",
    label: "我想提升能力",
    stage: "能力成长阶段",
    agents: ["AI学习导师智能体"],
    reason: "通过学习诊断定位薄弱能力，并回到相应章节开展针对性练习。",
    next: "进入课程智能体生成学习路径，再完成推荐章节。",
    target: "agents",
    action: "规划能力成长"
  }
];

const lifecycle = [
  { id: "discover", title: "项目发现", goal: "从兴趣和课程能力中找到可研究的传播现象。", agent: "AI学习导师 + AI项目策划", chapters: "第 1-3 章：导论、平台传播、问题数据化", task: "写下一个兴趣方向、一个平台和一个可观察对象。", target: "agents" },
  { id: "design", title: "项目设计", goal: "明确项目主题、研究问题、数据方案和成果形式。", agent: "AI项目策划", chapters: "第 3、5 章：研究设计与数据清洗", task: "生成项目设计报告，并完成字段表初稿。", target: "agents" },
  { id: "data", title: "数据处理", goal: "验证数据能否获取，并完成小样本清洗与试分析。", agent: "AI数据分析", chapters: "第 5-7 章：数据清洗、可视化、情感分析", task: "输入 20-30 条文本，完成词频与情感试分析。", target: "lab" },
  { id: "method", title: "方法分析", goal: "选择能够回应研究问题的方法，并形成结果图表。", agent: "AI数据分析 + AI研究设计", chapters: "第 7-10 章：文本分析、主题模型、方法应用", task: "比较方法适配性，制作至少 2 张核心图表。", target: "methods" },
  { id: "evaluate", title: "成果评价", goal: "检验项目证据、解释质量和实践价值，形成最终成果。", agent: "AI项目评价", chapters: "项目实战与课程论文表达", task: "完成项目评价，并提交项目档案或课程成果。", target: "studentProjects" }
];

const initialProfile = {
  currentStage: "noIdea",
  completed: [],
  usedAgents: []
};

export default function AIWorkflow({ onNavigate }) {
  const [profile, setProfile] = useState(loadProfile);
  const selected = useMemo(() => stageOptions.find((item) => item.id === profile.currentStage) || stageOptions[0], [profile.currentStage]);

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(profile));
    } catch {
      // localStorage 不可用时仅保留当前会话状态。
    }
  }, [profile]);

  const selectStage = (id) => {
    const stage = stageOptions.find((item) => item.id === id) || stageOptions[0];
    setProfile((current) => ({
      ...current,
      currentStage: id,
      usedAgents: Array.from(new Set([...current.usedAgents, ...stage.agents]))
    }));
  };

  const toggleComplete = (id) => {
    setProfile((current) => ({
      ...current,
      completed: current.completed.includes(id) ? current.completed.filter((item) => item !== id) : [...current.completed, id]
    }));
  };

  const goTo = (target, agentNames = []) => {
    if (agentNames.length) {
      setProfile((current) => ({ ...current, usedAgents: Array.from(new Set([...current.usedAgents, ...agentNames])) }));
    }
    onNavigate(target);
  };

  const progress = Math.round((profile.completed.length / lifecycle.length) * 100);

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="ZhiChuan AI Project Workflow"
        title="智传 AI 项目学习工作流"
        subtitle="该模块通过多个教育智能体协同工作，为学生提供从选题、设计、分析到评价的全过程支持，实现 AI 辅助教学、实践训练与能力培养。"
      />

      <section className="overflow-hidden rounded-3xl border border-cyan/20 bg-panel/80 p-6 shadow-glow sm:p-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold text-mint">学生项目全过程 AI 陪伴系统</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">从学生想法到能力成长的协同路径</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">学生想法 → 项目设计 → 数据分析 → 研究设计 → 成果评价 → 能力成长</p>
          </div>
          <button onClick={() => goTo("knowledge", ["AI学习导师智能体"])} className="rounded-xl border border-violet/35 bg-violet/10 px-4 py-3 text-sm font-semibold text-violet transition hover:bg-violet/20">
            进入学习章节
          </button>
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-cyan">项目阶段选择</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">你现在处于哪一步？</h2>
          </div>
          <span className="text-sm text-slate-400">选择阶段后，系统会推荐已有的智能体与下一步页面。</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {stageOptions.map((item, index) => (
            <button key={item.id} onClick={() => selectStage(item.id)} className={`rounded-2xl border p-4 text-left transition duration-300 hover:-translate-y-1 ${selected.id === item.id ? "border-cyan bg-cyan/10 shadow-glow" : "border-white/10 bg-panel/75 hover:border-cyan/45"}`}>
              <span className="text-xs font-semibold text-mint">阶段 {index + 1}</span>
              <h3 className="mt-2 font-semibold text-white">{item.label}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-400">{item.stage}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
        <article className="rounded-2xl border border-cyan/25 bg-ink/80 p-6 shadow-glow">
          <p className="text-sm font-semibold text-cyan">当前阶段：{selected.stage}</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">推荐智能体</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {selected.agents.map((agent) => <span key={agent} className="rounded-full border border-mint/30 bg-mint/10 px-3 py-1.5 text-sm text-mint">{agent}</span>)}
          </div>
          <div className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
            <p><span className="font-semibold text-violet">为什么推荐：</span>{selected.reason}</p>
            <p><span className="font-semibold text-violet">下一步任务：</span>{selected.next}</p>
          </div>
          <button onClick={() => goTo(selected.target, selected.agents)} className="mt-6 w-full rounded-xl border border-cyan/40 bg-cyan/15 px-5 py-3 text-sm font-semibold text-cyan transition hover:bg-cyan/25">
            {selected.action}
          </button>
        </article>

        <ProjectArchive profile={profile} progress={progress} onNavigate={goTo} />
      </section>

      <section>
        <div className="mb-4">
          <p className="text-sm font-semibold text-mint">Project Lifecycle</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">项目生命周期</h2>
        </div>
        <div className="grid gap-4 xl:grid-cols-5">
          {lifecycle.map((item, index) => {
            const done = profile.completed.includes(item.id);
            return (
              <article key={item.id} className={`rounded-2xl border p-4 transition duration-300 hover:-translate-y-1 ${done ? "border-mint/40 bg-mint/10" : "border-white/10 bg-panel/80"}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-cyan">阶段 {index + 1}</span>
                  <span className={`rounded-full px-2 py-1 text-xs ${done ? "bg-mint/15 text-mint" : "bg-white/[.06] text-slate-400"}`}>{done ? "完成" : "待进行"}</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3>
                <InfoLine title="学习目标" text={item.goal} />
                <InfoLine title="推荐智能体" text={item.agent} />
                <InfoLine title="课程章节" text={item.chapters} />
                <InfoLine title="实践任务" text={item.task} />
                <div className="mt-4 grid gap-2">
                  <button onClick={() => goTo(item.target, [item.agent])} className="rounded-lg border border-cyan/25 bg-cyan/10 px-3 py-2 text-xs font-semibold text-cyan transition hover:bg-cyan/20">打开对应工具</button>
                  <button onClick={() => toggleComplete(item.id)} className="rounded-lg border border-white/10 bg-white/[.04] px-3 py-2 text-xs text-slate-300 transition hover:border-mint/40 hover:text-mint">{done ? "标记为未完成" : "标记本阶段完成"}</button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function ProjectArchive({ profile, progress, onNavigate }) {
  const status = (id) => profile.completed.includes(id) ? "完成" : id === "data" && profile.currentStage === "data" ? "进行中" : "未开始";
  return (
    <aside className="rounded-2xl border border-violet/25 bg-violet/10 p-6 shadow-glow">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-violet">我的项目成长档案</p>
          <h2 className="mt-1 text-xl font-semibold text-white">项目进度：{progress}%</h2>
        </div>
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-violet/35 text-sm font-bold text-violet">{progress}%</span>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-ink/70"><div className="h-full rounded-full bg-gradient-to-r from-cyan to-mint transition-all duration-500" style={{ width: `${progress}%` }} /></div>
      <div className="mt-5 space-y-3">
        {[['项目设计', 'design'], ['数据分析', 'data'], ['成果评价', 'evaluate']].map(([label, id]) => (
          <div key={id} className="flex items-center justify-between rounded-xl border border-white/10 bg-ink/60 px-4 py-3 text-sm"><span className="text-slate-200">{label}</span><span className={status(id) === "完成" ? "text-mint" : status(id) === "进行中" ? "text-cyan" : "text-slate-500"}>{status(id)}</span></div>
        ))}
      </div>
      <div className="mt-5 border-t border-white/10 pt-4">
        <p className="text-xs font-semibold text-slate-400">已选择的智能体</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">{profile.usedAgents.length ? profile.usedAgents.join("、") : "尚未开始，选择一个项目阶段即可建立档案。"}</p>
      </div>
      <button onClick={() => onNavigate("studentProjects", ["AI项目评价智能体"])} className="mt-5 w-full rounded-xl border border-amber/30 bg-amber/10 px-4 py-3 text-sm font-semibold text-amber transition hover:bg-amber/20">提交学生项目</button>
    </aside>
  );
}

function InfoLine({ title, text }) {
  return <div className="mt-3"><p className="text-xs font-semibold text-cyan">{title}</p><p className="mt-1 text-xs leading-5 text-slate-400">{text}</p></div>;
}

function loadProfile() {
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return initialProfile;
    const parsed = JSON.parse(saved);
    return {
      currentStage: stageOptions.some((item) => item.id === parsed.currentStage) ? parsed.currentStage : initialProfile.currentStage,
      completed: Array.isArray(parsed.completed) ? parsed.completed.filter((id) => lifecycle.some((item) => item.id === id)) : [],
      usedAgents: Array.isArray(parsed.usedAgents) ? parsed.usedAgents : []
    };
  } catch {
    return initialProfile;
  }
}
