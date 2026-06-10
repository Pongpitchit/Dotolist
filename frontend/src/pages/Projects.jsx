import { useState, useEffect } from "react";
import { api } from "../api.js";
import TaskCard from "../components/TaskCard.jsx";
import TaskModal from "../components/TaskModal.jsx";

const PROJECT_COLORS = ["#6366f1","#ec4899","#f59e0b","#10b981","#3b82f6","#8b5cf6","#ef4444","#14b8a6"];

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(null);
  const [newProj, setNewProj] = useState({ name: "", color: PROJECT_COLORS[0] });
  const [adding, setAdding] = useState(false);

  const load = async () => {
    const [p, t] = await Promise.all([api.projects(), api.tasks()]);
    setProjects(p);
    setTasks(t);
  };

  useEffect(() => { load(); }, []);

  const createProject = async (e) => {
    e.preventDefault();
    if (!newProj.name) return;
    await api.createProject(newProj);
    setNewProj({ name: "", color: PROJECT_COLORS[0] });
    setAdding(false);
    load();
  };

  const projTasks = selected ? tasks.filter((t) => t.project_id === selected.id) : [];
  const pct = (p) => p.task_count > 0 ? Math.round((p.done_count / p.task_count) * 100) : 0;

  return (
    <div style={{ padding: 28, display: "flex", gap: 24, height: "100vh", overflow: "hidden" }}>
      {/* Left */}
      <div style={{ width: 280, flexShrink: 0, overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontWeight: 600, fontSize: 20 }}>Projects</h1>
          <button className="btn btn-primary" style={{ padding: "6px 12px", fontSize: 13 }} onClick={() => setAdding(!adding)}>+ ใหม่</button>
        </div>

        {adding && (
          <form onSubmit={createProject} className="card" style={{ marginBottom: 12, padding: 14 }}>
            <input value={newProj.name} onChange={(e) => setNewProj((f) => ({ ...f, name: e.target.value }))}
              placeholder="ชื่อ project..." autoFocus style={{ marginBottom: 8 }} />
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              {PROJECT_COLORS.map((c) => (
                <button type="button" key={c} onClick={() => setNewProj((f) => ({ ...f, color: c }))}
                  style={{ width: 20, height: 20, borderRadius: "50%", background: c, border: newProj.color === c ? "2px solid var(--text)" : "2px solid transparent", cursor: "pointer" }} />
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: "center", fontSize: 13 }}>สร้าง</button>
              <button type="button" className="btn btn-ghost" onClick={() => setAdding(false)}>ยกเลิก</button>
            </div>
          </form>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {projects.map((p) => {
            const percent = pct(p);
            const isSelected = selected?.id === p.id;
            return (
              <div key={p.id} className="card"
                style={{ cursor: "pointer", border: isSelected ? "1px solid var(--accent)" : "1px solid var(--border)", background: isSelected ? "var(--accent-light)" : "var(--surface)" }}
                onClick={() => setSelected(isSelected ? null : p)}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
                  <span style={{ fontWeight: 500, fontSize: 14, flex: 1 }}>{p.name}</span>
                  <span style={{ fontSize: 12, color: "var(--text-3)" }}>{p.task_count}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${percent}%`, background: p.color }} />
                </div>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>เสร็จ {p.done_count}/{p.task_count} ({percent}%)</div>
              </div>
            );
          })}
          {projects.length === 0 && (
            <div style={{ color: "var(--text-3)", textAlign: "center", padding: 32 }}>ยังไม่มี project</div>
          )}
        </div>
      </div>

      {/* Right */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {selected ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: selected.color }} />
              <h2 style={{ fontWeight: 600, fontSize: 18 }}>{selected.name}</h2>
              <span style={{ fontSize: 13, color: "var(--text-2)" }}>{projTasks.length} งาน</span>
              <button className="btn btn-primary" style={{ marginLeft: "auto", fontSize: 13 }} onClick={() => setModal({ project_id: selected.id })}>+ เพิ่มงาน</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {projTasks.map((t) => (
                <TaskCard key={t.id} task={t} onEdit={(t) => setModal(t)} onRefresh={load} />
              ))}
              {projTasks.length === 0 && (
                <div style={{ textAlign: "center", padding: 48, color: "var(--text-3)" }}>
                  ยังไม่มีงานใน project นี้
                  <br /><button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => setModal({ project_id: selected.id })}>+ เพิ่มงานแรก</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-3)" }}>
            ← เลือก project เพื่อดูงาน
          </div>
        )}
      </div>

      {modal !== null && (
        <TaskModal
          task={modal.id ? modal : null}
          defaultProjectId={modal.project_id || null}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
