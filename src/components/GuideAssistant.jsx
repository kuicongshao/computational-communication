import { useEffect, useMemo, useState } from "react";
import { encouragementMessages, pageHelpMessages, reminderMessages, waitingMessages } from "../assistantMessages.js";
import { firstUseFlow, getNextRecommendation, onboardingFlow, stageNames } from "../assistantFlows.js";
import { chatWithDeepSeek, isDeepSeekConfigured } from "../api/deepseek.js";
import { COURSE_ASSISTANT_SYSTEM_PROMPT, quickQuestions } from "../agents/prompts.js";
import { createLocalCourseReply, routeEducationTask } from "../agents/agentRouter.js";
import APIConnectModal from "./APIConnectModal.jsx";
import { clearLocalAIConfig, getLocalAIConfig } from "../utils/localAIConfig.js";

const assistantStateKey = "assistantState";
const chatHistoryKey = "assistantChatHistory";
const onboardingKey = "zhi_xing_onboarding";
const validPages = new Set(["home", "knowledge", "problem", "ability", "job", "methods", "projects", "resources", "agents", "workflow", "learningProfile", "teacherDashboard", "aiCollaboration", "lab", "studentProjects", "about"]);

const initialAssistantState = {
  currentFlow: "idle",
  currentStep: 0,
  completedSteps: [],
  firstVisit: true,
  assistantOpen: false
};
const initialOnboarding = { completed: false, dismissed: false, currentStep: 0, started: false };

function readJson(key, fallback = null) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function loadLearningStatus() {
  const identity = readJson("zhichuan-learning-identity");
  const workflow = readJson("zhichuan-ai-workflow-profile");
  const usedAgents = readJson("zhichuan-course-agent-usage", []);
  const chapters = readJson("zhichuan-knowledge-progress", []);
  const project = readJson("zhichuan-student-project");
  const analysisCount = Number(window.localStorage.getItem("zhichuan-analysis-lab-usage") || "0");
  const completed = Array.isArray(workflow?.completed) ? workflow.completed : [];
  const hasProjectDesign = completed.includes("design") || (Array.isArray(usedAgents) && usedAgents.some((agent) => agent.includes("项目策划")));

  return {
    hasIdentity: Boolean(identity?.name),
    hasWorkflow: Boolean(workflow),
    hasProjectDesign,
    hasAnalysis: analysisCount > 0 || completed.includes("data"),
    hasProjectCard: Boolean(project?.name),
    projectComplete: Boolean(project?.name) || completed.includes("evaluate"),
    stage: stageNames[workflow?.currentStage] || "尚未开始",
    completedCount: completed.length,
    chapterCount: Array.isArray(chapters) ? chapters.length : 0,
    usedAgentCount: Array.isArray(usedAgents) ? usedAgents.length : 0
  };
}

function loadChatHistory() {
  const history = readJson(chatHistoryKey, []);
  return Array.isArray(history) ? history.slice(-30) : [];
}

