require("dotenv").config();

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    // Checks if authentication cookie exists
    const token = req.cookies.auth_token || req.headers.authorization;
    if (!token) return res.status(401).send({ error: "Please, Log in" });

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findOne({ _id: decoded._id }).select("-password");

    if (!user) {
      return res.status(401).json({ error: "Please, Log in" });
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ error: error.message || "Please, Log in" });
  }
};

module.exports = auth;
