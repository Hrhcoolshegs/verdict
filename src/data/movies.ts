import { supabase } from '../lib/supabase';

export interface Movie {
  id: number;
  title: string;
  director: string;
  year: number;
  poster: string;
  plot?: string;
  runtime_minutes?: number;
  budget_usd?: number;
  aspect_ratio?: string;
  camera_equipment?: any;
  filming_locations?: string[];
  cinematography_techniques?: string[];
  micro_genres?: string[];
  controversies?: any;
  cultural_movements?: string[];
  cultural_influence?: any;
  academic_analysis?: any;
  awards?: any;
  technical_craftsmanship?: number;
  narrative_depth?: number;
  artistic_ambition?: number;
  ai_rationale?: string;
  critical_evolution?: any;
  dominant_colors?: any;
  cinemaVotes: number;
  notCinemaVotes: number;
  created_at?: string;
  updated_at?: string;
}

export interface CastCrewMember {
  id: string;
  name: string;
  birth_year?: number;
  nationality?: string;
  biography?: string;
  filmography?: any;
  awards?: any;
  role_type?: string;
  character_name?: string;
  billing_order?: number;
}

export interface MovieCollection {
  id: string;
  name: string;
  description?: string;
  collection_type: string;
  movie_ids?: number[];
  display_order: number;
  is_active: boolean;
}

export interface CinemaQuote {
  id: string;
  quote_text: string;
  author: string;
  author_role?: string;
  context?: string;
  movie_id?: number;
  quote_category?: string;
}

export interface PersonalJourney {
  tasteTrend: string[];
  blindSpots: string[];
  verdictHistory: Array<{
    movieId: number;
    verdict: 'cinema' | 'not-cinema';
    confidence: number;
    timestamp: string;
  }>;
  recommendedNext: string[];
  totalVerdicts: number;
  cinemaPercentage: number;
  favoriteGenres: string[];
  averageConfidence: number;
}

