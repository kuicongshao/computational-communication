export const firstUseFlow = [
  {
    id: "identity",
    title: "创建你的 AI 学习档案",
    target: "learningProfile",
    action: "去创建学习档案",
    message: "我们先建立你的学习身份。这不是注册账号，而是帮助平台了解你的学习阶段和兴趣方向。填写完成后，我可以为你推荐学习路径。",
    complete: "很好，你已经完成第一步。现在我知道你的学习方向了。下一步，我们一起规划你的项目。"
  },
  {
    id: "direction",
    title: "选择项目方向",
    target: "workflow",
    action: "进入 AI 工作流",
    message: "计算传播学项目不是从代码开始，而是从问题开始。你可以告诉我：你关注什么现象、想研究什么对象、希望得到什么成果？",
    complete: "项目方向已经确定。接下来让 AI 项目策划助手帮助你把想法变成研究方案。"
  },
  {
    id: "design",
    title: "生成项目设计方案",
    target: "agents",
    action: "使用 AI 项目策划",
    message: "现在进入项目设计阶段。AI 项目策划可以帮助你优化研究问题、推荐数据来源、匹配分析方法，并规划成果形式。",
    complete: "项目雏形已经形成。下一步，我们让数据帮助你验证想法。"
  },
  {
    id: "analysis",
    title: "数据分析实践",
    target: "lab",
    action: "进入智能分析实验室",
    message: "研究不能只停留在想法。现在尝试输入文本数据，让 AI 帮助你发现高频词、情感倾向、潜在主题和分析方向。",
    complete: "你的数据分析结果已经产生。下一步完善研究逻辑。"
  },
  {
    id: "outcome",
    title: "形成项目成果",
    target: "studentProjects",
    action: "生成项目档案",
    message: "最后一步，把你的研究过程整理成项目成果。你可以生成项目卡片、成果展示和提交材料。",
    complete: "很好，你已完成一轮项目式学习。记得回到学习档案查看成长反馈。"
  }
];

export const onboardingFlow = [
  { id: "profile", title: "创建学习档案", target: "learningProfile", action: "去创建学习档案", message: "我们先创建你的学习档案。它不是账号注册，而是用于记录你的学习阶段、兴趣方向和项目成长过程。" },
  { id: "stage", title: "确定项目阶段", target: "workflow", action: "进入AI工作流", message: "学习档案创建完成后，请进入AI工作流，告诉系统你目前处于没有想法、已有主题、已有数据或成果整理的哪一阶段。" },
  { id: "design", title: "完成项目设计", target: "agents", action: "使用课程智能体", message: "AI项目策划和AI研究设计智能体会将你的兴趣转化为研究问题、数据方案、方法路径和成果目标。" },
  { id: "analysis", title: "开展数据分析", target: "lab", action: "进入智能分析实验室", message: "项目方案形成后，可进入方法工具箱和智能分析实验室，完成方法选择与文本试分析。" },
  { id: "review", title: "评价与成长复盘", target: "learningProfile", action: "查看学习档案", message: "最后通过项目评价、学生项目和AI学习档案查看修改建议、能力画像与下一阶段学习路径。" }
];

export const stageNames = {
  noIdea: "项目发现",
  topic: "项目设计",
  data: "数据分析",
  paper: "研究设计",
  finish: "成果评价",
  growth: "能力成长"
};

export function getNextRecommendation(status) {
  if (!status.hasIdentity) {
    return {
      title: "创建学习档案",
      text: "看起来你还没有创建学习档案。这是开始学习的第一步。",
      target: "learningProfile",
      action: "去创建学习档案"
    };
  }
  if (!status.hasWorkflow) {
    return {
      title: "确定项目方向",
      text: "你的学习档案已经建立。下一步建议确定项目方向。",
      target: "workflow",
      action: "进入 AI 工作流"
    };
  }
  if (status.hasProjectDesign && !status.hasAnalysis) {
    return {
      title: "开始数据分析",
      text: "项目方案已经完成。现在需要用数据验证你的研究。",
      target: "lab",
      action: "进入智能分析实验室"
    };
  }
  if (status.hasAnalysis && !status.hasProjectCard) {
    return {
      title: "整理项目成果",
      text: "你的分析结果已经产生。现在整理成果，让别人看到你的研究。",
      target: "studentProjects",
      action: "进入学生项目中心"
    };
  }
  return {
    title: "查看学习反馈",
    text: "你的学习记录正在积累。可以查看学习档案，回顾能力成长与下一步建议。",
    target: "learningProfile",
    action: "查看成长反馈"
  };
}
