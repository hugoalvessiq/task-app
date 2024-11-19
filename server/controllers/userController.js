require("dotenv").config();
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Task = require("../models/Task");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth");
const validator = require("validator");

const SECRET_KEY = process.env.SECRET_KEY;

const createUser = async (req, res) => {
  let { name, email, password } = req.body;

  // Sanitization and validation
  name = validator.trim(name);
  email = validator.normalizeEmail(email);

  if (!validator.isEmail(email)) {
    return res.status(400).send({ error: "Invalid email format." });
  }

  if (!name || !email || !password) {
    return res.status(400).send({ error: "Please fill in all fields." });
  }

  if (password.length < 6) {
    return res.status(400).send({ error: "Min password length 6 characters!" });
  }

  try {
    const existingName = await User.findOne({ name });
    if (existingName) {
      return res.status(400).send({ error: "Name not available!" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).send({ error: "Email not available!" });
    }

    const user = new User({
      name,
      email,
      password,
    });
    await user.save();

    const token = jwt.sign({ _id: user._id }, `${SECRET_KEY}`);

    res.status(201).send({ user, token });
  } catch (error) {
    console.log("Error sending!", error);

    res.status(400).send({ error: "Error creating user." });
  }
};

const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    email = validator.normalizeEmail(email);

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    // Data validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Please fill all in fields. To log in" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    const isMath = await bcrypt.compare(password, user.password);

    if (!isMath) {
      return res.status(401).json({ message: "Incorrect Password!" });
    }

    // Generate a token JWT
    const token = jwt.sign({ _id: user._id }, `${SECRET_KEY}`, {
      expiresIn: "7d",
    });

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: false, // Must be `true` in production with HTTPS
      sameSite: "strict",
    });

    res.json({
      token,
      name: user.name,
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

const logout = async (req, res) => {
  try {
    // Remove authentication cookie
    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });
    res.send({ message: "Successfully logged out." });
  } catch (error) {
    res.status(500).send({ error: "Logout failed." });
  }
};

const updateUser = async (req, res) => {
  let { name, email } = req.body;
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email"];

  name = validator.trim(name);
  email = validator.normalizeEmail(email);

  if (!validator.isEmail(email)) {
    return res.status(400).send({ error: "Invalid email format." });
  }

  if (!name || !email) {
    return res.status(400).send({ error: "Please fill in all fields." });
  }

  try {
    // Checks if the name is already in use by another user
    const existingName = await User.findOne({
      name,
      _id: { $ne: req.user._id },
    });
    if (existingName) {
      return res.status(400).send({ error: "Name not available!" });
    }

    const existingEmail = await User.findOne({
      email,
      _id: { $ne: req.user._id },
    });
    if (existingEmail) {
      return res.status(400).send({ error: "Email not available!" });
    }

    const user = await User.findById(req.user._id);

    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();

    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
};

// Change password
const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id);

    const isMath = await bcrypt.compare(currentPassword, user.password);

    if (!isMath) {
      return res.status(400).send({ error: "Incorrect current password." });
    }

    user.password = await newPassword;
    await user.save();

    res.send({ message: "Password update successfully." });
  } catch (error) {
    res.status(400).send(error);
  }
};

const deleteUser = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(400).json({ error: "User not authenticated." });
    }

    // Find user by ID
    const user = await User.findById(req.user._id);

    // Checks if user was found
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Delete all tasks related to the user
    await Task.deleteMany({ user: user._id });

    // Remove user using deleteOne
    const result = await User.deleteOne({ _id: user._id });

    // Check if the deletion was successful
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "User not deleted." });
    }

    // Sends the response with information about the deleted user
    res.json({ message: `Username ${user.name} with ID ${user._id} deleted` });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const getUser = async (req, res) => {
  try {
    const user = req.user.toObject();
    delete user.password;

    res.send(user);
  } catch (error) {
    res.status(500).send({ error: "Error fetching user data." });
  }
};

module.exports = {
  createUser,
  loginUser,
  logout,
  updateUser,
  updatePassword,
  deleteUser,
  getUser,
};
