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
  ["lab", "智能分析实验室"],
  ["about", "关于课程"]
];

export default function Navbar({ active, onNavigate }) {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-cyan/15 bg-ink/88 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <button onClick={() => onNavigate("home")} className="text-left">
          <div className="text-sm font-semibold text-cyan">计算传播学</div>
          <div className="text-xs text-slate-400">Graph Learning</div>
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
