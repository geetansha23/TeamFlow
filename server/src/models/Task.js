import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Task title is required"],
    trim: true,
    minlength: 3
  },
  description: {
    type: String,
    trim: true,
    default: ""
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium"
  },
  status: {
    type: String,
    enum: ["Todo", "In Progress", "Completed"],
    default: "Todo"
  },
  dueDate: {
    type: Date,
    required: [true, "Due date is required"]
  }
}, { timestamps: true });

export default mongoose.model("Task", taskSchema);
