import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth.jsx";
import Sidebar from "./components/Sidebar.jsx";
import LoginPage from "./pages/Login.jsx";
import TodayPage from "./pages/Today.jsx";
import BoardPage from "./pages/Board.jsx";
import TeamPage from "./pages/Team.jsx";
import ProjectsPage from "./pages/Projects.jsx";
import "./index.css";

function Layout() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "var(--text-3)" }}>
      กำลังโหลด...
    </div>
  );

  if (!user) return <LoginPage />;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: "auto" }}>
        <Routes>
          <Route path="/" element={<TodayPage />} />
          <Route path="/board" element={<BoardPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  );
}
