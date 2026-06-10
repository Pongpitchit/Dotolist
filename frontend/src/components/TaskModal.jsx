import { useState, useEffect } from "react";
import { api } from "../api.js";

const STATUS_OPTS = [
  { value: "todo", label: "📋 To Do" },
  { value: "in_progress", label: "🔄 กำลังทำ" },
  { value: "review", label: "🔍 Review" },
  { value: "done", label: "✅ เสร็จแล้ว" },
];
const PRIORITY_OPTS = [
  { value: "high", label: "🔴 สูง" },
  { value: "medium", label: "🟡 กลาง" },
  { value: "low", label: "⚪ ต่ำ" },
];

export default function TaskModal({ task, onClose, onSave, defaultProjectId }) {
  const [form, setForm] = useState({
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || "todo",
    priority: task?.priority || "medium",
    due_date: task?.due_date ? task.due_date.slice(0, 10) : "",
    assigned_to: task?.assigned_to || "",
    project_id: task?.project_id || defaultProjectId || "",
  });
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.users().then(setUsers);
    api.projects().then(setProjects);
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError("กรุณาใส่ชื่องาน");
    setSaving(true);
    try {
      const payload = {
        ...form,
        assigned_to: form.assigned_to ? Number(form.assigned_to) : null,
        project_id: form.project_id ? Number(form.project_id) : null,
        due_date: form.due_date || null,
      };
      if (task) {
        await api.updateTask(task.id, payload);
      } else {
        await api.createTask(payload);
      }
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16
    }} onClick={onClose}>
      <div className="card" style={{ width: 480, maxWidth: "100%", padding: 24, maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontWeight: 600, fontSize: 16 }}>{task ? "แก้ไขงาน" : "สร้างงานใหม่"}</h3>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>ชื่องาน *</label>
            <input value={form.title} onChange={set("title")} placeholder="ชื่องาน..." autoFocus />
          </div>
          <div>
            <label style={labelStyle}>รายละเอียด</label>
            <textarea value={form.description} onChange={set("description")} placeholder="รายละเอียดเพิ่มเติม..." rows={2} style={{ resize: "vertical" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>สถานะ</label>
              <select value={form.status} onChange={set("status")}>
                {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>ความสำคัญ</label>
              <select value={form.priority} onChange={set("priority")}>
                {PRIORITY_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>มอบหมายให้</label>
              <select value={form.assigned_to} onChange={set("assigned_to")}>
                <option value="">— ไม่ระบุ —</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.display_name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>วันครบกำหนด</label>
              <input type="date" value={form.due_date} onChange={set("due_date")} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Project</label>
            <select value={form.project_id} onChange={set("project_id")}>
              <option value="">— ไม่ระบุ —</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {error && <div style={{ color: "var(--danger)", fontSize: 13 }}>{error}</div>}

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>ยกเลิก</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "กำลังบันทึก..." : task ? "บันทึก" : "สร้างงาน"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-2)", marginBottom: 6 };
