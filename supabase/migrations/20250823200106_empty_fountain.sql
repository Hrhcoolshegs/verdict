/*
  # Comprehensive Movie Database Schema

  1. New Tables
    - Enhanced `movies` table with comprehensive metadata
    - `cast_crew` table for detailed person information
    - `movie_cast_crew` junction table for relationships
    - `movie_collections` table for curated lists
    - `community_insights` table for demographic data
    - `cinema_quotes` table for dynamic quotes system
    - `film_techniques` table for educational content

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Service role management policies

  3. Performance
    - Comprehensive indexing strategy
    - Materialized views for aggregated data
*/

-- Drop existing tables if they exist to recreate with new schema
DROP TABLE IF EXISTS user_verdicts CASCADE;
DROP TABLE IF EXISTS movies CASCADE;

-- Enhanced movies table with comprehensive metadata
CREATE TABLE IF NOT EXISTS movies (
  id bigint PRIMARY KEY,
  title text NOT NULL,
  director text NOT NULL,
  year integer NOT NULL,
  poster text NOT NULL,
  plot text,
  runtime_minutes integer,
  budget_usd bigint,
  aspect_ratio text,
  camera_equipment jsonb DEFAULT '{}',
  filming_locations text[],
  cinematography_techniques text[],
  micro_genres text[],
  controversies jsonb DEFAULT '{}',
  cultural_movements text[],
  cultural_influence jsonb DEFAULT '{}',
  academic_analysis jsonb DEFAULT '{}',
  awards jsonb DEFAULT '{}',
  technical_craftsmanship integer CHECK (technical_craftsmanship >= 1 AND technical_craftsmanship <= 10),
  narrative_depth integer CHECK (narrative_depth >= 1 AND narrative_depth <= 10),
  artistic_ambition integer CHECK (artistic_ambition >= 1 AND artistic_ambition <= 10),
  ai_rationale text,
  critical_evolution jsonb DEFAULT '{}',
  dominant_colors jsonb DEFAULT '{}',
  cinema_votes integer DEFAULT 0,
  not_cinema_votes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cast and crew information
CREATE TABLE IF NOT EXISTS cast_crew (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  birth_year integer,
  nationality text,
  biography text,
  filmography jsonb DEFAULT '{}',
  awards jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Junction table for movie-person relationships
CREATE TABLE IF NOT EXISTS movie_cast_crew (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id bigint REFERENCES movies(id) ON DELETE CASCADE,
  person_id uuid REFERENCES cast_crew(id) ON DELETE CASCADE,
  role_type text NOT NULL CHECK (role_type IN ('director', 'actor', 'cinematographer', 'composer', 'writer', 'producer')),
  character_name text,
  billing_order integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE(movie_id, person_id, role_type, character_name)
);

-- Anonymous verdicts (no user authentication)
CREATE TABLE IF NOT EXISTS verdicts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id bigint REFERENCES movies(id) ON DELETE CASCADE,
  verdict_type text NOT NULL CHECK (verdict_type IN ('cinema', 'not-cinema')),
  device_id uuid,
  confidence_level integer CHECK (confidence_level >= 1 AND confidence_level <= 5),
  reasoning text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(movie_id, device_id)
);

-- Curated movie collections
CREATE TABLE IF NOT EXISTS movie_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  collection_type text NOT NULL CHECK (collection_type IN ('trending', 'classic', 'controversial', 'technical', 'movement', 'director-spotlight')),
  movie_ids bigint[],
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Community insights and demographic data
CREATE TABLE IF NOT EXISTS community_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id bigint REFERENCES movies(id) ON DELETE CASCADE,
  demographic_breakdown jsonb DEFAULT '{}',
  trending_debates jsonb DEFAULT '{}',
  verdict_confidence_avg numeric(3,2),
  engagement_metrics jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now(),
  UNIQUE(movie_id)
);

