import { useState } from "react";
import { jobNodes } from "../data.js";
import GraphShell from "./GraphShell.jsx";
import SectionHeader from "./SectionHeader.jsx";
import InfoCard from "./InfoCard.jsx";

export default function JobGraph() {
  const [selected, setSelected] = useState(jobNodes[0]);
  const nodes = jobNodes.map(([title, abilities]) => ({ title, caption: abilities.slice(0, 2).join(" / ") }));

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Job Graph"
        title="岗位能力图谱"
        subtitle="把课程知识连接到新媒体运营、品牌传播、舆情分析、数据新闻、国际传播和学术研究等方向。"
      />
      <GraphShell
        center="计算传播学岗位能力"
        nodes={nodes}
        activeTitle={selected[0]}
        onSelect={(node) => setSelected(node ? jobNodes.find((item) => item[0] === node.title) : jobNodes[0])}
        color="amber"
      />
      <section className="rounded-2xl border border-white/10 bg-panel/80 p-6 shadow-glow">
        <h2 className="text-2xl font-bold text-white">{selected[0]}</h2>
        <p className="mt-3 leading-8 text-slate-300">{selected[2]}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {selected[1].map((item) => <span key={item} className="rounded-full border border-amber/30 bg-amber/10 px-3 py-1 text-amber">{item}</span>)}
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard title="对应课程知识">{selected[3]}</InfoCard>
        <InfoCard title="需要掌握的方法" tone="mint">{selected[4]}</InfoCard>
        <InfoCard title="典型任务" tone="violet">{selected[5]}</InfoCard>
        <InfoCard title="学习建议" tone="amber">{selected[6]}</InfoCard>
      </section>
    </div>
  );
}
