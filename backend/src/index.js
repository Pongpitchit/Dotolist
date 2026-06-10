import express from "express";
import cors from "cors";
import { initDB } from "./db/schema.js";
import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js";
import projectRoutes from "./routes/projects.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);

app.get("/api/health", (_, res) => res.json({ ok: true }));

async function start() {
  // Wait for DB to be ready
  let retries = 10;
  while (retries > 0) {
    try {
      await initDB();
      break;
    } catch (e) {
      retries--;
      console.log(`DB not ready, retrying... (${retries} left)`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Tellro API running on port ${PORT}`);
  });
}

start();