export default function GuideAssistant({ currentPage, onNavigate }) {
  const [assistantState, setAssistantState] = useState(() => ({ ...initialAssistantState, ...readJson(assistantStateKey, {}) }));
  const [learningStatus, setLearningStatus] = useState(loadLearningStatus);
  const [chatHistory, setChatHistory] = useState(loadChatHistory);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const [apiConfig, setApiConfig] = useState(getLocalAIConfig);
  const [connectOpen, setConnectOpen] = useState(false);
  const [runtimeStatus, setRuntimeStatus] = useState(() => getLocalAIConfig().connected ? "api" : "local");
  const [onboarding, setOnboarding] = useState(() => ({ ...initialOnboarding, ...readJson(onboardingKey, {}) }));

  useEffect(() => {
    try {
      window.localStorage.setItem(assistantStateKey, JSON.stringify(assistantState));
    } catch {
      // 助手状态不可保存时，仍保留当前页面会话引导。
    }
  }, [assistantState]);

  useEffect(() => {
    try {
      window.localStorage.setItem(chatHistoryKey, JSON.stringify(chatHistory.slice(-30)));
    } catch {
      // 对话记录不可保存时，仍保留当前会话结果。
    }
  }, [chatHistory]);

  useEffect(() => {
    try { window.localStorage.setItem(onboardingKey, JSON.stringify(onboarding)); } catch { /* 不影响原有 assistantState。 */ }
  }, [onboarding]);

  useEffect(() => {
    setLearningStatus(loadLearningStatus());
  }, [currentPage, assistantState.assistantOpen]);

  useEffect(() => {
    const refreshConfig = () => setApiConfig(getLocalAIConfig());
    window.addEventListener("zhi-xing-ai-config-changed", refreshConfig);
    return () => window.removeEventListener("zhi-xing-ai-config-changed", refreshConfig);
  }, []);

  useEffect(() => {
    const updateStatus = (event) => setRuntimeStatus(event.detail || "local");
    window.addEventListener("zhi-xing-ai-runtime-status", updateStatus);
    return () => window.removeEventListener("zhi-xing-ai-runtime-status", updateStatus);
  }, []);

  const currentFlowStep = firstUseFlow[Math.min(assistantState.currentStep, firstUseFlow.length - 1)];
  const recommendation = useMemo(() => getNextRecommendation(learningStatus), [learningStatus]);
  const pageHelp = pageHelpMessages[currentPage] || "我会根据你的学习记录，为你推荐最合适的下一步。";

  const openAssistant = () => setAssistantState((current) => ({ ...current, assistantOpen: true }));
  const closeAssistant = () => setAssistantState((current) => ({ ...current, assistantOpen: false }));
  const refreshConnection = () => {
    const config = getLocalAIConfig();
    setApiConfig(config);
    setRuntimeStatus(config.connected ? "api" : "local");
  };
  const clearConnection = () => {
    if (!window.confirm("确认删除当前浏览器中保存的模型连接信息吗？删除后系统将切换为本地智能模式。")) return;
    clearLocalAIConfig();
    setApiConfig(getLocalAIConfig());
    setRuntimeStatus("local");
  };
  const startOnboarding = () => {
    setOnboarding({ completed: false, dismissed: false, currentStep: 0, started: true });
    openAssistant();
  };
  const dismissOnboarding = () => setOnboarding((current) => ({ ...current, dismissed: true, started: false }));
  const advanceOnboarding = () => {
    const step = onboardingFlow[onboarding.currentStep];
    goTo(step.target);
    setOnboarding((current) => current.currentStep >= onboardingFlow.length - 1 ? { ...current, completed: true, started: false } : { ...current, currentStep: current.currentStep + 1 });
  };

  const startFirstFlow = () => {
    setAssistantState((current) => ({ ...current, currentFlow: "first-use", currentStep: 0, completedSteps: [], firstVisit: false }));
  };

  const goTo = (target) => {
    setLearningStatus(loadLearningStatus());
    onNavigate(validPages.has(target) ? target : "agents");
  };

  const advanceFlow = () => {
    const step = currentFlowStep;
    setAssistantState((current) => ({
      ...current,
      completedSteps: Array.from(new Set([...current.completedSteps, step.id])),
      currentStep: Math.min(current.currentStep + 1, firstUseFlow.length - 1),
      firstVisit: false
    }));
    goTo(step.target);
  };

  const restartFlow = () => {
    setAssistantState((current) => ({ ...current, currentFlow: "first-use", currentStep: 0, completedSteps: [], firstVisit: false, assistantOpen: true }));
  };

  const welcomeContent = () => {
    if (assistantState.firstVisit && !learningStatus.hasIdentity) {
      return {
        eyebrow: "第一次学习",
        title: "你好，我是知行助手 👋",
        text: `我可以帮助你完成课程学习、研究设计、数据分析和项目实践。${apiConfig.connected ? "" : "当前使用本地智能模式；如果希望体验更强大的生成式AI能力，可以连接自己的DeepSeek API。"}如果你不知道从哪里开始，我可以带你一步一步完成。`,
        action: "开始第一次学习",
        onAction: startOnboarding
      };
    }
    if (learningStatus.projectComplete) {
      return {
        eyebrow: "成果阶段",
        title: "你的项目已经进入成果阶段",
        text: "接下来可以查看项目评价、优化研究设计、完善展示成果。需要我帮你检查项目吗？",
        action: "查看项目评价",
        onAction: () => goTo("agents")
      };
    }
    return {
      eyebrow: "欢迎回来",
      title: "我们继续完成下一步吧",
      text: `学习档案：${learningStatus.hasIdentity ? "已创建" : "未创建"}；项目阶段：${learningStatus.stage}；完成步骤：${learningStatus.completedCount} 项。`,
      action: "继续我的项目",
      onAction: () => goTo(recommendation.target)
    };
  };

  const welcome = welcomeContent();

  const sendChat = async (presetQuestion) => {
    const question = String(presetQuestion || chatInput).trim();
    if (!question || chatSending) return;
    const latestStatus = loadLearningStatus();
    setLearningStatus(latestStatus);
    const route = routeEducationTask(question);
    let reply = createLocalCourseReply(question, latestStatus);
    let replyMode = "local";
    setChatSending(true);
    if (route.inScope && isDeepSeekConfigured()) {
      const deepseek = await chatWithDeepSeek({ systemPrompt: COURSE_ASSISTANT_SYSTEM_PROMPT, userInput: question, studentState: latestStatus, route });
      if (deepseek.ok) { reply = deepseek.data; replyMode = "api"; }
    }
    setChatSending(false);
    setChatInput("");
    setChatHistory((current) => [...current, { id: `${Date.now()}-${question}`, time: new Date().toISOString(), question, mode: replyMode, ...reply }].slice(-30));
  };

  return (
    <aside className="fixed bottom-4 right-4 z-[60] flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {assistantState.assistantOpen && (
        <section className="w-[min(23rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-cyan/30 bg-ink/95 shadow-[0_20px_60px_rgba(0,0,0,.45)] backdrop-blur-xl">
          <div className="relative border-b border-white/10 bg-gradient-to-r from-cyan/15 via-mint/10 to-violet/10 p-5">
            <button onClick={closeAssistant} aria-label="关闭知行助手" className="absolute right-4 top-4 rounded-full border border-white/10 bg-ink/50 px-2 py-1 text-xs text-slate-300 transition hover:text-white">×</button>
            <div className="flex items-center gap-3 pr-7"><AssistantAvatar compact /><div><p className="text-xs font-semibold tracking-wider text-mint">AI 教学陪伴助手</p><h2 className="text-lg font-bold text-white">知行助手</h2></div></div>
            <div className={`mt-4 flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-xs ${runtimeStatus === "api" ? "border-mint/30 bg-mint/10 text-mint" : "border-amber/25 bg-amber/10 text-amber"}`}>
              <span>AI运行状态：{runtimeStatus === "testing" ? "正在测试连接" : runtimeStatus === "fallback" ? "连接异常，已自动回退" : runtimeStatus === "api" ? "生成式AI增强模式" : "本地智能模式"}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setConnectOpen(true)} className="font-semibold text-cyan hover:text-white">{apiConfig.connected ? "重新配置" : "连接AI模型"}</button>
                {apiConfig.connected && <button onClick={clearConnection} className="font-semibold text-slate-300 hover:text-white">清除本地配置</button>}
              </div>
            </div>
          </div>

          <div className="max-h-[58vh] overflow-y-auto p-5 scrollbar-soft">
            {onboarding.started && !onboarding.completed ? (
              <OnboardingPanel step={onboardingFlow[onboarding.currentStep]} currentStep={onboarding.currentStep} onAdvance={advanceOnboarding} />
            ) : onboarding.completed ? (
              <OnboardingComplete onRestart={startOnboarding} onConnect={() => setConnectOpen(true)} />
            ) : assistantState.currentFlow === "first-use" ? (
              <FlowPanel step={currentFlowStep} currentStep={assistantState.currentStep} completedSteps={assistantState.completedSteps} onAdvance={advanceFlow} />
            ) : (
              <>
                <p className="text-xs font-semibold text-cyan">{welcome.eyebrow}</p>
                <h3 className="mt-1 text-xl font-bold text-white">{welcome.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{welcome.text}</p>
                <button onClick={welcome.onAction} className="mt-4 w-full rounded-xl border border-cyan/40 bg-cyan/15 px-4 py-3 text-sm font-semibold text-cyan transition hover:bg-cyan/25">{welcome.action}</button>
              </>
            )}

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[.035] p-4">
              <p className="text-xs font-semibold text-mint">当前页面提示</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{pageHelp}</p>
              <p className="mt-2 text-xs text-slate-400">{waitingMessages[assistantState.currentStep % waitingMessages.length]}</p>
            </div>
            <div className="mt-3 rounded-2xl border border-violet/20 bg-violet/5 p-4">
              <p className="text-xs font-semibold text-violet">下一步建议 · {recommendation.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{recommendation.text}</p>
              <button onClick={() => goTo(recommendation.target)} className="mt-3 text-sm font-semibold text-violet transition hover:text-white">{recommendation.action} →</button>
            </div>
            <ChatPanel history={chatHistory} input={chatInput} sending={chatSending} onInput={setChatInput} onSend={sendChat} onNavigate={goTo} />
            <p className="mt-4 text-xs leading-6 text-slate-400">{encouragementMessages[assistantState.currentStep % encouragementMessages.length]} {reminderMessages[assistantState.currentStep % reminderMessages.length]}</p>
            <button onClick={startOnboarding} className="mt-4 text-xs font-semibold text-slate-400 underline-offset-4 transition hover:text-cyan hover:underline">重新开始引导</button>
          </div>
        </section>
      )}

      {!assistantState.assistantOpen && !onboarding.completed && !onboarding.dismissed && <div className="max-w-72 rounded-2xl border border-cyan/20 bg-panel/90 px-4 py-3 text-sm leading-6 text-slate-200 shadow-glow backdrop-blur-xl"><p>你好，我是知行助手，你的课程学习与项目实践伙伴。我可以陪你完成学习建档、项目设计、数据分析、成果评价和成长复盘。</p><p className="mt-2 text-xs text-slate-400">当前平台可在本地智能模式下直接使用；连接自己的 DeepSeek API 后，可获得更灵活的生成式AI回答。</p><div className="mt-3 flex flex-wrap gap-2"><button onClick={startOnboarding} className="text-xs font-semibold text-cyan">开始学习引导</button><button onClick={() => setConnectOpen(true)} className="text-xs font-semibold text-mint">连接AI模型</button><button onClick={dismissOnboarding} className="text-xs text-slate-400">稍后再说</button></div></div>}
      {!assistantState.assistantOpen && (onboarding.completed || onboarding.dismissed) && <div className="max-w-64 rounded-2xl border border-cyan/20 bg-panel/90 px-4 py-3 text-sm leading-6 text-slate-200 shadow-glow backdrop-blur-xl">{learningStatus.hasIdentity ? `欢迎回来。我已读取当前浏览器中的学习记录：学习档案已创建，当前阶段为${learningStatus.stage}。建议：${recommendation.title}。` : "你好，我是知行助手。当前使用本地智能模式；连接DeepSeek API可体验更强的生成式AI能力。"}</div>}
      <button onClick={openAssistant} aria-label="打开知行助手" className="group flex items-center gap-3 rounded-full border border-cyan/35 bg-ink/90 py-2 pl-2 pr-4 shadow-glow backdrop-blur-xl transition hover:-translate-y-1 hover:border-mint/70">
        <AssistantAvatar />
        <span className="text-sm font-bold text-white">知行助手</span>
        <span className="text-mint transition group-hover:translate-x-0.5">✦</span>
      </button>
      <APIConnectModal open={connectOpen} onClose={() => setConnectOpen(false)} onChanged={refreshConnection} />
    </aside>
  );
}

