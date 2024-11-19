const User = require("../models/User");
const Task = require("../models/Task");
const validator = require("validator");
const logger = require("../middlewares/logger");

const createTask = async (req, res) => {
  let { title, description } = req.body;

  if (!title) {
    return res.status(400).send({ message: "Task title is required!" });
  }

  if (!description) {
    description = "No description yet!";
  }

  const normalizedTile = validator.trim(title).toLowerCase();
  description = validator.trim(description);

  if (!validator.isLength(title, { min: 1, max: 30 })) {
    return res
      .status(400)
      .send({ message: "Title must be between 1 and 30 characters." });
  }

  if (!validator.isLength(description, { min: 1, max: 180 })) {
    return res
      .status(400)
      .send({ message: "Description must be between 1 and 180 characters." });
  }

  if (!validator.isLength(description, { max: 180 })) {
    return res.status(400).send({ message: "Description too long!" });
  }

  if (title.length > 30) {
    return res.status(400).send({ message: "Title very long!" });
  }

  const existingTask = await Task.findOne({
    user: req.user._id,
    title: normalizedTile,
  });

  if (existingTask) {
    return res
      .status(400)
      .send({ message: "Task with this title already exists!" });
  }

  const task = new Task({
    ...req.body,
    title: normalizedTile,
    description: description,
    user: req.user._id,
  });

  try {
    // Save the Task
    await task.save();

    // Adds the task to the user's task array
    const user = await User.findById(req.user._id.toString());
    if (user) {
      user.tasks.push(task._id);
      await user.save();
    }

    logger.info(`User ${req.user._id} created a task with ID: ${task._id}`);
    res.status(201).send(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(400).send(error);
  }
};

const updateTask = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["title", "description", "completed"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Updates inválidos" });
  }

  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).send({ error: "Task ID non-existent!" });
    }

    let title = req.body.title ? validator.trim(req.body.title) : task.title;
    let description = req.body.description
      ? validator.trim(req.body.description)
      : "no description";

    if (req.body.title && !validator.isLength(title, { min: 1, max: 30 })) {
      return res
        .status(400)
        .send({ message: "Title must be between 1 and 30 characters." });
    }

    if (
      req.body.description &&
      !validator.isLength(description, { min: 1, max: 180 })
    ) {
      return res
        .status(400)
        .send({ message: "Description must be between 1 and 180 characters." });
    }

    if (req.body.title) {
      const normalizedTile = validator.trim(req.body.title).toLowerCase();
      const existingTask = await Task.findOne({
        title: normalizedTile,
        completed: req.body.completed,
        description: req.body.description,
        user: req.user._id,
      });

      // Check if there have been changes
      const hasUpdates = updates.some(
        (update) => task[update] !== req.body[update]
      );
      if (!hasUpdates) {
        return res.status(200).send(task); // Task without changes
      }
      if (req.body.title && existingTask && req.body.description) {
        // Check if existingTask exists at all
        return res
          .status(400)
          .send({ error: "Task with this title already exists!" });
      }
      task.title = normalizedTile;
    }

    updates.forEach((update) => {
      if (update !== "title" || update !== "description")
        task[update] = req.body[update];
    });

    if (!task.description) {
      task.description = "No description yet!";
    }

    await task.save();
    res.send(task);
  } catch (error) {
    res.status(400).send({ error: "Task with this title already exists!" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).send({ error: "Task ID not found!" });
    }

    // Remove task ID from user's task list
    const user = await User.findById(req.user._id);
    if (user) {
      user.tasks = user.tasks.filter(
        (taskId) => taskId.toString() !== task._id.toString()
      );

      await user.save();
    }

    res.send({ message: `Task ${task._id} deleted successfully!` });
  } catch (error) {
    res.status(500).send();
  }
};

const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res
        .status(404)
        .send({ error: "Could not find task with that ID!" });
    }

    res.send(task);
  } catch (error) {
    res.status(500).send();
  }
};

// Fetch all tasks of the logged in user
const getAllTasks = async (req, res) => {
  const tasks = await Task.find({ user: req.user._id });
  res.send(tasks);
};

const searchTask = async (req, res) => {
  const { title, completed } = req.query;

  try {
    let searchCriteria = { user: req.user._id };

    if (title) {
      searchCriteria.title = new RegExp(title, "i"); // Search for substring in title
    }

    if (completed !== undefined) {
      searchCriteria.completed = completed === "true";
    }

    // Database search with limit for title suggestions
    const tasks = await Task.find(searchCriteria).limit(25);

    if (tasks.length === 0) {
      return res
        .status(404)
        .send({ message: "No tasks found with that title." });
    }

    res.send(tasks);
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error searching tasks.", error: error.message });
  }
};

module.exports = {
  createTask,
  updateTask,
  deleteTask,
  getTask,
  searchTask,
  getAllTasks,
};
