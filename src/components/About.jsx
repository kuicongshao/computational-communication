import SectionHeader from "./SectionHeader.jsx";
import InfoCard from "./InfoCard.jsx";

export default function About() {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="About Platform"
        title="关于知行智链"
        subtitle="知行智链是一套面向高校课程教学场景设计的AI教育智能体系统。"
      />
      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard title="品牌定位" tone="cyan">
          知行智链——AI教育智能体平台
        </InfoCard>
        <InfoCard title="平台定位" tone="mint">
          计算传播学课程学习智能体：面向课程学习、项目实践、研究训练与过程评价提供智能化、个性化支持。
        </InfoCard>
        <InfoCard title="示范应用" tone="violet">
          计算传播学课程智能教学实践：以知识图谱、项目工作流和多智能体协同支持学生从学习到成果展示的完整路径。
        </InfoCard>
        <InfoCard title="课程定位">
          课程不是单纯的 Python 技术课，也不是普通理论介绍课。它以传播学问题为起点，以平台数据为材料，以文本分析、情感分析、主题模型、机器学习和可视化为方法，训练学生形成从问题提出到论文表达的完整路径。
        </InfoCard>
        <InfoCard title="学习方式" tone="mint">
          学生可以先从知识图谱进入章节，理解概念和方法；再进入问题图谱训练研究转化；随后用能力图谱检查自己能完成的任务；最后在项目实战中完成一个可展示的课程作品。
        </InfoCard>
        <InfoCard title="教师展示建议" tone="violet">
          教师可在课堂开头使用首页展示课程全貌，在章节教学中打开知识节点，在项目汇报前使用岗位能力图谱说明学习成果如何连接实际岗位，并用方法工具箱提示学生选择合适分析方法。
        </InfoCard>
        <InfoCard title="学习成果" tone="amber">
          完成课程后，学生应能设计一个计算传播学研究问题，整理平台数据，完成基础清洗和分析，制作解释性图表，并以研究报告、课程论文或项目展示的形式表达发现。
        </InfoCard>
      </div>
    </div>
  );
}
