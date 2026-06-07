export default function InfoCard({ title, children, tone = "cyan" }) {
  const tones = {
    cyan: "border-cyan/30",
    mint: "border-mint/30",
    violet: "border-violet/30",
    amber: "border-amber/30"
  };
  return (
    <article className={`rounded-xl border ${tones[tone]} bg-white/[.045] p-5`}>
      <h3 className="mb-3 text-lg font-semibold text-white">{title}</h3>
      <div className="text-sm leading-7 text-slate-300">{children}</div>
    </article>
  );
}
