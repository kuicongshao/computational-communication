import { useEffect, useMemo, useState } from "react";
import SectionHeader from "./SectionHeader.jsx";
import { generateTeachingEnhancement, isDeepSeekConfigured } from "../api/deepseek.js";

const agents = [
  {
    id: "learning",
    name: "AI学习导师智能体",
    scene: "学｜学习支持",
    problem: "帮助学生规划学习路径，诊断知识掌握情况，并推荐下一步学习章节。",
    input: "当前学习阶段、已掌握内容、学习困难、每周可投入时间。",
    output: "学习画像、推荐章节、每周学习计划与练习建议。",
    example: "我刚学完 Python 基础，但不会把传播问题转成数据问题。"
  },
  {
    id: "topic",
    name: "AI项目策划智能体",
    scene: "练｜实践教学",
    problem: "把项目兴趣转化为可执行、可展示的计算传播学项目设计报告。",
    input: "项目兴趣方向、平台、研究对象、数据类型、目标成果。",
    output: "备选题目、研究问题、数据和方法方案、成果设计与风险提醒。",
    example: "为小红书城市文旅短视频评论设计一份可视化课程项目。"
  },
  {
    id: "method",
    name: "AI数据分析智能体",
    scene: "练+研｜实践与研究",
    problem: "根据数据类型和分析目标，选择适合的计算传播学方法。",
    input: "研究目标、文本/互动/结构化数据特征与样本规模。",
    output: "方法推荐等级、所需数据、图表输出与论文写法。",
    example: "我有 800 条评论和点赞数，想分析情感与互动的关系。"
  },
  {
    id: "research",
    name: "AI研究设计智能体",
    scene: "研｜研究能力培养",
    problem: "形成连贯的研究问题、理论框架、变量设计与方法路径。",
    input: "研究主题、传播现象、研究对象、可用数据与关注关系。",
    output: "研究问题、理论视角、变量表、方法和预期图表。",
    example: "研究国风短视频如何影响海外受众的国家形象评价。"
  },
  {
    id: "diagnosis",
    name: "AI项目评价智能体",
    scene: "评｜教学评价",
    problem: "从选题、数据、方法、创新性和实践价值评价项目方案。",
    input: "项目题目、问题、数据、样本量、方法与预期结论。",
    output: "项目评价、风险提示、修改建议和下一步行动。",
    example: "评价一个以微博公共事件评论为数据的舆情分析方案。"
  }
];

const goalOptions = [
  "想知道大家讨论什么",
  "想知道情绪正负",
  "想发现隐藏主题",
  "想比较不同群体",
  "想判断文本类别",
  "想分析词语关系",
  "想预测传播效果",
  "想展示传播趋势"
];

const methodRules = [
  {
    name: "词频分析",
    strong: ["想知道大家讨论什么", "想展示传播趋势"],
    optional: ["想比较不同群体", "想分析词语关系"],
    reason: "能快速识别语料中的高频表达，适合作为文本分析的第一步。",
    data: "清洗后的标题、评论、弹幕、新闻正文等文本。",
    chart: "高频词柱状图、词云图、分组词频对比图。",
    writing: "本文首先对文本语料进行分词和停用词处理，并统计高频词，以识别受众关注的主要表达。"
  },
  {
    name: "关键词提取",
    strong: ["想知道大家讨论什么", "想比较不同群体"],
    optional: ["想展示传播趋势"],
    reason: "比单纯词频更重视具有区分度的词语，适合提炼议题线索。",
    data: "分组文本或完整语料，最好包含平台、时间、账号类型等分组字段。",
    chart: "关键词表、关键词排名图、不同群体关键词对比图。",
    writing: "本文采用关键词提取方法识别文本中具有代表性的主题词，并结合样本语境进行解释。"
  },
  {
    name: "情感分析",
    strong: ["想知道情绪正负"],
    optional: ["想比较不同群体", "想预测传播效果", "想展示传播趋势"],
    reason: "适合判断评论、弹幕或帖子中的态度倾向，能与互动表现结合分析。",
    data: "包含态度表达的短文本，最好有时间、平台或互动指标字段。",
    chart: "情感比例图、情绪趋势线、不同主题情感对比图。",
    writing: "本文对评论文本进行情感倾向识别，并统计正向、负向和中性评论的分布特征。"
  },
  {
    name: "LDA主题模型",
    strong: ["想发现隐藏主题", "想知道大家讨论什么"],
    optional: ["想比较不同群体", "想展示传播趋势"],
    reason: "适合从较大规模文本中发现潜在议题结构，结果便于写成主题解释。",
    data: "数量较多、长度适中的文本语料，需完成分词、去停用词和低频词处理。",
    chart: "主题词表、主题分布图、主题随时间变化图。",
    writing: "本文使用 LDA 主题模型识别文本语料中的潜在主题，并结合主题高频词和代表文本进行命名。"
  },
  {
    name: "BERTopic",
    strong: ["想发现隐藏主题"],
    optional: ["想知道大家讨论什么", "想比较不同群体"],
    reason: "更适合短文本和语义相近表达，能基于语义向量发现主题聚类。",
    data: "评论、标题、弹幕、帖子等短文本，样本量越大越稳定。",
    chart: "主题聚类图、主题关键词表、代表文本列表。",
    writing: "本文采用 BERTopic 对文本进行语义聚类，并根据各主题关键词与代表文本解释主题含义。"
  },
  {
    name: "共词网络",
    strong: ["想分析词语关系"],
    optional: ["想知道大家讨论什么", "想发现隐藏主题"],
    reason: "能展示关键词之间的共现关系，适合解释议题结构和概念关联。",
    data: "分词后的文本，需设定共现窗口或按文档统计词语共现。",
    chart: "共词网络图、节点中心性表、社群结构图。",
    writing: "本文构建关键词共现网络，分析核心节点、连接关系和词语社群，以呈现议题结构。"
  },
  {
    name: "相关分析",
    strong: ["想比较不同群体", "想预测传播效果"],
    optional: ["想展示传播趋势"],
    reason: "适合初步判断变量之间是否存在同步变化关系。",
    data: "数值变量，例如情感分数、点赞数、评论数、发布时间、主题比例。",
    chart: "相关矩阵热力图、散点图。",
    writing: "本文使用相关分析检验变量之间的关联方向与强度，为后续解释提供依据。"
  },
  {
    name: "回归分析",
    strong: ["想预测传播效果"],
    optional: ["想比较不同群体"],
    reason: "适合分析多个因素与传播效果指标之间的关系。",
    data: "因变量和自变量都需要量化，如点赞数、转发数、情感分数、主题占比、内容类型编码。",
    chart: "回归结果表、系数图、拟合散点图。",
    writing: "本文以互动指标作为因变量，将文本特征和内容变量纳入回归模型，分析其对传播效果的解释作用。"
  },
  {
    name: "决策树",
    strong: ["想判断文本类别", "想预测传播效果"],
    optional: ["想比较不同群体"],
    reason: "规则路径直观，适合课堂展示变量如何影响分类或预测结果。",
    data: "带标签数据或明确的分类目标，同时需要可量化特征。",
    chart: "决策树结构图、特征重要性图、分类报告。",
    writing: "本文使用决策树模型对文本或传播效果类别进行预测，并通过树结构解释关键判断路径。"
  },
  {
    name: "随机森林",
    strong: ["想预测传播效果", "想判断文本类别"],
    optional: ["想比较不同群体"],
    reason: "比单棵决策树更稳定，适合处理多个特征共同预测的问题。",
    data: "样本量较充足的结构化特征表，包含文本特征、互动指标或人工编码标签。",
    chart: "特征重要性图、混淆矩阵、预测效果评估表。",
    writing: "本文使用随机森林模型评估多类文本和传播特征对结果变量的预测能力。"
  },
  {
    name: "聚类分析",
    strong: ["想比较不同群体", "想发现隐藏主题"],
    optional: ["想判断文本类别"],
    reason: "适合在没有人工标签时发现用户、内容或文本的自然分组。",
    data: "数值特征或文本向量，如主题比例、互动指标、情感分数、TF-IDF 特征。",
    chart: "聚类散点图、群体画像表、雷达图。",
    writing: "本文基于文本与互动特征进行聚类分析，识别不同类型的内容或用户群体。"
  },
  {
    name: "可视化分析",
    strong: ["想展示传播趋势", "想比较不同群体"],
    optional: ["想知道大家讨论什么", "想知道情绪正负", "想预测传播效果"],
    reason: "能把时间、平台、主题、情感和互动指标转化为可读图表。",
    data: "带时间、分组或数值指标的数据表。",
    chart: "趋势折线图、分组柱状图、热力图、桑基图。",
    writing: "本文通过可视化方式呈现传播指标、情感分布和主题变化，使结果更便于比较和解释。"
  }
];

