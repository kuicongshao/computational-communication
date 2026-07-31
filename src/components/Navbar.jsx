import BrandLogo from "./BrandLogo.jsx";

const navItems = [
  ["home", "首页"],
  ["knowledge", "知识图谱"],
  ["problem", "问题图谱"],
  ["ability", "能力图谱"],
  ["job", "岗位能力图谱"],
  ["methods", "方法工具箱"],
  ["projects", "项目实战"],
  ["studentProjects", "学生项目"],
  ["resources", "资源"],
  ["agents", "课程智能体"],
  ["workflow", "AI工作流"],
  ["learningProfile", "AI学习档案"],
  ["aiCollaboration", "AI协同日志"],
  ["teacherDashboard", "教师驾驶舱"],
  ["lab", "智能分析实验室"],
  ["about", "关于课程"]
];

export default function Navbar({ active, onNavigate }) {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-cyan/15 bg-ink/88 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-8">
        <button onClick={() => onNavigate("home")} className="flex min-w-0 items-center gap-2.5 text-left">
          <BrandLogo className="h-10 w-10 sm:h-12 sm:w-12" alt="知行智链品牌标识" />
          <div className="min-w-0">
            <div className="truncate text-base font-bold text-cyan">知行智链</div>
            <div className="truncate text-xs font-medium text-slate-300">AI教育智能体平台</div>
          </div>
        </button>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-soft">
          {navItems.map(([id, label]) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`shrink-0 rounded-full border px-3 py-2 text-sm transition ${
                active === id
                  ? "border-cyan bg-cyan/15 text-cyan shadow-glow"
                  : "border-white/10 bg-white/5 text-slate-300 hover:border-cyan/60 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}
