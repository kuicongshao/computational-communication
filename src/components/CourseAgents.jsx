import { useMemo, useState } from "react";
import SectionHeader from "./SectionHeader.jsx";

const tabs = [
  ["topic", "选题梳理"],
  ["method", "方法选择"],
  ["diagnosis", "项目诊断"]
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
  phenomenon: "",
  platform: "",
  object: "",
  concern: ""
};

const emptyDiagnosis = {
  title: "",
  questions: "",
  dataSource: "",
  sampleSize: "",
  methods: "",
  conclusion: ""
};

export default function CourseAgents() {
  const [activeTab, setActiveTab] = useState("topic");
  const [topicForm, setTopicForm] = useState(emptyTopic);
  const [topicReport, setTopicReport] = useState(null);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [methodReport, setMethodReport] = useState(null);
  const [diagnosisForm, setDiagnosisForm] = useState(emptyDiagnosis);
  const [diagnosisReport, setDiagnosisReport] = useState(null);
  const [copied, setCopied] = useState("");

  const reportText = useMemo(() => {
    if (activeTab === "topic" && topicReport) return stringifyReport("选题梳理报告", topicReport);
    if (activeTab === "method" && methodReport) return stringifyMethods(methodReport);
    if (activeTab === "diagnosis" && diagnosisReport) return stringifyReport("项目诊断报告", diagnosisReport);
    return "";
  }, [activeTab, topicReport, methodReport, diagnosisReport]);

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
  };

  return (
    <div className="space-y-7">
      <SectionHeader
        eyebrow="Course Agents"
        title="课程智能体"
        subtitle="不调用外部 API 的规则型学习工具。学生可以把模糊想法转化为研究题目、方法组合和项目诊断报告。"
      />

      <section className="rounded-2xl border border-cyan/20 bg-panel/85 p-4 shadow-glow">
        <div className="grid gap-2 sm:grid-cols-3">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                activeTab === id
                  ? "border-cyan bg-cyan/15 text-cyan shadow-glow"
                  : "border-white/10 bg-white/[.045] text-slate-300 hover:border-cyan/50 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[.92fr_1.08fr]">
        <section className="rounded-2xl border border-white/10 bg-panel/80 p-5 shadow-glow">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">{tabs.find(([id]) => id === activeTab)?.[1]}</h2>
              <p className="mt-1 text-sm text-slate-400">填写信息后生成本地规则分析结果。</p>
            </div>
            <button
              onClick={clearCurrent}
              className="rounded-full border border-white/10 bg-white/[.045] px-4 py-2 text-sm text-slate-300 transition hover:border-amber/60 hover:text-amber"
            >
              清空输入
            </button>
          </div>

          {activeTab === "topic" && (
            <TopicAgent form={topicForm} setForm={setTopicForm} onAnalyze={() => setTopicReport(buildTopicReport(topicForm))} />
          )}
          {activeTab === "method" && (
            <MethodAgent selected={selectedGoals} setSelected={setSelectedGoals} onAnalyze={() => setMethodReport(buildMethodReport(selectedGoals))} />
          )}
          {activeTab === "diagnosis" && (
            <DiagnosisAgent form={diagnosisForm} setForm={setDiagnosisForm} onAnalyze={() => setDiagnosisReport(buildDiagnosisReport(diagnosisForm))} />
          )}
        </section>

        <section className="rounded-2xl border border-cyan/20 bg-ink/80 p-5 shadow-glow">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">诊断报告</h2>
              <p className="mt-1 text-sm text-slate-400">结果会按论文写作和课程项目执行逻辑分块展示。</p>
            </div>
            <button
              onClick={copyResult}
              disabled={!reportText}
              className="rounded-full border border-mint/30 bg-mint/10 px-4 py-2 text-sm font-semibold text-mint transition hover:bg-mint/15 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[.035] disabled:text-slate-500"
            >
              {copied === activeTab ? "已复制" : "复制结果"}
            </button>
          </div>

          {activeTab === "topic" && <ReportView report={topicReport} placeholder="填写传播现象、平台、对象和关心的问题后，生成选题梳理报告。" />}
          {activeTab === "method" && <MethodReportView report={methodReport} />}
          {activeTab === "diagnosis" && <ReportView report={diagnosisReport} placeholder="填写项目题目、研究问题和数据方法后，生成项目诊断报告。" />}
        </section>
      </div>
    </div>
  );
}

function TopicAgent({ form, setForm, onAnalyze }) {
  return (
    <div className="space-y-4">
      <TextArea label="想研究的传播现象" value={form.phenomenon} onChange={(value) => setForm({ ...form, phenomenon: value })} placeholder="例如：我想研究小红书上的品牌评论" />
      <TextInput label="平台或数据来源" value={form.platform} onChange={(value) => setForm({ ...form, platform: value })} placeholder="例如：小红书、微博、B站弹幕、YouTube评论" />
      <TextInput label="研究对象" value={form.object} onChange={(value) => setForm({ ...form, object: value })} placeholder="例如：品牌评论、城市文旅短视频、海外受众评论" />
      <TextArea label="关心的问题" value={form.concern} onChange={(value) => setForm({ ...form, concern: value })} placeholder="例如：用户情绪、讨论主题、互动表现之间有什么关系" />
      <AnalyzeButton onClick={onAnalyze}>生成选题方案</AnalyzeButton>
    </div>
  );
}