const emptyTopic = {
  interest: "",
  platform: "",
  object: "",
  dataType: "",
  outcome: ""
};

const emptyDiagnosis = {
  title: "",
  questions: "",
  dataSource: "",
  sampleSize: "",
  methods: "",
  conclusion: ""
};

const emptyLearning = {
  stage: "刚开始学习",
  mastered: "",
  difficulty: "",
  weeklyHours: ""
};

const emptyResearch = {
  topic: "",
  phenomenon: "",
  object: "",
  data: "",
  concern: ""
};

export default function CourseAgents({ onNavigate }) {
  const [activeTab, setActiveTab] = useState("learning");
  const [learningForm, setLearningForm] = useState(emptyLearning);
  const [learningReport, setLearningReport] = useState(null);
  const [topicForm, setTopicForm] = useState(emptyTopic);
  const [topicReport, setTopicReport] = useState(null);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [methodReport, setMethodReport] = useState(null);
  const [diagnosisForm, setDiagnosisForm] = useState(emptyDiagnosis);
  const [diagnosisReport, setDiagnosisReport] = useState(null);
  const [researchForm, setResearchForm] = useState(emptyResearch);
  const [researchReport, setResearchReport] = useState(null);
  const [copied, setCopied] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [aiStatus, setAiStatus] = useState(() => isDeepSeekConfigured() ? "已连接 DeepSeek：复杂任务可获得 AI 深化建议。" : "当前使用本地规则引擎；可在知行助手中连接你的 DeepSeek API 以启用复杂生成增强。 ");

  useEffect(() => {
    const activeAgent = agents.find((agent) => agent.id === activeTab)?.name;
    if (!activeAgent) return;
    try {
      const saved = JSON.parse(window.localStorage.getItem("zhichuan-course-agent-usage") || "[]");
      const usage = Array.isArray(saved) ? saved : [];
      if (!usage.includes(activeAgent)) window.localStorage.setItem("zhichuan-course-agent-usage", JSON.stringify([...usage, activeAgent]));
    } catch {
      // localStorage 不可用时不影响智能体使用。
    }
  }, [activeTab]);

  const reportText = useMemo(() => {
    if (activeTab === "learning" && learningReport) return stringifyReport("AI学习导师报告", learningReport);
    if (activeTab === "topic" && topicReport) return stringifyReport("计算传播学项目设计报告", topicReport);
    if (activeTab === "method" && methodReport) return stringifyMethods(methodReport);
    if (activeTab === "research" && researchReport) return stringifyReport("AI研究设计报告", researchReport);
    if (activeTab === "diagnosis" && diagnosisReport) return stringifyReport("AI项目评价报告", diagnosisReport);
    return "";
  }, [activeTab, learningReport, topicReport, methodReport, researchReport, diagnosisReport]);

  const copyResult = async () => {
    if (!reportText) return;
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(reportText);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = reportText;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(activeTab);
    window.setTimeout(() => setCopied(""), 1600);
  };

  const clearCurrent = () => {
    setCopied("");
    if (activeTab === "learning") {
      setLearningForm(emptyLearning);
      setLearningReport(null);
    }
    if (activeTab === "topic") {
      setTopicForm(emptyTopic);
      setTopicReport(null);
    }
    if (activeTab === "method") {
      setSelectedGoals([]);
      setMethodReport(null);
    }
    if (activeTab === "diagnosis") {
      setDiagnosisForm(emptyDiagnosis);
      setDiagnosisReport(null);
    }
    if (activeTab === "research") {
      setResearchForm(emptyResearch);
      setResearchReport(null);
    }
  };

  const runStructuredAgent = async (task, input, buildReport, setReport) => {
    const localReport = buildReport(input);
    setReport(localReport);
    setAiStatus("已生成本地结构化教学结果。");
    if (!isDeepSeekConfigured()) return;

    setIsEnhancing(true);
    const enhancement = await generateTeachingEnhancement({ task, input, localOutline: summarizeReport(localReport) });
    setIsEnhancing(false);
    if (enhancement.ok) {
      setReport([...localReport, { title: "DeepSeek AI 深化教学建议", tone: "violet", content: enhancement.content }]);
      setAiStatus("本地规则已完成结构化结果，并已叠加 DeepSeek 复杂生成建议。");
    } else {
      setAiStatus(`已保留本地规则结果。${enhancement.reason || "DeepSeek 暂不可用。"}`);
    }
  };

  const runDiagnosis = () => {
    const input = mergeStoredProject(diagnosisForm);
    setDiagnosisForm(input);
    runStructuredAgent("项目评价", input, buildDiagnosisReport, setDiagnosisReport);
  };

  const hasActiveReport = Boolean({ learning: learningReport, topic: topicReport, method: methodReport, research: researchReport, diagnosis: diagnosisReport }[activeTab]);

  return (
    <div className="space-y-7">
      <SectionHeader
        eyebrow="ZhiChuan AI Education Agents"
        title="智传 AI 教育智能体中心"
        subtitle="面向计算传播学课程的 AI 辅助教学系统，围绕教、学、练、评、研五个环节，为学生提供可解释、可操作的本地规则型支持。"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {agents.map((agent, index) => (
          <button
            key={agent.id}
            onClick={() => setActiveTab(agent.id)}
            className={`group rounded-2xl border p-5 text-left shadow-glow transition hover:-translate-y-1 ${
              activeTab === agent.id
                ? "border-cyan bg-cyan/10"
                : "border-white/10 bg-panel/80 hover:border-cyan/50"
            }`}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cyan/30 bg-cyan/10 text-sm font-bold text-cyan">{index + 1}</span>
              <span className="rounded-full border border-mint/25 bg-mint/10 px-2.5 py-1 text-xs text-mint">{agent.scene}</span>
            </div>
            <h2 className="text-lg font-semibold text-white group-hover:text-cyan">{agent.name}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{agent.problem}</p>
            <div className="mt-4 border-t border-white/10 pt-3 text-xs leading-6 text-slate-400">
              <div><span className="text-cyan">输入：</span>{agent.input}</div>
              <div><span className="text-mint">输出：</span>{agent.output}</div>
            </div>
            <p className="mt-3 text-xs leading-5 text-violet">案例参考 · 示例任务：{agent.example}</p>
          </button>
        ))}
      </section>

      <section className="rounded-2xl border border-cyan/20 bg-panel/85 p-5 shadow-glow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan">Agent Workspace</p>
            <h2 className="mt-1 text-xl font-semibold text-white">{agents.find((agent) => agent.id === activeTab)?.name}</h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-slate-400">{aiStatus}</p>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[.92fr_1.08fr]">
        <section className="rounded-2xl border border-white/10 bg-panel/80 p-5 shadow-glow">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">智能体输入</h2>
              <p className="mt-1 text-sm text-slate-400">填写学习或项目情境，生成适合课程任务的建议。</p>
            </div>
            <button
              onClick={clearCurrent}
              className="rounded-full border border-white/10 bg-white/[.045] px-4 py-2 text-sm text-slate-300 transition hover:border-amber/60 hover:text-amber"
            >
              清空输入
            </button>
          </div>

          {activeTab === "learning" && <LearningAgent form={learningForm} setForm={setLearningForm} onAnalyze={() => runStructuredAgent("学习路径诊断", learningForm, (input) => appendLearningProfileContext(buildLearningReport(input)), setLearningReport)} loading={isEnhancing} />}
          {activeTab === "topic" && (
            <TopicAgent form={topicForm} setForm={setTopicForm} onAnalyze={() => runStructuredAgent("项目设计", topicForm, buildTopicReport, setTopicReport)} loading={isEnhancing} />
          )}
          {activeTab === "method" && (
            <MethodAgent selected={selectedGoals} setSelected={setSelectedGoals} onAnalyze={() => setMethodReport(buildMethodReport(selectedGoals))} loading={isEnhancing} />
          )}
          {activeTab === "diagnosis" && (
            <DiagnosisAgent form={diagnosisForm} setForm={setDiagnosisForm} onAnalyze={runDiagnosis} loading={isEnhancing} />
          )}
          {activeTab === "research" && <ResearchAgent form={researchForm} setForm={setResearchForm} onAnalyze={() => runStructuredAgent("研究设计", researchForm, buildResearchReport, setResearchReport)} loading={isEnhancing} />}
        </section>

        <section className="rounded-2xl border border-cyan/20 bg-ink/80 p-5 shadow-glow">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">智能体输出</h2>
              <p className="mt-1 text-sm text-slate-400">结果会按课程学习、项目执行与论文写作逻辑分块展示。</p>
            </div>
            <button
              onClick={copyResult}
              disabled={!reportText}
              className="rounded-full border border-mint/30 bg-mint/10 px-4 py-2 text-sm font-semibold text-mint transition hover:bg-mint/15 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[.035] disabled:text-slate-500"
            >
              {copied === activeTab ? "已复制" : "复制结果"}
            </button>
          </div>

          {activeTab === "learning" && <ReportView report={learningReport} placeholder="填写当前学习阶段、已掌握内容和困难后，生成个性化学习路径。" />}
          {activeTab === "topic" && (
            <>
              <ProjectTeachingLoop />
              <div className="mt-4">
                <ReportView report={topicReport} placeholder="填写项目兴趣、平台、对象、数据类型和目标成果后，生成完整的项目式学习设计报告。" />
              </div>
            </>
          )}
          {activeTab === "method" && <MethodReportView report={methodReport} />}
          {activeTab === "research" && <ReportView report={researchReport} placeholder="填写研究主题、对象、数据和关注关系后，生成研究设计方案。" />}
          {activeTab === "diagnosis" && <ReportView report={diagnosisReport} placeholder="填写项目题目、研究问题和数据方法后，生成项目诊断报告。" />}
          {hasActiveReport && <AgentNextAction agent={activeTab} onNavigate={onNavigate} />}
        </section>
      </div>
    </div>
  );
}

