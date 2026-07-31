export function buildTeacherReport(summary) {
  const focus = summary.difficulties[0]?.name || "数据分析困难";
  const risk = summary.averageAnalysisCount < 3 ? "部分学生尚未充分进入试分析环节。" : "试分析参与度处于可持续推进水平。";
  return {
    title: "《课程学习智能体教学分析报告》",
    mode: "local",
    sections: [
      ["1. 班级学习概况", `当前共有${summary.count}名学生参与课程学习，平均学习进度为${summary.averageProgress}%，章节完成情况为${summary.chapterCompletion}%，项目完成率为${summary.projectCompletion}%。`],
      ["2. 学习行为分析", `班级累计使用智能体${summary.agentUses}次，智能分析实验室累计使用${summary.analysisUses}次。当前学习行为呈现“知识学习先行、项目与试分析逐步推进”的特征。`],
      ["3. 项目质量分析", `当前项目${summary.projects}个，其中优秀项目${summary.excellentProjects}个、待修改项目${summary.revisionProjects}个。高频问题集中于数据不足、方法与研究问题不匹配、研究范围过大。`],
      ["4. 学生能力诊断", `研究设计平均评分${summary.averageResearchScore}分，数据分析平均评分${summary.averageAnalysisScore}分，综合能力平均评分${summary.averageAbilityScore}分。建议将${focus}作为下一轮教学支持重点。`],
      ["5. 教学风险预警", `${risk} 对低进度或待修改项目学生，需重点检查研究问题范围、数据来源与方法匹配关系。`],
      ["6. 教师教学建议", "下一次课堂增加20分钟研究问题压缩训练；安排一次文本清洗与字段设计工作坊；对未完成试分析的学生分组指导；选取优秀项目作为方法匹配案例。"],
      ["7. 下一阶段教学安排", "建议复习文本分析与研究设计章节；实践任务为完成一份小样本试分析；重点关注低数据分析评分学生；评价重点为研究问题、数据字段与分析方法的一致性。"]
    ]
  };
}

export function reportToText(report) { return [report.title, ...report.sections.map(([title, text]) => `${title}\n${text}`)].join("\n\n"); }
