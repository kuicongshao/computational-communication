import { OUT_OF_SCOPE_REPLY } from "./prompts.js";

const courseKeywords = ["计算传播", "传播", "课程", "研究", "理论", "数据", "方法", "样本", "文本", "评论", "情感", "主题", "网络", "变量", "项目", "论文", "章节", "学习", "分析", "评价", "平台", "问卷"];

export function routeEducationTask(message) {
  const text = String(message || "").trim();
  const includes = (...words) => words.some((word) => text.includes(word));
  if (!text || !courseKeywords.some((word) => text.includes(word))) return { inScope: false, agentType: "AI学习导师", recommendPage: "learningProfile", nextStep: "请提出一个与计算传播学课程或项目相关的问题。" };
  if (includes("评价", "修改", "优化", "不足", "项目方案")) return { inScope: true, agentType: "AI项目评价助手", recommendPage: "studentProjects", nextStep: "补充项目题目、研究问题、数据来源和方法后进行评价。" };
  if (includes("方法", "词频", "情感", "主题", "机器学习", "网络分析", "样本", "数据类型")) return { inScope: true, agentType: "AI方法推荐助手", recommendPage: "methods", nextStep: "明确研究目标、数据类型和样本规模，再验证方法匹配。" };
  if (includes("研究问题", "RQ", "理论", "变量", "研究设计", "论文结构")) return { inScope: true, agentType: "AI研究设计助手", recommendPage: "agents", nextStep: "将研究兴趣压缩为对象、数据、变量和可回答的研究问题。" };
  if (includes("下一步", "学习路径", "成长", "进度", "章节", "档案")) return { inScope: true, agentType: "AI成长导师", recommendPage: "learningProfile", nextStep: "查看能力画像，并完成当前最薄弱能力对应的实践任务。" };
  return { inScope: true, agentType: "AI学习导师", recommendPage: "knowledge", nextStep: "先完成一个知识节点，再把概念转化为项目中的研究问题。" };
}

export function createLocalCourseReply(message, studentState) {
  const route = routeEducationTask(message);
  if (!route.inScope) return { answer: OUT_OF_SCOPE_REPLY, ...route };
  const progress = `当前已完成 ${studentState.completedCount || 0} 个工作流步骤、${studentState.chapterCount || 0} 个知识章节。`;
  const replies = {
    "AI学习导师": `先把你的问题拆成“传播现象—研究对象—可获得数据”三个部分。${progress}建议先学习与问题最接近的知识章节，再用一个小样本完成试分析。`,
    "AI研究设计助手": "建议先限定一个平台、一个研究对象和一个时间范围，再形成 RQ1（现象/主题）、RQ2（态度或差异）、RQ3（变量或机制）。理论框架应服务于变量定义，数据来源与方法必须能够回答每一个 RQ。",
    "AI方法推荐助手": "方法应由研究问题决定：了解讨论内容可用词频或主题模型；判断态度可用情感分析；比较变量关系可用统计或机器学习；分析互动关系可用网络分析。先做 20—30 条小样本试分析，确认字段和方法可行。",
    "AI项目评价助手": "请从五项检查项目：研究问题是否聚焦、数据是否可获得、方法是否回答问题、创新点是否具体、实践价值是否可呈现。优先补齐最薄弱的一项，再生成项目展示卡片。",
    "AI成长导师": `${progress}建议优先完成当前学习链条中尚未开始的环节：学习档案 → 项目方向 → 项目设计 → 数据分析 → 项目成果。`
  };
  return { answer: replies[route.agentType], ...route };
}
