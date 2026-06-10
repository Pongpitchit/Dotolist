import { api } from "../api.js";

const STATUS_LABELS = {
  todo: { label: "To Do", cls: "badge-todo" },
  in_progress: { label: "กำลังทำ", cls: "badge-in_progress" },
  review: { label: "Review", cls: "badge-review" },
  done: { label: "เสร็จแล้ว", cls: "badge-done" },
};

const PRIORITY_ICON = { high: "🔴", medium: "🟡", low: "⚪" };

export default function TaskCard({ task, onEdit, onRefresh }) {
  const s = STATUS_LABELS[task.status] || STATUS_LABELS.todo;

  const cycleStatus = async () => {
    const order = ["todo", "in_progress", "review", "done"];
    const next = order[(order.indexOf(task.status) + 1) % order.length];
    await api.updateTask(task.id, { status: next });
    onRefresh();
  };

  const del = async (e) => {
    e.stopPropagation();
    if (!confirm("ลบงานนี้?")) return;
    await api.deleteTask(task.id);
    onRefresh();
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "done";

  return (
    <div className="card" style={{ padding: "12px 14px", cursor: "pointer", transition: "box-shadow 0.15s", border: task.status === "done" ? "1px solid #e5e5e3" : "1px solid var(--border)" }}
      onClick={() => onEdit(task)}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = "var(--shadow-lg)"}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = "var(--shadow)"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 12 }}>{PRIORITY_ICON[task.priority]}</span>
            <span style={{ fontWeight: 500, fontSize: 14, color: task.status === "done" ? "var(--text-3)" : "var(--text)", textDecoration: task.status === "done" ? "line-through" : "none" }}>
              {task.title}
            </span>
          </div>
          {task.description && (
            <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {task.description}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span className={`badge ${s.cls}`}>{s.label}</span>
            {task.project_name && (
              <span style={{ fontSize: 11, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 3 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: task.project_color || "#6366f1", display: "inline-block" }} />
                {task.project_name}
              </span>
            )}
            {task.due_date && (
              <span style={{ fontSize: 11, color: isOverdue ? "var(--danger)" : "var(--text-3)" }}>
                {isOverdue ? "⚠️ " : "📅 "}
                {new Date(task.due_date).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {task.assignee_name && (
            <div className="avatar" style={{ background: task.assignee_color || "#6366f1" }} title={task.assignee_name}>
              {task.assignee_name[0].toUpperCase()}
            </div>
          )}
          <button className="btn btn-ghost" style={{ padding: "4px 6px", fontSize: 12 }}
            onClick={(e) => { e.stopPropagation(); cycleStatus(); }} title="เปลี่ยนสถานะ">
            →
          </button>
          <button className="btn btn-danger" style={{ padding: "4px 6px", fontSize: 12 }} onClick={del}>✕</button>
        </div>
      </div>
    </div>
  );
}
