import { useState, useEffect } from "react";
import { api } from "../api.js";
import { useAuth } from "../hooks/useAuth.jsx";
import TaskCard from "../components/TaskCard.jsx";
import TaskModal from "../components/TaskModal.jsx";

export default function TodayPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [t, s] = await Promise.all([api.tasks({ today: 1 }), api.taskStats()]);
    setTasks(t);
    setStats(s);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const todayPct = stats ? (stats.total_today > 0 ? Math.round((stats.done_today / stats.total_today) * 100) : 0) : 0;
  const allPct = stats ? (stats.total_all > 0 ? Math.round((stats.total_done / stats.total_all) * 100) : 0) : 0;

  const today = new Date().toLocaleDateString("th-TH", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div style={{ padding: 32, maxWidth: 720, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 4 }}>{today}</div>
        <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.3px" }}>
          สวัสดี, {user?.display_name} 👋
        </h1>
      </div>

      {/* Stats cards */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 28 }}>
          <StatCard label="งานวันนี้" value={stats.total_today} sub={`เสร็จ ${stats.done_today} งาน`} accent />
          <StatCard label="กำลังทำ" value={stats.in_progress} sub="งานที่กำลังดำเนินการ" />
          <StatCard label="ทั้งหมด" value={`${allPct}%`} sub={`เสร็จ ${stats.total_done}/${stats.total_all}`} />
        </div>
      )}

      {/* Today progress */}
      {stats && stats.total_today > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>ความคืบหน้าวันนี้</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>{todayPct}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${todayPct}%`, background: todayPct === 100 ? "var(--success)" : "var(--accent)" }} />
          </div>
          {todayPct === 100 && (
            <div style={{ fontSize: 12, color: "var(--success)", marginTop: 8, textAlign: "center" }}>🎉 เสร็จหมดทุกงานวันนี้แล้ว!</div>
          )}
        </div>
      )}

      {/* Add task */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontWeight: 600, fontSize: 15 }}>งานวันนี้ & ที่กำลังทำ</h2>
        <button className="btn btn-primary" onClick={() => setModal({})}>+ เพิ่มงาน</button>
      </div>

      {/* Task list */}
      {loading ? (
        <div style={{ color: "var(--text-3)", textAlign: "center", padding: 40 }}>กำลังโหลด...</div>
      ) : tasks.length === 0 ? (
        <div style={{ textAlign: "center", padding: 48, color: "var(--text-3)" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🌤️</div>
          <div>ยังไม่มีงานวันนี้</div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setModal({})}>+ เพิ่มงานแรก</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tasks.map((t) => (
            <TaskCard key={t.id} task={t} onEdit={(t) => setModal(t)} onRefresh={load} />
          ))}
        </div>
      )}

      {modal !== null && (
        <TaskModal
          task={modal.id ? modal : null}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="card" style={{ padding: "14px 16px" }}>
      <div style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 600, color: accent ? "var(--accent)" : "var(--text)", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 4 }}>{sub}</div>
    </div>
  );
}
