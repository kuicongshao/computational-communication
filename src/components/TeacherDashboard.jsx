import { useMemo, useState } from "react";
import SectionHeader from "./SectionHeader.jsx";

const storageKey = "zhichuan-teacher-class-data";

export default function TeacherDashboard({ onNavigate }) {
  const [students, setStudents] = useState(loadClassData);
  const summary = useMemo(() => buildSummary(students), [students]);

  const resetDemo = () => {
    const data = createDemoStudents();
    try { window.localStorage.setItem(storageKey, JSON.stringify(data)); } catch { /* 本地存储不可用时仍展示当前模拟数据。 */ }
    setStudents(data);
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="ZhiChuan Teacher Dashboard"
        title="AI 教学管理驾驶舱"
        subtitle="面向教师的课程管理、学习诊断与项目评价工作台。当前版本使用本地模拟班级数据，不上传任何学生信息。"
      />

      <section className="rounded-3xl border border-cyan/20 bg-panel/80 p-6 shadow-glow sm:p-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-semibold text-mint">计算传播学课程 · 本地模拟班级</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">以学习数据辅助教学决策</h2>
            <p className="mt-2 text-sm leading-7 text-slate-300">聚合知识学习、项目实践与智能体使用记录，帮助教师识别班级共性困难并安排下一步教学。</p>
          </div>
          <button onClick={resetDemo} className="rounded-xl border border-white/10 bg-ink/70 px-4 py-3 text-sm text-slate-300 transition hover:border-cyan/50 hover:text-cyan">重置模拟班级数据</button>
        </div>
      </section>

      <section>
        <div className="mb-4"><p className="text-sm font-semibold text-cyan">Class Overview</p><h2 className="mt-1 text-2xl font-semibold text-white">班级学习概览</h2></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Metric label="学生数量" value={`${summary.count} 人`} tone="cyan" />
          <Metric label="平均学习进度" value={`${summary.averageProgress}%`} tone="mint" />
          <Metric label="章节完成情况" value={`${summary.chapterCompletion}%`} tone="violet" />
          <Metric label="项目完成情况" value={`${summary.projectCompletion}%`} tone="amber" />
          <Metric label="智能体使用次数" value={`${summary.agentUses} 次`} tone="cyan" />
        </div>
        <div className="mt-5 rounded-2xl border border-white/10 bg-ink/75 p-5 shadow-glow">
          <div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-white">章节完成情况</h3><span className="text-sm text-mint">班级平均 {summary.chapterCompletion}%</span></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{summary.chapterProgress.map((value, index) => <div key={index} className="rounded-xl border border-white/10 bg-panel/70 p-3"><div className="flex justify-between text-xs"><span className="text-slate-400">第 {index + 1}-{index + 2} 章</span><span className="text-cyan">{value}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan to-mint transition-all duration-500" style={{ width: `${value}%` }} /></div></div>)}</div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <DiagnosisPanel difficulties={summary.difficulties} />
        <ProjectQuality summary={summary} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <TeacherAdvice summary={summary} />
        <article className="rounded-2xl border border-violet/25 bg-violet/10 p-6 shadow-glow">
          <p className="text-sm font-semibold text-violet">课程联动入口</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">从诊断到教学行动</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <NavigateButton label="查看知识图谱" text="安排章节复习与学习任务" onClick={() => onNavigate("knowledge")} />
            <NavigateButton label="查看学生项目" text="检查项目档案和成果提交" onClick={() => onNavigate("studentProjects")} />
            <NavigateButton label="查看 AI 工作流" text="指导学生按阶段推进项目" onClick={() => onNavigate("workflow")} />
            <NavigateButton label="查看学习档案" text="了解个体学习画像逻辑" onClick={() => onNavigate("learningProfile")} />
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-white/10 bg-panel/80 p-6 shadow-glow">
        <p className="text-sm font-semibold text-cyan">Student Snapshot</p>
        <h2 className="mt-1 text-2xl font-semibold text-white">模拟学生学习快照</h2>
        <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-white/10 text-slate-400"><tr><th className="px-3 py-3">学生</th><th className="px-3 py-3">学习进度</th><th className="px-3 py-3">项目状态</th><th className="px-3 py-3">主要困难</th><th className="px-3 py-3">智能体使用</th></tr></thead><tbody>{students.map((student) => <tr key={student.id} className="border-b border-white/[.06] text-slate-200"><td className="px-3 py-3 font-semibold">{student.name}</td><td className="px-3 py-3"><span className="text-mint">{student.progress}%</span></td><td className="px-3 py-3">{student.projectStatus}</td><td className="px-3 py-3 text-slate-400">{student.difficulty}</td><td className="px-3 py-3 text-cyan">{student.agentUses} 次</td></tr>)}</tbody></table></div>
      </section>
    </div>
  );
}

function DiagnosisPanel({ difficulties }) {
  return <article className="rounded-2xl border border-amber/25 bg-amber/10 p-6 shadow-glow"><p className="text-sm font-semibold text-amber">Learning Diagnosis</p><h2 className="mt-1 text-2xl font-semibold text-white">学习困难诊断</h2><div className="mt-5 space-y-4">{difficulties.map((item) => <div key={item.name} className="rounded-xl border border-white/10 bg-ink/70 p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-white">{item.name}</h3><span className="text-sm text-amber">{item.count} 人</span></div><p className="mt-2 text-sm leading-7 text-slate-300">教学建议：{item.advice}</p></div>)}</div></article>;
}

