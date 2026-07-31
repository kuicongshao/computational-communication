import SectionHeader from "./SectionHeader.jsx";
import BrandLogo from "./BrandLogo.jsx";

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
      <section className="relative mb-10 overflow-hidden rounded-3xl border border-cyan/20 bg-ink/85 p-8 shadow-glow sm:p-12">
        {/* TODO: 品牌视觉资源 public/assets/ai-campus-bg.jpg */}
        <div
          aria-hidden="true"
          className="absolute -inset-2 scale-105 bg-cover bg-center opacity-45 blur-[0.75px]"
          style={{ backgroundImage: "url('/assets/ai-campus-bg.jpg')" }}
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#050f1e]/82 via-[#07111f]/74 to-[#081728]/70" />
        <div className="relative max-w-4xl">
          <div className="mb-5 flex items-center gap-2.5">
            {/* TODO: 品牌视觉资源 public/assets/brand-logo.png */}
            <BrandLogo className="h-16 w-16 sm:h-20 sm:w-20" />
            <div className="text-sm font-semibold tracking-wide text-slate-100 sm:text-base">知行智链 · AI教育智能体平台</div>
          </div>
          <div className="mb-4 inline-flex rounded-full border border-mint/30 bg-mint/10 px-4 py-2 text-sm text-mint">未来教育科技 · 多智能体协同</div>
          <h1 className="text-5xl font-bold leading-none tracking-tight text-white sm:text-7xl">知行智链</h1>
          <p className="mt-4 text-xl font-medium text-cyan sm:text-2xl">计算传播学课程学习智能体</p>
          <p className="mt-2 text-base font-medium text-slate-200 sm:text-lg">计算传播学课程学习智能体</p>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">面向课程学习、研究实践与智能评价的AI教育智能体平台。</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["课程学习", "项目实践", "研究训练", "过程评价"].map((tag) => <span key={tag} className="rounded-full border border-white/15 bg-ink/45 px-3 py-1.5 text-sm text-cyan backdrop-blur-sm">{tag}</span>)}
          </div>
        </div>
      </section>

      <section className="mb-10 rounded-3xl border border-violet/25 bg-panel/85 p-6 shadow-glow sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div>
            <div className="inline-flex rounded-full border border-violet/30 bg-violet/10 px-3 py-1.5 text-sm text-violet">AI Learning Journey</div>
            <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">开始我的AI学习之旅</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">创建AI学习档案，选择项目阶段，使用多智能体完成计算传播学实践。</p>
            <button
              onClick={() => onNavigate("learningProfile")}
              className="mt-5 rounded-xl border border-cyan/40 bg-cyan/15 px-5 py-3 text-sm font-semibold text-cyan shadow-glow transition hover:-translate-y-0.5 hover:bg-cyan/25"
            >
              创建学习档案
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-4 sm:items-stretch">
            {["创建学习档案", "AI项目工作流", "智能体协同学习", "生成成长报告"].map((step, index) => (
              <div key={step} className="relative rounded-xl border border-white/10 bg-ink/70 p-4 text-center">
                <span className="text-xs font-semibold text-mint">步骤 {index + 1}</span>
                <p className="mt-2 text-sm font-semibold leading-6 text-white">{step}</p>
                {index < 3 && <><span className="absolute -bottom-3 left-1/2 z-10 text-lg text-cyan sm:hidden">↓</span><span className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 text-lg text-cyan sm:inline">→</span></>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-10 rounded-3xl border border-mint/20 bg-panel/80 p-6 shadow-glow sm:p-8">
        <div className="grid gap-5 lg:grid-cols-[auto_1fr] lg:items-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-mint/30 bg-mint/10 text-xl font-bold text-mint">AI</div>
          <div>
            <p className="text-sm font-semibold text-mint">平台简介</p>
            <p className="mt-2 max-w-4xl text-base leading-8 text-slate-300">知行智链面向课程学习、项目实践、研究训练与过程评价，通过多智能体协同支持学习者将问题意识转化为可执行、可评价的课程成果。</p>
          </div>
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
