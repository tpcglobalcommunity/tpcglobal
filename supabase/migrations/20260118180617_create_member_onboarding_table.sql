/*
  # Member Onboarding System

  1. New Tables
    - `member_onboarding`
      - `user_id` (uuid, primary key, foreign key to auth.users)
      - `accepted_disclaimer` (boolean, not null, default false)
      - `joined_telegram` (boolean, not null, default false)
      - `read_docs` (boolean, not null, default false)
      - `completed` (boolean, not null, default false) - auto-calculated
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Functions
    - `update_member_onboarding_updated_at()` - trigger function to update updated_at timestamp
    - `calculate_onboarding_completed()` - trigger function to auto-set completed status

  3. Security
    - Enable RLS on `member_onboarding` table
    - Add policy for authenticated users to read their own row
    - Add policy for authenticated users to insert their own row
    - Add policy for authenticated users to update their own row
    - No delete policy for users (admin only if needed)

  4. Important Notes
    - The `completed` field is automatically calculated based on all three steps
    - Users cannot manually set `completed` - it's server-side enforced
    - Each user can only have one onboarding record
    - Compliance-first: tracks user consent and actions explicitly
*/

-- Create the member_onboarding table
CREATE TABLE IF NOT EXISTS member_onboarding (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  accepted_disclaimer boolean NOT NULL DEFAULT false,
  joined_telegram boolean NOT NULL DEFAULT false,
  read_docs boolean NOT NULL DEFAULT false,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_member_onboarding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to auto-calculate completed status
CREATE OR REPLACE FUNCTION calculate_onboarding_completed()
RETURNS TRIGGER AS $$
BEGIN
  NEW.completed = (NEW.accepted_disclaimer AND NEW.joined_telegram AND NEW.read_docs);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_member_onboarding_updated_at ON member_onboarding;
CREATE TRIGGER set_member_onboarding_updated_at
  BEFORE UPDATE ON member_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION update_member_onboarding_updated_at();

-- Create trigger for auto-calculating completed status
DROP TRIGGER IF EXISTS set_member_onboarding_completed ON member_onboarding;
CREATE TRIGGER set_member_onboarding_completed
  BEFORE INSERT OR UPDATE ON member_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION calculate_onboarding_completed();

-- Enable RLS
ALTER TABLE member_onboarding ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own onboarding row
CREATE POLICY "Users can read own onboarding"
  ON member_onboarding
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own onboarding row
CREATE POLICY "Users can insert own onboarding"
  ON member_onboarding
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own onboarding row
CREATE POLICY "Users can update own onboarding"
  ON member_onboarding
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);