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
export const submitMovieVerdict = async (movieId: number, verdict: 'cinema' | 'not-cinema'): Promise<Movie | null> => {
  try {
    // Use the database function to safely increment the verdict count
    const { error: functionError } = await supabase.rpc('increment_movie_verdict', {
      movie_id: movieId,
      verdict_type: verdict
    });

    if (functionError) {
      console.error('Error submitting verdict:', functionError);
      throw functionError;
    }

    // Fetch and return the updated movie data
    return await fetchMovieById(movieId);
  } catch (error) {
    console.error('Failed to submit verdict:', error);
    throw error;
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