function LearningAgent({ form, setForm, onAnalyze, loading }) {
  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-cyan">当前学习阶段</span>
        <select value={form.stage} onChange={(event) => setForm({ ...form, stage: event.target.value })} className="w-full rounded-xl border border-white/10 bg-ink/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan focus:shadow-glow">
          <option>刚开始学习</option>
          <option>正在学习基础方法</option>
          <option>准备开展课程项目</option>
          <option>正在撰写课程论文</option>
        </select>
      </label>
      <TextArea label="已经掌握的内容" value={form.mastered} onChange={(value) => setForm({ ...form, mastered: value })} placeholder="例如：Python 基础、pandas 读表、词频分析" />
      <TextArea label="当前最困惑的问题" value={form.difficulty} onChange={(value) => setForm({ ...form, difficulty: value })} placeholder="例如：看得懂代码，但不会设计研究问题和变量" />
      <TextInput label="每周可投入学习时间" value={form.weeklyHours} onChange={(value) => setForm({ ...form, weeklyHours: value })} placeholder="例如：4 小时" />
      <AnalyzeButton onClick={onAnalyze} loading={loading}>生成学习路径</AnalyzeButton>
    </div>
  );
}

function TopicAgent({ form, setForm, onAnalyze, loading }) {
  return (
    <div className="space-y-4">
      <TextArea label="项目兴趣方向" value={form.interest} onChange={(value) => setForm({ ...form, interest: value })} placeholder="例如：传播现象、公共议题、文化内容或品牌活动" />
      <TextInput label="平台" value={form.platform} onChange={(value) => setForm({ ...form, platform: value })} placeholder="例如：选择与项目相关的内容平台" />
      <TextInput label="研究对象" value={form.object} onChange={(value) => setForm({ ...form, object: value })} placeholder="例如：某类传播内容、用户互动或公共议题" />
      <TextInput label="数据类型" value={form.dataType} onChange={(value) => setForm({ ...form, dataType: value })} placeholder="例如：文本、互动指标、关系数据或图像" />
      <TextInput label="目标成果" value={form.outcome} onChange={(value) => setForm({ ...form, outcome: value })} placeholder="例如：课程论文、数据报告、传播策划案、可视化作品" />
      <AnalyzeButton onClick={onAnalyze} loading={loading}>生成项目设计报告</AnalyzeButton>
    </div>
  );
}

