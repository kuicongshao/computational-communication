export default function GraphShell({ center, nodes, activeTitle, onSelect, color = "cyan" }) {
  const colors = {
    cyan: "border-cyan/60 bg-cyan/12 text-cyan",
    mint: "border-mint/60 bg-mint/12 text-mint",
    violet: "border-violet/60 bg-violet/12 text-violet",
    amber: "border-amber/60 bg-amber/12 text-amber"
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-panel/80 p-5 shadow-glow">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        {[18, 54, 90, 126, 162, 198, 234, 270, 306, 342].map((deg) => (
          <span key={deg} className="node-line" style={{ transform: `rotate(${deg}deg)` }} />
        ))}
      </div>
      <div className="relative grid gap-5 lg:grid-cols-[280px_1fr]">
        <button
          onClick={() => onSelect?.(null)}
          className={`flex min-h-40 items-center justify-center rounded-2xl border p-6 text-center text-xl font-bold ${colors[color]}`}
        >
          {center}
        </button>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {nodes.map((node, index) => (
            <button
              key={node.title}
              onClick={() => onSelect(node)}
              className={`group rounded-xl border p-4 text-left transition hover:-translate-y-1 hover:shadow-glow ${
                activeTitle === node.title
                  ? "border-cyan bg-cyan/15"
                  : "border-white/10 bg-white/[.045] hover:border-cyan/50"
              }`}
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-400">
                  Node {String(index + 1).padStart(2, "0")}
                </span>
                <span className="h-2 w-2 rounded-full bg-mint shadow-[0_0_18px_rgba(52,211,153,.8)]" />
              </div>
              <div className="font-semibold text-white group-hover:text-cyan">{node.title}</div>
              {node.caption && <p className="mt-2 text-sm leading-6 text-slate-400">{node.caption}</p>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
