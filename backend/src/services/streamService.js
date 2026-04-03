const jwt = require('jsonwebtoken');

function generateStreamToken(userId) {
  if (!userId) {
    return { status: 400, payload: { error: 'Missing userId' } };
  }

  const apiKey = process.env.STREAM_API_KEY;
  const apiSecret = process.env.STREAM_API_SECRET;

  if (!apiKey || !apiSecret) {
    return { status: 500, payload: { error: 'Stream API credentials not set' } };
  }

  const payload = {
    user_id: userId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
    iat: Math.floor(Date.now() / 1000),
  };

  const token = jwt.sign(payload, apiSecret, { algorithm: 'HS256' });
  return { status: 200, payload: { token } };
}

module.exports = {
  generateStreamToken,
};
