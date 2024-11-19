const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../../server");
const User = require("../../models/User");
const Task = require("../../models/Task");
const { log } = require("winston");

let mongoServer;

beforeAll(async () => {
  // If there is already an active connection, disconnect before reconnecting.
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(process.env.MONGO_URI_TEST, {
    // useNewUrlParser: true,
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Task Model", () => {
  let user;

  beforeEach(async () => {
    // Create a sample user
    user = new User({
      name: "testuser",
      email: "testuser@example.com",
      password: "password123",
    });
    await user.save();
  });

  afterEach(async () => {
    // Clear collections after each test
    await Task.deleteMany({});
    await User.deleteMany({});
  });

  it("should save a valid task", async () => {
    const task = new Task({
      title: "First Task",
      description: "This is a test task",
      user: user._id,
    });

    const savedTask = await task.save();
    expect(savedTask._id).toBeDefined();
    expect(savedTask.title).toBe("first task"); // Should be lowcase
    expect(savedTask.description).toBe("This is a test task");
    expect(savedTask.user).toEqual(user._id);
    expect(savedTask.completed).toBe(false);
  });

  it("should fail to save an untitled task", async () => {
    const task = new Task({
      description: "Untitled task",
      user: user._id,
    });

    await expect(task.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it("should set 'No description yet!' as default description", async () => {
    const task = new Task({
      title: "Untitled task",
      user: user._id,
    });

    const savedTask = await task.save();
    expect(savedTask.description).toBe("No description yet!");
  });

  it("should ensure that the title is unique per user", async () => {
    const task1 = new Task({
      title: "Duplicate Task",
      user: user._id,
    });
    await task1.save();

    const task2 = new Task({
      title: "Duplicate Task",
      user: user._id,
    });

    await expect(task2.save()).rejects.toThrow(mongoose.MongoServerError);
  });

  it("should allow duplicate titles between different users", async () => {
    const task1 = new Task({
      title: "Same Task",
      user: user._id,
    });
    await task1.save();

    // Criar outro usuário
    const anotherUser = new User({
      name: "otheruser",
      email: "otheruser@example.com",
      password: "password123",
    });
    await anotherUser.save();

    const task2 = new Task({
      title: "Same Task",
      user: anotherUser._id,
    });

    const savedTask = await task2.save();
    expect(savedTask._id).toBeDefined();
  });

  it("should respect the maximum character limit in the title", async () => {
    const longTitle = "T".repeat(32); // Exceeds the 30 character limit
    const task = new Task({
      title: longTitle,
      user: user._id,
    });

    await expect(task.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it("should respect the maximum character limit in the description", async () => {
    const longDescription = "D".repeat(181); // Exceeds the 181 character limit
    const task = new Task({
      title: longDescription,
      user: user._id,
    });

    await expect(task.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });
});
