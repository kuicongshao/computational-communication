import { useState } from "react";
import { abilityNodes } from "../data.js";
import GraphShell from "./GraphShell.jsx";
import SectionHeader from "./SectionHeader.jsx";
import InfoCard from "./InfoCard.jsx";

export default function AbilityGraph() {
  const [selected, setSelected] = useState(abilityNodes[0]);
  const nodes = abilityNodes.map(([title, desc, chapter]) => ({ title, caption: `${desc}｜${chapter}` }));

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Ability Graph"
        title="能力图谱"
        subtitle="把课程学习转化为可说明、可训练、可评价的能力节点。"
      />
      <GraphShell
        center="计算传播学学习能力"
        nodes={nodes}
        activeTitle={selected[0]}
        onSelect={(node) => setSelected(node ? abilityNodes.find((item) => item[0] === node.title) : abilityNodes[0])}
        color="violet"
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <InfoCard title="能力说明" tone="violet">{selected[1]}</InfoCard>
        <InfoCard title="对应章节">{selected[2]}</InfoCard>
        <InfoCard title="需要掌握的工具" tone="mint">{selected[3]}</InfoCard>
        <InfoCard title="可完成的任务" tone="amber">{selected[4]}</InfoCard>
        <InfoCard title="评价标准">{selected[5]}</InfoCard>
      </section>
    </div>
  );
}
