import { useState, useEffect, useCallback } from 'react';
import { findMovieByTitle, isMovieCinema, getRandomMovie, submitMovieVerdict, hasUserAlreadyJudged, getUserVerdict, type Movie } from '../data/movies';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface MovieJudgeState {
  searchQuery: string;
  verdict: 'cinema' | 'not-cinema' | null;
  selectedMood: string;
  isLoading: boolean;
  error: string | null;
  currentMovie: Movie | null;
  isSubmittingVerdict: boolean;
  user: User | null;
  userEmail: string;
  isEmailVerificationSent: boolean;
  userVerdict: 'cinema' | 'not-cinema' | null;
  hasAlreadyJudged: boolean;
}

export interface MovieJudgeActions {
  handleSearchChange: (value: string) => void;
  handleSearch: () => void;
  handleVerdictSubmit: (verdict: 'cinema' | 'not-cinema') => Promise<void>;
  handleMoodChange: (mood: string) => void;
  resetPanel: () => void;
  randomizeSelection: () => void;
  shareVerdict: () => Promise<void>;
  handleEmailChange: (email: string) => void;
  sendVerificationEmail: () => Promise<void>;
  signOut: () => Promise<void>;
}

const STORAGE_KEYS = {
  SEARCH_QUERY: 'cinema-search-query',
  VERDICT: 'cinema-verdict',
  SELECTED_MOOD: 'cinema-selected-mood',
  USER_EMAIL: 'cinema-user-email',
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
    currentMovie: null,
    isSubmittingVerdict: false,
    user: null,
    userEmail: localStorage.getItem(STORAGE_KEYS.USER_EMAIL) || '',
    isEmailVerificationSent: false,
    userVerdict: null,
    hasAlreadyJudged: false,
  }));

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setState(prev => ({
        ...prev,
        user: session?.user || null,
        userEmail: session?.user?.email || prev.userEmail,
      }));

      if (session?.user?.email) {
        localStorage.setItem(STORAGE_KEYS.USER_EMAIL, session.user.email);
        
        // Check if user has already judged current movie
        if (state.currentMovie) {
          const hasJudged = await hasUserAlreadyJudged(session.user.email, state.currentMovie.id);
          const userVerdict = hasJudged ? await getUserVerdict(session.user.email, state.currentMovie.id) : null;
          
          setState(prev => ({
            ...prev,
            hasAlreadyJudged: hasJudged,
            userVerdict,
          }));
        }
      }
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({
        ...prev,
        user: session?.user || null,
        userEmail: session?.user?.email || prev.userEmail,
      }));
    });

    return () => subscription.unsubscribe();
  }, [state.currentMovie]);

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

  useEffect(() => {
    if (state.userEmail) {
      localStorage.setItem(STORAGE_KEYS.USER_EMAIL, state.userEmail);
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER_EMAIL);
    }
  }, [state.userEmail]);

  // Check user verdict when movie changes
  useEffect(() => {
    const checkUserVerdict = async () => {
      if (state.user?.email && state.currentMovie) {
        const hasJudged = await hasUserAlreadyJudged(state.user.email, state.currentMovie.id);
        const userVerdict = hasJudged ? await getUserVerdict(state.user.email, state.currentMovie.id) : null;
        
        setState(prev => ({
          ...prev,
          hasAlreadyJudged: hasJudged,
          userVerdict,
        }));
      }
    };

    checkUserVerdict();
  }, [state.user, state.currentMovie]);

  // Actions
  const handleSearchChange = useCallback((value: string) => {
    setState(prev => ({
      ...prev,
      searchQuery: value,
      error: null,
      verdict: null,
      currentMovie: null,
      hasAlreadyJudged: false,
    }));
  }, []);

  const handleSearch = useCallback(async () => {
    if (!state.searchQuery.trim()) {
      setState(prev => ({
        ...prev,
        error: 'Please enter a movie title',
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const foundMovie = await findMovieByTitle(state.searchQuery.trim());
      
      if (foundMovie) {
        const movieVerdict = isMovieCinema(foundMovie) ? 'cinema' : 'not-cinema';
        setState(prev => ({
          ...prev,
          verdict: movieVerdict,
          currentMovie: foundMovie,
          isLoading: false,
        }));
      } else {
        // Movie not found in database - reset verdict to allow user input
        setState(prev => ({
          ...prev,
          verdict: null,
          currentMovie: null,
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

  const handleVerdictSubmit = useCallback(async (verdict: 'cinema' | 'not-cinema') => {
    // Check if user is authenticated
    if (!state.user?.email) {
      setState(prev => ({
        ...prev,
        error: 'Please verify your email first to submit a verdict.',
      }));
      return;
    }

    // Check if user has already judged this movie
    if (state.hasAlreadyJudged) {
      setState(prev => ({
        ...prev,
        error: 'You have already submitted a verdict for this movie.',
      }));
      return;
    }

    if (!state.currentMovie) {
      // For movies not in database, just set the verdict locally
      setState(prev => ({
        ...prev,
        verdict,
        error: null,
      }));
      return;
    }

    setState(prev => ({ ...prev, isSubmittingVerdict: true, error: null }));

    try {
      const updatedMovie = await submitMovieVerdict(state.currentMovie.id, verdict, state.user.email);
      
      if (updatedMovie) {
        const newVerdict = isMovieCinema(updatedMovie) ? 'cinema' : 'not-cinema';
        setState(prev => ({
          ...prev,
          verdict: newVerdict,
          currentMovie: updatedMovie,
          isSubmittingVerdict: false,
          hasAlreadyJudged: true,
          userVerdict: verdict,
        }));
      } else {
        throw new Error('Failed to update movie verdict');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isSubmittingVerdict: false,
        error: error instanceof Error ? error.message : 'Failed to submit verdict. Please try again.',
      }));
    }
  }, [state.currentMovie, state.user, state.hasAlreadyJudged]);

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
      currentMovie: null,
      isSubmittingVerdict: false,
      user: null,
      userEmail: '',
      isEmailVerificationSent: false,
      userVerdict: null,
      hasAlreadyJudged: false,
    });
    
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEYS.SEARCH_QUERY);
    localStorage.removeItem(STORAGE_KEYS.VERDICT);
    localStorage.removeItem(STORAGE_KEYS.USER_EMAIL);
    localStorage.setItem(STORAGE_KEYS.SELECTED_MOOD, 'Friday Night Laughs');
    
    // Sign out user
    supabase.auth.signOut();
  }, []);

  const randomizeSelection = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const randomMood = DEFAULT_MOODS[Math.floor(Math.random() * DEFAULT_MOODS.length)];
      const randomMovie = await getRandomMovie();
      
      if (randomMovie) {
        const movieVerdict = isMovieCinema(randomMovie) ? 'cinema' : 'not-cinema';
        
        setState({
          searchQuery: randomMovie.title,
          verdict: movieVerdict,
          currentMovie: randomMovie,
          selectedMood: randomMood,
          isLoading: false,
          error: null,
          isSubmittingVerdict: false,
          hasAlreadyJudged: false,
          userVerdict: null,
        });
      } else {
        throw new Error('Failed to get random movie');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to get random movie. Please try again.',
      }));
    }
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

  const handleEmailChange = useCallback((email: string) => {
    setState(prev => ({
      ...prev,
      userEmail: email,
      error: null,
    }));
  }, []);

  const sendVerificationEmail = useCallback(async () => {
    if (!state.userEmail.trim()) {
      setState(prev => ({
        ...prev,
        error: 'Please enter your email address.',
      }));
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(state.userEmail)) {
      setState(prev => ({
        ...prev,
        error: 'Please enter a valid email address.',
      }));
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: state.userEmail,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        throw error;
      }

      setState(prev => ({
        ...prev,
        isEmailVerificationSent: true,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to send verification email.',
      }));
    }
  }, [state.userEmail]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setState(prev => ({
        ...prev,
        user: null,
        userEmail: '',
        isEmailVerificationSent: false,
        userVerdict: null,
        hasAlreadyJudged: false,
        error: null,
      }));
      localStorage.removeItem(STORAGE_KEYS.USER_EMAIL);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, []);

  const actions: MovieJudgeActions = {
    handleSearchChange,
    handleSearch,
    handleVerdictSubmit,
    handleMoodChange,
    resetPanel,
    randomizeSelection,
    shareVerdict,
    handleEmailChange,
    sendVerificationEmail,
    signOut,
  };

  return {
    ...state,
    ...actions,
    moods: DEFAULT_MOODS,
  };
};