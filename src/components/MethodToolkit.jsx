import { methods } from "../data.js";
import SectionHeader from "./SectionHeader.jsx";

export default function MethodToolkit() {
  return (
    <div>
      <SectionHeader
        eyebrow="Method Toolkit"
        title="方法工具箱"
        subtitle="每张方法卡片回答：适合什么传播问题、需要什么输入数据、会输出什么结果、对应哪个章节。"
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {methods.map(([name, question, input, output, chapter, example], index) => (
          <article key={name} className="rounded-2xl border border-white/10 bg-panel/80 p-5 shadow-glow">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">{name}</h2>
              <span className="rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 text-xs text-cyan">
                M{String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <dl className="space-y-3 text-sm leading-7">
              <div><dt className="text-mint">适合回答</dt><dd className="text-slate-300">{question}</dd></div>
              <div><dt className="text-violet">输入数据</dt><dd className="text-slate-300">{input}</dd></div>
              <div><dt className="text-amber">输出结果</dt><dd className="text-slate-300">{output}</dd></div>
              <div><dt className="text-cyan">对应章节</dt><dd className="text-slate-300">{chapter}</dd></div>
              <div><dt className="text-slate-200">案例</dt><dd className="text-slate-300">{example}</dd></div>
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
