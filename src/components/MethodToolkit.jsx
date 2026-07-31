import { useMemo, useState } from "react";
import { methods } from "../data.js";
import SectionHeader from "./SectionHeader.jsx";

const emptyAdvisor = { goal: "", dataType: "", sampleSize: "" };

export default function MethodToolkit({ onNavigate }) {
  const [advisor, setAdvisor] = useState(emptyAdvisor);
  const recommendation = useMemo(() => recommendMethods(advisor), [advisor]);

  return (
    <div className="space-y-7">
      <SectionHeader
        eyebrow="Method Toolkit"
        title="方法工具箱"
        subtitle="每张方法卡片回答：适合什么传播问题、需要什么输入数据、会输出什么结果、对应哪个章节。"
      />

      <section className="rounded-3xl border border-cyan/20 bg-panel/85 p-6 shadow-glow">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-sm font-semibold text-cyan">AI 方法推荐助手</p><h2 className="mt-1 text-2xl font-semibold text-white">根据任务匹配分析方法</h2><p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">本推荐在浏览器本地完成。请先说明研究目标、数据类型和大致样本规模，再把建议带入智能分析实验室验证。</p></div>
          <button onClick={() => onNavigate?.("lab")} className="rounded-xl border border-mint/35 bg-mint/10 px-4 py-3 text-sm font-semibold text-mint transition hover:bg-mint/15">进入智能分析实验室</button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Field label="研究目标" value={advisor.goal} onChange={(value) => setAdvisor({ ...advisor, goal: value })} placeholder="例如：识别主题、判断情感、比较群体或预测效果" />
          <Field label="数据类型" value={advisor.dataType} onChange={(value) => setAdvisor({ ...advisor, dataType: value })} placeholder="例如：评论文本、互动指标、转发关系或标签数据" />
          <Field label="样本规模" value={advisor.sampleSize} onChange={(value) => setAdvisor({ ...advisor, sampleSize: value })} placeholder="例如：50、500 或 5000" />
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="rounded-2xl border border-mint/20 bg-mint/10 p-4"><p className="text-sm font-semibold text-mint">任务判断</p><p className="mt-2 text-sm leading-7 text-slate-200">{recommendation.reason}</p></div>
          <button onClick={() => setAdvisor(emptyAdvisor)} className="rounded-xl border border-white/10 bg-ink/65 px-4 py-3 text-sm text-slate-300 transition hover:border-amber/50 hover:text-amber">清空条件</button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {recommendation.items.map((item) => <article key={item.name} className="rounded-2xl border border-white/10 bg-ink/70 p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-white">{item.name}</h3><span className={`rounded-full border px-2.5 py-1 text-xs ${item.tone}`}>{item.level}</span></div><p className="mt-3 text-sm leading-6 text-slate-300">{item.reason}</p><p className="mt-3 text-xs leading-6 text-slate-400">课堂任务：{item.task}</p></article>)}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {methods.map(([name, question, input, output, chapter, example], index) => (
          <article key={name} className="rounded-2xl border border-white/10 bg-panel/80 p-5 shadow-glow">
            <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-semibold text-white">{name}</h2><span className="rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 text-xs text-cyan">M{String(index + 1).padStart(2, "0")}</span></div>
            <dl className="space-y-3 text-sm leading-7"><div><dt className="text-mint">适合回答</dt><dd className="text-slate-300">{question}</dd></div><div><dt className="text-violet">输入数据</dt><dd className="text-slate-300">{input}</dd></div><div><dt className="text-amber">输出结果</dt><dd className="text-slate-300">{output}</dd></div><div><dt className="text-cyan">对应章节</dt><dd className="text-slate-300">{chapter}</dd></div><div><dt className="text-slate-200">案例参考</dt><dd className="text-slate-300">{example}</dd></div></dl>
          </article>
        ))}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return <label className="block"><span className="mb-2 block text-sm font-semibold text-cyan">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-white/10 bg-ink/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan focus:shadow-glow" /></label>;
}

function recommendMethods({ goal, dataType, sampleSize }) {
  const text = `${goal} ${dataType}`.toLowerCase();
  const size = Number((String(sampleSize).match(/\d+/) || ["0"])[0]);
  const includes = (...words) => words.some((word) => text.includes(word));
  const items = [];
  const add = (name, level, reason, task) => items.push({ name, level, reason, task, tone: level === "优先推荐" ? "border-mint/30 bg-mint/10 text-mint" : "border-cyan/30 bg-cyan/10 text-cyan" });

  if (includes("词", "高频", "讨论", "文本")) add("词频分析", "优先推荐", "适合快速识别文本中的主要表达与讨论焦点。", "先清洗 20-30 条文本，输出高频词表和词云。");
  if (includes("情感", "态度", "评价", "评论")) add("情感分析", "优先推荐", "可比较正负态度与互动或主题之间的关系。", "抽样核验情感标签，再制作情感分布图。");
  if (includes("主题", "议题", "发现") || (includes("文本") && size >= 200)) add("主题模型", "优先推荐", "适合从较多文本中归纳潜在议题结构。", "先验证样本质量，再为每个主题阅读代表文本并命名。");
  if (includes("预测", "分类", "标签") && size >= 300) add("机器学习", "条件推荐", "需要足够样本与明确标签，适合分类或预测任务。", "先建立人工编码规则和训练集，再报告模型评估指标。");
  if (includes("关系", "转发", "网络", "互动关系")) add("网络分析", "优先推荐", "适合分析用户、话题或转发之间的连接结构。", "明确节点与边的定义，再输出网络图和中心性指标。");
  if (includes("趋势", "比较", "展示", "互动") || !items.length) add("可视化", "基础推荐", "用于呈现时间变化、群体差异与核心发现。", "选择一张图只回答一个研究问题，并写出图表发现。");

  return { items: items.slice(0, 5), reason: items.length ? "已根据你的目标、数据类型和样本规模匹配方法。方法可组合使用，但应始终回到研究问题。" : "请补充研究目标、数据类型和样本规模；系统会据此给出更精确的组合建议。" };
}
