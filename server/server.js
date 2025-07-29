require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const dbConnect = require("./config/dbConnect");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const corsOptions = require("./config/corsOptions");
const accessLogger = require("./middlewares/accessLogger");
const errorHandler = require("./middlewares/error");
const logger = require("./middlewares/logger");

const app = express();
const port = process.env.PORT || 3500;

// ATTENTION: USE ONLY IN TESTS!!!!! Configure on .env file 'NODE_ENV="test"'
// if (process.env.NODE_ENV === "test") {
//   const User = require("./models/User");
//   const Task = require("./models/Task");

//   const resetDatabase = async (req, res) => {
//     try {
//       await User.deleteMany({});
//       await Task.deleteMany({});
//       res.status(200).send({ message: "Banco de dados resetado para testes" });
//     } catch (error) {
//       res.status(500).send({ error: "Erro ao resetar o banco de dados" });
//     }
//   };

//   // Define a rota de reset no ambiente de teste
//   app.use("/reset-database", resetDatabase);
// }

dbConnect();

app.use(cors(corsOptions));

app.use(express.json());

// Access logger for all requests
app.use(accessLogger);

// creation of cookies
app.use((req, res, next) => {
  // Check if cookie header exists
  if (req.headers.cookie) {
    // Split the cookie header into individual key-value pairs
    const rawCookies = req.headers.cookie.split("; ");
    // Transform key-value pairs into an object
    req.cookies = rawCookies.reduce((acc, cookie) => {
      const [key, value] = cookie.split("=");
      acc[key] = value;
      return acc;
    }, {});
  } else {
    // If there are no cookies, set req.cookies to an empty object
    req.cookies = {};
  }
  next();
});

// Routes
app.use("/users", userRoutes);
app.use("/tasks", taskRoutes);

app.use("/", express.static(path.join(__dirname, "public")));

// Initial route
app.all("*", (req, res) => {
  logger.warn(`404 Not Found - ${req.method} ${req.url} - ${req.ip}`);
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

// Middleware to catch malformed requests
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    logger.error(
      `Malformed JSON in request - ${err.message} - ${req.method} ${req.url}`
    );
    return res.status(400).json({ error: "Malformed JSON in request" });
  }

  next(err);
});

// Error Middleware
app.use(errorHandler);

module.exports = app;
