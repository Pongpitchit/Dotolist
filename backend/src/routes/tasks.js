import { Router } from "express";
import { pool } from "../db/schema.js";
import { auth } from "../middleware/auth.js";

const router = Router();

// Get all tasks with user info (with optional date filter)
router.get("/", auth, async (req, res) => {
  const { today, project_id, assigned_to } = req.query;
  let where = [];
  let params = [];
  let i = 1;

  if (today === "1") {
    where.push(`(t.due_date = CURRENT_DATE OR t.status = 'in_progress')`);
  }
  if (project_id) {
    where.push(`t.project_id = $${i++}`);
    params.push(project_id);
  }
  if (assigned_to) {
    where.push(`t.assigned_to = $${i++}`);
    params.push(assigned_to);
  }

  const whereClause = where.length ? "WHERE " + where.join(" AND ") : "";

  const { rows } = await pool.query(`
    SELECT 
      t.*,
      u.display_name as assignee_name,
      u.avatar_color as assignee_color,
      p.name as project_name, p.color as project_color,
      cb.display_name as creator_name
    FROM tasks t
    LEFT JOIN users u ON t.assigned_to = u.id
    LEFT JOIN projects p ON t.project_id = p.id
    LEFT JOIN users cb ON t.created_by = cb.id
    ${whereClause}
    ORDER BY 
      CASE t.priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
      t.due_date ASC NULLS LAST,
      t.created_at DESC
  `, params);
  res.json(rows);
});

// Today's stats
router.get("/stats/today", auth, async (req, res) => {
  const { rows } = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE due_date = CURRENT_DATE) as total_today,
      COUNT(*) FILTER (WHERE due_date = CURRENT_DATE AND status = 'done') as done_today,
      COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
      COUNT(*) FILTER (WHERE status = 'todo') as todo,
      COUNT(*) FILTER (WHERE status = 'done') as total_done,
      COUNT(*) as total_all
    FROM tasks
  `);
  res.json(rows[0]);
});

// Who's working on what
router.get("/active-users", auth, async (req, res) => {
  const { rows } = await pool.query(`
    SELECT 
      u.id, u.display_name, u.avatar_color,
      json_agg(json_build_object(
        'id', t.id, 'title', t.title, 'status', t.status, 'priority', t.priority
      ) ORDER BY t.updated_at DESC) as tasks
    FROM users u
    JOIN tasks t ON t.assigned_to = u.id AND t.status != 'done'
    GROUP BY u.id, u.display_name, u.avatar_color
    ORDER BY u.display_name
  `);
  res.json(rows);
});

// Create task
router.post("/", auth, async (req, res) => {
  const { title, description, project_id, assigned_to, priority, due_date } = req.body;
  if (!title) return res.status(400).json({ error: "Title required" });
  const { rows } = await pool.query(`
    INSERT INTO tasks (title, description, project_id, assigned_to, created_by, priority, due_date)
    VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [title, description || null, project_id || null, assigned_to || null, req.user.id, priority || "medium", due_date || null]
  );
  await pool.query(
    "INSERT INTO task_activity (task_id, user_id, action) VALUES ($1,$2,$3)",
    [rows[0].id, req.user.id, "created task"]
  );
  res.json(rows[0]);
});

// Update task
router.patch("/:id", auth, async (req, res) => {
  const { title, description, status, priority, due_date, assigned_to, project_id } = req.body;
  const { id } = req.params;

  const fields = [];
  const vals = [];
  let n = 1;
  const addField = (name, val) => { if (val !== undefined) { fields.push(`${name}=$${n++}`); vals.push(val); } };

  addField("title", title);
  addField("description", description);
  addField("status", status);
  addField("priority", priority);
  addField("due_date", due_date);
  addField("assigned_to", assigned_to);
  addField("project_id", project_id);
  fields.push(`updated_at=NOW()`);

  if (!fields.length) return res.status(400).json({ error: "Nothing to update" });

  vals.push(id);
  const { rows } = await pool.query(
    `UPDATE tasks SET ${fields.join(",")} WHERE id=$${n} RETURNING *`,
    vals
  );

  if (status) {
    await pool.query(
      "INSERT INTO task_activity (task_id, user_id, action) VALUES ($1,$2,$3)",
      [id, req.user.id, `changed status to ${status}`]
    );
  }

  res.json(rows[0]);
});

// Delete task
router.delete("/:id", auth, async (req, res) => {
  await pool.query("DELETE FROM tasks WHERE id=$1", [req.params.id]);
  res.json({ ok: true });
});

export default router;
