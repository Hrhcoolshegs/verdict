/*
  # Create user verdicts tracking table

  1. New Tables
    - `user_verdicts`
      - `id` (uuid, primary key)
      - `user_email` (text, verified email address)
      - `movie_id` (int8, foreign key to movies)
      - `verdict_type` (text, 'cinema' or 'not-cinema')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `user_verdicts` table
    - Add policy for authenticated users to manage their own verdicts
    - Add unique constraint to prevent duplicate verdicts per email/movie

  3. Functions
    - Function to safely record user verdicts
    - Function to check if user has already judged a movie
*/

-- Create user_verdicts table
CREATE TABLE IF NOT EXISTS user_verdicts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  movie_id int8 NOT NULL REFERENCES movies(id),
  verdict_type text NOT NULL CHECK (verdict_type IN ('cinema', 'not-cinema')),
  created_at timestamptz DEFAULT now()
);

-- Add unique constraint to prevent duplicate verdicts
ALTER TABLE user_verdicts ADD CONSTRAINT unique_user_movie_verdict 
  UNIQUE (user_email, movie_id);

-- Enable RLS
ALTER TABLE user_verdicts ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to manage their own verdicts
CREATE POLICY "Users can manage their own verdicts"
  ON user_verdicts
  FOR ALL
  TO authenticated
  USING (user_email = (auth.jwt() ->> 'email'::text))
  WITH CHECK (user_email = (auth.jwt() ->> 'email'::text));

-- Policy for public to read verdicts (for statistics)
CREATE POLICY "Anyone can read verdicts"
  ON user_verdicts
  FOR SELECT
  TO public
  USING (true);

-- Function to check if user has already judged a movie
CREATE OR REPLACE FUNCTION has_user_already_judged(p_user_email text, p_movie_id int8)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_verdicts 
    WHERE user_email = p_user_email AND movie_id = p_movie_id
  );
END;
$$;

-- Function to record user verdict safely
CREATE OR REPLACE FUNCTION record_user_verdict(
  p_user_email text,
  p_movie_id int8,
  p_verdict_type text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Check if user has already judged this movie
  IF has_user_already_judged(p_user_email, p_movie_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'You have already submitted a verdict for this movie'
    );
  END IF;

  -- Insert user verdict
  INSERT INTO user_verdicts (user_email, movie_id, verdict_type)
  VALUES (p_user_email, p_movie_id, p_verdict_type);

  -- Increment movie verdict count
  IF p_verdict_type = 'cinema' THEN
    UPDATE movies SET cinema_votes = cinema_votes + 1 WHERE id = p_movie_id;
  ELSE
    UPDATE movies SET not_cinema_votes = not_cinema_votes + 1 WHERE id = p_movie_id;
  END IF;

  RETURN json_build_object(
    'success', true,
    'message', 'Verdict recorded successfully'
  );
END;
$$;

-- Function to get user's verdict for a movie
CREATE OR REPLACE FUNCTION get_user_verdict(p_user_email text, p_movie_id int8)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_verdict text;
BEGIN
  SELECT verdict_type INTO user_verdict
  FROM user_verdicts 
  WHERE user_email = p_user_email AND movie_id = p_movie_id;
  
  RETURN user_verdict;
END;
$$;