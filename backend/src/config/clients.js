const multer = require('multer');
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = require('./env');

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

const supabaseAdmin = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
  : null;

const keyLooksPublishable = typeof SUPABASE_SERVICE_ROLE_KEY === 'string'
  && SUPABASE_SERVICE_ROLE_KEY.startsWith('sb_publishable_');

if (!supabaseAdmin) {
  console.warn('Supabase admin client not initialized. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend environment.');
}

if (
  keyLooksPublishable
) {
  console.error('Invalid SUPABASE_SERVICE_ROLE_KEY: publishable key detected. Use the Supabase service_role secret key for backend writes.');
}

module.exports = {
  upload,
  openai,
  gemini,
  supabaseAdmin,
};
