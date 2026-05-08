import express from "express";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/stats", protect, async (req, res, next) => {
  try {
    const now = new Date();
    const taskFilter = req.user.role === "admin" ? {} : { assignedTo: req.user._id };
    const projectFilter = req.user.role === "admin" ? {} : { members: req.user._id };

    const [totalTasks, todo, inProgress, completed, overdue, totalProjects] = await Promise.all([
      Task.countDocuments(taskFilter),
      Task.countDocuments({ ...taskFilter, status: "Todo" }),
      Task.countDocuments({ ...taskFilter, status: "In Progress" }),
      Task.countDocuments({ ...taskFilter, status: "Completed" }),
      Task.countDocuments({ ...taskFilter, status: { $ne: "Completed" }, dueDate: { $lt: now } }),
      Project.countDocuments(projectFilter)
    ]);

    res.json({
      totalProjects,
      totalTasks,
      todo,
      inProgress,
      completed,
      overdue,
      completionRate: totalTasks ? Math.round((completed / totalTasks) * 100) : 0
    });
  } catch (error) {
    next(error);
  }
});

export default router;