-- Dynamic cinema quotes system
CREATE TABLE IF NOT EXISTS cinema_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_text text NOT NULL,
  author text NOT NULL,
  author_role text, -- 'director', 'critic', 'actor', etc.
  context text,
  movie_id bigint REFERENCES movies(id) ON DELETE SET NULL,
  quote_category text CHECK (quote_category IN ('technique', 'philosophy', 'process', 'criticism', 'inspiration')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Film techniques for educational content
CREATE TABLE IF NOT EXISTS film_techniques (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  technique_name text NOT NULL,
  description text NOT NULL,
  explanation text,
  example_movies bigint[],
  technique_category text CHECK (technique_category IN ('cinematography', 'editing', 'sound', 'narrative', 'visual')),
  difficulty_level integer CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE cast_crew ENABLE ROW LEVEL SECURITY;
ALTER TABLE movie_cast_crew ENABLE ROW LEVEL SECURITY;
ALTER TABLE verdicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE movie_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE cinema_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE film_techniques ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Movies are viewable by everyone" ON movies FOR SELECT TO public USING (true);
CREATE POLICY "Cast crew are viewable by everyone" ON cast_crew FOR SELECT TO public USING (true);
CREATE POLICY "Movie cast crew relationships are viewable by everyone" ON movie_cast_crew FOR SELECT TO public USING (true);
CREATE POLICY "Verdicts are viewable by everyone" ON verdicts FOR SELECT TO public USING (true);
CREATE POLICY "Movie collections are viewable by everyone" ON movie_collections FOR SELECT TO public USING (true);
CREATE POLICY "Community insights are viewable by everyone" ON community_insights FOR SELECT TO public USING (true);
CREATE POLICY "Cinema quotes are viewable by everyone" ON cinema_quotes FOR SELECT TO public USING (true);
CREATE POLICY "Film techniques are viewable by everyone" ON film_techniques FOR SELECT TO public USING (true);

-- Insert verdict policies
CREATE POLICY "Anyone can insert verdicts" ON verdicts FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Movies can be updated for verdict counts" ON movies FOR UPDATE TO public USING (true) WITH CHECK (true);

-- Service role policies for data management
CREATE POLICY "Service role can manage all data" ON movies FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can manage cast crew" ON cast_crew FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can manage movie cast crew" ON movie_cast_crew FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can manage verdicts" ON verdicts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can manage collections" ON movie_collections FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can manage insights" ON community_insights FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can manage quotes" ON cinema_quotes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role can manage techniques" ON film_techniques FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Comprehensive indexing strategy
CREATE INDEX IF NOT EXISTS idx_movies_year ON movies(year);
CREATE INDEX IF NOT EXISTS idx_movies_director ON movies(director);
CREATE INDEX IF NOT EXISTS idx_movies_micro_genres ON movies USING GIN(micro_genres);
CREATE INDEX IF NOT EXISTS idx_movies_cultural_movements ON movies USING GIN(cultural_movements);
CREATE INDEX IF NOT EXISTS idx_movies_verdict_ratio ON movies((cinema_votes::float / NULLIF(cinema_votes + not_cinema_votes, 0)));
CREATE INDEX IF NOT EXISTS idx_verdicts_movie_id ON verdicts(movie_id);
CREATE INDEX IF NOT EXISTS idx_verdicts_device_id ON verdicts(device_id);
CREATE INDEX IF NOT EXISTS idx_verdicts_created_at ON verdicts(created_at);
CREATE INDEX IF NOT EXISTS idx_movie_cast_crew_movie_id ON movie_cast_crew(movie_id);
CREATE INDEX IF NOT EXISTS idx_movie_cast_crew_person_id ON movie_cast_crew(person_id);
CREATE INDEX IF NOT EXISTS idx_movie_cast_crew_role_type ON movie_cast_crew(role_type);
CREATE INDEX IF NOT EXISTS idx_community_insights_movie_id ON community_insights(movie_id);
CREATE INDEX IF NOT EXISTS idx_cinema_quotes_movie_id ON cinema_quotes(movie_id);
CREATE INDEX IF NOT EXISTS idx_cinema_quotes_category ON cinema_quotes(quote_category);

-- Function to update movie verdict counts
CREATE OR REPLACE FUNCTION update_movie_verdict_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.verdict_type = 'cinema' THEN
      UPDATE movies SET cinema_votes = cinema_votes + 1, updated_at = now() WHERE id = NEW.movie_id;
    ELSE
      UPDATE movies SET not_cinema_votes = not_cinema_votes + 1, updated_at = now() WHERE id = NEW.movie_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update verdict counts
CREATE TRIGGER update_verdict_counts_trigger
  AFTER INSERT ON verdicts
  FOR EACH ROW
  EXECUTE FUNCTION update_movie_verdict_counts();

-- Function to get random movie
CREATE OR REPLACE FUNCTION get_random_movie()
RETURNS TABLE(
  id bigint,
  title text,
  director text,
  year integer,
  poster text,
  plot text,
  runtime_minutes integer,
  micro_genres text[],
  cinema_votes integer,
  not_cinema_votes integer,
  ai_rationale text,
  dominant_colors jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT m.id, m.title, m.director, m.year, m.poster, m.plot, m.runtime_minutes, 
         m.micro_genres, m.cinema_votes, m.not_cinema_votes, m.ai_rationale, m.dominant_colors
  FROM movies m
  ORDER BY RANDOM()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to get personalized recommendations (based on device_id verdicts)
CREATE OR REPLACE FUNCTION get_personalized_recommendations(user_device_id uuid, limit_count integer DEFAULT 10)
RETURNS TABLE(
  id bigint,
  title text,
  director text,
  year integer,
  poster text,
  micro_genres text[],
  cinema_votes integer,
  not_cinema_votes integer,
  recommendation_score numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH user_preferences AS (
    SELECT 
      UNNEST(m.micro_genres) as preferred_genre,
      COUNT(*) as genre_count
    FROM verdicts v
    JOIN movies m ON v.movie_id = m.id
    WHERE v.device_id = user_device_id AND v.verdict_type = 'cinema'
    GROUP BY UNNEST(m.micro_genres)
    ORDER BY genre_count DESC
    LIMIT 3
  ),
  user_voted_movies AS (
    SELECT movie_id FROM verdicts WHERE device_id = user_device_id
  )
  SELECT 
    m.id, m.title, m.director, m.year, m.poster, m.micro_genres,
    m.cinema_votes, m.not_cinema_votes,
    (
      CASE 
        WHEN m.micro_genres && ARRAY(SELECT preferred_genre FROM user_preferences) 
        THEN (m.cinema_votes::float / NULLIF(m.cinema_votes + m.not_cinema_votes, 0)) * 2
        ELSE (m.cinema_votes::float / NULLIF(m.cinema_votes + m.not_cinema_votes, 0))
      END
    ) as recommendation_score
  FROM movies m
  WHERE m.id NOT IN (SELECT movie_id FROM user_voted_movies)
  ORDER BY recommendation_score DESC NULLS LAST, RANDOM()
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Materialized view for top cinema movies
CREATE MATERIALIZED VIEW IF NOT EXISTS top_cinema_movies AS
SELECT 
  m.*,
  (m.cinema_votes::float / NULLIF(m.cinema_votes + m.not_cinema_votes, 0)) as cinema_percentage,
  (m.cinema_votes + m.not_cinema_votes) as total_votes
FROM movies m
WHERE (m.cinema_votes + m.not_cinema_votes) > 0
ORDER BY cinema_percentage DESC, total_votes DESC;

-- Index on materialized view
CREATE INDEX IF NOT EXISTS idx_top_cinema_movies_percentage ON top_cinema_movies(cinema_percentage DESC);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_top_cinema_movies()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW top_cinema_movies;
END;
$$ LANGUAGE plpgsql;