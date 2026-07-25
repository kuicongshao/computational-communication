import { useState } from "react";
import { problemNodes } from "../data.js";
import GraphShell from "./GraphShell.jsx";
import SectionHeader from "./SectionHeader.jsx";
import InfoCard from "./InfoCard.jsx";

export default function ProblemGraph() {
  const nodes = problemNodes.map(([title, examples]) => ({ title, caption: examples[0] }));
  const [selected, setSelected] = useState(problemNodes[0]);

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Problem Graph"
        title="问题图谱"
        subtitle="中心问题是“传播现象如何转化为计算传播学研究问题？”。每类问题都连接数据、方法、图表和论文表达。"
      />
      <GraphShell
        center="传播现象如何转化为计算传播学研究问题？"
        nodes={nodes}
        activeTitle={selected[0]}
        onSelect={(node) => setSelected(node ? problemNodes.find((item) => item[0] === node.title) : problemNodes[0])}
        color="mint"
      />
      <section className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <InfoCard title={selected[0]} tone="mint">
          <ul className="space-y-2">
            {selected[1].map((item) => <li key={item}>· {item}</li>)}
          </ul>
        </InfoCard>
        <div className="grid gap-4">
          <InfoCard title="可分析数据">{selected[2]}</InfoCard>
          <InfoCard title="可使用方法" tone="violet">{selected[3]}</InfoCard>
          <InfoCard title="可形成图表" tone="amber">{selected[4]}</InfoCard>
          <InfoCard title="论文表达方式">{selected[5]}</InfoCard>
        </div>
      </section>
    </div>
  );
}