function FlowPanel({ step, currentStep, completedSteps, onAdvance }) {
  return (
    <>
      <p className="text-xs font-semibold text-cyan">第一次使用平台 · 第 {currentStep + 1}/{firstUseFlow.length} 步</p>
      <h3 className="mt-1 text-xl font-bold text-white">{step.title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-300">{step.message}</p>
      <div className="mt-4 flex gap-1.5">{firstUseFlow.map((item, index) => <span key={item.id} className={`h-1.5 flex-1 rounded-full ${completedSteps.includes(item.id) || index === currentStep ? "bg-cyan" : "bg-white/10"}`} />)}</div>
      <button onClick={onAdvance} className="mt-4 w-full rounded-xl border border-cyan/40 bg-cyan/15 px-4 py-3 text-sm font-semibold text-cyan transition hover:bg-cyan/25">{step.action}</button>
      <p className="mt-3 text-xs leading-6 text-mint">完成提示：{step.complete}</p>
    </>
  );
}

function OnboardingPanel({ step, currentStep, onAdvance }) {
  return <><p className="text-xs font-semibold text-cyan">学习引导 · 第 {currentStep + 1}/{onboardingFlow.length} 步</p><h3 className="mt-1 text-xl font-bold text-white">{step.title}</h3><p className="mt-3 text-sm leading-7 text-slate-300">{step.message}</p><div className="mt-4 flex gap-1.5">{onboardingFlow.map((item, index) => <span key={item.id} className={`h-1.5 flex-1 rounded-full ${index <= currentStep ? "bg-cyan" : "bg-white/10"}`} />)}</div><button onClick={onAdvance} className="mt-4 w-full rounded-xl border border-cyan/40 bg-cyan/15 px-4 py-3 text-sm font-semibold text-cyan transition hover:bg-cyan/25">{step.action}</button></>;
}

function OnboardingComplete({ onRestart, onConnect }) {
  return <div><p className="text-xs font-semibold text-mint">学习引导已完成</p><h3 className="mt-1 text-xl font-bold text-white">你已经了解知行智链的核心学习流程</h3><p className="mt-3 text-sm leading-7 text-slate-300">后续遇到困难，可以随时向我提问，或点击“告诉我下一步”获取任务建议。</p><div className="mt-4 flex flex-wrap gap-2"><button onClick={onRestart} className="rounded-xl border border-cyan/40 bg-cyan/15 px-3 py-2 text-sm font-semibold text-cyan">重新开始</button><button onClick={onConnect} className="rounded-xl border border-mint/40 bg-mint/10 px-3 py-2 text-sm font-semibold text-mint">连接AI模型</button></div></div>;
}

function ChatPanel({ history, input, sending, onInput, onSend, onNavigate }) {
  return (
    <section className="mt-5 border-t border-white/10 pt-5">
      <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold text-cyan">任务型对话助手</p><h3 className="mt-1 text-base font-semibold text-white">问一个课程项目问题</h3></div><span className="rounded-full border border-mint/25 bg-mint/10 px-2.5 py-1 text-xs text-mint">本地优先</span></div>
      <div className="mt-3 flex flex-wrap gap-2">{quickQuestions.map((question) => <button key={question} onClick={() => onSend(question)} disabled={sending} className="rounded-full border border-white/10 bg-white/[.04] px-3 py-1.5 text-xs text-slate-200 transition hover:border-cyan/50 hover:text-cyan disabled:opacity-50">{question}</button>)}</div>
      {history.length > 0 && <div className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1 scrollbar-soft">{history.slice(-6).map((item) => <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[.035] p-3"><p className="text-xs text-slate-400">你：{item.question}</p><p className="mt-2 text-sm leading-6 text-slate-200">{item.answer}</p><div className="mt-3 flex flex-wrap items-center justify-between gap-2"><span className="text-xs text-mint">{item.agentType}</span><button onClick={() => onNavigate(item.recommendPage)} className="text-xs font-semibold text-cyan transition hover:text-white">{item.recommendPage ? "前往推荐页面 →" : "查看下一步"}</button></div><p className="mt-2 text-xs leading-5 text-violet">下一步：{item.nextStep}</p></article>)}</div>}
      <div className="mt-4 flex gap-2"><input value={input} onChange={(event) => onInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); onSend(); } }} placeholder="例如：我有评论文本，适合用什么方法？" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-ink/80 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan" /><button onClick={() => onSend()} disabled={!input.trim() || sending} className="rounded-xl border border-cyan/40 bg-cyan/15 px-4 py-2.5 text-sm font-semibold text-cyan transition hover:bg-cyan/25 disabled:cursor-not-allowed disabled:opacity-50">{sending ? "思考中" : "发送"}</button></div>
      <p className="mt-2 text-xs leading-5 text-slate-500">仅回答计算传播学学习、研究设计、数据方法、项目评价与学习路径问题。</p>
    </section>
  );
}

function AssistantAvatar({ compact = false }) {
  const [imageUnavailable, setImageUnavailable] = useState(false);
  const size = compact ? "h-11 w-11" : "h-12 w-12";

  return (
    <span className={`${size} relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-cyan/60 bg-gradient-to-br from-cyan/30 via-[#123c55] to-mint/20 p-0.5 shadow-[0_0_0_3px_rgba(34,211,238,.1),0_0_22px_rgba(34,211,238,.38)]`}>
      {!imageUnavailable ? (
        <img
          src="/assets/ai-assistant.png"
          alt="知行助手"
          onError={() => setImageUnavailable(true)}
          className="h-full w-full rounded-full object-cover object-center"
        />
      ) : (
        <>
          <span className="absolute top-2 h-4 w-4 rounded-full border border-cyan/40 bg-slate-100" />
          <span className="mb-1 h-5 w-7 rounded-t-[999px] border border-mint/45 bg-gradient-to-t from-cyan/60 to-mint/50" />
          <span className="absolute left-1/2 top-0 h-2 w-px -translate-x-1/2 bg-mint" />
          <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-mint shadow-glow" />
        </>
      )}
    </span>
  );
}
