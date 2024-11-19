const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const auth = require("../middlewares/auth");
const taskController = require("../controllers/taskController");
const rateLimit = require("express-rate-limit");

const taskLimiter = rateLimit({
  windowsMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

router.post("/", auth, taskLimiter, taskController.createTask);
router.get("/search", auth, taskController.searchTask);
router.patch("/:id", auth, taskController.updateTask);
router.delete("/:id", auth, taskController.deleteTask);
router.get("/:id", auth, taskController.getTask);
router.get("/", auth, taskController.getAllTasks);

module.exports = router;
