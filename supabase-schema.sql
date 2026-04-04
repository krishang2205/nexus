-- Create profiles table for Clerk user data storage
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY, -- Clerk user ID (string, not UUID)
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Remove RLS for now to allow Clerk integration (we can add it back later)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Backfill missing columns for existing installs
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert a test profile to verify the table works
INSERT INTO profiles (id, email, full_name, avatar_url)
VALUES (
  'test-clerk-id-123',
  'test@example.com',
  'Test User',
  'https://example.com/avatar.jpg'
)
ON CONFLICT (id) DO NOTHING;

-- Live transcript chunks persisted from meeting sessions
CREATE TABLE IF NOT EXISTS meeting_transcripts (
  transcript_id TEXT PRIMARY KEY,
  meeting_id TEXT NOT NULL,
  user_id TEXT,
  speaker_name TEXT,
  transcript_text TEXT NOT NULL,
  source TEXT DEFAULT 'browser-stt',
  is_final BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backfill missing columns for existing installs
ALTER TABLE meeting_transcripts ADD COLUMN IF NOT EXISTS transcript_id TEXT;
ALTER TABLE meeting_transcripts ADD COLUMN IF NOT EXISTS meeting_id TEXT;
ALTER TABLE meeting_transcripts ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE meeting_transcripts ADD COLUMN IF NOT EXISTS speaker_name TEXT;
ALTER TABLE meeting_transcripts ADD COLUMN IF NOT EXISTS transcript_text TEXT;
ALTER TABLE meeting_transcripts ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'browser-stt';
ALTER TABLE meeting_transcripts ADD COLUMN IF NOT EXISTS is_final BOOLEAN DEFAULT FALSE;
ALTER TABLE meeting_transcripts ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE meeting_transcripts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Ensure primary key exists on transcript_id for upsert support
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'meeting_transcripts_pkey'
  ) THEN
    ALTER TABLE meeting_transcripts ADD PRIMARY KEY (transcript_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_meeting_transcripts_meeting_id_updated_at
  ON meeting_transcripts (meeting_id, updated_at);

DROP TRIGGER IF EXISTS update_meeting_transcripts_updated_at ON meeting_transcripts;

CREATE TRIGGER update_meeting_transcripts_updated_at
  BEFORE UPDATE ON meeting_transcripts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE meeting_transcripts DISABLE ROW LEVEL SECURITY;
