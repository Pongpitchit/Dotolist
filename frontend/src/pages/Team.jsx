import { useState, useEffect } from "react";
import { api } from "../api.js";
import TaskCard from "../components/TaskCard.jsx";
import TaskModal from "../components/TaskModal.jsx";

const STATUS_LABEL = { todo: "To Do", in_progress: "กำลังทำ", review: "Review", done: "เสร็จแล้ว" };
const STATUS_COLOR = { todo: "#6b7280", in_progress: "#3b82f6", review: "#ca8a04", done: "#16a34a" };

export default function TeamPage() {
  const [activeUsers, setActiveUsers] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modal, setModal] = useState(null);

  const load = async () => {
    const [u, t] = await Promise.all([api.activeUsers(), api.tasks()]);
    setActiveUsers(u);
    setAllTasks(t);
  };

  useEffect(() => { load(); }, []);

  const userTasks = selectedUser ? allTasks.filter((t) => t.assigned_to === selectedUser.id) : [];

  return (
    <div style={{ padding: 28, display: "flex", gap: 24, height: "100vh", overflow: "hidden" }}>
      {/* Left: team overview */}
      <div style={{ width: 300, flexShrink: 0, overflowY: "auto" }}>
        <h1 style={{ fontWeight: 600, fontSize: 20, marginBottom: 20 }}>ทีม</h1>

        {activeUsers.length === 0 ? (
          <div style={{ color: "var(--text-3)", textAlign: "center", padding: 32 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>😴</div>
            ยังไม่มีงานที่กำลังดำเนินการ
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {activeUsers.map((u) => {
              const inProgress = u.tasks.filter((t) => t.status === "in_progress");
              const isSelected = selectedUser?.id === u.id;
              return (
                <div key={u.id} className="card"
                  style={{ cursor: "pointer", border: isSelected ? "1px solid var(--accent)" : "1px solid var(--border)", background: isSelected ? "var(--accent-light)" : "var(--surface)" }}
                  onClick={() => setSelectedUser(isSelected ? null : u)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div className="avatar" style={{ background: u.avatar_color, width: 36, height: 36, fontSize: 14 }}>
                      {u.display_name[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{u.display_name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-3)" }}>{u.tasks.length} งานที่ยังเปิดอยู่</div>
                    </div>
                  </div>
                  {/* Active task pill */}
                  {inProgress.length > 0 && (
                    <div style={{ background: "#eff6ff", borderRadius: "var(--radius)", padding: "6px 10px", fontSize: 12, color: "#3b82f6" }}>
                      🔄 {inProgress[0].title}
                      {inProgress.length > 1 && ` +${inProgress.length - 1} อื่นๆ`}
                    </div>
                  )}
                  {/* Status breakdown */}
                  <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                    {["todo", "in_progress", "review"].map((s) => {
                      const cnt = u.tasks.filter((t) => t.status === s).length;
                      if (!cnt) return null;
                      return (
                        <span key={s} style={{ fontSize: 11, color: STATUS_COLOR[s], background: `${STATUS_COLOR[s]}18`, padding: "2px 7px", borderRadius: "100px", fontWeight: 500 }}>
                          {STATUS_LABEL[s]} {cnt}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: selected user tasks */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {selectedUser ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div className="avatar" style={{ background: selectedUser.avatar_color, width: 40, height: 40, fontSize: 16 }}>
                {selectedUser.display_name[0].toUpperCase()}
              </div>
              <div>
                <h2 style={{ fontWeight: 600, fontSize: 18 }}>{selectedUser.display_name}</h2>
                <div style={{ fontSize: 13, color: "var(--text-2)" }}>{userTasks.length} งานทั้งหมด</div>
              </div>
            </div>

            {/* Progress */}
            {userTasks.length > 0 && (() => {
              const done = userTasks.filter((t) => t.status === "done").length;
              const pct = Math.round((done / userTasks.length) * 100);
              return (
                <div className="card" style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13 }}>ความคืบหน้า</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>{pct}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })()}

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {userTasks.map((t) => (
                <TaskCard key={t.id} task={t} onEdit={(t) => setModal(t)} onRefresh={load} />
              ))}
            </div>
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-3)" }}>
            ← เลือกคนในทีมเพื่อดูงาน
          </div>
        )}
      </div>

      {modal !== null && (
        <TaskModal task={modal} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />
      )}
    </div>
  );
}
