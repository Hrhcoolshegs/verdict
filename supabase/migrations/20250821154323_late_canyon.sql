/*
  # Create movies table for cinema verdicting

  1. New Tables
    - `movies`
      - `id` (bigint, primary key)
      - `title` (text, not null)
      - `director` (text, not null)
      - `year` (integer, not null)
      - `poster` (text, not null)
      - `cinema_votes` (integer, default 0)
      - `not_cinema_votes` (integer, default 0)
      - `created_at` (timestamp with timezone, default now())
      - `updated_at` (timestamp with timezone, default now())

  2. Security
    - Enable RLS on `movies` table
    - Add policy for public read access
    - Add policy for public verdict updates (increment votes)

  3. Functions
    - Create function to safely increment verdict counts
    - Create trigger to update `updated_at` timestamp
*/

-- Create movies table
CREATE TABLE IF NOT EXISTS movies (
  id bigint PRIMARY KEY,
  title text NOT NULL,
  director text NOT NULL,
  year integer NOT NULL,
  poster text NOT NULL,
  cinema_votes integer DEFAULT 0,
  not_cinema_votes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Movies are viewable by everyone"
  ON movies
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Movies can be updated by everyone for verdicts"
  ON movies
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create function to safely increment verdict counts
CREATE OR REPLACE FUNCTION increment_movie_verdict(
  movie_id bigint,
  verdict_type text
) RETURNS void AS $$
BEGIN
  IF verdict_type = 'cinema' THEN
    UPDATE movies 
    SET cinema_votes = cinema_votes + 1, updated_at = now()
    WHERE id = movie_id;
  ELSIF verdict_type = 'not-cinema' THEN
    UPDATE movies 
    SET not_cinema_votes = not_cinema_votes + 1, updated_at = now()
    WHERE id = movie_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_movies_updated_at
  BEFORE UPDATE ON movies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial movie data
INSERT INTO movies (id, title, director, year, poster, cinema_votes, not_cinema_votes) VALUES
(1, 'The Godfather', 'Francis Ford Coppola', 1972, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 12847, 1653),
(2, 'Citizen Kane', 'Orson Welles', 1941, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 8934, 1566),
(3, 'Vertigo', 'Alfred Hitchcock', 1958, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 9821, 2179),
(4, '2001: A Space Odyssey', 'Stanley Kubrick', 1968, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 7456, 2344),
(5, 'Tokyo Story', 'Yasujirō Ozu', 1953, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 4123, 877),
(6, 'The Rules of the Game', 'Jean Renoir', 1939, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 3567, 933),
(7, 'Sunrise', 'F.W. Murnau', 1927, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 2891, 709),
(8, '8½', 'Federico Fellini', 1963, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 5234, 1266),
(9, 'Singin'' in the Rain', 'Gene Kelly', 1952, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 11567, 2433),
(10, 'The Bicycle Thieves', 'Vittorio De Sica', 1948, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 3789, 1211),
(11, 'Parasite', 'Bong Joon-ho', 2019, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 18234, 2766),
(12, 'Moonlight', 'Barry Jenkins', 2016, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 9876, 2124),
(13, 'Mad Max: Fury Road', 'George Miller', 2015, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 15432, 3568),
(14, 'Her', 'Spike Jonze', 2013, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 8765, 3235),
(15, 'There Will Be Blood', 'Paul Thomas Anderson', 2007, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 11234, 2766),
(16, 'Mulholland Drive', 'David Lynch', 2001, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 6789, 2211),
(17, 'Spirited Away', 'Hayao Miyazaki', 2001, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 22456, 3544),
(18, 'Goodfellas', 'Martin Scorsese', 1990, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 16789, 4211),
(19, 'Taxi Driver', 'Martin Scorsese', 1976, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 13456, 3544),
(20, 'Apocalypse Now', 'Francis Ford Coppola', 1979, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 10234, 2766),
(21, 'The Lighthouse', 'Robert Eggers', 2019, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 4567, 1433),
(22, 'Portrait of a Lady on Fire', 'Céline Sciamma', 2019, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 7234, 1266),
(23, 'Roma', 'Alfonso Cuarón', 2018, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 8456, 1544),
(24, 'Call Me by Your Name', 'Luca Guadagnino', 2017, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 9123, 2877),
(25, 'La La Land', 'Damien Chazelle', 2016, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 11567, 4433),
(26, 'Birdman', 'Alejandro G. Iñárritu', 2014, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 7891, 2109),
(27, '12 Years a Slave', 'Steve McQueen', 2013, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 12345, 2655),
(28, 'The Tree of Life', 'Terrence Malick', 2011, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 3456, 2544),
(29, 'The Social Network', 'David Fincher', 2010, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 14567, 3433),
(30, 'No Country for Old Men', 'Coen Brothers', 2007, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 13789, 2211),
(31, 'Son of Saul', 'László Nemes', 2015, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 3234, 766),
(32, 'Amour', 'Michael Haneke', 2012, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 4567, 1433),
(33, 'The Master', 'Paul Thomas Anderson', 2012, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 5234, 1766),
(34, 'Drive', 'Nicolas Winding Refn', 2011, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 8456, 2544),
(35, 'Black Swan', 'Darren Aronofsky', 2010, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 9876, 2124),
(36, 'Inglourious Basterds', 'Quentin Tarantino', 2009, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 15234, 3766),
(37, 'WALL-E', 'Andrew Stanton', 2008, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 18456, 2544),
(38, 'The Departed', 'Martin Scorsese', 2006, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 16789, 3211),
(39, 'Eternal Sunshine of the Spotless Mind', 'Michel Gondry', 2004, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 11234, 2766),
(40, 'Lost in Translation', 'Sofia Coppola', 2003, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 8567, 2433),
(41, 'Swiss Army Man', 'Daniel Kwan', 2016, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 3456, 1544),
(42, 'The Neon Demon', 'Nicolas Winding Refn', 2016, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 2789, 2211),
(43, 'Only God Forgives', 'Nicolas Winding Refn', 2013, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 1567, 3433),
(44, 'Spring Breakers', 'Harmony Korine', 2012, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 2345, 2655),
(45, 'The Love Witch', 'Anna Biller', 2016, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 2891, 1109),
(46, 'Under the Skin', 'Jonathan Glazer', 2013, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 4123, 1877),
(47, 'Holy Motors', 'Leos Carax', 2012, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 2567, 1433),
(48, 'Enter the Void', 'Gaspar Noé', 2009, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 1789, 2211),
(49, 'Synecdoche, New York', 'Charlie Kaufman', 2008, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 2456, 1544),
(50, 'I''m Not There', 'Todd Haynes', 2007, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg', 2234, 1766)
ON CONFLICT (id) DO NOTHING;