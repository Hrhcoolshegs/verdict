import { supabase } from '../lib/supabase';
import type { EnhancedMovie, transformDbRowToEnhancedMovie } from '../utils/movieSeeder';

// Re-export the enhanced movie interface
export type Movie = EnhancedMovie;

// Use the enhanced transformer
const transformDbRowToMovie = transformDbRowToEnhancedMovie;

// Fetch all movies from Supabase
export const fetchMovies = async (): Promise<Movie[]> => {
  try {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('id');

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

// Fetch a single movie by ID
export const fetchMovieById = async (id: number): Promise<Movie | null> => {
  try {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
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

// Search for movies by title
export const searchMoviesByTitle = async (title: string): Promise<Movie[]> => {
  try {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .ilike('title', `%${title}%`)
      .order('cinema_votes', { ascending: false })
      .limit(10);

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

// Record user verdict with email (this now handles both user tracking and vote counting)
export const recordUserVerdict = async (userEmail: string, movieId: number, verdict: 'cinema' | 'not-cinema'): Promise<{ success: boolean; error?: string; message?: string; movie?: Movie }> => {
  try {
    const { data: result, error: functionError } = await supabase.rpc('record_user_verdict', {
      p_user_email: userEmail,
      p_movie_id: movieId,
      p_verdict_type: verdict
    });

    if (functionError) {
      console.error('Error recording verdict:', functionError);
      return {
        success: false,
        error: 'Failed to record verdict. Please try again.'
      };
    }

    if (result && !result.success) {
      return {
        success: false,
        error: result.error || 'Failed to record verdict'
      };
    }

    // Fetch updated movie data
    const updatedMovie = await fetchMovieById(movieId);
    
    return {
      success: true,
      message: result?.message || 'Verdict recorded successfully!',
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

// Check if user has already judged a movie
export const hasUserAlreadyJudged = async (userEmail: string, movieId: number): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('has_user_already_judged', {
      p_user_email: userEmail,
      p_movie_id: movieId
    });

    if (error) {
      console.error('Error checking user verdict:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Failed to check user verdict:', error);
    return false;
  }
};

// Get user's verdict for a movie
export const getUserVerdict = async (userEmail: string, movieId: number): Promise<'cinema' | 'not-cinema' | null> => {
  try {
    const { data, error } = await supabase.rpc('get_user_verdict', {
      p_user_email: userEmail,
      p_movie_id: movieId
    });

    if (error) {
      console.error('Error getting user verdict:', error);
      return null;
    }

    return data as 'cinema' | 'not-cinema' | null;
  } catch (error) {
    console.error('Failed to get user verdict:', error);
    return null;
  }
};

// Get a random movie
export const getRandomMovie = async (): Promise<Movie | null> => {
  try {
    // Get total count first
    const { count, error: countError } = await supabase
      .from('movies')
      .select('*', { count: 'exact', head: true });

    if (countError || !count) {
      console.error('Error getting movie count:', countError);
      return null;
    }

    // Get a random offset
    const randomOffset = Math.floor(Math.random() * count);

    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .range(randomOffset, randomOffset)
      .single();

    if (error) {
      console.error('Error fetching random movie:', error);
      return null;
    }

    return data ? transformDbRowToMovie(data) : null;
  } catch (error) {
    console.error('Failed to get random movie:', error);
    return null;
  }
};

export const calculateCinemaPercentage = (movie: Movie): number => {
  const totalVotes = movie.cinemaVotes + movie.notCinemaVotes;
  if (totalVotes === 0) return 0;
  return Math.round((movie.cinemaVotes / totalVotes) * 100);
};

export const isMovieCinema = (movie: Movie): boolean => {
  return calculateCinemaPercentage(movie) >= 79;
};

export const findMovieByTitle = async (title: string): Promise<Movie | undefined> => {
  const movies = await searchMoviesByTitle(title);
  return movies.find(movie => 
    movie.title.toLowerCase().includes(title.toLowerCase()) ||
    title.toLowerCase().includes(movie.title.toLowerCase())
  );
};