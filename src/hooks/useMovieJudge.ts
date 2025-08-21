import { useState, useEffect, useCallback } from 'react';
import { findMovieByTitle, isMovieCinema, movies } from '../data/movies';

export interface MovieJudgeState {
  searchQuery: string;
  verdict: 'cinema' | 'not-cinema' | null;
  selectedMood: string;
  isLoading: boolean;
  error: string | null;
}

export interface MovieJudgeActions {
  handleSearchChange: (value: string) => void;
  handleSearch: () => void;
  handleVerdictSubmit: (verdict: 'cinema' | 'not-cinema') => void;
  handleMoodChange: (mood: string) => void;
  resetPanel: () => void;
  randomizeSelection: () => void;
  shareVerdict: () => Promise<void>;
}

const STORAGE_KEYS = {
  SEARCH_QUERY: 'cinema-search-query',
  VERDICT: 'cinema-verdict',
  SELECTED_MOOD: 'cinema-selected-mood',
} as const;

const DEFAULT_MOODS = [
  'Friday Night Laughs',
  'Slow Burn & Feels', 
  'Epic Action',
  'Indie Gems'
] as const;

export const useMovieJudge = () => {
  // Initialize state from localStorage
  const [state, setState] = useState<MovieJudgeState>(() => ({
    searchQuery: localStorage.getItem(STORAGE_KEYS.SEARCH_QUERY) || '',
    verdict: (localStorage.getItem(STORAGE_KEYS.VERDICT) as 'cinema' | 'not-cinema') || null,
    selectedMood: localStorage.getItem(STORAGE_KEYS.SELECTED_MOOD) || 'Friday Night Laughs',
    isLoading: false,
    error: null,
  }));

  // Persist state changes to localStorage
  useEffect(() => {
    if (state.searchQuery) {
      localStorage.setItem(STORAGE_KEYS.SEARCH_QUERY, state.searchQuery);
    } else {
      localStorage.removeItem(STORAGE_KEYS.SEARCH_QUERY);
    }
  }, [state.searchQuery]);

  useEffect(() => {
    if (state.verdict) {
      localStorage.setItem(STORAGE_KEYS.VERDICT, state.verdict);
    } else {
      localStorage.removeItem(STORAGE_KEYS.VERDICT);
    }
  }, [state.verdict]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_MOOD, state.selectedMood);
  }, [state.selectedMood]);

  // Actions
  const handleSearchChange = useCallback((value: string) => {
    setState(prev => ({
      ...prev,
      searchQuery: value,
      error: null,
    }));
  }, []);

  const handleSearch = useCallback(() => {
    if (!state.searchQuery.trim()) {
      setState(prev => ({
        ...prev,
        error: 'Please enter a movie title',
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const foundMovie = findMovieByTitle(state.searchQuery.trim());
      
      if (foundMovie) {
        const movieVerdict = isMovieCinema(foundMovie) ? 'cinema' : 'not-cinema';
        setState(prev => ({
          ...prev,
          verdict: movieVerdict,
          isLoading: false,
        }));
      } else {
        // Movie not found in database - reset verdict to allow user input
        setState(prev => ({
          ...prev,
          verdict: null,
          isLoading: false,
          error: 'Movie not found in our database. You can still judge it!',
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'An error occurred while searching. Please try again.',
      }));
    }
  }, [state.searchQuery]);

  const handleVerdictSubmit = useCallback((verdict: 'cinema' | 'not-cinema') => {
    setState(prev => ({
      ...prev,
      verdict,
      error: null,
    }));
  }, []);

  const handleMoodChange = useCallback((mood: string) => {
    setState(prev => ({
      ...prev,
      selectedMood: mood,
    }));
  }, []);

  const resetPanel = useCallback(() => {
    setState({
      searchQuery: '',
      verdict: null,
      selectedMood: 'Friday Night Laughs',
      isLoading: false,
      error: null,
    });
    
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEYS.SEARCH_QUERY);
    localStorage.removeItem(STORAGE_KEYS.VERDICT);
    localStorage.setItem(STORAGE_KEYS.SELECTED_MOOD, 'Friday Night Laughs');
  }, []);

  const randomizeSelection = useCallback(() => {
    const randomMood = DEFAULT_MOODS[Math.floor(Math.random() * DEFAULT_MOODS.length)];
    const randomMovie = movies[Math.floor(Math.random() * movies.length)];
    const movieVerdict = isMovieCinema(randomMovie) ? 'cinema' : 'not-cinema';
    
    setState({
      searchQuery: randomMovie.title,
      verdict: movieVerdict,
      selectedMood: randomMood,
      isLoading: false,
      error: null,
    });
  }, []);

  const shareVerdict = useCallback(async () => {
    if (!state.verdict || !state.searchQuery) {
      setState(prev => ({
        ...prev,
        error: 'Nothing to share yet. Search for a movie first!',
      }));
      return;
    }

    const verdictText = state.verdict === 'cinema' ? 'Cinema' : 'Not Quite Cinema';
    const shareText = `"${state.searchQuery}" is ${verdictText} - judged on Is It Cinema?`;
    
    try {
      if (navigator.share) {
        // Use native sharing if available
        await navigator.share({
          title: 'Is It Cinema?',
          text: shareText,
          url: window.location.href,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText);
        // You could show a toast notification here
        console.log('Verdict copied to clipboard!');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to share verdict. Please try again.',
      }));
    }
  }, [state.verdict, state.searchQuery]);

  const actions: MovieJudgeActions = {
    handleSearchChange,
    handleSearch,
    handleVerdictSubmit,
    handleMoodChange,
    resetPanel,
    randomizeSelection,
    shareVerdict,
  };

  return {
    ...state,
    ...actions,
    moods: DEFAULT_MOODS,
  };
};