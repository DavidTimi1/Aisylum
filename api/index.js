import app from './server.js';

export default function handler(req, res) {
  // Delegate to Express
  app(req, res);
}
