import { useState, useEffect, useCallback } from 'react';
import type { Movie } from '../data/movies';

export interface PersonalVerdict {
  movieId: number;
  movieTitle: string;
  verdict: 'cinema' | 'not-cinema';
  timestamp: number;
  confidence?: number;
  reasoning?: string;
}

export interface TasteProfile {
  preferredGenres: string[];
  preferredDirectors: string[];
  preferredEras: string[];
  cinemaPercentage: number;
  totalVerdicts: number;
  averageConfidence: number;
}

export interface PersonalStats {
  totalMoviesJudged: number;
  cinemaVerdicts: number;
  notCinemaVerdicts: number;
  cinemaPercentage: number;
  favoriteGenres: string[];
  favoriteDirectors: string[];
  favoriteEras: string[];
  judgingStreak: number;
  lastJudgedDate: string | null;
  averageConfidence: number;
}

export interface BlindSpot {
  movieId: number;
  title: string;
  director: string;
  year: number;
  importance: 'essential' | 'important' | 'recommended';
  reason: string;
}

const STORAGE_KEYS = {
  VERDICTS: 'verdict-personal-verdicts',
  TASTE_PROFILE: 'verdict-taste-profile',
  LAST_UPDATE: 'verdict-last-update',
} as const;

export const usePersonalJourney = () => {
  const [verdicts, setVerdicts] = useState<PersonalVerdict[]>([]);
  const [tasteProfile, setTasteProfile] = useState<TasteProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const storedVerdicts = localStorage.getItem(STORAGE_KEYS.VERDICTS);
      const storedProfile = localStorage.getItem(STORAGE_KEYS.TASTE_PROFILE);

      if (storedVerdicts) {
        setVerdicts(JSON.parse(storedVerdicts));
      }

      if (storedProfile) {
        setTasteProfile(JSON.parse(storedProfile));
      }
    } catch (error) {
      console.error('Error loading personal journey data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save verdicts to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEYS.VERDICTS, JSON.stringify(verdicts));
      localStorage.setItem(STORAGE_KEYS.LAST_UPDATE, Date.now().toString());
    }
  }, [verdicts, isLoading]);

  // Update taste profile whenever verdicts change
  useEffect(() => {
    if (verdicts.length > 0) {
      const profile = calculateTasteProfile(verdicts);
      setTasteProfile(profile);
      localStorage.setItem(STORAGE_KEYS.TASTE_PROFILE, JSON.stringify(profile));
    }
  }, [verdicts]);

  const addVerdict = useCallback((
    movie: Movie,
    verdict: 'cinema' | 'not-cinema',
    confidence: number = 5,
    reasoning?: string
  ) => {
    const newVerdict: PersonalVerdict = {
      movieId: movie.id,
      movieTitle: movie.title,
      verdict,
      timestamp: Date.now(),
      confidence,
      reasoning,
    };

    setVerdicts(prev => {
      // Remove any existing verdict for this movie
      const filtered = prev.filter(v => v.movieId !== movie.id);
      return [...filtered, newVerdict].sort((a, b) => b.timestamp - a.timestamp);
    });
  }, []);

  const getPersonalVerdict = useCallback((movieId: number): PersonalVerdict | null => {
    return verdicts.find(v => v.movieId === movieId) || null;
  }, [verdicts]);

  const getPersonalStats = useCallback((): PersonalStats => {
    const cinemaVerdicts = verdicts.filter(v => v.verdict === 'cinema').length;
    const notCinemaVerdicts = verdicts.filter(v => v.verdict === 'not-cinema').length;
    const totalMoviesJudged = verdicts.length;

    // Calculate favorite genres, directors, and eras
    // Note: This would need movie data to be fully accurate
    const favoriteGenres = ['Drama', 'Thriller', 'Sci-Fi']; // Placeholder
    const favoriteDirectors = ['Christopher Nolan', 'Denis Villeneuve']; // Placeholder
    const favoriteEras = ['2000s', '2010s']; // Placeholder

    // Calculate judging streak
    const sortedVerdicts = [...verdicts].sort((a, b) => b.timestamp - a.timestamp);
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const verdict of sortedVerdicts) {
      const verdictDate = new Date(verdict.timestamp);
      verdictDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((currentDate.getTime() - verdictDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }

    const averageConfidence = verdicts.length > 0 
      ? verdicts.reduce((sum, v) => sum + (v.confidence || 5), 0) / verdicts.length
      : 0;

    return {
      totalMoviesJudged,
      cinemaVerdicts,
      notCinemaVerdicts,
      cinemaPercentage: totalMoviesJudged > 0 ? Math.round((cinemaVerdicts / totalMoviesJudged) * 100) : 0,
      favoriteGenres,
      favoriteDirectors,
      favoriteEras,
      judgingStreak: streak,
      lastJudgedDate: sortedVerdicts.length > 0 ? new Date(sortedVerdicts[0].timestamp).toLocaleDateString() : null,
      averageConfidence: Math.round(averageConfidence * 10) / 10,
    };
  }, [verdicts]);

  const getRecommendations = useCallback((allMovies: Movie[]): Movie[] => {
    if (verdicts.length < 3) {
      // Not enough data for personalized recommendations
      return allMovies.slice(0, 5);
    }

    // Simple recommendation based on cinema percentage and genres
    const cinemaMovies = verdicts.filter(v => v.verdict === 'cinema');
    const userCinemaPercentage = (cinemaMovies.length / verdicts.length) * 100;

    // Recommend movies with similar cinema percentage
    const recommended = allMovies
      .filter(movie => {
        const hasJudged = verdicts.some(v => v.movieId === movie.id);
        if (hasJudged) return false;

        const movieCinemaPercentage = movie.cinemaVotes + movie.notCinemaVotes > 0
          ? (movie.cinemaVotes / (movie.cinemaVotes + movie.notCinemaVotes)) * 100
          : 50;

        // Recommend movies within 20% of user's taste
        return Math.abs(movieCinemaPercentage - userCinemaPercentage) <= 20;
      })
      .slice(0, 10);

    return recommended;
  }, [verdicts]);

  const getBlindSpots = useCallback((allMovies: Movie[]): BlindSpot[] => {
    const judgedMovieIds = new Set(verdicts.map(v => v.movieId));
    
    // Define important films that users should judge
    const importantFilms = allMovies
      .filter(movie => !judgedMovieIds.has(movie.id))
      .filter(movie => {
        // High vote count indicates importance
        const totalVotes = movie.cinemaVotes + movie.notCinemaVotes;
        return totalVotes > 50;
      })
      .map(movie => ({
        movieId: movie.id,
        title: movie.title,
        director: movie.director,
        year: movie.year,
        importance: 'important' as const,
        reason: 'Highly discussed film in the community',
      }))
      .slice(0, 5);

    return importantFilms;
  }, [verdicts]);

  const clearAllData = useCallback(() => {
    setVerdicts([]);
    setTasteProfile(null);
    localStorage.removeItem(STORAGE_KEYS.VERDICTS);
    localStorage.removeItem(STORAGE_KEYS.TASTE_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.LAST_UPDATE);
  }, []);

  const exportData = useCallback(() => {
    const data = {
      verdicts,
      tasteProfile,
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verdict-personal-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [verdicts, tasteProfile]);

  return {
    verdicts,
    tasteProfile,
    isLoading,
    addVerdict,
    getPersonalVerdict,
    getPersonalStats,
    getRecommendations,
    getBlindSpots,
    clearAllData,
    exportData,
  };
};

// Helper function to calculate taste profile
const calculateTasteProfile = (verdicts: PersonalVerdict[]): TasteProfile => {
  const cinemaVerdicts = verdicts.filter(v => v.verdict === 'cinema');
  const totalVerdicts = verdicts.length;
  const cinemaPercentage = totalVerdicts > 0 ? (cinemaVerdicts.length / totalVerdicts) * 100 : 0;

  // Calculate average confidence
  const averageConfidence = verdicts.length > 0
    ? verdicts.reduce((sum, v) => sum + (v.confidence || 5), 0) / verdicts.length
    : 0;

  // Placeholder data - in a real implementation, this would analyze actual movie data
  const preferredGenres = ['Drama', 'Thriller', 'Sci-Fi'];
  const preferredDirectors = ['Christopher Nolan', 'Denis Villeneuve'];
  const preferredEras = ['2000s', '2010s'];

  return {
    preferredGenres,
    preferredDirectors,
    preferredEras,
    cinemaPercentage: Math.round(cinemaPercentage),
    totalVerdicts,
    averageConfidence: Math.round(averageConfidence * 10) / 10,
  };
};