import { projects } from "../data.js";
import SectionHeader from "./SectionHeader.jsx";

export default function Projects() {
  return (
    <div>
      <SectionHeader
        eyebrow="Project Studio"
        title="项目实战"
        subtitle="每个项目都以研究问题为牵引，要求学生完成数据来源说明、方法选择、可视化结果和最终成果表达。"
      />
      <div className="grid gap-5 lg:grid-cols-2">
        {projects.map((project, index) => (
          <article key={project.name} className="rounded-2xl border border-white/10 bg-panel/80 p-6 shadow-glow">
            <div className="mb-4 flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-amber/40 bg-amber/10 font-semibold text-amber">
                {index + 1}
              </span>
              <div>
                <h2 className="text-xl font-semibold text-white">{project.name}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-300">{project.intro}</p>
              </div>
            </div>
            <div className="grid gap-3 text-sm leading-7 sm:grid-cols-2">
              <Block title="研究问题" text={project.question} />
              <Block title="数据来源" text={project.data} />
              <Block title="分析方法" text={project.method} />
              <Block title="可视化结果" text={project.visual} />
            </div>
            <div className="mt-4 rounded-xl border border-mint/25 bg-mint/10 p-4 text-sm text-mint">
              最终成果形式：{project.outcome}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Block({ title, text }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[.04] p-4">
      <div className="mb-1 text-cyan">{title}</div>
      <div className="text-slate-300">{text}</div>
    </div>
  );
}
