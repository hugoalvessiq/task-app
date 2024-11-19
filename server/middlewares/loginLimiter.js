const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windoesMs: 30 * 60 * 1000,
  max: 5,
  message: {
    message:
      "Too many login attempts from this IP, please try again after 30 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = loginLimiter;
