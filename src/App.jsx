import { useEffect, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Home from "./components/Home.jsx";
import KnowledgeGraph from "./components/KnowledgeGraph.jsx";
import ProblemGraph from "./components/ProblemGraph.jsx";
import AbilityGraph from "./components/AbilityGraph.jsx";
import JobGraph from "./components/JobGraph.jsx";
import MethodToolkit from "./components/MethodToolkit.jsx";
import Projects from "./components/Projects.jsx";
import Resources from "./components/Resources.jsx";
import CourseAgents from "./components/CourseAgents.jsx";
import AIWorkflow from "./components/AIWorkflow.jsx";
import LearningProfile from "./components/LearningProfile.jsx";
import TeacherDashboard from "./components/TeacherDashboard.jsx";
import AICollaborationLog from "./components/AICollaborationLog.jsx";
import AnalysisLab from "./components/AnalysisLab.jsx";
import StudentProjects from "./components/StudentProjects.jsx";
import About from "./components/About.jsx";
import Footer from "./components/Footer.jsx";

const pages = {
  home: Home,
  knowledge: KnowledgeGraph,
  problem: ProblemGraph,
  ability: AbilityGraph,
  job: JobGraph,
  methods: MethodToolkit,
  projects: Projects,
  resources: Resources,
  agents: CourseAgents,
  workflow: AIWorkflow,
  learningProfile: LearningProfile,
  teacherDashboard: TeacherDashboard,
  aiCollaboration: AICollaborationLog,
  lab: AnalysisLab,
  studentProjects: StudentProjects,
  about: About
};

export default function App() {
  const [page, setPage] = useState(() => {
    try {
      const savedPage = window.localStorage.getItem("currentPage");
      return savedPage && pages[savedPage] ? savedPage : "home";
    } catch {
      return "home";
    }
  });
  const Page = pages[page];

  useEffect(() => {
    try {
      window.localStorage.setItem("currentPage", page);
    } catch {
      // localStorage 不可用时仍保留当前会话导航状态。
    }
  }, [page]);

  return (
    <div className="min-h-screen graph-grid">
      <Navbar active={page} onNavigate={setPage} />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <Page onNavigate={setPage} />
      </main>
      <Footer />
    </div>
  );
}
