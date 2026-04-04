const { openai, gemini, supabaseAdmin } = require('../config/clients');
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = require('../config/env');
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
      supabaseConfigured: Boolean(supabaseAdmin),
      supabaseUrlConfigured: Boolean(SUPABASE_URL),
      supabaseServiceRoleConfigured: Boolean(SUPABASE_SERVICE_ROLE_KEY),
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
