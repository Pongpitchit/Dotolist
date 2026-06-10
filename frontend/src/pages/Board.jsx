import { useState, useEffect } from "react";
import { api } from "../api.js";
import TaskCard from "../components/TaskCard.jsx";
import TaskModal from "../components/TaskModal.jsx";

const COLUMNS = [
  { key: "todo", label: "📋 To Do", color: "#6b7280" },
  { key: "in_progress", label: "🔄 กำลังทำ", color: "#3b82f6" },
  { key: "review", label: "🔍 Review", color: "#ca8a04" },
  { key: "done", label: "✅ เสร็จแล้ว", color: "#16a34a" },
];

export default function BoardPage() {
  const [tasks, setTasks] = useState([]);
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState("");

  const load = () => api.tasks().then(setTasks);
  useEffect(() => { load(); }, []);

  const filtered = filter ? tasks.filter((t) => t.assigned_to === Number(filter)) : tasks;
  const byStatus = (s) => filtered.filter((t) => t.status === s);

  return (
    <div style={{ padding: 28, height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexShrink: 0 }}>
        <h1 style={{ fontWeight: 600, fontSize: 20 }}>Board</h1>
        <button className="btn btn-primary" onClick={() => setModal({})}>+ เพิ่มงาน</button>
      </div>

      {/* Kanban columns */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, flex: 1, overflow: "hidden" }}>
        {COLUMNS.map((col) => {
          const colTasks = byStatus(col.key);
          return (
            <div key={col.key} style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexShrink: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: col.color }}>{col.label}</span>
                <span style={{ fontSize: 12, color: "var(--text-3)", background: "var(--border)", padding: "1px 7px", borderRadius: "100px" }}>
                  {colTasks.length}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, overflowY: "auto", flex: 1, paddingBottom: 8 }}>
                {colTasks.map((t) => (
                  <TaskCard key={t.id} task={t} onEdit={(t) => setModal(t)} onRefresh={load} />
                ))}
                <button
                  onClick={() => setModal({ status: col.key })}
                  style={{ padding: "8px", borderRadius: "var(--radius)", border: "1px dashed var(--border)", color: "var(--text-3)", fontSize: 13, cursor: "pointer", background: "transparent" }}>
                  + เพิ่มงาน
                </button>
              </div>
            </div>
          );
        })}
      </div>

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
