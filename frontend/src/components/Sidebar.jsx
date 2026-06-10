import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

const navItems = [
  { to: "/", label: "วันนี้", icon: "☀️" },
  { to: "/board", label: "Board", icon: "⬜" },
  { to: "/team", label: "ทีม", icon: "👥" },
  { to: "/projects", label: "Projects", icon: "📁" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <nav style={{
      width: 220, minHeight: "100vh", background: "var(--surface)",
      borderRight: "1px solid var(--border)", display: "flex",
      flexDirection: "column", padding: "20px 12px", flexShrink: 0
    }}>
      {/* Logo */}
      <div style={{ padding: "4px 8px", marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.5px" }}>
          <span style={{ color: "var(--accent)" }}>Tell</span>ro
        </div>
      </div>

      {/* Nav */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        {navItems.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} end={to === "/"} style={({ isActive }) => ({
            display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
            borderRadius: "var(--radius)", textDecoration: "none", fontSize: 14, fontWeight: 500,
            color: isActive ? "var(--accent)" : "var(--text-2)",
            background: isActive ? "var(--accent-light)" : "transparent",
            transition: "all 0.1s",
          })}>
            <span>{icon}</span> {label}
          </NavLink>
        ))}
      </div>

      {/* User */}
      {user && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <div className="avatar" style={{ background: user.avatar_color }}>
            {user.display_name[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.display_name}</div>
            <button onClick={logout} style={{ fontSize: 11, color: "var(--text-3)", cursor: "pointer", background: "none", border: "none", padding: 0 }}>ออกจากระบบ</button>
          </div>
        </div>
      )}
    </nav>
  );
}
