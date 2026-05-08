import express from "express";
import Project from "../models/Project.js";
import User from "../models/User.js";
import Task from "../models/Task.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, async (req, res, next) => {
  try {
    const filter = req.user.role === "admin"
      ? {}
      : { members: req.user._id };

    const projects = await Project.find(filter)
      .populate("owner", "name email role")
      .populate("members", "name email role")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    next(error);
  }
});

router.post("/", protect, adminOnly, async (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title || title.trim().length < 3) {
      return res.status(400).json({ message: "Project title must be at least 3 characters." });
    }

    const project = await Project.create({
      title,
      description,
      owner: req.user._id,
      members: [req.user._id]
    });

    const populated = await project.populate("owner members", "name email role");
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/members", protect, adminOnly, async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Member email is required." });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found." });

    const user = await User.findOne({ email: email.toLowerCase() }).select("-password");
    if (!user) return res.status(404).json({ message: "No user found with this email." });

    if (!project.members.map(String).includes(String(user._id))) {
      project.members.push(user._id);
      await project.save();
    }

    const populated = await Project.findById(project._id)
      .populate("owner", "name email role")
      .populate("members", "name email role");

    res.json(populated);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found." });

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ message: "Project and its tasks deleted." });
  } catch (error) {
    next(error);
  }
});

export default router;
