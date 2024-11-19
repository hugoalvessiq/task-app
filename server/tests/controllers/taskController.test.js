const request = require("supertest");
const app = require("../../server");
const User = require("../../models/User");
const Task = require("../../models/Task");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

describe("Task Routes - Update Task", () => {
  let userId;
  let token;
  let taskId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST, {
      useNewUrlParser: true,
    });

    const hashedPassword = await bcrypt.hash("password123", 10);

    // Create a user for authentication testing
    const user = await new User({
      name: "Test User",
      email: "testuser@example.com",
      password: hashedPassword,
    }).save();

    userId = user._id;
    token = jwt.sign({ _id: userId }, process.env.SECRET_KEY, {
      expiresIn: "7d",
    });

    await request(app)
      .post("/users/login")
      .send({ email: "testuser@example.com", password: "password123" });

    // Criar uma tarefa de teste para o usuário
    const task = await Task.create({
      title: "Initial Task",
      description: "Inicital task description",
      user: userId,
    });
    taskId = task._id;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Task.deleteMany({});

    await mongoose.connection.close();
  });

  // ######################## Create Tasks #######################

  it("should create a new task successfully", async () => {
    const taskData = {
      title: "Test Task",
      description: "This is a test task description",
      user: userId,
    };

    const res = await request(app)
      .post("/tasks")
      .set("Cookie", `auth_token=${token}`)
      .send(taskData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body).toHaveProperty("title", taskData.title.toLowerCase());
    expect(res.body).toHaveProperty("description", taskData.description);
    expect(res.body).toHaveProperty("user", userId.toString());
  });

  it("should not create a task without a title", async () => {
    const taskData = {
      title: "",
      description: "Valid description",
      user: userId,
    };

    const res = await request(app)
      .post("/tasks")
      .set("Cookie", `auth_token=${token}`)
      .send(taskData);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message", "Task title is required!");
  });

  it("should not create a task with a title that already exists for the user", async () => {
    const taskData = {
      title: "Test Task",
      description: "Another description",
      user: userId,
    };

    const res = await request(app)
      .post("/tasks")
      .set("Cookie", `auth_token=${token}`)
      .send(taskData);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty(
      "message",
      "Task with this title already exists!"
    );
  });

  it("should not create a task with an invalid title length ", async () => {
    const taskData = {
      title: "a".repeat(31),
      description: "Valid description",
      user: userId,
    };

    const res = await request(app)
      .post("/tasks")
      .set("Cookie", `auth_token=${token}`)
      .send(taskData);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty(
      "message",
      "Title must be between 1 and 30 characters."
    );
  });

  it("should not create a task with an in valid description length", async () => {
    const taskData = {
      title: "Valid Title",
      description: "a".repeat(181),
      user: userId,
    };

    const res = await request(app)
      .post("/tasks")
      .set("Cookie", `auth_token=${token}`)
      .send(taskData);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty(
      "message",
      "Description must be between 1 and 180 characters."
    );
  });

  // ##################### Update Tasks ##########################
  it("should update the task successfully", async () => {
    const updatedTaskData = {
      title: "Update Task Title",
      description: "Update task description",
    };

    const res = await request(app)
      .patch(`/tasks/${taskId}`)
      .set("Cookie", `auth_token=${token}`)
      .send(updatedTaskData);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("_id", taskId.toString());
    expect(res.body).toHaveProperty(
      "title",
      updatedTaskData.title.toLowerCase()
    );
    expect(res.body).toHaveProperty("description", updatedTaskData.description);
    expect(res.body).toHaveProperty("user", userId.toString());
  });

  it("should return 404 when updating a non-existent task", async () => {
    const nonExistentTaskId = new mongoose.Types.ObjectId();
    const updatedTaskData = {
      title: "New Title",
      description: "New Description",
    };

    const res = await request(app)
      .patch(`/tasks/${nonExistentTaskId}`)
      .set("Cookie", `auth_token=${token}`)
      .send(updatedTaskData);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", "Task ID non-existent!");
  });

  it("should not update a task if no changes are made", async () => {
    const taskData = {
      title: "test task no change",
      description: "Task description",
      completed: false,
    };

    const taskNoChange = await Task.create({
      ...taskData,
      user: userId,
    });

    const res = await request(app)
      .patch(`/tasks/${taskNoChange._id}`)
      .set("Cookie", `auth_token=${token}`)
      .send(taskData); // Same content as the original task

    expect(res.status).toBe(200);
    expect(res.body.title).toBe(taskData.title);
    expect(res.body.description).toBe(taskData.description);
    expect(res.body.completed).toBe(taskData.completed);
  });

  it("It should not allow update with empty description and complete with `No description yet!`", async () => {
    const anotherTask = await Task.create({
      title: "Another Task",
      description: "Another task description",
      user: userId,
    });

    const updatedTaskData = {
      title: "another task",
      description: "",
      completed: false,
    };

    const res = await request(app)
      .patch(`/tasks/${anotherTask._id}`)
      .set("Cookie", `auth_token=${token}`)
      .send(updatedTaskData);

    expect(res.status).toBe(200);
    expect(res.body.title).toBe(anotherTask.title);
    expect(res.body).toHaveProperty("description", "No description yet!");
  });

  it("should not update a task with a title that already exists for the user", async () => {
    const anotherTaskExists = await Task.create({
      title: "Another Task Exists",
      description: "Another task description",
      user: userId,
    });

    const updatedTaskDataExists = {
      title: "Another Task Exists", // Attempting to update with a title that already exists
      description: "Another task description",
      completed: false,
    };

    const res = await request(app)
      .patch(`/tasks/${anotherTaskExists._id}`)
      .set("Cookie", `auth_token=${token}`)
      .send(updatedTaskDataExists);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty(
      "error",
      "Task with this title already exists!"
    );
  });

  
  it("should not update a task with an invalid title length", async () => {
    const updatedTaskData = {
      title: "a".repeat(31),
      description: "Update task description",
    };

    const res = await request(app)
      .patch(`/tasks/${taskId}`)
      .set("Cookie", `auth_token=${token}`)
      .send(updatedTaskData);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty(
      "message",
      "Title must be between 1 and 30 characters."
    );
  });

  it("should not update a task with an invalid description length", async () => {
    const updatedTaskData = {
      title: "a".repeat(30),
      description: "a".repeat(181),
    };

    const res = await request(app)
      .patch(`/tasks/${taskId}`)
      .set("Cookie", `auth_token=${token}`)
      .send(updatedTaskData);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty(
      "message",
      "Description must be between 1 and 180 characters."
    );
  });

  it("should not update a non-existent task", async () => {
    const nonExistentTaskId = "000000000000000000000000"; // A non-existent ID
    const updatedTaskData = {
      title: "Non-existent Task",
      description: "Trying to update a non-existent task",
    };

    const res = await request(app)
      .patch(`/tasks/${nonExistentTaskId}`)
      .set("Cookie", `auth_token=${token}`)
      .send(updatedTaskData);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", "Task ID non-existent!");
  });

  // ################## DeleteTask ###################################

  it("should delete a task", async () => {
    const deleteTask = await Task.create({
      title: "Delete Task",
      description: "Delete task description",
      user: userId,
    });
    let deleteTaskID = deleteTask._id.toString();

    const res = await request(app)
      .delete(`/tasks/${deleteTaskID}`)
      .set("Cookie", `auth_token=${token}`);
    // .send(updatedTaskData);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty(
      "message",
      `Task ${deleteTaskID} deleted successfully!`
    );
  });

  it("should return 404 when deleting a non-existent task ", async () => {
    const nonExistentTaskId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .delete(`/tasks/${nonExistentTaskId}`)
      .set("Cookie", `auth_token=${token}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", `Task ID not found!`);
  });

  it("should not delete a task with a non-existent ID ", async () => {
    const deleteTask = await Task.create({
      title: "Delete Task",
      description: "Delete task description",
      user: userId,
    });
    let deleteTaskID = "000000000000000000000000"; // An existent ID

    const res = await request(app)
      .delete(`/tasks/${deleteTaskID}`)
      .set("Cookie", `auth_token=${token}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", `Task ID not found!`);
  });

  // ################## Get Task ###################################

  it("should get a task successfully", async () => {
    const getTask = await Task.create({
      title: "Get Task",
      description: "Get task description",
      user: userId,
    });
    let getTaskID = getTask._id.toString();

    const res = await request(app)
      .get(`/tasks/${getTaskID}`)
      .set("Cookie", `auth_token=${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("_id", getTaskID);
    expect(res.body).toHaveProperty("title", "get task");
    expect(res.body).toHaveProperty("description", "Get task description");
    expect(res.body).toHaveProperty("completed", false);
    expect(res.body).toHaveProperty("user", userId.toString());
    expect(new Date(res.body.createdAt)).toBeInstanceOf(Date);
  });

  it("should return 404 if the task does not exist", async () => {
    const nonExistentTaskId = "000000000000000000000000";

    const res = await request(app)
      .get(`/tasks/${nonExistentTaskId}`)
      .set("Cookie", `auth_token=${token}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty(
      "error",
      "Could not find task with that ID!"
    );
  });

  it("should return 500 if the task ID is invalid", async () => {
    const invalidTaskId = "invalidTaskId";

    const res = await request(app)
      .get(`/tasks/${invalidTaskId}`)
      .set("Cookie", `auth_token=${token}`);

    expect(res.status).toBe(500);
  });

  // ################## Search Task ###############################
  it("should return tasks matching the search title", async () => {
    const taskData = {
      title: "Searchable Task",
      description: "Searchable task description",
      user: userId,
    };

    await Task.create(taskData);

    const res = await request(app)
      .get(`/tasks/search`)
      .set("Cookie", `auth_token=${token}`)
      .query({ title: "Searchable Task" });

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("title", taskData.title.toLowerCase());
  });

  it("should return 404 when no tasks match the search title", async () => {
    const res = await request(app)
      .get(`/tasks/search`)
      .set("Cookie", `auth_token=${token}`)
      .query({ title: "NonExistentTitle" });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty(
      "message",
      "No tasks found with that title."
    );
  });
});
