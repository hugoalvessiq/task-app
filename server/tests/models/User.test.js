const mongoose = require("mongoose");
const User = require("../../models/User");
const bcrypt = require("bcrypt");

describe("User model", () => {
  // Connect to DB
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI_TEST, {
      // useNewUrlParser: true,
    });
  });

  afterAll(async () => {
    // Clean DB after tests
  
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  // => 1. Testing required fields and minlength validation
  it("should require name, email, and password", async () => {
    const user = new User({});

    let error;
    try {
      await user.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.name).toBeDefined();
    expect(error.errors.email).toBeDefined();
    expect(error.errors.password).toBeDefined();
  });

  it("should require a password with at least 6 characters", async () => {
    const user = new User({
      name: "testuser",
      email: "test@example.com",
      password: "12345", // Password too short
    });

    let error;
    try {
      await user.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.password).toBeDefined();
    expect(error.errors.password.kind).toBe("minlength");
  });

  // => 2. Testing name and email uniqueness
  it("should enforce unique name and email", async () => {
    const user1 = new User({
      name: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    const user2 = new User({
      name: "testuser", // Same name
      email: "another@example.com",
      password: "password123",
    });

    const user3 = new User({
      name: "another user",
      email: "test@example.com", // Same email
      password: "password123",
    });

    await user1.save();

    let error;
    try {
      await user2.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(11000); // Duplicate error code in MongoDB

    error = null;
    try {
      await user3.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(11000);
  });

  //  => 3. Testing transformation to lowercase letters
  it("should convert name and email to lowercase", async () => {
    const user = new User({
      name: "TESTUSERLOWER",
      email: "TESTLOWER@EXAMPLE.COM",
      password: "password123",
    });

    const savedUser = await user.save();
    expect(savedUser.name).toBe("testuserlower");
    expect(savedUser.email).toBe("testlower@example.com");
  });

  // => 4. Testing password hashing 
  it("should hash the password before saving", async () => {
    const user = new User({
      name: "testuserhash",
      email: "testhash@example.com",
      password: "password123",
    });

    const savedUser = await user.save();

    // Password should not be stored in plain text
    expect(savedUser.password).not.toBe("password123");

    // Verify that the password has been hashed correctly
    const isMatch = await bcrypt.compare("password123", savedUser.password);
    expect(isMatch).toBe(true);
  });

  it("should only hash the password if it is modified", async () => {
    const user = new User({
      name: "testuserhashmodified",
      email: "testhashmodified@example.com",
      password: "password123",
    });

    const savedUser = await user.save();

    //Change name without changing password
    savedUser.name = "newname"
    const updateUser = await savedUser.save()

    // The password should not be changed
    expect(updateUser.password).toBe(savedUser.password);
  });
});
