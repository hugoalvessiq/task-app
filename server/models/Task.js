const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    lowercase: true,
    maxlength: 30,
  },
  description: {
    type: String,
    default: "No description yet!",
    maxlength: 180,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

taskSchema.index({ title: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Task", taskSchema);