// Transform database row to Movie interface
const transformDbRowToMovie = (row: any): Movie => ({
  id: row.id,
  title: row.title,
  director: row.director,
  year: row.year,
  poster: row.poster,
  plot: row.plot,
  runtime_minutes: row.runtime_minutes,
  budget_usd: row.budget_usd,
  aspect_ratio: row.aspect_ratio,
  camera_equipment: row.camera_equipment,
  filming_locations: row.filming_locations,
  cinematography_techniques: row.cinematography_techniques,
  micro_genres: row.micro_genres,
  controversies: row.controversies,
  cultural_movements: row.cultural_movements,
  cultural_influence: row.cultural_influence,
  academic_analysis: row.academic_analysis,
  awards: row.awards,
  technical_craftsmanship: row.technical_craftsmanship,
  narrative_depth: row.narrative_depth,
  artistic_ambition: row.artistic_ambition,
  ai_rationale: row.ai_rationale,
  critical_evolution: row.critical_evolution,
  dominant_colors: row.dominant_colors,
  cinemaVotes: row.cinema_votes,
  notCinemaVotes: row.not_cinema_votes,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

// Generate unique device ID for anonymous tracking
export const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('verdict_device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('verdict_device_id', deviceId);
  }
  return deviceId;
};

// Personal journey management
export const getPersonalJourney = (): PersonalJourney => {
  const stored = localStorage.getItem('verdict_personal_journey');
  if (stored) {
    return JSON.parse(stored);
  }
  
  const defaultJourney: PersonalJourney = {
    tasteTrend: [],
    blindSpots: [],
    verdictHistory: [],
    recommendedNext: [],
    totalVerdicts: 0,
    cinemaPercentage: 0,
    favoriteGenres: [],
    averageConfidence: 0,
  };
  
  localStorage.setItem('verdict_personal_journey', JSON.stringify(defaultJourney));
  return defaultJourney;
};

export const updatePersonalJourney = (update: Partial<PersonalJourney>): PersonalJourney => {
  const current = getPersonalJourney();
  const updated = { ...current, ...update };
  localStorage.setItem('verdict_personal_journey', JSON.stringify(updated));
  return updated;
};

export const addVerdictToJourney = (movieId: number, movie: Movie, verdict: 'cinema' | 'not-cinema', confidence: number = 3): PersonalJourney => {
  const journey = getPersonalJourney();
  
  // Add to verdict history
  const newVerdict = {
    movieId,
    verdict,
    confidence,
    timestamp: new Date().toISOString(),
  };
  
  journey.verdictHistory.push(newVerdict);
  journey.totalVerdicts = journey.verdictHistory.length;
  
  // Calculate cinema percentage
  const cinemaVerdicts = journey.verdictHistory.filter(v => v.verdict === 'cinema').length;
  journey.cinemaPercentage = Math.round((cinemaVerdicts / journey.totalVerdicts) * 100);
  
  // Update favorite genres
  if (movie.micro_genres) {
    const genreCounts: Record<string, number> = {};
    journey.verdictHistory.forEach(v => {
      // This would need movie data to get genres, simplified for now
      if (v.movieId === movieId && movie.micro_genres) {
        movie.micro_genres.forEach(genre => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      }
    });
    
    journey.favoriteGenres = Object.entries(genreCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([genre]) => genre);
  }
  
  // Calculate average confidence
  journey.averageConfidence = Math.round(
    journey.verdictHistory.reduce((sum, v) => sum + v.confidence, 0) / journey.totalVerdicts
  );
  
  // Update taste trend analysis
  if (journey.totalVerdicts >= 5) {
    const recentVerdicts = journey.verdictHistory.slice(-10);
    const recentCinemaRate = recentVerdicts.filter(v => v.verdict === 'cinema').length / recentVerdicts.length;
    
    if (recentCinemaRate > 0.7) {
      journey.tasteTrend = ['arthouse-leaning', 'quality-focused'];
    } else if (recentCinemaRate < 0.3) {
      journey.tasteTrend = ['commercial-skeptical', 'critical-viewer'];
    } else {
      journey.tasteTrend = ['balanced-perspective', 'open-minded'];
    }
  }
  
  return updatePersonalJourney(journey);
};

// Fetch all movies from Supabase
export const fetchMovies = async (): Promise<Movie[]> => {
  try {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('cinema_votes', { ascending: false });

    if (error) {
      console.error('Error fetching movies:', error);
      throw error;
    }

    return data?.map(transformDbRowToMovie) || [];
  } catch (error) {
    console.error('Failed to fetch movies:', error);
    return [];
  }
};

// Fetch a single movie by ID with cast/crew
export const fetchMovieById = async (id: number): Promise<Movie | null> => {
  try {
    const { data, error } = await supabase
      .from('movies')
      .select(`
        *,
        movie_cast_crew!inner(
          role_type,
          character_name,
          billing_order,
          cast_crew!inner(
            name,
            birth_year,
            nationality,
            biography
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching movie by ID:', error);
      return null;
    }

    return data ? transformDbRowToMovie(data) : null;
  } catch (error) {
    console.error('Failed to fetch movie by ID:', error);
    return null;
  }
};

// Search for movies with advanced filtering
export const searchMovies = async (
  query: string,
  filters?: {
    genres?: string[];
    yearRange?: [number, number];
    minRating?: number;
    controversyLevel?: string;
  }
): Promise<Movie[]> => {
  try {
    let queryBuilder = supabase
      .from('movies')
      .select('*')
      .order('cinema_votes', { ascending: false })
      .limit(20);

    if (query.trim()) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,director.ilike.%${query}%`);
    }

    if (filters?.genres && filters.genres.length > 0) {
      queryBuilder = queryBuilder.overlaps('micro_genres', filters.genres);
    }

    if (filters?.yearRange) {
      queryBuilder = queryBuilder
        .gte('year', filters.yearRange[0])
        .lte('year', filters.yearRange[1]);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error('Error searching movies:', error);
      throw error;
    }

    return data?.map(transformDbRowToMovie) || [];
  } catch (error) {
    console.error('Failed to search movies:', error);
    return [];
  }
};

// Record anonymous verdict
export const recordUserVerdict = async (
  movieId: number,
  verdict: 'cinema' | 'not-cinema',
  confidence: number = 3,
  reasoning?: string
): Promise<{ success: boolean; error?: string; movie?: Movie }> => {
  try {
    const deviceId = getDeviceId();
    
    // Check if device has already voted for this movie
    const { data: existingVerdict } = await supabase
      .from('verdicts')
      .select('id')
      .eq('movie_id', movieId)
      .eq('device_id', deviceId)
      .single();

    if (existingVerdict) {
      return {
        success: false,
        error: 'You have already cast your verdict for this movie.'
      };
    }

    // Insert new verdict
    const { error: insertError } = await supabase
      .from('verdicts')
      .insert({
        movie_id: movieId,
        verdict_type: verdict,
        device_id: deviceId,
        confidence_level: confidence,
        reasoning: reasoning
      });

    if (insertError) {
      console.error('Error recording verdict:', insertError);
      return {
        success: false,
        error: 'Failed to record verdict. Please try again.'
      };
    }

    // Fetch updated movie data
    const updatedMovie = await fetchMovieById(movieId);
    
    return {
      success: true,
      movie: updatedMovie
    };
  } catch (error) {
    console.error('Failed to record verdict:', error);
    return {
      success: false,
      error: 'Failed to record verdict. Please try again.'
    };
  }
};

// Check if device has already voted for a movie
export const hasUserAlreadyJudged = async (movieId: number): Promise<boolean> => {
  try {
    const deviceId = getDeviceId();
    const { data, error } = await supabase
      .from('verdicts')
      .select('id')
      .eq('movie_id', movieId)
      .eq('device_id', deviceId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking device vote:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Failed to check device vote:', error);
    return false;
  }
};

// Get device's verdict for a movie
export const getUserVerdict = async (movieId: number): Promise<'cinema' | 'not-cinema' | null> => {
  try {
    const deviceId = getDeviceId();
    const { data, error } = await supabase
      .from('verdicts')
      .select('verdict_type')
      .eq('movie_id', movieId)
      .eq('device_id', deviceId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error getting device verdict:', error);
      return null;
    }

    return data?.verdict_type as 'cinema' | 'not-cinema' | null;
  } catch (error) {
    console.error('Failed to get device verdict:', error);
    return null;
  }
};

// Find movie by title
export const findMovieByTitle = async (title: string): Promise<Movie | null> => {
  try {
    const results = await searchMovies(title);
    return results.find(movie => 
      movie.title.toLowerCase() === title.toLowerCase()
    ) || null;
  } catch (error) {
    console.error('Failed to find movie by title:', error);
    return null;
  }
};

// Get random movie using Supabase function
export const getRandomMovie = async (): Promise<Movie | null> => {
  try {
    const { data, error } = await supabase.rpc('get_random_movie');

    if (error) {
      console.error('Error fetching random movie:', error);
      return null;
    }

    return data && data.length > 0 ? transformDbRowToMovie(data[0]) : null;
  } catch (error) {
    console.error('Failed to get random movie:', error);
    return null;
  }
};

// Get personalized recommendations
export const getPersonalizedRecommendations = async (limit: number = 10): Promise<Movie[]> => {
  try {
    const deviceId = getDeviceId();
    const { data, error } = await supabase.rpc('get_personalized_recommendations', {
      user_device_id: deviceId,
      limit_count: limit
    });

    if (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }

    return data?.map(transformDbRowToMovie) || [];
  } catch (error) {
    console.error('Failed to get recommendations:', error);
    return [];
  }
};

// Fetch movie collections
export const fetchMovieCollections = async (): Promise<MovieCollection[]> => {
  try {
    const { data, error } = await supabase
      .from('movie_collections')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (error) {
      console.error('Error fetching collections:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch collections:', error);
    return [];
  }
};

// Fetch movies from a collection
export const fetchMoviesFromCollection = async (collectionId: string): Promise<Movie[]> => {
  try {
    const { data: collection, error: collectionError } = await supabase
      .from('movie_collections')
      .select('movie_ids')
      .eq('id', collectionId)
      .single();

    if (collectionError || !collection?.movie_ids) {
      return [];
    }

    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .in('id', collection.movie_ids);

    if (error) {
      console.error('Error fetching collection movies:', error);
      return [];
    }

    return data?.map(transformDbRowToMovie) || [];
  } catch (error) {
    console.error('Failed to fetch collection movies:', error);
    return [];
  }
};

// Fetch random cinema quote
export const getRandomCinemaQuote = async (): Promise<CinemaQuote | null> => {
  try {
    const { data, error } = await supabase
      .from('cinema_quotes')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching cinema quote:', error);
      return null;
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Failed to get cinema quote:', error);
    return null;
  }
};

// Calculate cinema percentage
export const calculateCinemaPercentage = (movie: Movie): number => {
  const totalVotes = movie.cinemaVotes + movie.notCinemaVotes;
  if (totalVotes === 0) return 0;
  return Math.round((movie.cinemaVotes / totalVotes) * 100);
};

// Determine if movie is considered "Cinema"
export const isMovieCinema = (movie: Movie): boolean => {
  return calculateCinemaPercentage(movie) >= 70; // Adjusted threshold
};

// Get verdict confidence color
export const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 4) return '#00E0FF'; // High confidence - cyan
  if (confidence >= 3) return '#00BFFF'; // Medium confidence - blue
  return '#87CEEB'; // Low confidence - light blue
};

// Format runtime for display
export const formatRuntime = (minutes?: number): string => {
  if (!minutes) return 'Runtime unknown';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

// Format budget for display
export const formatBudget = (budget?: number): string => {
  if (!budget) return 'Budget unknown';
  if (budget >= 1000000000) return `$${(budget / 1000000000).toFixed(1)}B`;
  if (budget >= 1000000) return `$${(budget / 1000000).toFixed(1)}M`;
  if (budget >= 1000) return `$${(budget / 1000).toFixed(0)}K`;
  return `$${budget}`;
};

// Get genre color for UI theming
export const getGenreColor = (genre: string): string => {
  const genreColors: Record<string, string> = {
    'Drama': '#FF6B6B',
    'Comedy': '#4ECDC4',
    'Action': '#45B7D1',
    'Thriller': '#96CEB4',
    'Horror': '#FFEAA7',
    'Sci-Fi': '#DDA0DD',
    'Romance': '#FFB6C1',
    'Documentary': '#F0E68C',
    'Animation': '#98D8C8',
    'Crime': '#F7DC6F',
    'Neo-noir': '#2C3E50',
    'Mumblecore': '#E8F8F5',
    'Giallo': '#F39C12',
  };
  
  return genreColors[genre] || '#00E0FF';
};