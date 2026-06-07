import SectionHeader from "./SectionHeader.jsx";

const entries = [
  ["知识图谱", "学习课程核心知识", "knowledge", "cyan"],
  ["问题图谱", "理解传播学研究问题如何转化为数据问题", "problem", "mint"],
  ["能力图谱", "掌握数据清洗、文本分析、主题模型、机器学习等能力", "ability", "violet"],
  ["岗位能力图谱", "对应新媒体运营、数据分析、品牌传播、舆情分析、内容策划等岗位能力", "job", "amber"]
];

const badgeClasses = {
  cyan: "bg-cyan/10 text-cyan",
  mint: "bg-mint/10 text-mint",
  violet: "bg-violet/10 text-violet",
  amber: "bg-amber/10 text-amber"
};

export default function Home({ onNavigate }) {
  return (
    <div>
      <section className="relative mb-10 overflow-hidden rounded-3xl border border-cyan/20 bg-ink/75 p-8 shadow-glow sm:p-12">
        <div className="absolute inset-x-0 top-1/2 h-px bg-cyan/25" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-cyan/15" />
        <div className="relative max-w-4xl">
          <div className="mb-4 inline-flex rounded-full border border-mint/30 bg-mint/10 px-4 py-2 text-sm text-mint">
            课程图谱式学习平台
          </div>
          <h1 className="text-4xl font-bold leading-tight text-white sm:text-6xl">计算传播学图谱式学习平台</h1>
          <p className="mt-5 max-w-3xl text-lg leading-9 text-slate-300">
            从传播问题、数据方法到岗位能力的系统学习路径。学生可以沿着节点进入章节，教师可以直接展示课程结构与项目训练路线。
          </p>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {entries.map(([title, text, target, tone], index) => (
          <button
            key={title}
            onClick={() => onNavigate(target)}
            className="group min-h-48 rounded-2xl border border-white/10 bg-panel/80 p-5 text-left shadow-glow transition hover:-translate-y-1 hover:border-cyan/60"
          >
            <div className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 ${badgeClasses[tone]}`}>
              {index + 1}
            </div>
            <h2 className="text-xl font-semibold text-white group-hover:text-cyan">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">{text}</p>
          </button>
        ))}
      </div>

      <section className="mt-10">
        <SectionHeader
          eyebrow="Learning Path"
          title="从现象到论文，从技能到岗位"
          subtitle="平台把课程内容组织为四张图谱：知识图谱解释课程结构，问题图谱训练研究转化，能力图谱沉淀学习成果，岗位能力图谱连接职业场景。"
        />
      </section>
    </div>
  );
}
