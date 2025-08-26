const bodyParser = require('body-parser');
const cors = require('cors');

// Middleware setup
const setupMiddleware = (handler) => async (req, res) => {
  // Enable CORS
  cors()(req, res, () => {});

  // Parse JSON body
  if (!req.body && req.method === 'POST') {
    await new Promise((resolve) => {
      bodyParser.json()(req, res, resolve);
    });
  }

  return handler(req, res);
};

module.exports = setupMiddleware;
