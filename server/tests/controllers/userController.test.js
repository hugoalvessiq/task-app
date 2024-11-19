// tests/routes/userRoutes.test.js
const request = require("supertest");
const app = require("../../server"); // Make sure the server exports the app instance
const User = require("../../models/User");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

describe("User Routes", () => {
  let token;
  let userId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST, {
      useNewUrlParser: true,
    });

    const hashedPassword = await bcrypt.hash("password123", 10);

    // Create a user for authentication testing
    const user = await new User({
      name: "Original User",
      email: "original@example.com",
      password: hashedPassword,
    }).save();

    userId = user._id;
    token = jwt.sign({ _id: userId }, process.env.SECRET_KEY, {
      expiresIn: "7d",
    });
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    // await User.deleteMany({});

    await mongoose.connection.close();
  });

  it("should update a user's name and email", async () => {
    await new User({
      _id: userId,
      name: "Original User",
      email: "original@example.com",
      password: "password123",
    }).save();

    const res = await request(app)
      .put("/users")
      .set("Cookie", `auth_token=${token}`)
      .send({
        name: "Updated User",
        email: "updated@example.com",
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toBe("updated user");
    expect(res.body.email).toBe("updated@example.com");
  });

  it("should not update to an existing name", async () => {
    // Create a second user to test email conflict
    await new User({
      name: "Second User",
      email: "second@example.com",
      password: "password123",
    }).save();

    await new User({
      _id: userId,
      name: "Original User",
      email: "original@example.com",
      password: "password123",
    }).save();

    const res = await request(app)
      .put("/users")
      .set("Cookie", `auth_token=${token}`)
      .send({
        name: "Second User",
        email: "another@example.com", // try to update with an existing email
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBe("Name not available!");
  });

  it("should not update to an existing email", async () => {
    // Create a second user to test email conflict
    await new User({
      name: "Second User",
      email: "second@example.com",
      password: "password123",
    }).save();

    await new User({
      _id: userId,
      name: "Original User",
      email: "original@example.com",
      password: "password123",
    }).save();

    const res = await request(app)
      .put("/users")
      .set("Cookie", `auth_token=${token}`)
      .send({
        name: "Another User",
        email: "second@example.com", // try to update with an existing email
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBe("Email not available!");
  });

  it("should return an error if no auth token is provided", async () => {
    const res = await request(app).put("/users").send({
      name: "No Auth User",
      email: "noauth@example.com",
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.error).toBe("Please, Log in");
  });

  it("should create a new user", async () => {
    const res = await request(app).post("/users").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("user");
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.name).toBe("test user");
  });

  it("should not create a user with an existing name", async () => {
    await new User({
      name: "Test User",
      email: "test2@example.com",
      password: "password123",
    }).save();

    const res = await request(app).post("/users").send({
      name: "Test User",
      email: "test2@example.com",
      password: "password123",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBe("Name not available!");
  });

  it("should not create a user with an existing email", async () => {
    await new User({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    }).save();

    const res = await request(app).post("/users").send({
      name: "Another User",
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBe("Email not available!");
  });

  it("should login a user with correct credentials", async () => {
    await new User({
      name: "Login User",
      email: "login@example.com",
      password: "password123",
    }).save();

    const res = await request(app)
      .post("/users/login")
      .send({ email: "login@example.com", password: "password123" });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.name).toBe("login user");
  });

  it("should update the user's password with correct current password", async () => {
    await new User({
      _id: userId,
      name: "Original User",
      email: "original@example.com",
      password: "password123",
    }).save();

    const res = await request(app)
      .patch("/users/password")
      .set("Cookie", `auth_token=${token}`)
      .send({
        currentPassword: "password123",
        newPassword: "newPassword465",
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe("Password update successfully.");

    // Check if the password was actually updated
    const updateUser = await User.findById(userId);
    const isMatch = await bcrypt.compare("newPassword465", updateUser.password);
    expect(isMatch).toBe(true);
  });

  it("should not update the password with incorrect current password", async () => {
    await new User({
      _id: userId,
      name: "Original User",
      email: "original@example.com",
      password: await bcrypt.hash("password123", 10),
    }).save();

    const res = await request(app)
      .patch("/users/password")
      .set("Cookie", `auth_token=${token}`)
      .send({
        currentPassword: "wrongPassword",
        newPassword: "newPassword465",
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBe("Incorrect current password.");
  });

  it("should return an error if no auth token is provided", async () => {
    const res = await request(app).patch("/users/password").send({
      currentPassword: "password123",
      newPassword: "newPassword465",
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.error).toBe("Please, Log in");
  });

  it("should log out the user and clear the auth cookie", async () => {
    // First, create a user and generate a token
    await new User({
      _id: userId,
      name: "Original User",
      email: "original@example.com",
      password: await bcrypt.hash("password123", 10),
    }).save();

    // make the logout request using the authentication token
    const res = await request(app)
      .post("/users/logout")
      .set("Cookie", `auth_token=${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe("Successfully logged out.");

    // Check if the authentication cookie has been removed
    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();
    expect(cookies.some((cookie) => cookie.includes("auth_token=;"))).toBe(
      true
    );
  });

  it("should return the user's data when authenticated", async () => {
    // First, create a test user
    const user = await new User({
      _id: userId,
      name: "Get User Test",
      email: "get_user_test@example.com",
      password: await bcrypt.hash("password123", 10),
    }).save();

    // Make a logout request using the authentication token
    const res = await request(app)
      .get("/users")
      .set("Cookie", `auth_token=${token}`);

    // Checks if the response status is 200
    expect(res.statusCode).toEqual(200);

    // Checks if the returned user data is correct
    expect(res.body).toHaveProperty("_id", userId.toString());
    expect(res.body).toHaveProperty("name", "get user test");
    expect(res.body).toHaveProperty("email", "get_user_test@example.com");
    expect(res.body).toHaveProperty("tasks", []);

    // Ensures that the password is not returned in the response
    expect(res.body).not.toHaveProperty("password");
  });

  it("should delete the user and return a success message", async () => {
    // First, create a test user
    const user = await new User({
      _id: userId,
      name: "delete User Test",
      email: "delete_user_test@example.com",
      password: await bcrypt.hash("password123", 10),
    }).save();

    // Make a DELETE request to delete the authenticated user
    const res = await request(app)
      .delete("/users")
      .set("Cookie", `auth_token=${token}`)
      .send({
        id: userId,
      });

    // Checks if the response status is 200
    expect(res.statusCode).toEqual(200);

    // Checks if the retrieved user data is correct
    expect(res.body).toHaveProperty(
      "message",
      `Username ${user.name} with ID ${user._id} deleted`
    );

    // Makes sure the user was actually removed from the database
    const deletedUser = await User.findById(user._id);
    expect(deletedUser).toBeNull();
  });
});
