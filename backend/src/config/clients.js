const multer = require('multer');
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const gemini = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

module.exports = {
  upload,
  openai,
  gemini,
};
