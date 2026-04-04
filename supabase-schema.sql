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

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
