const { createLogger, format } = require("winston");
const { combine, timestamp, printf, errors } = format;
const path = require("path");
const fs = require("fs");
const DailyRatateFile = require("winston-daily-rotate-file");

// Path to logs folder
const logDir = path.join(__dirname, "../log");

// Checks if the "log" folder exists, if not, creates the folder
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

// Logger Config
const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "warn" : "debug", // Use 'warn' for production and 'debug' for development
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }), // Log errors with stack trace
    logFormat
  ),
  transports: [
    // new transports.Console(), // Adds log output to the console
    new DailyRatateFile({
      filename: path.join(logDir, "error-%DATE%.log"),
      datePattern: "YYY-MM-DD",
      level: "error",
      maxFiles: "14d",
    }),
    new DailyRatateFile({
      filename: path.join(logDir, "access-%DATE%.log"),
      level: "info",
      maxFiles: "14d",
    }),
  ],
});

module.exports = logger;
