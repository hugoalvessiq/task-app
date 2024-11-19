require("dotenv").config();
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth");
const userController = require("../controllers/userController");
const loginLimiter = require("../middlewares/loginLimiter");

// A new user
router.post("/", userController.createUser);

// Login
router.post("/login", loginLimiter, userController.loginUser);

router.post("/logout", userController.logout);

// Search for logged in user information
router.get("/", auth, userController.getUser);

// Update user profile
router.put("/", auth, userController.updateUser);

// Change user password
router.patch("/password", auth, userController.updatePassword);

// Delete user account
router.delete("/", auth, userController.deleteUser);

module.exports = router;
