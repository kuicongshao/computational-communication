import { useMemo, useState } from "react";
import SectionHeader from "./SectionHeader.jsx";

const tencentFormUrl = "https://doc.weixin.qq.com/sheet/e3_AV8AZAYhAG8CN1Mwhi9gaRCWCm11Y?scode=AB8Aewc3AAcKn0PqhVAV8AZAYhAG8&tab=BB08J2";
const feishuFormUrl = "https://www.feishu.cn/";

const projectTypes = ["短视频分析", "小红书分析", "舆情分析", "品牌传播", "国际传播", "二次元社群", "其他"];

const emptyForm = {
  name: "",
  type: "短视频分析",
  members: "",
  question: "",
  dataSource: "",
  sampleSize: "",
  methods: "",
  summary: "",
  projectLink: "",
  reportLink: ""
};

const examples = [
  {
    title: "小红书品牌传播分析",
    type: "品牌传播",
    intro: "分析品牌笔记和评论中的用户评价、种草话语与消费体验表达。",
    data: "小红书公开笔记、评论文本、点赞收藏等互动指标。",
    methods: "词频分析、情感分析、主题识别、互动指标对比。",
    charts: "品牌认知词云、情绪分布图、内容类型互动柱状图。",
    value: "帮助学生理解品牌传播中的用户生成内容、口碑扩散和平台化消费场景。"
  },
  {
    title: "抖音城市文旅传播效果分析",
    type: "短视频分析",
    intro: "比较城市文旅短视频中景观、叙事、音乐和评论反馈之间的关系。",
    data: "抖音公开视频标题、评论、点赞、收藏、转发等指标。",
    methods: "内容编码、评论情感分析、互动指标分析。",
    charts: "互动趋势图、内容类型对比图、评论高频词图。",
    value: "适合训练学生把城市形象传播问题转化为可观察变量。"
  },
  {
    title: "B站弹幕情绪传播分析",
    type: "二次元社群",
    intro: "观察视频不同时间段弹幕情绪变化和社群互动表达。",
    data: "B站公开弹幕、评论、视频分段信息。",
    methods: "情感分析、时间序列分析、共词网络。",
    charts: "弹幕情绪时间线、关键词共现网络、分段弹幕密度图。",
    value: "帮助学生理解弹幕互动、社群身份和情绪同步。"
  },
  {
    title: "微博公共事件舆情分析",
    type: "舆情分析",
    intro: "分析公共事件中网民关注点、情绪变化和议题转移。",
    data: "微博公开话题、帖子、评论和发布时间。",
    methods: "词频分析、主题模型、情绪趋势分析。",
    charts: "议题演化图、情感趋势线、高频词柱状图。",
    value: "适合训练舆情分析、公共传播和议题设置相关研究能力。"
  },
  {
    title: "YouTube中国文化海外接受研究",
    type: "国际传播",
    intro: "研究海外受众如何评价中国文化视频及其国家形象表达。",
    data: "YouTube公开评论、视频标题、频道信息和互动指标。",
    methods: "主题识别、情感分析、框架分析。",
    charts: "主题分布图、国家形象关键词图、情感比例图。",
    value: "连接国际传播、国家形象和跨文化受众研究。"
  },
  {
    title: "二次元社群话语规训分析",
    type: "二次元社群",
    intro: "分析社群成员如何通过评论、弹幕和帖子形成身份边界与互动规范。",
    data: "公开帖子、评论、弹幕和社群讨论文本。",
    methods: "话语分析、文本分类、关键词共现。",
    charts: "身份标签图、话语类型分布图、互动关系图。",
    value: "帮助学生理解社群文化、话语秩序和平台互动规范。"
  }
];

const teacherTips = [
  ["创建腾讯文档收集表", "进入腾讯文档，新建在线收集表或表格，字段对应项目名称、成员、研究问题、数据来源、样本量、方法、链接等。"],
  ["创建飞书表单", "进入飞书工作台或飞书多维表格，新建表单视图，设置必填字段并开启收集链接。"],
  ["替换表单链接", "在 src/components/StudentProjects.jsx 中修改 tencentFormUrl 或 feishuFormUrl 常量，即可替换按钮入口。"],
  ["导出学生项目", "在腾讯文档或飞书表单后台导出 Excel，再按项目类型、方法完整度、图表质量筛选。"],
  ["进入课程案例库", "优先选择研究问题清楚、数据来源规范、方法可复现、报告链接完整的项目进入课程案例库。"]
];

