const { generateStreamToken } = require('../services/streamService');

function getStreamToken(req, res) {
  try {
    const result = generateStreamToken(req.query.userId);
    return res.status(result.status).json(result.payload);
  } catch (error) {
    console.error('Error generating Stream token:', error);
    return res.status(500).json({ error: 'Failed to generate token' });
  }
}

module.exports = {
  getStreamToken,
};