function MethodAgent({ selected, setSelected, onAnalyze }) {
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
      <AnalyzeButton onClick={onAnalyze}>推荐分析方法</AnalyzeButton>
    </div>
  );
}

function DiagnosisAgent({ form, setForm, onAnalyze }) {
  return (
    <div className="space-y-4">
      <TextInput label="项目题目" value={form.title} onChange={(value) => setForm({ ...form, title: value })} placeholder="例如：小红书品牌评论中的用户情感与传播效果研究" />
      <TextArea label="研究问题" value={form.questions} onChange={(value) => setForm({ ...form, questions: value })} placeholder="例如：用户主要讨论哪些议题？不同情感是否对应不同互动表现？" />
      <TextInput label="数据来源" value={form.dataSource} onChange={(value) => setForm({ ...form, dataSource: value })} placeholder="例如：小红书公开笔记评论" />
      <TextInput label="样本量" value={form.sampleSize} onChange={(value) => setForm({ ...form, sampleSize: value })} placeholder="例如：300 条评论" />
      <TextInput label="使用方法" value={form.methods} onChange={(value) => setForm({ ...form, methods: value })} placeholder="例如：词频分析、情感分析、LDA主题模型" />
      <TextArea label="预期结论" value={form.conclusion} onChange={(value) => setForm({ ...form, conclusion: value })} placeholder="例如：不同主题评论的情感倾向和互动表现存在差异" />
      <AnalyzeButton onClick={onAnalyze}>生成项目诊断</AnalyzeButton>
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

function AnalyzeButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border border-cyan/40 bg-cyan/15 px-5 py-3 text-sm font-semibold text-cyan shadow-glow transition hover:-translate-y-0.5 hover:bg-cyan/20"
    >
      {children}
    </button>
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

function buildTopicReport(form) {
  const phenomenon = clean(form.phenomenon) || "平台传播现象";
  const platform = clean(form.platform) || inferPlatform(phenomenon) || "公开平台";
  const object = clean(form.object) || inferObject(phenomenon) || "用户文本";
  const concern = clean(form.concern) || "用户讨论主题、情感倾向与传播效果之间的关系";
  const topicName = buildTopicTitle(platform, object, concern);
  const dataItems = inferData(platform, object);
  const methods = inferMethods(concern, phenomenon, object);

  return [
    { title: "推荐研究题目", tone: "cyan", content: `《${topicName}》` },
    {
      title: "研究问题",
      tone: "mint",
      content: [
        `RQ1：${object}中用户主要讨论哪些议题或传播主题？`,
        `RQ2：围绕${object}的情感倾向、态度表达或评价框架如何分布？`,
        `RQ3：不同主题、情感或内容特征是否对应不同的互动表现或传播效果？`
      ]
    },
    {
      title: "核心变量",
      tone: "violet",
      content: [
        "文本主题：高频词、关键词、主题类别、代表文本。",
        "情感态度：正向、负向、中性或细分情绪类别。",
        "传播效果：点赞、评论、收藏、转发、播放量等互动指标。",
        "分组变量：平台、时间、账号类型、内容类型或受众群体。"
      ]
    },
    { title: "可采集数据", tone: "cyan", content: dataItems },
    { title: "推荐分析方法", tone: "mint", content: methods },
    {
      title: "可能的论文框架",
      tone: "amber",
      content: [
        "引言：说明传播现象、平台背景、研究价值和问题意识。",
        "文献综述：梳理平台传播、文本分析、情感分析或主题模型相关研究。",
        "研究设计：交代数据来源、样本筛选、变量定义和分析方法。",
        "结果分析：依次呈现词频/主题、情感分布、互动表现及其关系。",
        "讨论与结论：解释发现的传播学意义、局限和后续研究方向。"
      ]
    },
    {
      title: "选题风险提示",
      tone: "amber",
      content: [
        `当前关心的问题是“${concern}”，需要进一步压缩到 2-3 个可回答的问题。`,
        "如果互动数据无法采集，不宜直接声称研究“传播效果”，可改为研究“用户反馈”或“受众评价”。",
        "平台评论不等同于全部受众态度，论文中需要说明样本偏差和平台规则影响。",
        "不要把 AI 或模型输出直接当作结论，主题命名和情感解释需要回到原文样本核验。"
      ]
    }
  ];
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
    suggestions.push("先写出“平台/对象/方法/问题”四个要素，例如“小红书品牌评论中的用户情感与主题结构研究”。");
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
