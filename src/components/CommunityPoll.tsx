import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Trophy, Medal, Award, TrendingUp, TrendingDown, Users, Star } from 'lucide-react';
import { fetchMovies, calculateCinemaPercentage, isMovieCinema, recordUserVerdict, hasUserAlreadyJudged, getUserVerdict, type Movie } from '../data/movies';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import MovieDetailsModal from './MovieDetailsModal';
import LazyImage from './LazyImage';

const CommunityPoll: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'cinema' | 'not-cinema'>('all');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingVerdict, setIsSubmittingVerdict] = useState(false);
  const [verdictFeedback, setVerdictFeedback] = useState<{ movieId: number; message: string } | null>(null);
  const moviesPerPage = 12;
  const [user, setUser] = useState<User | null>(null);
  const [userVerdicts, setUserVerdicts] = useState<Record<number, 'cinema' | 'not-cinema'>>({});
  const [showEmailPrompt, setShowEmailPrompt] = useState<{ movieId: number; verdict: 'cinema' | 'not-cinema' } | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [isEmailVerificationSent, setIsEmailVerificationSent] = useState(false);
  const [isSubmittingEmailVerdict, setIsSubmittingEmailVerdict] = useState(false);

  // New state for improved swipe functionality
  const [isSwiping, setIsSwiping] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [cardTransform, setCardTransform] = useState('');
  const [cardTransition, setCardTransition] = useState('');
  
  // New state for pending votes and non-blocking email prompt
  const [pendingVotes, setPendingVotes] = useState<{ movieId: number; verdict: 'cinema' | 'not-cinema' }[]>([]);
  const [showNonBlockingEmailPrompt, setShowNonBlockingEmailPrompt] = useState(false);

  const SWIPE_THRESHOLD = typeof window !== 'undefined' ? window.innerWidth / 4 : 100;

  // New state for movie details modal
  const [selectedMovieForDetails, setSelectedMovieForDetails] = useState<Movie | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Enhanced visual state
  const [hoveredMovieId, setHoveredMovieId] = useState<number | null>(null);
  const [dynamicColors, setDynamicColors] = useState<Record<number, string>>({});

  // Load movies on component mount
  React.useEffect(() => {
    const loadMovies = async () => {
      try {
        setIsLoading(true);
        const fetchedMovies = await fetchMovies();
        setMovies(fetchedMovies);
      } catch (error) {
        console.error('Failed to load movies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMovies();
  }, []);

  // Listen for auth state changes
  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
      
      if (session?.user?.email && movies.length > 0) {
        // Load user's verdicts for all movies
        const verdicts: Record<number, 'cinema' | 'not-cinema'> = {};
        for (const movie of movies) {
          const verdict = await getUserVerdict(session.user.email, movie.id);
          if (verdict) {
            verdicts[movie.id] = verdict;
          }
        }
        setUserVerdicts(verdicts);
      } else {
        setUserVerdicts({});
      }
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [movies]);

  // Handle auth state changes for email verification
  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user?.email && showEmailPrompt) {
        // User just verified their email - process the pending vote
        try {
          setIsSubmittingVerdict(true);
          const result = await recordUserVerdict(session.user.email, showEmailPrompt.movieId, showEmailPrompt.verdict);
          
          if (result.success && result.movie) {
            // Update the movie in the local state
            setMovies(prevMovies => 
              prevMovies.map(movie => 
                movie.id === showEmailPrompt.movieId ? result.movie! : movie
              )
            );

            // Update user verdicts
            setUserVerdicts(prev => ({
              ...prev,
              [showEmailPrompt.movieId]: showEmailPrompt.verdict
            }));

            // Show feedback
            const verdictText = showEmailPrompt.verdict === 'cinema' ? 'Cinema' : 'Not Cinema';
            setVerdictFeedback({
              movieId: showEmailPrompt.movieId,
              message: `Verdict recorded: ${verdictText}!`
            });

            // Move to next movie
            setCurrentIndex((prev) => (prev + 1) % movies.length);
          } else {
            setVerdictFeedback({
              movieId: showEmailPrompt.movieId,
              message: result.error || 'Failed to record verdict. Please try again.'
            });
          }
        } catch (error) {
          console.error('Failed to submit verdict:', error);
          setVerdictFeedback({
            movieId: showEmailPrompt.movieId,
            message: 'Failed to record verdict. Please try again.'
          });
        } finally {
          setIsSubmittingVerdict(false);
          setShowEmailPrompt(null);
          setIsEmailVerificationSent(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [showEmailPrompt]);

  // Clear verdict feedback after 3 seconds
  React.useEffect(() => {
    if (verdictFeedback) {
      const timer = setTimeout(() => {
        setVerdictFeedback(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [verdictFeedback]);

  // New function to process votes (both swipe and button clicks)
  const processVote = async (movieId: number, verdict: 'cinema' | 'not-cinema') => {
    if (isSubmittingVerdict) return;

    // If user is authenticated, record vote immediately
    if (user?.email) {
      if (userVerdicts[movieId]) {
        setVerdictFeedback({
          movieId,
          message: `You already judged this as ${userVerdicts[movieId] === 'cinema' ? 'Cinema' : 'Not Cinema'}.`
        });
        return;
      }

      try {
        setIsSubmittingVerdict(true);
        const result = await recordUserVerdict(user.email, movieId, verdict);
        
        if (result.success && result.movie) {
          // Update the movie in the local state
          setMovies(prevMovies => 
            prevMovies.map(movie => 
              movie.id === movieId ? result.movie! : movie
            )
          );

          // Update user verdicts
          setUserVerdicts(prev => ({
            ...prev,
            [movieId]: verdict
          }));

          // Show feedback
          const verdictText = verdict === 'cinema' ? 'Cinema' : 'Not Cinema';
          setVerdictFeedback({
            movieId,
            message: `Verdict recorded: ${verdictText}!`
          });
        } else {
          setVerdictFeedback({
            movieId,
            message: result.error || 'Failed to record verdict. Please try again.'
          });
        }
      } catch (error) {
        console.error('Failed to submit verdict:', error);
        setVerdictFeedback({
          movieId,
          message: 'Failed to record verdict. Please try again.'
        });
      } finally {
        setIsSubmittingVerdict(false);
      }
    } else {
      // User is not authenticated - add to pending votes and show non-blocking prompt
      setPendingVotes(prev => {
        const existing = prev.find(vote => vote.movieId === movieId);
        if (existing) {
          return prev.map(vote => vote.movieId === movieId ? { movieId, verdict } : vote);
        }
        return [...prev, { movieId, verdict }];
      });
      setShowNonBlockingEmailPrompt(true);
    }
  };

  const handleEmailSubmit = async () => {
    if (!userEmail.trim()) {
      setVerdictFeedback({
        movieId: showEmailPrompt?.movieId || 0,
        message: 'Please enter your email address.'
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      setVerdictFeedback({
        movieId: showEmailPrompt?.movieId || 0,
        message: 'Please enter a valid email address.'
      });
      return;
    }

    if (!showEmailPrompt) return;

    // Check if user has already judged this movie with this email
    try {
      const hasJudged = await hasUserAlreadyJudged(userEmail, showEmailPrompt.movieId);
      if (hasJudged) {
        setVerdictFeedback({
          movieId: showEmailPrompt.movieId,
          message: 'You have already submitted a verdict for this movie with this email.'
        });
        setShowEmailPrompt(null);
        return;
      }

      setIsSubmittingEmailVerdict(true);
      
      // Send verification email
      const { error } = await supabase.auth.signInWithOtp({
        email: userEmail,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        throw error;
      }

      // Record the vote immediately after email is sent
      const result = await recordUserVerdict(userEmail, showEmailPrompt.movieId, showEmailPrompt.verdict);
      
      if (result.success && result.movie) {
        // Update the movie in the local state
        setMovies(prevMovies => 
          prevMovies.map(movie => 
            movie.id === showEmailPrompt.movieId ? result.movie! : movie
          )
        );

        // Update user verdicts
        setUserVerdicts(prev => ({
          ...prev,
          [showEmailPrompt.movieId]: showEmailPrompt.verdict
        }));

        // Show success feedback
        const verdictText = showEmailPrompt.verdict === 'cinema' ? 'Cinema' : 'Not Cinema';
        setVerdictFeedback({
          movieId: showEmailPrompt.movieId,
          message: `Vote recorded: ${verdictText}!`
        });

        setIsEmailVerificationSent(true);
        
        // Move to next movie after a short delay
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % movies.length);
        }, 1500);
      } else {
        setVerdictFeedback({
          movieId: showEmailPrompt.movieId,
          message: result.error || 'Failed to record verdict. Please try again.'
        });
      }
    } catch (error) {
      setVerdictFeedback({
        movieId: showEmailPrompt?.movieId || 0,
        message: error instanceof Error ? error.message : 'Failed to send verification email.'
      });
    } finally {
      setIsSubmittingEmailVerdict(false);
    }
  };

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovieForDetails(movie);
    setShowDetailsModal(true);
  };

  // Extract dominant color from movie poster
  const extractDominantColor = async (imageUrl: string, movieId: number) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        let r = 0, g = 0, b = 0;
        const sampleSize = 10;
        
        for (let i = 0; i < data.length; i += 4 * sampleSize) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
        }
        
        const pixelCount = data.length / (4 * sampleSize);
        r = Math.floor(r / pixelCount);
        g = Math.floor(g / pixelCount);
        b = Math.floor(b / pixelCount);
        
        const dominantColor = `rgb(${r}, ${g}, ${b})`;
        setDynamicColors(prev => ({ ...prev, [movieId]: dominantColor }));
      };
      img.src = imageUrl;
    } catch (error) {
      console.log('Could not extract color from image:', error);
    }
  };

  // Create particle effect on interaction
  const createParticleEffect = (e: React.MouseEvent, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    for (let i = 0; i < 5; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle-trail';
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.animationDelay = `${i * 0.1}s`;
      
      element.appendChild(particle);
      
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 1000);
    }
  };

  const sortedMovies = [...movies].sort((a, b) => {
    const aPercentage = calculateCinemaPercentage(a);
    const bPercentage = calculateCinemaPercentage(b);
    return bPercentage - aPercentage;
  });

  const filteredMovies = sortedMovies.filter(movie => {
    if (selectedCategory === 'all') return true;
    return selectedCategory === 'cinema' ? isMovieCinema(movie) : !isMovieCinema(movie);
  });

  const displayedMovies = filteredMovies.slice(
    currentPage * moviesPerPage,
    (currentPage + 1) * moviesPerPage
  );

  const totalPages = Math.ceil(filteredMovies.length / moviesPerPage);

  const handleVoteAction = async (movieId: number, verdictType: 'cinema' | 'not-cinema') => {
    if (isSubmittingVerdict) return;

    // If user is authenticated, proceed with vote
    if (user?.email) {
      // Check if user has already judged this movie
      if (userVerdicts[movieId]) {
        setVerdictFeedback({
          movieId,
          message: `You already judged this as ${userVerdicts[movieId] === 'cinema' ? 'Cinema' : 'Not Cinema'}.`
        });
        return;
      }

      try {
        setIsSubmittingVerdict(true);
        const result = await recordUserVerdict(user.email, movieId, verdictType);
        
        if (result.success && result.movie) {
          // Update the movie in the local state
          setMovies(prevMovies => 
            prevMovies.map(movie => 
              movie.id === movieId ? result.movie! : movie
            )
          );

          // Update user verdicts
          setUserVerdicts(prev => ({
            ...prev,
            [movieId]: verdictType
          }));

          // Show feedback
          const verdictText = verdictType === 'cinema' ? 'Cinema' : 'Not Cinema';
          setVerdictFeedback({
            movieId,
            message: `Verdict recorded: ${verdictText}!`
          });
        } else {
          setVerdictFeedback({
            movieId,
            message: result.error || 'Failed to record verdict. Please try again.'
          });
        }
      } catch (error) {
        console.error('Failed to submit verdict:', error);
        setVerdictFeedback({
          movieId,
          message: 'Failed to record verdict. Please try again.'
        });
      } finally {
        setIsSubmittingVerdict(false);
      }
    } else {
      // User is not authenticated - show email prompt
      setShowEmailPrompt({ movieId, verdict: verdictType });
      return;
    }
  };

  const handleVote = (movieId: number, verdict: 'cinema' | 'not-cinema') => {
    if (verdict === 'cinema') {
      // Swipe right - vote cinema
      processVote(movieId, 'cinema');
    } else {
      // Swipe left - vote not cinema
      processVote(movieId, 'not-cinema');
    }
  };

  if (isLoading) {
    return (
      <section className="py-24 px-6" data-section="verdict">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#00E0FF] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-xl text-[#A6A9B3]">Loading cinema verdicts...</p>
          </div>
        </div>
      </section>
    );
  }

  const getStats = () => {
    const cinemaMovies = movies.filter(isMovieCinema);
    
    return {
      totalMovies: movies.length,
      cinemaMovies: cinemaMovies.length,
      notCinemaMovies: movies.length - cinemaMovies.length,
      totalVotes: movies.reduce((sum, movie) => sum + movie.cinemaVotes + movie.notCinemaVotes, 0)
    };
  };

  const stats = getStats();

  // Email Prompt Modal
  const EmailPromptModal = () => {
    if (!showEmailPrompt) return null;

    return (
      <>
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[rgba(16,18,24,0.95)] backdrop-blur-xl border border-[rgba(0,224,255,0.1)] rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold font-space-grotesk text-[#00E0FF]">
                Enter Email to Record Vote
              </h3>
              <button
                onClick={() => setShowEmailPrompt(null)}
                className="p-2 hover:bg-[rgba(0,224,255,0.1)] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-[#A6A9B3] mb-4">
              Your vote will be recorded immediately. We'll send a verification link for future votes.
            </p>
            
            {!isEmailVerificationSent && !isSubmittingEmailVerdict ? (
              <div className="space-y-3">
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-[rgba(16,18,24,0.8)] border border-[rgba(0,224,255,0.2)] rounded-lg focus:border-[#00E0FF] focus:outline-none transition-colors text-[#F2F4F8] placeholder-[#A6A9B3]"
                />
                <button
                  onClick={handleEmailSubmit}
                  disabled={isSubmittingEmailVerdict}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#00E0FF] text-[#0B0B10] rounded-lg hover:bg-[#00C0E0] transition-colors font-medium"
                >
                  {isSubmittingEmailVerdict ? 'Recording Vote...' : 'Submit Vote'}
                </button>
              </div>
            ) : isSubmittingEmailVerdict ? (
              <div className="text-center">
                <div className="w-12 h-12 bg-[rgba(0,224,255,0.1)] rounded-full flex items-center justify-center mx-auto mb-3">
                  <div className="w-6 h-6 border-2 border-[#00E0FF] border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-sm text-[#00E0FF] mb-2">Recording your vote...</p>
                <p className="text-xs text-[#A6A9B3]">
                  Please wait while we process your vote.
                </p>
              </div>
            ) : isEmailVerificationSent ? (
              <div className="text-center">
                <div className="w-12 h-12 bg-[rgba(0,224,255,0.1)] rounded-full flex items-center justify-center mx-auto mb-3">
                  <div className="w-6 h-6 text-[#00E0FF] flex items-center justify-center text-lg font-bold">✓</div>
                </div>
                <p className="text-sm text-[#00E0FF] mb-2">Vote recorded successfully!</p>
                <p className="text-xs text-[#A6A9B3]">
                  We sent a verification link to <strong>{userEmail}</strong> for future votes.
                  Your vote has been counted.
                </p>
                <button
                  onClick={() => {
                    setShowEmailPrompt(null);
                    setIsEmailVerificationSent(false);
                    setUserEmail('');
                  }}
                  className="mt-3 px-4 py-2 bg-[#00E0FF] text-[#0B0B10] rounded-lg hover:bg-[#00C0E0] transition-colors text-sm font-medium"
                >
                  Continue
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </>
    );
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-[#00E0FF]" />;
    if (index === 1) return <Medal className="w-5 h-5 text-[#C0C0C0]" />;
    if (index === 2) return <Award className="w-5 h-5 text-[#CD7F32]" />;
    return null;
  };

  return (
    <section className="py-24 px-6" data-section="verdict">
      <EmailPromptModal />
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold font-space-grotesk mb-6 text-[#00E0FF]">
            Verdict
          </h2>
          <p className="text-xl text-[#A6A9B3] max-w-2xl mx-auto leading-relaxed">
            Click through movies and cast your vote. Choose cinema or not.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-[rgba(16,18,24,0.6)] backdrop-blur-xl border border-[rgba(255,215,0,0.1)] rounded-xl p-6 text-center">
            <Users className="w-8 h-8 text-[#00E0FF] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#F2F4F8]">{stats.totalVotes.toLocaleString()}</div>
            <div className="text-sm text-[#A6A9B3]">Total Votes</div>
          </div>
          
          <div className="bg-[rgba(16,18,24,0.6)] backdrop-blur-xl border border-[rgba(255,215,0,0.1)] rounded-xl p-6 text-center">
            <Star className="w-8 h-8 text-[#00E0FF] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#F2F4F8]">{stats.totalMovies}</div>
            <div className="text-sm text-[#A6A9B3]">Movies Rated</div>
          </div>
          
          <div className="bg-[rgba(16,18,24,0.6)] backdrop-blur-xl border border-[rgba(255,215,0,0.1)] rounded-xl p-6 text-center">
            <TrendingUp className="w-8 h-8 text-[#00E0FF] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#F2F4F8]">{stats.cinemaMovies}</div>
            <div className="text-sm text-[#A6A9B3]">Cinema</div>
          </div>
          
          <div className="bg-[rgba(16,18,24,0.6)] backdrop-blur-xl border border-[rgba(255,215,0,0.1)] rounded-xl p-6 text-center">
            <TrendingDown className="w-8 h-8 text-[#FFD700] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#F2F4F8]">{stats.notCinemaMovies}</div>
            <div className="text-sm text-[#A6A9B3]">Not Cinema</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-20 items-start">
          {/* Movie Cards */}
          <div className="relative w-full">
            <div className="relative h-[24rem] sm:h-[28rem] w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto">
              {movies.map((movie, index) => {
                const offset = index - currentIndex;
                const isActive = offset === 0;
                
                const handleTouchStart = (e: React.TouchEvent) => {
                  if (isSubmittingVerdict) return;
                  
                  const touch = e.touches[0];
                  setStartX(touch.clientX);
                  setCurrentX(touch.clientX);
                  setIsSwiping(true);
                  setCardTransition('none');
                };
                
                const handleTouchMove = (e: React.TouchEvent) => {
                  if (!isSwiping || isSubmittingVerdict) return;
                  
                  const touch = e.touches[0];
                  const deltaX = touch.clientX - startX;
                  const rotation = (deltaX / window.innerWidth) * 20; // Max 20 degrees rotation
                  
                  setCurrentX(touch.clientX);
                  setCardTransform(`translateX(${deltaX}px) rotate(${rotation}deg)`);
                };
                
                const handleTouchEnd = (e: React.TouchEvent) => {
                  if (!isSwiping || isSubmittingVerdict) return;
                  
                  setIsSwiping(false);
                  setCardTransition('transform 0.3s ease-out');
                  
                  const deltaX = currentX - startX;
                  
                  if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
                    const verdict = deltaX > 0 ? 'cinema' : 'not-cinema';
                    
                    // Animate card off screen
                    const offScreenX = Math.sign(deltaX) * window.innerWidth;
                    const offScreenRotation = Math.sign(deltaX) * 30;
                    setCardTransform(`translateX(${offScreenX}px) rotate(${offScreenRotation}deg)`);
                    
                    // Process the vote
                    processVote(movies[currentIndex].id, verdict);
                    
                    // Move to next movie after animation
                    setTimeout(() => {
                      setCardTransform('');
                      setCardTransition('');
                      setCurrentIndex((prev) => (prev + 1) % movies.length);
                    }, 300);
                  } else {
                    // Snap back to center
                    setCardTransform('');
                  }
                  
                  // Reset touch coordinates
                  setTimeout(() => {
                    setStartX(0);
                    setCurrentX(0);
                  }, 300);
                };
                
                return (
                  <div
                    key={movie.id}
                    className="cinema-card-3d"
                    onTouchStart={isActive ? handleTouchStart : undefined}
                    onTouchMove={isActive ? handleTouchMove : undefined}
                    onTouchEnd={isActive ? handleTouchEnd : undefined}
                    onMouseEnter={() => {
                      setHoveredMovieId(movie.id);
                      if (!dynamicColors[movie.id]) {
                        extractDominantColor(movie.poster, movie.id);
                      }
                    }}
                    onMouseLeave={() => setHoveredMovieId(null)}
                    className={`absolute inset-0 transition-all duration-300 transform ${
                      isActive 
                        ? 'scale-100 z-20 rotate-0' 
                        : offset === 1 
                          ? 'scale-95 z-10 rotate-2 translate-x-4'
                          : offset === -1
                            ? 'scale-95 z-10 -rotate-2 -translate-x-4'
                            : 'scale-90 z-0 opacity-0'
                    } cinema-card-3d`}
                    style={isActive && (cardTransform || cardTransition) ? {
                      transform: cardTransform || undefined,
                      transition: cardTransition || undefined
                    } : undefined}
                  >
                    <div 
                      className={`card-inner bg-[rgba(16,18,24,0.8)] backdrop-blur-cinema border border-[rgba(255,215,0,0.1)] rounded-2xl overflow-hidden shadow-2xl h-full cursor-pointer transition-all duration-500 flex flex-col film-strip-border film-grain cinema-card-enhanced ${
                        hoveredMovieId === movie.id ? 'border-[#FFD700]' : ''
                      }`}
                      style={{
                        borderColor: hoveredMovieId === movie.id && dynamicColors[movie.id] 
                          ? dynamicColors[movie.id] 
                          : undefined
                      }}
                    >
                      <div className="sprocket-holes"></div>
                      <div className="flex-grow overflow-hidden">
                        <LazyImage
                          src={movie.poster}
                          alt={movie.title}
                          className="w-full h-full object-cover aspect-185"
                        />
                      </div>
                      <div 
                        className="p-3 sm:p-4 flex-shrink-0 cursor-pointer hover:bg-[rgba(0,224,255,0.05)] transition-all duration-300 relative z-10"
                        onClick={() => handleMovieClick(movie)}
                        onMouseDown={(e) => createParticleEffect(e, e.currentTarget)}
                      >
                        <h3 className="cinema-title text-base sm:text-lg text-[#00E0FF] truncate text-shadow-cinema">
                          {movie.title}
                        </h3>
                        <p className="director-credit text-xs sm:text-sm text-[#A6A9B3] truncate">
                          {movie.director} • {movie.year}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div 
                            className="film-reel-progress"
                            style={{ '--progress': `${calculateCinemaPercentage(movie)}%` } as React.CSSProperties}
                          >
                            <span className="film-reel-center text-[#00E0FF]">
                              {calculateCinemaPercentage(movie)}%
                            </span>
                          </div>
                          <span className="text-xs text-[#A6A9B3]">say Cinema</span>
                        </div>
                        {movie.micro_genres && movie.micro_genres.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {movie.micro_genres.slice(0, 2).map((genre, idx) => (
                              <span
                                key={idx}
                                className={`px-2 py-1 rounded text-xs text-[#00E0FF] genre-icon-${genre.split('-')[0]} bg-opacity-20 border border-opacity-30`}
                              >
                                {genre.replace(/-/g, ' ')}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Vote Controls */}
            <div className="flex justify-center gap-6 sm:gap-8 mt-6 sm:mt-8">
              <button
                onClick={() => handleVote(movies[currentIndex]?.id, 'not-cinema')}
                disabled={isSubmittingVerdict || !movies[currentIndex] || userVerdicts[movies[currentIndex]?.id] || (showEmailPrompt && showEmailPrompt.movieId === movies[currentIndex]?.id)}
                className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cinema-card-enhanced ${
                  userVerdicts[movies[currentIndex]?.id] === 'not-cinema' 
                    ? 'bg-[#FFD700] text-[#0B0B10] ring-2 ring-[#FFD700] not-cinema-matte' 
                    : 'bg-[#00BFFF] hover:bg-[#0099CC] text-white hover:scale-110 focus:ring-[#00BFFF] disabled:opacity-50 cinema-glow'
                }`}
                onMouseDown={(e) => createParticleEffect(e, e.currentTarget)}
              >
                {isSubmittingVerdict ? (
                  <div className="projector-loading" />
                ) : (
                  <X className="w-6 h-6 sm:w-8 sm:h-8" />
                )}
              </button>
              <button
                onClick={() => handleVote(movies[currentIndex]?.id, 'cinema')}
                disabled={isSubmittingVerdict || !movies[currentIndex] || userVerdicts[movies[currentIndex]?.id] || (showEmailPrompt && showEmailPrompt.movieId === movies[currentIndex]?.id)}
                className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cinema-card-enhanced ${
                  userVerdicts[movies[currentIndex]?.id] === 'cinema' 
                    ? 'bg-[#00E0FF] text-[#0B0B10] ring-2 ring-[#00E0FF] scale-110 cinema-glow' 
                    : 'bg-[#00E0FF] hover:bg-[#00C0E0] text-[#0B0B10] hover:scale-110 focus:ring-[#00E0FF] disabled:opacity-50 cinema-glow'
                }`}
                onMouseDown={(e) => createParticleEffect(e, e.currentTarget)}
              >
                {isSubmittingVerdict ? (
                  <div className="projector-loading border-[#0B0B10]" />
                ) : (
                  <span className="text-xl sm:text-2xl font-bold">✓</span>
                )}
              </button>
            </div>

            {/* User verdict status */}
            {user && movies[currentIndex] && userVerdicts[movies[currentIndex].id] && (
              <div className="text-center mt-2">
                <p className="text-sm text-[#00E0FF] font-medium">
                  Your verdict: {userVerdicts[movies[currentIndex].id] === 'cinema' ? 'Cinema' : 'Not Cinema'}
                </p>
              </div>
            )}

            {/* Verdict Feedback */}
            {verdictFeedback && verdictFeedback.movieId === movies[currentIndex]?.id && (
              <div className="text-center mt-4">
                <div className="inline-block px-4 py-2 bg-[rgba(0,224,255,0.1)] border border-[rgba(0,224,255,0.3)] rounded-lg">
                  <p className="text-sm text-[#00E0FF] font-medium">{verdictFeedback.message}</p>
                </div>
              </div>
            )}

            <div className="text-center mt-4 space-x-4 text-sm sm:text-base">
              <span className="text-[#FFD700]">✗ Not Cinema</span>
              <span className="text-[#00E0FF]">✓ Cinema</span>
            </div>
            
            {/* Mobile Swipe Hint */}
            <div className="text-center mt-2 sm:hidden"> 
              <p className="text-xs text-[#A6A9B3]">
                Swipe left for ✗ • Swipe right for ✓
              </p>
            </div>
          </div>

          {/* Cinema Billboard */}
          <div className="bg-[rgba(16,18,24,0.6)] backdrop-blur-cinema border border-[rgba(255,215,0,0.1)] rounded-2xl p-4 sm:p-6 lg:p-8 film-grain cinema-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="cinema-title text-xl sm:text-2xl text-[#00E0FF] text-shadow-cinema">
                Cinema Billboard
              </h3>
              
              {/* Category Filter */}
              <div className="flex bg-[rgba(16,18,24,0.8)] rounded-lg p-1 text-xs sm:text-sm">
                {(['all', 'cinema', 'not-cinema'] as const).map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setCurrentPage(0);
                    }}
                    className={`px-2 sm:px-3 py-1 rounded text-xs font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-[#00E0FF] text-[#0B0B10]'
                        : 'text-[#A6A9B3] hover:text-[#F2F4F8]'
                    }`}
                  >
                    {category === 'all' ? 'All' : category === 'cinema' ? 'Cinema' : 'Not Cinema'}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 mb-6">
              {displayedMovies.map((movie, index) => {
                const cinemaPercentage = calculateCinemaPercentage(movie);
                const isCinema = isMovieCinema(movie);
                const rank = (currentPage * moviesPerPage) + index + 1;

                return (
                  <div
                    key={movie.id}
                    className={`bg-[rgba(16,18,24,0.4)] rounded-xl p-3 sm:p-4 transition-all duration-300 cinema-card-enhanced film-grain ${
                      isCinema 
                        ? 'border border-[rgba(0,224,255,0.1)] hover:border-[#00E0FF] cinema-glow' 
                        : 'border border-[rgba(255,215,0,0.1)] hover:border-[#FFD700] not-cinema-matte'
                    }`}
                    onMouseEnter={() => {
                      setHoveredMovieId(movie.id);
                      if (!dynamicColors[movie.id]) {
                        extractDominantColor(movie.poster, movie.id);
                      }
                    }}
                    onMouseLeave={() => setHoveredMovieId(null)}
                  >
                    <div 
                      className="flex items-start gap-3 sm:gap-4 cursor-pointer perspective-1000"
                      onClick={() => handleMovieClick(movie)}
                      onMouseDown={(e) => createParticleEffect(e, e.currentTarget)}
                    >
                      <div className="w-12 h-16 sm:w-16 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 film-strip-border">
                        <LazyImage
                          src={movie.poster}
                          alt={movie.title}
                          className="w-full h-full object-cover aspect-185"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0 hover:bg-[rgba(0,224,255,0.02)] rounded p-2 -m-2 transition-all duration-300 transform-3d">
                        <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold bg-[rgba(0,224,255,0.1)] text-[#00E0FF] cinema-border">
                              {rank <= 3 ? getRankIcon(rank - 1) : rank}
                            </div>
                            <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                              isCinema 
                                ? 'bg-[#00E0FF] text-[#0B0B10] cinema-glow' 
                                : 'bg-[#FFD700] text-[#0B0B10] not-cinema-matte'
                            }`}>
                              <span className="hidden sm:inline">Says it's </span>{isCinema ? 'Cinema' : 'NOT Cinema'}
                            </div>
                          </div>

                          <div className="text-right parallax-slow">
                            <div className={`film-reel-progress ${
                              isCinema ? 'text-[#00E0FF]' : 'text-[#FFD700]'
                            }`} style={{ '--progress': `${cinemaPercentage}%` } as React.CSSProperties}>
                              <span className="film-reel-center">
                                {cinemaPercentage}%
                              </span>
                            </div>
                          </div>
                        </div>

                        <h4 className="cinema-title text-sm sm:text-base text-[#F2F4F8] mb-1 truncate text-shadow-cinema">
                          {movie.title}
                        </h4>
                        <p className="director-credit text-xs sm:text-sm text-[#A6A9B3] mb-3 truncate">
                          {movie.director} • {movie.year}
                        </p>

                        {/* Enhanced metadata preview */}
                        {movie.micro_genres && movie.micro_genres.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {movie.micro_genres.slice(0, 2).map((genre, idx) => (
                              <span
                                key={idx}
                                className={`px-2 py-1 rounded text-xs text-[#00E0FF] genre-icon-${genre.split('-')[0]} bg-opacity-20 border border-opacity-30 transition-all duration-300`}
                              >
                                {genre.replace(/-/g, ' ')}
                              </span>
                            ))}
                            {movie.micro_genres.length > 2 && (
                              <span className="px-2 py-1 bg-[rgba(0,224,255,0.05)] rounded text-xs text-[#A6A9B3] parallax-fast">
                                +{movie.micro_genres.length - 2}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-[#A6A9B3] mb-3 parallax-medium">
                          <span>{(movie.cinemaVotes + movie.notCinemaVotes).toLocaleString()} votes</span>
                          {movie.runtime_minutes && (
                            <span>{Math.floor(movie.runtime_minutes / 60)}h {movie.runtime_minutes % 60}m</span>
                          )}
                          <span className={`font-medium cinema-title ${
                            isCinema ? 'text-[#00E0FF]' : 'text-[#FFD700]'
                          }`}>
                            #{rank}
                          </span>
                        </div>

                        <div className="flex gap-2 text-xs sm:text-sm">
                          <button
                            onClick={() => handleVoteAction(movie.id, 'cinema')}
                            disabled={isSubmittingVerdict || userVerdicts[movie.id] || (showEmailPrompt && showEmailPrompt.movieId === movie.id)}
                            className={`flex-1 py-2 px-2 sm:px-3 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed relative cinema-card-enhanced ${
                              userVerdicts[movie.id] === 'cinema'
                                ? 'bg-[#00E0FF] text-[#0B0B10] ring-2 ring-[#00E0FF] cinema-glow'
                                : 'bg-[rgba(0,224,255,0.1)] hover:bg-[rgba(0,224,255,0.2)] text-[#00E0FF] focus:ring-[#00E0FF] cinema-glow'
                            }`}
                            onMouseDown={(e) => createParticleEffect(e, e.currentTarget)}
                          >
                            {isSubmittingVerdict && verdictFeedback?.movieId === movie.id ? (
                              <div className="flex items-center justify-center">
                                <div className="projector-loading w-3 h-3 mr-2" />
                                Cinema
                              </div>
                            ) : (
                              userVerdicts[movie.id] === 'cinema' ? '✓ Cinema' : 'Cinema'
                            )}
                          </button>
                          <button
                            onClick={() => handleVoteAction(movie.id, 'not-cinema')}
                            disabled={isSubmittingVerdict || userVerdicts[movie.id] || (showEmailPrompt && showEmailPrompt.movieId === movie.id)}
                            className={`flex-1 py-2 px-2 sm:px-3 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed relative cinema-card-enhanced ${
                              userVerdicts[movie.id] === 'not-cinema'
                                ? 'bg-[#FFD700] text-[#0B0B10] ring-2 ring-[#FFD700] not-cinema-matte'
                                : 'bg-[rgba(255,215,0,0.1)] hover:bg-[rgba(255,215,0,0.2)] text-[#FFD700] focus:ring-[#FFD700] not-cinema-matte'
                            }`}
                            onMouseDown={(e) => createParticleEffect(e, e.currentTarget)}
                          >
                            {isSubmittingVerdict && verdictFeedback?.movieId === movie.id ? (
                              <div className="flex items-center justify-center">
                                <div className="projector-loading w-3 h-3 mr-2 border-[#FFD700]" />
                                Not Cinema
                              </div>
                            ) : (
                              userVerdicts[movie.id] === 'not-cinema' ? '✗ Not Cinema' : 'Not Cinema'
                            )}
                          </button>
                        </div>

                        {/* Individual movie verdict feedback */}
                        {verdictFeedback && verdictFeedback.movieId === movie.id && (
                          <div className="mt-2 text-center">
                            <div className="inline-block px-2 py-1 bg-[rgba(0,224,255,0.1)] border border-[rgba(0,224,255,0.3)] rounded text-xs text-[#00E0FF] cinema-glow">
                              {verdictFeedback.message}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-6 border-t border-[rgba(255,215,0,0.1)]">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-[rgba(16,18,24,0.8)] border border-[rgba(0,224,255,0.1)] rounded-lg hover:border-[#00E0FF] transition-colors text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#00E0FF] focus:ring-opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-[#A6A9B3]">
                  Page {currentPage + 1} of {totalPages}
                </span>
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-[rgba(16,18,24,0.8)] border border-[rgba(0,224,255,0.1)] rounded-lg hover:border-[#00E0FF] transition-colors text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#00E0FF] focus:ring-opacity-50"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Movie Details Modal */}
      <MovieDetailsModal
        movie={selectedMovieForDetails}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedMovieForDetails(null);
        }}
      />
    </section>
  );
};

export default CommunityPoll;