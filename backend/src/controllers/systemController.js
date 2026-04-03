const { openai, gemini } = require('../config/clients');
const { activeRooms, userActivity } = require('../socket/state');

function getRoot(req, res) {
  res.send('Hello from backend!');
}

function getStatus(req, res) {
  try {
    return res.json({
      uptime: process.uptime(),
      activeRooms: activeRooms.size,
      activeUsers: userActivity.size,
      aiConfigured: Boolean(openai || gemini),
      openaiConfigured: Boolean(openai),
      geminiConfigured: Boolean(gemini),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get server status' });
  }
}

module.exports = {
  getRoot,
  getStatus,
};
