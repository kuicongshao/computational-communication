export default function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <section className="mb-8">
      <div className="mb-3 text-sm font-semibold uppercase tracking-[.28em] text-mint">{eyebrow}</div>
      <h1 className="max-w-4xl text-3xl font-bold text-white sm:text-5xl">{title}</h1>
      {subtitle && <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">{subtitle}</p>}
    </section>
  );
}
