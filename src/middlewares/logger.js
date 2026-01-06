const morgan = require('morgan');

/**
 * Request logging middleware using Morgan
 */
const logger = morgan('combined', {
  skip: (req, res) => {
    // Skip logging for health check endpoints
    return req.url === '/health' || req.url === '/';
  }
});

/**
 * Custom error logger
 */
const errorLogger = (err, req, res, next) => {
  console.error(`[Error] ${new Date().toISOString()}`);
  console.error(`Path: ${req.method} ${req.path}`);
  console.error(`Error: ${err.message}`);
  console.error(`Stack: ${err.stack}`);
  next(err);
};

module.exports = { logger, errorLogger };
