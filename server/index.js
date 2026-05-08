import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./src/config/db.js";
import authRoutes from "./src/routes/auth.routes.js";
import projectRoutes from "./src/routes/project.routes.js";
import taskRoutes from "./src/routes/task.routes.js";
import dashboardRoutes from "./src/routes/dashboard.routes.js";


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";
app.use(cors({
  origin: process.env.NODE_ENV === "production" ? true : allowedOrigin,
  credentials: true
}));

app.get("/api/health", (req, res) => {
  res.json({ message: "Team Task Manager API is running 🚀" });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);

if (process.env.NODE_ENV === "production") {
  const clientDistPath = path.join(__dirname, "../client/dist");
  app.use(express.static(clientDistPath));
  app.get("/*splat", (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
