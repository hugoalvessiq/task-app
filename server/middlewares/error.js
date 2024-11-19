const logger = require("./logger");

const errorHandler = (err, req, res, next) => {
  logger.error(`${err.message} - ${req.method} ${req.url}`);
  res.status(500).json({ error: "Internal Server Error" });
};

module.exports = errorHandler;
