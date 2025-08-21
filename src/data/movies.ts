import { supabase } from '../lib/supabase';

export interface Movie {
  id: number;
  title: string;
  director: string;
  year: number;
  poster: string;
  cinemaVotes: number;
  notCinemaVotes: number;
}

// Transform database row to Movie interface
const transformDbRowToMovie = (row: any): Movie => ({
  id: row.id,
  title: row.title,
  director: row.director,
  year: row.year,
  poster: row.poster,
  cinemaVotes: row.cinema_votes,
  notCinemaVotes: row.not_cinema_votes,
});

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

// Submit a verdict for a movie
export const submitMovieVerdict = async (movieId: number, verdict: 'cinema' | 'not-cinema', userEmail?: string): Promise<Movie | null> => {
  try {
    if (userEmail) {
      // Use the new function that records user verdict and prevents duplicates
      const { data: result, error: functionError } = await supabase.rpc('record_user_verdict', {
        p_user_email: userEmail,
        p_movie_id: movieId,
        p_verdict_type: verdict
      });

      if (functionError) {
        console.error('Error submitting verdict:', functionError);
        throw functionError;
      }

      if (result && !result.success) {
        throw new Error(result.error || 'Failed to submit verdict');
      }
    } else {
      // Fallback to old method for backward compatibility
      const { error: functionError } = await supabase.rpc('increment_movie_verdict', {
        movie_id: movieId,
        verdict_type: verdict
      });

      if (functionError) {
        console.error('Error submitting verdict:', functionError);
        throw functionError;
      }
    }

    // Fetch and return the updated movie data
    return await fetchMovieById(movieId);
  } catch (error) {
    console.error('Failed to submit verdict:', error);
    throw error;
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