function MethodAgent({ selected, setSelected, onAnalyze, loading }) {
  const toggle = (goal) => {
    setSelected(selected.includes(goal) ? selected.filter((item) => item !== goal) : [...selected, goal]);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        {goalOptions.map((goal) => (
          <label
            key={goal}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm transition ${
              selected.includes(goal)
                ? "border-cyan/60 bg-cyan/10 text-white"
                : "border-white/10 bg-white/[.04] text-slate-300 hover:border-cyan/40"
            }`}
          >
            <input
              type="checkbox"
              checked={selected.includes(goal)}
              onChange={() => toggle(goal)}
              className="mt-1 h-4 w-4 accent-cyan"
            />
            <span>{goal}</span>
          </label>
        ))}
      </div>
      <AnalyzeButton onClick={onAnalyze} loading={loading}>推荐分析方法</AnalyzeButton>
    </div>
  );
}

function DiagnosisAgent({ form, setForm, onAnalyze, loading }) {
  return (
    <div className="space-y-4">
      <TextInput label="项目题目" value={form.title} onChange={(value) => setForm({ ...form, title: value })} placeholder="例如：某平台内容中的用户态度与传播效果研究" />
      <TextArea label="研究问题" value={form.questions} onChange={(value) => setForm({ ...form, questions: value })} placeholder="例如：用户主要讨论哪些议题？不同情感是否对应不同互动表现？" />
      <TextInput label="数据来源" value={form.dataSource} onChange={(value) => setForm({ ...form, dataSource: value })} placeholder="例如：公开内容、互动数据或调查材料" />
      <TextInput label="样本量" value={form.sampleSize} onChange={(value) => setForm({ ...form, sampleSize: value })} placeholder="例如：300 条评论" />
      <TextInput label="使用方法" value={form.methods} onChange={(value) => setForm({ ...form, methods: value })} placeholder="例如：词频分析、情感分析、LDA主题模型" />
      <TextArea label="预期结论" value={form.conclusion} onChange={(value) => setForm({ ...form, conclusion: value })} placeholder="例如：不同主题评论的情感倾向和互动表现存在差异" />
      <AnalyzeButton onClick={onAnalyze} loading={loading}>生成项目诊断</AnalyzeButton>
    </div>
  );
}

function ResearchAgent({ form, setForm, onAnalyze, loading }) {
  return (
    <div className="space-y-4">
      <TextInput label="研究主题" value={form.topic} onChange={(value) => setForm({ ...form, topic: value })} placeholder="例如：某一传播现象的受众反馈研究" />
      <TextArea label="传播现象或研究背景" value={form.phenomenon} onChange={(value) => setForm({ ...form, phenomenon: value })} placeholder="例如：某类内容的互动与讨论持续增加" />
      <TextInput label="研究对象" value={form.object} onChange={(value) => setForm({ ...form, object: value })} placeholder="例如：某平台中的相关内容或用户讨论" />
      <TextInput label="可用数据" value={form.data} onChange={(value) => setForm({ ...form, data: value })} placeholder="例如：文本、互动指标和时间信息" />
      <TextArea label="最关注的关系或问题" value={form.concern} onChange={(value) => setForm({ ...form, concern: value })} placeholder="例如：不同叙事主题是否对应不同的国家形象评价" />
      <AnalyzeButton onClick={onAnalyze} loading={loading}>生成研究设计</AnalyzeButton>
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-cyan">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-ink/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan focus:shadow-glow"
      />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-cyan">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-y rounded-xl border border-white/10 bg-ink/80 px-4 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan focus:shadow-glow"
      />
    </label>
  );
}

function AnalyzeButton({ children, onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full rounded-xl border border-cyan/40 bg-cyan/15 px-5 py-3 text-sm font-semibold text-cyan shadow-glow transition hover:-translate-y-0.5 hover:bg-cyan/20 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "正在生成 AI 教学建议…" : children}
    </button>
  );
}

function AgentNextAction({ agent, onNavigate }) {
  const actions = {
    learning: ["下一步：进入知识图谱完成推荐章节", "knowledge", "进入知识图谱"],
    topic: ["下一步：在 AI 工作流确认项目阶段与实践任务", "workflow", "进入 AI 工作流"],
    method: ["下一步：用真实或小样本文本验证推荐方法", "lab", "进入智能分析实验室"],
    research: ["下一步：回到方法工具箱核对研究问题与方法匹配", "methods", "进入方法工具箱"],
    diagnosis: ["下一步：根据评价建议完善并生成项目成果卡片", "studentProjects", "进入学生项目中心"]
  };
  const [text, target, label] = actions[agent] || actions.learning;
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-mint/25 bg-mint/10 p-4">
      <p className="text-sm leading-6 text-slate-200">{text}</p>
      <button onClick={() => onNavigate?.(target)} className="rounded-xl border border-mint/35 bg-ink/70 px-4 py-2.5 text-sm font-semibold text-mint transition hover:bg-mint/15">{label}</button>
    </div>
  );
}

function summarizeReport(report) {
  if (Array.isArray(report)) {
    return report.map((section) => `${section.title}：${Array.isArray(section.content) ? section.content.join("；") : section.content}`).join("\n").slice(0, 5000);
  }
  return JSON.stringify(report).slice(0, 5000);
}

function mergeStoredProject(form) {
  try {
    const saved = JSON.parse(window.localStorage.getItem("zhichuan-student-project") || "null");
    if (!saved || typeof saved !== "object") return form;
    return {
      title: clean(form.title) || clean(saved.name),
      questions: clean(form.questions) || clean(saved.question),
      dataSource: clean(form.dataSource) || clean(saved.dataSource),
      sampleSize: clean(form.sampleSize) || clean(saved.sampleSize),
      methods: clean(form.methods) || clean(saved.methods),
      conclusion: clean(form.conclusion) || clean(saved.summary)
    };
  } catch {
    return form;
  }
}

function appendLearningProfileContext(report) {
  try {
    const identity = JSON.parse(window.localStorage.getItem("zhichuan-learning-identity") || "null");
    const workflow = JSON.parse(window.localStorage.getItem("zhichuan-ai-workflow-profile") || "null");
    const agents = JSON.parse(window.localStorage.getItem("zhichuan-course-agent-usage") || "[]");
    const completed = Array.isArray(workflow?.completed) ? workflow.completed.length : 0;
    const used = Array.isArray(agents) ? agents.length : 0;
    const profileText = identity?.name
      ? `已读取本地学习档案：${identity.name}，学习阶段为“${identity.stage || "未填写"}”，兴趣方向为“${identity.interest || "未填写"}”。AI 工作流已完成 ${completed} 个步骤，已使用 ${used} 类课程智能体。`
      : "尚未创建本地学习档案；建议先进入 AI 学习档案填写学习阶段和兴趣方向，以获得更精确的学习建议。";
    return [...report, { title: "学习档案感知", tone: "violet", content: profileText }];
  } catch {
    return [...report, { title: "学习档案感知", tone: "violet", content: "当前无法读取本地学习档案；仍可根据本次输入生成学习路径。" }];
  }
}

function ProjectTeachingLoop() {
  const steps = [
    ["输入", "学生想法", "兴趣方向、平台、对象、数据和成果目标"],
    ["AI辅助", "学生项目方案", "研究问题、数据方案、方法方案与实践成果"],
    ["学", "学习路径", "识别难度，推荐适合的课程章节和能力训练"],
    ["评", "教师指导", "生成项目优势、风险、修改建议与课程项目判断"]
  ];

  return (
    <section className="rounded-2xl border border-violet/25 bg-violet/10 p-4">
      <div className="mb-3">
        <h3 className="font-semibold text-violet">AI 如何帮助学生完成项目设计</h3>
        <p className="mt-1 text-sm text-slate-300">项目策划智能体把学生想法转化为方案、学习支持与教师评价，形成 AI 辅助教、学、评闭环。</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {steps.map(([tag, title, text], index) => (
          <div key={title} className="relative rounded-xl border border-white/10 bg-ink/70 p-3">
            <span className="text-xs font-semibold text-cyan">{String(index + 1).padStart(2, "0")} · {tag}</span>
            <h4 className="mt-1 font-semibold text-white">{title}</h4>
            <p className="mt-1 text-xs leading-5 text-slate-400">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReportView({ report, placeholder }) {
  if (!report) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[.035] p-8 text-center text-sm leading-7 text-slate-400">
        {placeholder}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {report.map((section) => (
        <ReportBlock key={section.title} title={section.title} tone={section.tone}>
          {Array.isArray(section.content) ? (
            <ul className="space-y-2 text-sm leading-7 text-slate-300">
              {section.content.map((item) => <li key={item}>• {item}</li>)}
            </ul>
          ) : (
            <p className="text-sm leading-7 text-slate-300">{section.content}</p>
          )}
        </ReportBlock>
      ))}
    </div>
  );
}

function MethodReportView({ report }) {
  if (!report) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[.035] p-8 text-center text-sm leading-7 text-slate-400">
        勾选研究目标后，系统会为 12 种方法生成推荐等级和论文写法建议。
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ReportBlock title="研究目标识别" tone="cyan">
        <p className="text-sm leading-7 text-slate-300">{report.goals}</p>
      </ReportBlock>
      {report.methods.map((method) => (
        <article key={method.name} className="rounded-xl border border-white/10 bg-white/[.04] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-white">{method.name}</h3>
            <span className={`rounded-full border px-3 py-1 text-xs ${levelClass(method.level)}`}>{method.level}</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <MiniField title="为什么适合" text={method.reason} />
            <MiniField title="需要什么数据" text={method.data} />
            <MiniField title="输出什么图表" text={method.chart} />
            <MiniField title="论文中怎么写" text={method.writing} />
          </div>
        </article>
      ))}
    </div>
  );
}

function ReportBlock({ title, children, tone = "cyan" }) {
  const toneClass = {
    cyan: "border-cyan/25 bg-cyan/10 text-cyan",
    mint: "border-mint/25 bg-mint/10 text-mint",
    amber: "border-amber/25 bg-amber/10 text-amber",
    violet: "border-violet/25 bg-violet/10 text-violet"
  }[tone];

  return (
    <section className={`rounded-xl border p-4 ${toneClass}`}>
      <h3 className="mb-3 font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function MiniField({ title, text }) {
  return (
    <div className="rounded-lg border border-white/10 bg-ink/70 p-3">
      <div className="mb-1 text-xs font-semibold text-cyan">{title}</div>
      <p className="text-sm leading-7 text-slate-300">{text}</p>
    </div>
  );
}

function levelClass(level) {
  if (level === "强烈推荐") return "border-mint/35 bg-mint/10 text-mint";
  if (level === "可选") return "border-amber/35 bg-amber/10 text-amber";
  return "border-white/10 bg-white/[.04] text-slate-400";
}

function buildLearningReport(form) {
  const mastered = clean(form.mastered);
  const difficulty = clean(form.difficulty);
  const hours = Number((form.weeklyHours.match(/\d+/) || ["0"])[0]);
  const context = `${mastered} ${difficulty}`;
  const recommendations = [];

  if (form.stage === "刚开始学习" || !mastered) {
    recommendations.push("第 1-3 章：计算传播学导论、平台传播效果与问题数据化表达。", "第 4 章：Python 基础，先完成读取、筛选和统计评论表的小练习。");
  }
  if (hasAny(context, ["Python", "代码", "pandas", "读表", "清洗"])) {
    recommendations.push("第 5-6 章：AI 辅助数据清洗与数据可视化，建立从 CSV 到图表的完整流程。");
  }
  if (hasAny(context, ["研究问题", "变量", "理论", "论文", "设计"])) {
    recommendations.push("第 3 章及研究设计训练：把现象拆成研究对象、变量、指标与可回答的 RQ1/RQ2/RQ3。");
  }
  if (hasAny(context, ["情感", "主题", "文本", "评论", "方法"])) {
    recommendations.push("第 7-9 章：情感分析、主题模型与文本分类；每学一种方法都保留代表文本进行人工核验。");
  }
  if (form.stage === "准备开展课程项目" || form.stage === "正在撰写课程论文") {
    recommendations.push("项目实战模块：先完成 20-30 条样本试分析，再确定最终字段表、样本量和图表清单。");
  }
  if (!recommendations.length) recommendations.push("知识图谱第 1-4 章：先建立传播问题、数据意识与 Python 基础之间的连接。");

  const weeklyPlan = hours && hours <= 3
    ? ["第 1 周：阅读一个章节并记录 3 个概念。", "第 2 周：完成一个 20 分钟代码或数据小练习。", "第 3 周：用自己的传播案例复述“问题-数据-方法”路径。"]
    : ["第 1 周：学习一个章节，并完成配套概念笔记。", "第 2 周：使用一份小样本数据完成清洗或词频练习。", "第 3 周：把练习结果写成 200 字研究发现。", "第 4 周：复盘困难，调整下一轮学习目标。"];

  return [
    { title: "学习画像", tone: "cyan", content: `你当前处于“${form.stage}”阶段。${mastered ? `已掌握：${mastered}。` : "建议先从基础概念与数据操作开始。"}${difficulty ? `主要困难：${difficulty}。` : "请在下一轮学习中记录最难理解的一个环节。"}` },
    { title: "推荐学习章节", tone: "mint", content: Array.from(new Set(recommendations)) },
    { title: "建议学习节奏", tone: "violet", content: weeklyPlan },
    { title: "下一步练习", tone: "amber", content: ["选择一个真实传播现象，写出研究对象、可获得数据和一个研究问题。", "从知识图谱中完成一个章节后，勾选完成状态并用自己的案例解释核心概念。", "遇到代码问题时，先说明输入数据、预期输出与报错信息，再寻求 AI 辅助。"] }
  ];
}

function buildResearchReport(form) {
  const topic = clean(form.topic) || "平台传播现象";
  const phenomenon = clean(form.phenomenon) || "数字平台上的传播互动正在持续积累";
  const object = clean(form.object) || "平台用户文本";
  const data = clean(form.data) || "评论文本、时间和可见互动指标";
  const concern = clean(form.concern) || "主题、情感与传播效果之间的关系";
  const context = `${topic} ${phenomenon} ${object} ${data} ${concern}`;
  const methods = inferMethods(concern, phenomenon, object);
  const framework = hasAny(context, ["国家形象", "国际传播", "海外"])
    ? "国家形象建构与跨文化传播视角：关注内容叙事、受众评价和平台语境如何共同塑造形象。"
    : hasAny(context, ["情感", "态度", "评价"])
      ? "传播效果与受众反应视角：关注文本表达、情感态度、互动反馈之间的关联。"
      : "平台化传播视角：关注平台机制、内容特征、用户互动与议题形成之间的关系。";

  return [
    { title: "研究主题与边界", tone: "cyan", content: `建议题目：《${topic}——基于${object}的计算传播学分析》。研究对象限定为${object}，围绕“${concern}”展开，避免泛化到全部平台或所有用户。` },
    { title: "研究问题", tone: "mint", content: [`RQ1：${object}中呈现出哪些与“${topic}”相关的主题或叙事特征？`, `RQ2：${object}中的情感、态度或评价如何分布？`, `RQ3：${concern}在数据中是否呈现出可观察的关联？`] },
    { title: "理论框架", tone: "violet", content: framework },
    { title: "变量与数据设计", tone: "cyan", content: [`研究对象与样本：${object}。`, `可用数据字段：${data}。`, "自变量候选：内容类型、主题类别、情感倾向、发布时间或账号类型。", "因变量候选：点赞、评论、转发、收藏、播放量或受众评价类别。", "控制与分组变量：平台、时间段、内容形式、样本来源。"] },
    { title: "方法与成果形式", tone: "mint", content: [...methods, "成果形式：研究设计表、数据字段表、2-4 张核心图表、课程项目报告或论文初稿。"] },
    { title: "研究伦理提醒", tone: "amber", content: ["仅使用公开可访问数据，去除账号昵称、个人联系方式等可识别信息。", "说明采样时间、筛选规则与平台局限，避免将评论直接等同于整体受众。", "模型输出必须结合代表文本和人工阅读解释，避免把自动分类视为事实。"] }
  ];
}

function buildTopicReport(form) {
  const rawInterest = clean(form.interest);
  const rawPlatform = clean(form.platform);
  const rawObject = clean(form.object);
  const rawDataType = clean(form.dataType);
  const targetOutcome = clean(form.outcome) || "课程论文与可视化作品";
  const interest = rawInterest || "平台传播";
  const platform = rawPlatform || inferPlatform(interest) || "公开社交媒体平台";
  const object = rawObject || inferObject(interest) || "用户发布内容与评论";
  const dataType = rawDataType || "评论文本与可见互动指标";
  const context = `${interest} ${platform} ${object} ${dataType} ${targetOutcome}`;
  const positioning = inferProjectPositioning(context);
  const titles = buildProjectTitles({ interest, platform, object, positioning });
  const dataPlan = buildDataPlan({ platform, object, dataType });
  const methodPlan = buildProjectMethods({ dataType, targetOutcome, context });
  const productPlan = buildProductPlan(targetOutcome);
  const risks = buildProjectRisks({ interest, platform, object, dataType, targetOutcome, context, methodPlan, rawInterest, rawPlatform, rawObject, rawDataType });
  const analysisProcess = buildProjectAnalysisProcess({ interest, platform, object, dataType, methodPlan, targetOutcome });
  const difficulty = assessProjectDifficulty({ platform, dataType, context, methodPlan, rawPlatform, rawDataType });
  const teacherGuidance = buildTeacherGuidance({ interest, platform, object, dataType, targetOutcome, risks, difficulty, rawInterest, rawPlatform, rawObject, rawDataType });

  return [
    { title: "《计算传播学项目设计报告》", tone: "cyan", content: `项目兴趣方向：${interest}｜推荐平台：${platform}｜目标成果：${targetOutcome}` },
    { title: "项目名称：3 个备选题目", tone: "violet", content: titles.map((title, index) => `方案 ${index + 1}：《${title}》`) },
    { title: "项目定位", tone: "mint", content: `本项目属于“${positioning}”方向，重点分析${platform}中${object}的内容特征、受众反馈及其传播意义。` },
    {
      title: "研究问题",
      tone: "cyan",
      content: [
        `RQ1：${platform}中的${object}主要呈现哪些与“${interest}”相关的主题、叙事或表达特征？`,
        `RQ2：不同主题或内容特征的受众情感、评价和讨论重点如何分布？`,
        `RQ3：${dataType.includes("互动") || dataType.includes("点赞") || dataType.includes("转发") ? "主题、情感或内容类型是否与可见互动表现存在关联？" : "这些内容特征对理解该传播现象具有怎样的实践意义？"}`
      ]
    },
    { title: "数据方案", tone: "violet", content: dataPlan },
    { title: "方法方案", tone: "mint", content: methodPlan },
    { title: "实践成果设计", tone: "cyan", content: productPlan },
    { title: "AI项目分析过程：AI如何帮助学生完成项目设计", tone: "violet", content: analysisProcess },
    { title: `项目难度评估：${difficulty.level}`, tone: difficulty.tone, content: difficulty.items },
    { title: "教师指导建议", tone: "cyan", content: teacherGuidance },
    { title: "风险提醒", tone: "amber", content: risks }
  ];
}

function buildProjectAnalysisProcess({ interest, platform, object, dataType, methodPlan, targetOutcome }) {
  const textData = hasAny(dataType, ["文本", "评论", "标题", "弹幕", "帖子"]);
  const networkData = hasAny(dataType, ["关系", "转发", "关注", "网络"]);
  const metricData = hasAny(dataType, ["互动", "点赞", "转发", "收藏", "播放", "数值"]);
  return [
    `研究场景识别：系统将“${interest}”识别为以${platform}为场景、以${object}为对象的计算传播学项目。`,
    `数据类型判断：${textData ? "检测到文本数据，适合从主题、关键词和情感切入。" : "未明确文本数据，建议补充内容文本或人工编码字段。"}${metricData ? "检测到互动指标，可进一步比较传播表现。" : "如要研究传播效果，建议补充点赞、评论、转发或播放等指标。"}${networkData ? "检测到关系数据，可开展网络结构分析。" : ""}`,
    `方法匹配原因：${methodPlan.slice(0, 3).join("；")}`,
    `成果设计逻辑：目标成果为“${targetOutcome}”，因此将分析结果组织为可解释的数据证据、核心图表和可展示的课程项目成果。`
  ];
}

function assessProjectDifficulty({ platform, dataType, context, methodPlan, rawPlatform, rawDataType }) {
  let score = 0;
  const items = [];
  const dataComplex = hasAny(dataType, ["关系", "转发", "关注", "网络", "多平台"]);
  const advancedMethods = methodPlan.some((item) => item.includes("机器学习") || item.includes("网络分析"));
  const theoryComplex = hasAny(context, ["国际", "国家形象", "跨文化", "机制", "理论"]);

  if (!rawPlatform || !rawDataType) {
    score += 2;
    items.push("数据获取难度：当前平台或数据类型尚未明确，需要先完成小样本试采。 ");
  } else if (dataComplex) {
    score += 2;
    items.push("数据获取难度：关系型或多字段数据需要额外整理，建议先验证采集与清洗流程。 ");
  } else {
    score += 1;
    items.push(`数据获取难度：${platform}公开文本或互动数据可作为课程项目起点，难度可控。 `);
  }
  if (advancedMethods) {
    score += 2;
    items.push("方法复杂度：包含机器学习或网络分析，需要理解特征、模型参数或网络指标。 ");
  } else {
    score += 1;
    items.push("方法复杂度：以词频、情感、主题与可视化为主，适合分步骤完成。 ");
  }
  if (advancedMethods || dataComplex) {
    score += 2;
    items.push("编程要求：建议具备 pandas 数据处理、基础绘图和可复现脚本能力。 ");
  } else {
    score += 1;
    items.push("编程要求：掌握 CSV 读取、基础清洗和图表绘制即可启动。 ");
  }
  if (theoryComplex) {
    score += 2;
    items.push("理论要求：需要补充跨文化传播、国家形象或机制解释等相关文献。 ");
  } else {
    score += 1;
    items.push("理论要求：可从平台传播、受众反馈和传播效果等基础概念建立解释框架。 ");
  }

  const level = score <= 4 ? "简单" : score <= 6 ? "中等" : "挑战";
  const stage = level === "简单" ? "适合刚完成 Python 基础与数据清洗训练的学生" : level === "中等" ? "适合已掌握文本分析、准备开展课程项目的学生" : "适合具备项目经验、能够阅读方法文献和独立调试代码的学生";
  const chapters = level === "简单" ? "推荐章节：第 3-6 章（问题数据化、Python、数据清洗、可视化）" : level === "中等" ? "推荐章节：第 5-9 章（清洗、可视化、情感分析、主题模型、文本分类）" : "推荐章节：第 7-10 章及项目实战（文本建模、关系分析、研究设计与论文表达）";
  return { level, tone: level === "简单" ? "mint" : level === "中等" ? "cyan" : "amber", items: [...items, `适合学习阶段：${stage}。`, chapters] };
}

function buildTeacherGuidance({ interest, platform, object, dataType, targetOutcome, risks, difficulty, rawInterest, rawPlatform, rawObject, rawDataType }) {
  const setupComplete = rawInterest && rawPlatform && rawObject && rawDataType;
  const criticalRisks = risks.filter((item) => !item.startsWith("伦理提醒"));
  return [
    `项目优势：${setupComplete ? `已明确“${interest}—${platform}—${object}”的项目主线，具备形成课程项目的基础。` : "学生已提出初步方向，可作为项目讨论的起点。"}`,
    `可能问题：${criticalRisks.length ? criticalRisks[0] : "当前方案结构较完整，后续重点是验证样本和字段是否可获得。"}`,
    `修改建议：${difficulty.level === "挑战" ? "建议先缩小到一个时间段或一个内容类型，完成小样本试分析后再决定是否使用高级方法。" : "建议先采集 20-30 条样本，核验字段、清洗规则和图表能否回应研究问题。"}`,
    `课程项目判断：${setupComplete && difficulty.level !== "挑战" ? "适合作为课程项目。教师可要求学生提交字段表、试分析结果和阶段性反思。" : "可以作为课程项目雏形，但建议教师先指导学生补齐数据条件或降低项目复杂度。"}`,
    `成果把关：目标成果为“${targetOutcome}”，建议评价时同时检查研究问题、数据证据、方法解释和传播实践价值。`
  ];
}

function inferProjectPositioning(context) {
  if (hasAny(context, ["品牌", "营销", "产品", "消费者"])) return "品牌传播";
  if (hasAny(context, ["国际", "海外", "国家形象", "YouTube", "跨文化"])) return "国际传播";
  if (hasAny(context, ["文化", "国风", "文旅", "动漫", "非遗"])) return "文化传播";
  if (hasAny(context, ["舆情", "公共事件", "危机", "治理", "新闻"])) return "舆情分析";
  return "平台传播";
}

function buildProjectTitles({ interest, platform, object, positioning }) {
  return [
    `${platform}${object}中的${interest}主题与受众反馈分析`,
    `基于${platform}${object}的${positioning}计算分析：主题、情感与互动`,
    `${interest}在${platform}中的传播呈现与实践价值研究——以${object}为例`
  ];
}

function buildDataPlan({ platform, object, dataType }) {
  const hasNetwork = hasAny(dataType, ["关系", "转发", "关注", "互动网络"]);
  const hasText = hasAny(dataType, ["文本", "评论", "标题", "弹幕", "帖子"]);
  const hasMetrics = hasAny(dataType, ["互动", "点赞", "转发", "收藏", "播放", "数值"]);
  const sample = hasNetwork ? "建议采集 200-500 个节点及其关系边" : hasText && hasMetrics ? "建议采集 500-1000 条内容/评论及互动字段" : hasText ? "建议采集 300-800 条文本样本" : hasMetrics ? "建议采集 200-500 条内容及可见指标" : "建议先试采 50 条样本，确认字段后扩展至 300 条以上";
  return [
    `推荐平台：${platform}。优先选择公开可访问页面，并记录采集时间与筛选规则。`,
    `研究对象：${object}。`,
    `数据类型：${dataType}。${hasText ? "保留原始文本与清洗后文本。" : "补充可解释的内容字段。"}${hasMetrics ? "保留点赞、评论、转发、收藏或播放等可见指标。" : "如可获得，建议补充互动指标以便比较传播表现。"}`,
    `样本规模：${sample}。`
  ];
}

function buildProjectMethods({ dataType, targetOutcome, context }) {
  const methods = [];
  const hasText = hasAny(dataType, ["文本", "评论", "标题", "弹幕", "帖子"]);
  const hasNetwork = hasAny(dataType, ["关系", "转发", "关注", "网络"]);
  const hasMetrics = hasAny(dataType, ["互动", "点赞", "转发", "收藏", "播放", "数值"]);
  if (hasText || !dataType) methods.push("词频分析：识别高频表达与受众关注点。");
  if (hasText || hasAny(context, ["情感", "评价", "态度", "口碑"])) methods.push("情感分析：比较正向、负向和中性表达的分布。");
  if (hasText || hasAny(context, ["主题", "议题", "文化", "舆情"])) methods.push("主题模型：使用 LDA 或 BERTopic 发现潜在议题结构。");
  if (hasNetwork) methods.push("网络分析：构建转发、共词或互动网络，识别核心节点与社群。");
  if (hasMetrics) methods.push("机器学习/统计建模：在样本量充足且变量完整时，预测或解释互动表现。");
  methods.push(`可视化：制作${targetOutcome.includes("可视化") ? "交互式或叙事型" : "趋势、对比与结构"}图表呈现核心发现。`);
  return methods;
}

function buildProductPlan(targetOutcome) {
  const selected = (keywords) => hasAny(targetOutcome, keywords) ? "（建议作为本项目主成果）" : "（可作为配套成果）";
  return [
    `论文报告：按“问题—数据—方法—发现—讨论”完成 3000-5000 字课程论文。${selected(["论文"])}`,
    `数据报告：交付字段说明、清洗规则、核心指标表和方法结果。${selected(["数据", "报告"])}`,
    `传播策划案：将分析发现转化为目标受众、内容策略、渠道与评估指标。${selected(["策划", "传播"])}`,
    `可视化作品：输出趋势图、主题图、情感图或网络图，并配 1 句传播学解读。${selected(["可视化", "作品"])}`
  ];
}

function buildProjectRisks({ interest, platform, object, dataType, targetOutcome, context, methodPlan, rawInterest, rawPlatform, rawObject, rawDataType }) {
  const risks = [];
  if (!rawInterest || hasAny(interest, ["全网", "所有", "全国", "全球", "影响机制"])) risks.push("选题过大或范围不清：请限定一个平台、一个对象、一段时间和 2-3 个研究问题。");
  if (!rawPlatform || platform === "公开社交媒体平台") risks.push("数据可获得性不明确：请指定公开平台，并先用 20-30 条样本验证能否获得所需字段。");
  if (!rawObject || !rawDataType) risks.push("数据方案不完整：需要明确研究对象和至少一种可采集数据类型。");
  if (methodPlan.some((item) => item.includes("机器学习")) && !hasAny(dataType, ["互动", "点赞", "转发", "收藏", "播放", "数值", "标签"])) risks.push("方法可能不匹配：机器学习需要足够的标签或量化特征，只有少量文本时应先采用词频、情感或主题分析。");
  if (targetOutcome.includes("策划") && !hasAny(context, ["品牌", "文旅", "文化", "传播", "受众"])) risks.push("实践成果衔接不足：传播策划案需要明确服务对象、目标受众和可执行的传播场景。");
  risks.push("伦理提醒：只使用公开数据，移除个人可识别信息；模型结果必须通过代表文本和人工阅读核验。");
  return risks;
}

function buildMethodReport(selectedGoals) {
  const goals = selectedGoals.length ? selectedGoals : ["尚未选择目标，以下为通用入门建议"];
  const methods = methodRules.map((method) => {
    const strongHit = selectedGoals.some((goal) => method.strong.includes(goal));
    const optionalHit = selectedGoals.some((goal) => method.optional.includes(goal));
    return {
      ...method,
      level: strongHit ? "强烈推荐" : optionalHit ? "可选" : "不建议"
    };
  });

  return {
    goals: goals.join("；"),
    methods
  };
}

function buildDiagnosisReport(form) {
  const title = clean(form.title);
  const questions = clean(form.questions);
  const dataSource = clean(form.dataSource);
  const methods = clean(form.methods);
  const sampleSize = Number((form.sampleSize.match(/\d+/) || ["0"])[0]);
  const conclusion = clean(form.conclusion);
  const allText = `${title} ${questions} ${dataSource} ${methods} ${conclusion}`;
  const risks = [];
  const suggestions = [];
  const nextSteps = [];

  if (!title) {
    risks.push("项目题目为空，暂时无法判断研究边界。");
    suggestions.push("先写出“平台/对象/方法/问题”四个要素，例如“某平台内容中的用户态度与主题结构研究”。");
  } else if (hasAny(title, ["影响机制", "全国", "所有平台", "全网", "总体", "所有用户"])) {
    risks.push("选题可能过大，当前题目包含宏观或全覆盖表达。");
    suggestions.push("把范围压缩到一个平台、一个对象、一段时间和一个具体问题。");
  } else {
    suggestions.push("题目具备课程论文雏形，建议继续明确平台、对象和核心变量。");
  }

  if (!dataSource) {
    risks.push("数据来源为空，缺少项目执行基础。");
    suggestions.push("补充可采集的数据来源，并说明样本筛选规则、采集时间和字段。");
  } else if (hasAny(dataSource, ["评论", "弹幕", "文本"]) && hasAny(methods, ["回归", "相关", "随机森林", "决策树"]) && !hasAny(allText, ["点赞", "转发", "收藏", "评论数", "播放", "互动", "评分", "变量"])) {
    risks.push("数据与方法可能不匹配：只有文本数据却使用量化建模方法。");
    suggestions.push("若使用回归或预测模型，需要增加可量化变量，如点赞数、收藏数、发布时间、情感分数或主题比例。");
  } else {
    suggestions.push("数据来源可以支持基础文本分析，但仍需说明字段结构和采集规则。");
  }

  if (!methods) {
    risks.push("使用方法为空，无法判断分析路径。");
    suggestions.push("至少明确 2-3 个方法，例如词频分析、情感分析、主题模型、互动指标分析。");
  } else if (methods === "数据分析" || methods.length < 5) {
    risks.push("方法表述过于笼统。");
    suggestions.push("把“数据分析”改写为具体方法名称，并说明每种方法输入什么、输出什么。");
  } else {
    suggestions.push("方法已有基本方向，下一步需要把每种方法对应到具体研究问题。");
  }

  if (sampleSize > 0 && sampleSize < 100) {
    risks.push("样本量偏少，不适合复杂机器学习或稳定主题模型。");
    suggestions.push("样本量小于 100 时，建议以人工阅读、词频分析和描述性统计为主。");
  } else if (sampleSize >= 100 && sampleSize < 500) {
    suggestions.push("样本量适合课程项目中的词频、情感和初步主题分析，但复杂预测模型仍需谨慎。");
  } else if (sampleSize >= 500) {
    suggestions.push("样本量较充足，可以尝试主题模型、分类模型或分组比较。");
  } else {
    risks.push("样本量未填写或无法识别。");
    suggestions.push("补充样本量，并区分原始样本、清洗后样本和有效分析样本。");
  }

  if (!questions) {
    risks.push("研究问题为空。");
    suggestions.push("至少写出 RQ1/RQ2/RQ3，并使用“哪些、如何、是否、为何”等问题词。");
  } else if (!hasAny(questions, ["如何", "是否", "哪些", "为何", "什么", "怎样", "?","？"])) {
    risks.push("研究问题不够清楚，缺少明确问题词。");
    suggestions.push("将描述性句子改写为可回答的问题，例如“用户主要讨论哪些主题？”");
  } else {
    suggestions.push("研究问题具备可回答性，建议进一步对应数据字段和图表输出。");
  }

  nextSteps.push("把研究问题拆成变量表：每个 RQ 对应数据字段、分析方法和输出图表。");
  nextSteps.push("先采集 20-30 条样本做试分析，检查字段是否够用。");
  nextSteps.push("确定最终样本量后，再批量清洗文本并保存可复现脚本。");
  nextSteps.push("写作时按“问题-数据-方法-发现-局限”组织课程论文。");

  return [
    { title: "总体判断", tone: risks.length ? "amber" : "mint", content: risks.length ? "项目可以继续推进，但需要先修正范围、数据或方法中的关键风险。" : "项目结构较完整，具备写成课程论文的基础。" },
    {
      title: "项目评价维度",
      tone: "violet",
      content: [
        `选题：${title ? "已具备明确题目，建议继续压缩研究边界。" : "尚未形成可评价的项目题目。"}`,
        `数据：${dataSource ? "已有数据来源，需要补充字段、样本和采样规则。" : "缺少数据来源，暂不具备实施基础。"}`,
        `方法：${methods ? "已有方法方向，需要对应到具体研究问题。" : "尚未说明分析方法。"}`,
        `创新性：${hasAny(allText, ["比较", "跨平台", "时间", "国际", "社群", "机制"]) ? "已出现比较、跨平台或机制视角，可进一步说明新意。" : "建议加入明确的比较维度、平台语境或案例切口。"}`,
        `实践价值：${hasAny(allText, ["品牌", "文旅", "舆情", "公共", "治理", "传播"]) ? "议题具有可见的传播实践价值。" : "建议说明研究结果能服务哪类传播实践或课程任务。"}`
      ]
    },
    { title: "风险诊断", tone: "amber", content: risks.length ? risks : ["暂未发现明显高风险问题，但仍需核验数据质量和引用规范。"] },
    { title: "修改建议", tone: "cyan", content: suggestions },
    { title: "是否能写成课程论文", tone: "mint", content: canWritePaper(risks, title, questions, dataSource, methods) },
    { title: "推荐下一步行动", tone: "violet", content: nextSteps }
  ];
}

function clean(value) {
  return value.trim();
}

function hasAny(text, words) {
  return words.some((word) => text.includes(word));
}

function inferPlatform(text) {
  const platforms = ["小红书", "微博", "B站", "抖音", "YouTube", "公众号", "知乎", "豆瓣"];
  return platforms.find((platform) => text.includes(platform));
}

function inferObject(text) {
  if (text.includes("品牌")) return "品牌评论";
  if (text.includes("文旅") || text.includes("城市")) return "城市文旅内容";
  if (text.includes("弹幕")) return "弹幕文本";
  if (text.includes("国家形象")) return "国家形象相关评论";
  if (text.includes("舆情")) return "公共事件评论";
  return "";
}

function buildTopicTitle(platform, object, concern) {
  if (platform.includes("小红书") && object.includes("品牌")) return "小红书品牌评论中的用户情感、主题结构与传播效果研究";
  if (concern.includes("国家形象")) return `${platform}${object}中的国家形象建构与受众评价研究`;
  if (concern.includes("情感")) return `${platform}${object}中的用户情感表达与传播效果研究`;
  return `${platform}${object}中的主题结构、用户态度与传播效果研究`;
}

function inferData(platform, object) {
  return [
    `${platform}公开页面中的${object}文本。`,
    "发布时间、账号名称或内容类型等基础字段。",
    "点赞、评论、收藏、转发、播放量等可见互动指标。",
    "人工标注字段：主题类别、情感倾向、内容类型或传播策略。"
  ];
}

function inferMethods(concern, phenomenon, object) {
  const text = `${concern} ${phenomenon} ${object}`;
  const methods = ["词频分析", "关键词提取", "情感分析", "互动指标分析"];
  if (hasAny(text, ["主题", "议题", "讨论什么", "隐藏"])) methods.push("LDA主题模型或BERTopic");
  if (hasAny(text, ["关系", "影响", "预测", "效果"])) methods.push("相关分析或回归分析");
  if (hasAny(text, ["词语关系", "共现", "网络"])) methods.push("共词网络分析");
  return methods;
}

function canWritePaper(risks, title, questions, dataSource, methods) {
  if (!title || !questions || !dataSource || !methods) return "暂时还不能直接写成课程论文。需要先补齐题目、研究问题、数据来源和具体方法。";
  if (risks.length >= 4) return "可以作为课程项目雏形，但不建议马上写论文正文。请先压缩题目范围并完成小样本试分析。";
  return "可以写成课程论文。建议先完成数据字段表和一轮试分析，再进入正式写作。";
}

function stringifyReport(title, report) {
  return [title, ...report.map((section) => {
    const content = Array.isArray(section.content) ? section.content.map((item) => `- ${item}`).join("\n") : section.content;
    return `\n${section.title}\n${content}`;
  })].join("\n");
}

function stringifyMethods(report) {
  return [
    "方法选择报告",
    `研究目标：${report.goals}`,
    ...report.methods.map((method) => `\n${method.name}｜${method.level}\n为什么适合：${method.reason}\n需要数据：${method.data}\n输出图表：${method.chart}\n论文写法：${method.writing}`)
  ].join("\n");
}
