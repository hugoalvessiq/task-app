const logger = require("./logger");

const accessLogger = (req, res, next) => {
  logger.info(`${req.method} ${req.url} - ${req.ip}`);
  next();
};

module.exports = accessLogger;
