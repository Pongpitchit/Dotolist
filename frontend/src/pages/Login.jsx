import { useState } from "react";
import { useAuth } from "../hooks/useAuth.jsx";

export default function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", password: "", display_name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.username, form.password);
      } else {
        if (!form.display_name) return setError("กรุณาใส่ชื่อที่ใช้แสดง");
        await register(form.username, form.password, form.display_name);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ width: 360 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.5px", color: "var(--text)" }}>
            <span style={{ color: "var(--accent)" }}>Tell</span>ro
          </div>
          <div style={{ color: "var(--text-2)", fontSize: 13, marginTop: 4 }}>Team Task Tracker</div>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "register" && (
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-2)", marginBottom: 6 }}>ชื่อที่ใช้แสดง</label>
                <input placeholder="เช่น อาม สมชาย" value={form.display_name} onChange={set("display_name")} required />
              </div>
            )}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-2)", marginBottom: 6 }}>Username</label>
              <input placeholder="username" value={form.username} onChange={set("username")} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-2)", marginBottom: 6 }}>Password</label>
              <input type="password" placeholder="••••••••" value={form.password} onChange={set("password")} required />
            </div>

            {error && <div style={{ color: "var(--danger)", fontSize: 13, padding: "8px 12px", background: "#fef2f2", borderRadius: "var(--radius)" }}>{error}</div>}

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>
              {loading ? "กำลังโหลด..." : mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--text-2)" }}>
            {mode === "login" ? (
              <>ยังไม่มีบัญชี? <button onClick={() => setMode("register")} style={{ color: "var(--accent)", fontWeight: 500, cursor: "pointer", background: "none", border: "none" }}>สมัครสมาชิก</button></>
            ) : (
              <>มีบัญชีแล้ว? <button onClick={() => setMode("login")} style={{ color: "var(--accent)", fontWeight: 500, cursor: "pointer", background: "none", border: "none" }}>เข้าสู่ระบบ</button></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
