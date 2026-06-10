import { Router } from "express";
import { pool } from "../db/schema.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.get("/", auth, async (req, res) => {
  const { rows } = await pool.query(`
    SELECT p.*, 
      COUNT(t.id) as task_count,
      COUNT(t.id) FILTER (WHERE t.status='done') as done_count,
      u.display_name as creator_name
    FROM projects p
    LEFT JOIN tasks t ON t.project_id = p.id
    LEFT JOIN users u ON p.created_by = u.id
    GROUP BY p.id, u.display_name
    ORDER BY p.created_at DESC
  `);
  res.json(rows);
});

router.post("/", auth, async (req, res) => {
  const { name, color } = req.body;
  if (!name) return res.status(400).json({ error: "Name required" });
  const { rows } = await pool.query(
    "INSERT INTO projects (name, color, created_by) VALUES ($1,$2,$3) RETURNING *",
    [name, color || "#6366f1", req.user.id]
  );
  res.json(rows[0]);
});

router.delete("/:id", auth, async (req, res) => {
  await pool.query("DELETE FROM projects WHERE id=$1", [req.params.id]);
  res.json({ ok: true });
});

export default router;
