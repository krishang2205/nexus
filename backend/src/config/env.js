const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const repoEnvPath = path.resolve(__dirname, '../../../.env');
const backendEnvPath = path.resolve(__dirname, '../../.env');

if (fs.existsSync(repoEnvPath)) {
  dotenv.config({ path: repoEnvPath });
}

if (fs.existsSync(backendEnvPath)) {
  // Backend-local env should override root values when both are present.
  dotenv.config({ path: backendEnvPath, override: true });
}

const PORT = Number(process.env.PORT) || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const OPENAI_TRANSCRIBE_MODEL = process.env.OPENAI_TRANSCRIBE_MODEL || 'whisper-1';
const OPENAI_CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

module.exports = {
  PORT,
  NODE_ENV,
  ALLOWED_ORIGINS,
  OPENAI_TRANSCRIBE_MODEL,
  OPENAI_CHAT_MODEL,
  GEMINI_MODEL,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
};