export default function StudentProjects() {
  const [form, setForm] = useState(emptyForm);
  const [card, setCard] = useState(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem("zhichuan-student-project") || "null");
      return saved && typeof saved === "object" ? saved : null;
    } catch {
      return null;
    }
  });
  const [filter, setFilter] = useState("全部");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const submitText = useMemo(() => {
    const source = card || form;
    return [
      "学生项目提交内容",
      `项目名称：${source.name || "未填写"}`,
      `项目类型：${source.type || "未填写"}`,
      `小组成员：${source.members || "未填写"}`,
      `研究问题：${source.question || "未填写"}`,
      `数据来源：${source.dataSource || "未填写"}`,
      `样本量：${source.sampleSize || "未填写"}`,
      `分析方法：${source.methods || "未填写"}`,
      `项目摘要：${source.summary || "未填写"}`,
      `项目链接：${source.projectLink || "未填写"}`,
      `报告链接：${source.reportLink || "未填写"}`
    ].join("\n");
  }, [card, form]);

  const filteredExamples = filter === "全部" ? examples : examples.filter((item) => item.type === filter);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const generateCard = () => {
    if (!form.name.trim() || !form.question.trim()) {
      setMessage("请至少填写项目名称和研究问题，再生成项目展示卡片。");
      setCard(null);
      return;
    }
    setMessage("");
    setCopied(false);
    const nextCard = { ...form, savedAt: new Date().toISOString() };
    setCard(nextCard);
    try {
      window.localStorage.setItem("zhichuan-student-project", JSON.stringify(nextCard));
    } catch {
      // localStorage 不可用时仍可在当前页面生成卡片。
    }
  };

  const clearForm = () => {
    setForm(emptyForm);
    setCard(null);
    try {
      window.localStorage.removeItem("zhichuan-student-project");
    } catch {
      // localStorage 不可用时无需额外处理。
    }
    setMessage("");
    setCopied(false);
  };

  const copySubmitText = async () => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(submitText);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = submitText;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="space-y-7">
      <SectionHeader
        eyebrow="Student Projects"
        title="学生项目提交中心"
        subtitle="用于课程项目汇总、展示卡片生成和提交文本整理。当前版本为静态前端引导，不保存数据库。"
      />

      <section className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
        <InfoPanel />
        <section className="rounded-2xl border border-cyan/20 bg-panel/85 p-5 shadow-glow">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white">提交入口</h2>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              请先在本页面生成项目展示卡片，再点击按钮进入腾讯文档收集表完成提交。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={tencentFormUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-cyan/40 bg-cyan/15 px-5 py-3 text-sm font-semibold text-cyan shadow-glow transition hover:bg-cyan/20"
            >
              提交到腾讯文档收集表
            </a>
            <a
              href={feishuFormUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-violet/30 bg-violet/10 px-5 py-3 text-sm font-semibold text-violet transition hover:bg-violet/15"
            >
              飞书表单备用入口
            </a>
          </div>
          <div className="mt-4 rounded-xl border border-amber/25 bg-amber/10 p-4 text-sm leading-7 text-slate-300">
            教师可将按钮链接替换为真实表单链接。腾讯文档入口已配置为当前课程收集表，飞书入口保留为备用占位。
          </div>
        </section>
      </section>

      <section className="grid gap-5 xl:grid-cols-[.95fr_1.05fr]">
        <section className="rounded-2xl border border-white/10 bg-panel/80 p-5 shadow-glow">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">项目提交表单</h2>
              <p className="mt-1 text-sm text-slate-400">填写后可生成展示卡片，并复制结构化提交文本。</p>
            </div>
            <button onClick={clearForm} className="rounded-full border border-white/10 bg-white/[.045] px-4 py-2 text-sm text-slate-300 transition hover:border-amber/60 hover:text-amber">
              清空
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <TextInput label="项目名称" value={form.name} onChange={(value) => update("name", value)} placeholder="例如：小红书品牌评论中的用户情感研究" />
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-cyan">项目类型</span>
              <select
                value={form.type}
                onChange={(event) => update("type", event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-ink/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan focus:shadow-glow"
              >
                {projectTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
            <TextInput label="小组成员" value={form.members} onChange={(value) => update("members", value)} placeholder="例如：张三、李四、王五" />
            <TextInput label="样本量" value={form.sampleSize} onChange={(value) => update("sampleSize", value)} placeholder="例如：500 条评论" />
            <TextInput label="数据来源" value={form.dataSource} onChange={(value) => update("dataSource", value)} placeholder="例如：小红书公开笔记评论" />
            <TextInput label="分析方法" value={form.methods} onChange={(value) => update("methods", value)} placeholder="例如：词频分析、情感分析、主题模型" />
            <TextInput label="项目链接" value={form.projectLink} onChange={(value) => update("projectLink", value)} placeholder="例如：网盘、GitHub、腾讯文档链接" />
            <TextInput label="报告链接" value={form.reportLink} onChange={(value) => update("reportLink", value)} placeholder="例如：课程报告在线文档链接" />
          </div>

          <div className="mt-4 grid gap-4">
            <TextArea label="研究问题" value={form.question} onChange={(value) => update("question", value)} placeholder="例如：用户主要讨论哪些品牌议题？情感倾向如何分布？" />
            <TextArea label="项目摘要" value={form.summary} onChange={(value) => update("summary", value)} placeholder="简要说明研究对象、数据、方法和主要发现。" />
          </div>

          {message && <div className="mt-4 rounded-xl border border-amber/30 bg-amber/10 px-4 py-3 text-sm text-amber">{message}</div>}

          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={generateCard} className="rounded-xl border border-cyan/40 bg-cyan/15 px-5 py-3 text-sm font-semibold text-cyan shadow-glow transition hover:bg-cyan/20">
              生成项目展示卡片
            </button>
            <button onClick={copySubmitText} className="rounded-xl border border-mint/30 bg-mint/10 px-5 py-3 text-sm font-semibold text-mint transition hover:bg-mint/15">
              {copied ? "已复制" : "复制提交文本"}
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-cyan/20 bg-ink/80 p-5 shadow-glow">
          <h2 className="mb-4 text-xl font-semibold text-white">项目展示卡片</h2>
          {card ? <ProjectCard project={card} /> : (
            <div className="rounded-2xl border border-white/10 bg-white/[.035] p-8 text-center text-sm leading-7 text-slate-400">
              填写表单后点击“生成项目展示卡片”，这里会自动生成可展示的课程项目卡片。
            </div>
          )}
        </section>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-white">项目展示区</h2>
            <p className="mt-1 text-sm text-slate-400">示例项目可作为学生选题、方法组合和汇报结构参考。</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-soft">
            {["全部", ...projectTypes].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${
                  filter === type
                    ? "border-cyan bg-cyan/15 text-cyan"
                    : "border-white/10 bg-white/[.045] text-slate-300 hover:border-cyan/50 hover:text-white"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredExamples.map((item) => <ExampleCard key={item.title} item={item} />)}
        </div>
      </section>

      <section className="rounded-2xl border border-violet/25 bg-panel/85 p-5 shadow-glow">
        <h2 className="mb-4 text-xl font-semibold text-white">教师使用说明</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {teacherTips.map(([title, text]) => (
            <article key={title} className="rounded-xl border border-white/10 bg-white/[.04] p-4">
              <h3 className="mb-2 font-semibold text-violet">{title}</h3>
              <p className="text-sm leading-7 text-slate-300">{text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function InfoPanel() {
  const items = ["项目题目", "小组成员", "研究问题", "数据来源", "样本量", "使用方法", "预期图表", "研究发现", "项目文件链接", "课程报告链接"];
  return (
    <section className="rounded-2xl border border-white/10 bg-panel/80 p-5 shadow-glow">
      <h2 className="text-xl font-semibold text-white">项目提交说明</h2>
      <p className="mt-2 text-sm leading-7 text-slate-300">
        学生需要先整理项目基本信息，再复制提交文本或进入收集表完成提交。当前页面只生成展示内容，不保存数据库。
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {items.map((item) => (
          <span key={item} className="rounded-full border border-cyan/20 bg-cyan/10 px-3 py-2 text-center text-xs text-cyan">
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

function ProjectCard({ project }) {
  return (
    <article className="rounded-2xl border border-cyan/25 bg-panel/85 p-5 shadow-glow">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 text-xs text-cyan">{project.type}</span>
        {project.sampleSize && <span className="rounded-full border border-mint/30 bg-mint/10 px-3 py-1 text-xs text-mint">{project.sampleSize}</span>}
      </div>
      <h3 className="text-2xl font-bold text-white">{project.name}</h3>
      <dl className="mt-4 space-y-3 text-sm leading-7">
        <InfoLine title="研究问题" text={project.question} />
        <InfoLine title="数据来源" text={project.dataSource} />
        <InfoLine title="方法" text={project.methods} />
        <InfoLine title="摘要" text={project.summary} />
        <InfoLine title="项目链接" text={project.projectLink || "未填写"} />
        <InfoLine title="报告链接" text={project.reportLink || "未填写"} />
      </dl>
    </article>
  );
}

function ExampleCard({ item }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-panel/80 p-5 shadow-glow transition hover:-translate-y-1 hover:border-cyan/40">
      <div className="mb-3 inline-flex rounded-full border border-amber/30 bg-amber/10 px-3 py-1 text-xs text-amber">{item.type}</div>
      <h3 className="text-xl font-semibold text-white">{item.title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-300">{item.intro}</p>
      <dl className="mt-4 space-y-3 text-sm leading-7">
        <InfoLine title="数据来源" text={item.data} />
        <InfoLine title="方法" text={item.methods} />
        <InfoLine title="可视化结果" text={item.charts} />
        <InfoLine title="课程价值" text={item.value} />
      </dl>
    </article>
  );
}

function InfoLine({ title, text }) {
  return (
    <div>
      <dt className="font-semibold text-cyan">{title}</dt>
      <dd className="text-slate-300">{text || "未填写"}</dd>
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
