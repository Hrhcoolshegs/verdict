```sql
-- UP Migration
-- Create set_updated_at function for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create public.movies table
CREATE TABLE IF NOT EXISTS public.movies (
    id bigint PRIMARY KEY,
    title text NOT NULL,
    director text NOT NULL,
    year int NOT NULL,
    poster text,
    plot text,
    runtime_minutes int,
    budget_usd bigint,
    aspect_ratio text,
    camera_equipment jsonb DEFAULT '{}'::jsonb,
    filming_locations jsonb DEFAULT '[]'::jsonb,
    cinematography_techniques jsonb DEFAULT '[]'::jsonography,
    micro_genres jsonb DEFAULT '[]'::jsonb,
    controversies jsonb DEFAULT '{}'::jsonb,
    cultural_movements jsonb DEFAULT '[]'::jsonb,
    cultural_influence jsonb DEFAULT '{}'::jsonb,
    academic_analysis jsonb DEFAULT '{}'::jsonb,
    awards int,
    technical_craftsmanship int,
    narrative_depth int,
    artistic_ambition int,
    ai_rationale text,
    critical_evolution jsonb DEFAULT '{}'::jsonb,
    dominant_colors jsonb DEFAULT '{}'::jsonb,
    cinema_votes int DEFAULT 0,
    not_cinema_votes int DEFAULT 0,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create public.movies_staging table (for CSV import)
CREATE TABLE IF NOT EXISTS public.movies_staging (
    id bigint PRIMARY KEY,
    title text NOT NULL,
    director text NOT NULL,
    year int NOT NULL,
    poster text,
    plot text,
    runtime_minutes int,
    budget_usd bigint,
    aspect_ratio text,
    camera_equipment jsonb DEFAULT '{}'::jsonb,
    filming_locations jsonb DEFAULT '[]'::jsonb,
    cinematography_techniques jsonb DEFAULT '[]'::jsonb,
    micro_genres jsonb DEFAULT '[]'::jsonb,
    controversies jsonb DEFAULT '{}'::jsonb,
    cultural_movements jsonb DEFAULT '[]'::jsonb,
    cultural_influence jsonb DEFAULT '{}'::jsonb,
    academic_analysis jsonb DEFAULT '{}'::jsonb,
    awards int,
    technical_craftsmanship int,
    narrative_depth int,
    artistic_ambition int,
    ai_rationale text,
    critical_evolution jsonb DEFAULT '{}'::jsonb,
    dominant_colors jsonb DEFAULT '{}'::jsonb,
    cinema_votes int DEFAULT 0,
    not_cinema_votes int DEFAULT 0,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add constraints and indexes for public.movies
CREATE UNIQUE INDEX IF NOT EXISTS movies_title_year_key ON public.movies (title, year);
CREATE INDEX IF NOT EXISTS idx_movies_year ON public.movies USING btree (year);

-- GIN indexes for jsonb arrays (for filtering/tags)
CREATE INDEX IF NOT EXISTS idx_movies_micro_genres ON public.movies USING gin (micro_genres);
CREATE INDEX IF NOT EXISTS idx_movies_filming_locations ON public.movies USING gin (filming_locations);
CREATE INDEX IF NOT EXISTS idx_movies_cinematography_techniques ON public.movies USING gin (cinematography_techniques);
CREATE INDEX IF NOT EXISTS idx_movies_cultural_movements ON public.movies USING gin (cultural_movements);

-- GIN indexes for jsonb objects (using jsonb_path_ops)
CREATE INDEX IF NOT EXISTS idx_movies_camera_equipment_jsonb_path_ops ON public.movies USING gin (camera_equipment jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_movies_critical_evolution_jsonb_path_ops ON public.movies USING gin (critical_evolution jsonb_path_ops);

-- Optional: Add a trigram index on title for fuzzy search (uncomment if pg_trgm extension is enabled)
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CREATE INDEX IF NOT EXISTS idx_movies_title_trgm ON public.movies USING gin (title gin_trgm_ops);

-- Add trigger to update 'updated_at' column on public.movies
CREATE TRIGGER set_updated_at_movies
BEFORE UPDATE ON public.movies
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- RLS policies (commented out - enable if needed based on project settings)
-- Note: The schema indicates RLS is already enabled for the 'movies' table.
-- ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;

-- Policy for anonymous and authenticated users to select movies
-- CREATE POLICY "Movies are viewable by everyone" ON public.movies
-- FOR SELECT USING (true);

-- Policy for service role to manage all movie data
-- CREATE POLICY "Service role can manage all movie data" ON public.movies
-- FOR ALL USING (role() = 'service_role'::text) WITH CHECK (role() = 'service_role'::text);


-- DOWN Migration
-- Drop trigger
DROP TRIGGER IF EXISTS set_updated_at_movies ON public.movies;

-- Drop indexes
DROP INDEX IF EXISTS movies_title_year_key;
DROP INDEX IF EXISTS idx_movies_year;
DROP INDEX IF EXISTS idx_movies_micro_genres;
DROP INDEX IF EXISTS idx_movies_filming_locations;
DROP INDEX IF EXISTS idx_movies_cinematography_techniques;
DROP INDEX IF EXISTS idx_movies_cultural_movements;
DROP INDEX IF EXISTS idx_movies_camera_equipment_jsonb_path_ops;
DROP INDEX IF EXISTS idx_movies_critical_evolution_jsonb_path_ops;
-- DROP INDEX IF EXISTS idx_movies_title_trgm;

-- Drop tables
DROP TABLE IF EXISTS public.movies_staging;
DROP TABLE IF EXISTS public.movies;

-- Drop set_updated_at function
DROP FUNCTION IF EXISTS public.set_updated_at();
```