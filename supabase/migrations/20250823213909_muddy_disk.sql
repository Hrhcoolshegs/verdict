/*
  # Fix RLS policy for movies table seeding

  1. Security Updates
    - Add policy to allow anonymous users to insert movies (for seeding)
    - Maintain existing read permissions for everyone
    - Keep service role permissions intact

  2. Changes
    - Add INSERT policy for anonymous role to enable client-side seeding
    - This allows the DatabaseSeeder component to work properly
*/

-- Add policy to allow anonymous users to insert movies for seeding purposes
CREATE POLICY "Allow anonymous insert for seeding"
  ON movies
  FOR INSERT
  TO anon
  WITH CHECK (true);