function ProjectQuality({ summary }) {
  return <article className="rounded-2xl border border-mint/25 bg-mint/10 p-6 shadow-glow"><p className="text-sm font-semibold text-mint">Project Quality</p><h2 className="mt-1 text-2xl font-semibold text-white">项目质量分析</h2><div className="mt-5 grid grid-cols-3 gap-3"><Metric label="项目数量" value={`${summary.projects} 个`} tone="cyan" /><Metric label="优秀项目" value={`${summary.excellentProjects} 个`} tone="mint" /><Metric label="待修改" value={`${summary.revisionProjects} 个`} tone="amber" /></div><div className="mt-5 rounded-xl border border-white/10 bg-ink/70 p-4"><h3 className="font-semibold text-white">常见问题</h3><ul className="mt-3 space-y-2 text-sm leading-7 text-slate-300"><li>• 数据不足：建议先开展 20-30 条样本试采，明确字段与可得性。</li><li>• 方法不匹配：要求学生逐项对应“研究问题—数据字段—分析方法”。</li><li>• 研究问题过大：限定一个平台、一个对象、一段时间和 2-3 个 RQ。</li></ul></div></article>;
}

function TeacherAdvice({ summary }) {
  const focus = summary.difficulties[0]?.name || "数据分析困难";
  return <article className="rounded-2xl border border-cyan/25 bg-cyan/10 p-6 shadow-glow"><p className="text-sm font-semibold text-cyan">Teacher AI Advice</p><h2 className="mt-1 text-2xl font-semibold text-white">本周教学建议</h2><div className="mt-5 space-y-4 text-sm leading-7 text-slate-200"><div className="rounded-xl border border-white/10 bg-ink/70 p-4"><span className="font-semibold text-mint">推荐加强：</span>文本分析教学。围绕词频、情感分析和主题模型，用同一份评论数据演示“问题—方法—图表”的完整过程。</div><div className="rounded-xl border border-white/10 bg-ink/70 p-4"><span className="font-semibold text-mint">推荐实践：</span>舆情分析项目。让学生以公开评论为材料完成小样本清洗、主题归纳和情感变化图。</div><div className="rounded-xl border border-white/10 bg-ink/70 p-4"><span className="font-semibold text-mint">重点关注：</span>{focus}。建议使用 AI项目策划与 AI数据分析智能体开展一次分组工作坊，并要求提交字段表和试分析截图。</div></div></article>;
}

function Metric({ label, value, tone }) { const colors = { cyan: "text-cyan", mint: "text-mint", violet: "text-violet", amber: "text-amber" }; return <div className="rounded-xl border border-white/10 bg-ink/70 p-4"><p className="text-xs text-slate-400">{label}</p><p className={`mt-2 text-lg font-semibold ${colors[tone]}`}>{value}</p></div>; }
function NavigateButton({ label, text, onClick }) { return <button onClick={onClick} className="rounded-xl border border-white/10 bg-ink/70 p-4 text-left transition hover:-translate-y-0.5 hover:border-violet/50"><h3 className="font-semibold text-white">{label}</h3><p className="mt-2 text-xs leading-5 text-slate-400">{text}</p></button>; }

function buildSummary(students) {
  const count = students.length || 1;
  const averageProgress = Math.round(students.reduce((sum, item) => sum + item.progress, 0) / count);
  const projects = students.filter((item) => item.projectStatus !== "未开始").length;
  const excellentProjects = students.filter((item) => item.projectStatus === "优秀").length;
  const revisionProjects = students.filter((item) => item.projectStatus === "待修改").length;
  const difficultyData = ["项目设计困难", "方法选择困难", "数据分析困难"].map((name) => ({ name, count: students.filter((item) => item.difficulty === name).length, advice: adviceFor(name) })).sort((a, b) => b.count - a.count);
  return { count: students.length, averageProgress, chapterCompletion: averageProgress, projectCompletion: Math.round((projects / count) * 100), agentUses: students.reduce((sum, item) => sum + item.agentUses, 0), projects, excellentProjects, revisionProjects, difficulties: difficultyData, chapterProgress: [62, 54, 47, 39, 31] };
}

function adviceFor(difficulty) { return { "项目设计困难": "示范使用 AI项目策划智能体，要求学生把兴趣、平台、对象、数据和成果填入项目设计报告。", "方法选择困难": "安排“研究问题—数据类型—方法匹配”对照练习，并使用 AI数据分析智能体复核。", "数据分析困难": "以 20 条真实评论开展词频、情感、主题的逐步演示，降低进入门槛。" }[difficulty]; }

function loadClassData() { try { const saved = JSON.parse(window.localStorage.getItem(storageKey) || "null"); if (Array.isArray(saved) && saved.length) return saved; } catch { /* 使用默认模拟数据。 */ } const data = createDemoStudents(); try { window.localStorage.setItem(storageKey, JSON.stringify(data)); } catch { /* 仅当前会话展示。 */ } return data; }
function createDemoStudents() { const names = ["林若涵", "陈思远", "王子墨", "刘雨桐", "张启航", "李佳宁", "周明宇", "赵可心", "孙浩然", "吴思琪", "黄博文", "徐安然"]; const progress = [78, 64, 46, 82, 55, 71, 39, 88, 61, 52, 73, 44]; const difficulties = ["方法选择困难", "数据分析困难", "项目设计困难", "数据分析困难", "方法选择困难", "项目设计困难"]; return names.map((name, index) => ({ id: `student-${index + 1}`, name, progress: progress[index], projectStatus: index === 3 || index === 7 ? "优秀" : index === 2 || index === 6 || index === 11 ? "待修改" : index === 8 ? "未开始" : "进行中", difficulty: difficulties[index % difficulties.length], agentUses: 2 + ((index * 3) % 6) })); }
