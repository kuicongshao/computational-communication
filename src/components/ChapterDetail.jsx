import InfoCard from "./InfoCard.jsx";

export default function ChapterDetail({ chapter, completed = false, onToggleComplete }) {
  if (!chapter) {
    return (
      <div className="rounded-2xl border border-white/10 bg-panel/70 p-6 text-slate-300">
        请选择一个章节节点，右侧将显示完整学习内容。
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-cyan/25 bg-panel/85 p-6 shadow-glow">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-2 text-sm font-semibold text-cyan">章节学习卡片 · {chapter.wordCount}字</div>
            <h2 className="text-2xl font-bold text-white">{chapter.title}</h2>
          </div>
          <button
            onClick={onToggleComplete}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              completed
                ? "border-mint bg-mint/15 text-mint"
                : "border-white/10 bg-white/[.045] text-slate-300 hover:border-cyan hover:text-cyan"
            }`}
          >
            {completed ? "已完成本章" : "标记为已完成"}
          </button>
        </div>
        <p className="leading-8 text-slate-300">{chapter.goal}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <InfoCard title="学习目标" tone="cyan">
          <ul className="space-y-2">
            {chapter.goalList.map((item) => <li key={item}>· {item}</li>)}
          </ul>
        </InfoCard>
        <InfoCard title="核心概念" tone="mint">
          <div className="flex flex-wrap gap-2">
            {chapter.concepts.map((item) => (
              <span key={item} className="rounded-full border border-mint/30 bg-mint/10 px-3 py-1 text-mint">
                {item}
              </span>
            ))}
          </div>
        </InfoCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <InfoCard title="本章重点" tone="cyan">{chapter.focus}</InfoCard>
        <InfoCard title="本章难点" tone="violet">{chapter.difficulty}</InfoCard>
        <InfoCard title="常见错误" tone="amber">
          <ul className="space-y-2">
            {chapter.commonMistakes.map((item) => <li key={item}>· {item}</li>)}
          </ul>
        </InfoCard>
      </div>

      <InfoCard title="知识讲解">{chapter.lecture}</InfoCard>
      <InfoCard title="传播学案例" tone="violet">{chapter.case}</InfoCard>

      <section className="rounded-2xl border border-amber/25 bg-panel/85 p-6 shadow-glow">
        <div className="mb-4">
          <div className="text-sm font-semibold text-amber">Python 代码三版学习</div>
          <h3 className="mt-1 text-xl font-bold text-white">{chapter.codeTitle}</h3>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-amber/25 bg-amber/10 p-4">
            <h4 className="mb-3 font-semibold text-amber">第一版：完整可运行代码</h4>
            <pre className="rounded-lg bg-ink p-4 text-xs leading-6 text-slate-200">{chapter.code}</pre>
          </div>

          <div className="rounded-xl border border-cyan/20 bg-white/[.04] p-4">
            <h4 className="mb-3 font-semibold text-cyan">第二版：逐行中文解释</h4>
            <div className="space-y-2">
              {chapter.lineExplanations.map((item) => (
                <div key={`${chapter.id}-${item.lineNumber}`} className="grid gap-2 rounded-lg border border-white/10 bg-ink/70 p-3 md:grid-cols-[90px_1fr_1.4fr]">
                  <div className="text-xs text-slate-500">第 {item.lineNumber} 行</div>
                  <code className="text-xs text-slate-200">{item.code}</code>
                  <div className="text-sm leading-6 text-slate-300">{item.explanation}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-mint/25 bg-mint/10 p-4">
            <h4 className="mb-3 font-semibold text-mint">第三版：论文方法表述</h4>
            <p className="leading-8 text-slate-300">{chapter.paperMethod}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <InfoCard title="AI辅助学习提示词" tone="violet">{chapter.aiPrompt}</InfoCard>
        <InfoCard title="课堂练习" tone="amber">{chapter.exercise}</InfoCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <InfoCard title="自测题" tone="violet">
          <ol className="list-decimal space-y-2 pl-5">
            {chapter.quiz.map((q) => <li key={q}>{q}</li>)}
          </ol>
        </InfoCard>
        <InfoCard title="学习检查清单" tone="mint">
          <ul className="space-y-2">
            {chapter.checklist.map((item) => (
              <li key={item} className="flex gap-2"><span className="text-mint">✓</span>{item}</li>
            ))}
          </ul>
        </InfoCard>
      </div>

      <InfoCard title="本章小结">{chapter.summary}</InfoCard>
    </section>
  );
}
