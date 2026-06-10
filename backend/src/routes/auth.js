import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db/schema.js";
import { auth } from "../middleware/auth.js";

const router = Router();

const COLORS = ["#6366f1","#ec4899","#f59e0b","#10b981","#3b82f6","#8b5cf6","#ef4444","#14b8a6"];

// Register
router.post("/register", async (req, res) => {
  const { username, password, display_name } = req.body;
  if (!username || !password || !display_name)
    return res.status(400).json({ error: "All fields required" });
  try {
    const hash = await bcrypt.hash(password, 10);
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const { rows } = await pool.query(
      "INSERT INTO users (username, password_hash, display_name, avatar_color) VALUES ($1,$2,$3,$4) RETURNING id, username, display_name, avatar_color",
      [username.toLowerCase(), hash, display_name, color]
    );
    const token = jwt.sign({ id: rows[0].id, username: rows[0].username }, process.env.JWT_SECRET, { expiresIn: "30d" });
    res.json({ token, user: rows[0] });
  } catch (e) {
    if (e.code === "23505") return res.status(400).json({ error: "Username already taken" });
    res.status(500).json({ error: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE username=$1", [username.toLowerCase()]);
    if (!rows.length) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, rows[0].password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: rows[0].id, username: rows[0].username }, process.env.JWT_SECRET, { expiresIn: "30d" });
    const { password_hash, ...user } = rows[0];
    res.json({ token, user });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// Get current user
router.get("/me", auth, async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, username, display_name, avatar_color FROM users WHERE id=$1",
    [req.user.id]
  );
  res.json(rows[0]);
});

// List all users
router.get("/users", auth, async (req, res) => {
  const { rows } = await pool.query(
    "SELECT id, username, display_name, avatar_color FROM users ORDER BY display_name"
  );
  res.json(rows);
});

export default router;
