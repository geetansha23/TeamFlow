import express from "express";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, async (req, res, next) => {
  try {
    const { project, status } = req.query;
    const filter = {};

    if (project) filter.project = project;
    if (status) filter.status = status;

    if (req.user.role !== "admin") {
      filter.assignedTo = req.user._id;
    }

    const tasks = await Task.find(filter)
      .populate("project", "title")
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .sort({ dueDate: 1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

router.post("/", protect, adminOnly, async (req, res, next) => {
  try {
    const { title, description, project, assignedTo, dueDate, priority } = req.body;

    if (!title || !project || !assignedTo || !dueDate) {
      return res.status(400).json({ message: "Title, project, assignee and due date are required." });
    }

    const projectDoc = await Project.findById(project);
    if (!projectDoc) return res.status(404).json({ message: "Project not found." });

    const user = await User.findById(assignedTo);
    if (!user) return res.status(404).json({ message: "Assigned user not found." });

    if (!projectDoc.members.map(String).includes(String(assignedTo))) {
      return res.status(400).json({ message: "Assigned user must be a member of the project." });
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo,
      dueDate,
      priority,
      createdBy: req.user._id
    });

    const populated = await Task.findById(task._id)
      .populate("project", "title")
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role");

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", protect, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found." });

    const isAdmin = req.user.role === "admin";
    const isAssignee = String(task.assignedTo) === String(req.user._id);

    if (!isAdmin && !isAssignee) {
      return res.status(403).json({ message: "You can update only your assigned tasks." });
    }

    const allowedForMember = ["status"];
    const allowedForAdmin = ["title", "description", "assignedTo", "dueDate", "priority", "status"];

    const allowed = isAdmin ? allowedForAdmin : allowedForMember;
    for (const key of allowed) {
      if (req.body[key] !== undefined) task[key] = req.body[key];
    }

    await task.save();

    const populated = await Task.findById(task._id)
      .populate("project", "title")
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role");

    res.json(populated);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found." });

    await task.deleteOne();
    res.json({ message: "Task deleted." });
  } catch (error) {
    next(error);
  }
});

export default router;
