import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Trophy, Medal, Award, TrendingUp, TrendingDown, Users, Star } from 'lucide-react';
import { fetchMovies, calculateCinemaPercentage, isMovieCinema, recordUserVerdict, hasUserAlreadyJudged, getUserVerdict, type Movie } from '../data/movies';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

// Lazy loading image component
const LazyImage: React.FC<{ src: string; alt: string; className: string }> = ({ src, alt, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={`${className} bg-gray-800 flex items-center justify-center`}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`${className} transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        />
      )}
      {!isLoaded && isInView && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

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

  const handleVote = async (movieId: number, verdict: 'cinema' | 'not-cinema') => {
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

          // Move to next movie
          setCurrentIndex((prev) => (prev + 1) % movies.length);
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
      setShowEmailPrompt({ movieId, verdict });
      return;
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

      setIsEmailVerificationSent(true);
    } catch (error) {
      setVerdictFeedback({
        movieId: showEmailPrompt?.movieId || 0,
        message: error instanceof Error ? error.message : 'Failed to send verification email.'
      });
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

  // Email Prompt Modal
  const EmailPromptModal = () => {
    if (!showEmailPrompt) return null;

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

    return (
      <>
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[rgba(16,18,24,0.95)] backdrop-blur-xl border border-[rgba(0,224,255,0.1)] rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold font-space-grotesk text-[#00E0FF]">
                Enter Email to Vote
              </h3>
              <button
                onClick={() => setShowEmailPrompt(null)}
                className="p-2 hover:bg-[rgba(0,224,255,0.1)] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-[#A6A9B3] mb-4">
              Your vote will only count after you verify your email. This prevents duplicate votes.
            </p>
            
            {!isEmailVerificationSent ? (
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
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#00E0FF] text-[#0B0B10] rounded-lg hover:bg-[#00C0E0] transition-colors font-medium"
                >
                  Send Verification Link
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-12 h-12 bg-[rgba(0,224,255,0.1)] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-[#00E0FF]" />
                </div>
                <p className="text-sm text-[#00E0FF] mb-2">Check your email!</p>
                <p className="text-xs text-[#A6A9B3]">
                  We sent a verification link to <strong>{userEmail}</strong>.
                  Click the link to count your vote.
                </p>
              </div>
            )}
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
                  const touch = e.touches[0];
                  (e.currentTarget as HTMLElement).dataset.touchStartX = touch.clientX.toString();
                };
                
                const handleTouchEnd = (e: React.TouchEvent) => {
                  const touch = e.changedTouches[0];
                  const startX = parseFloat((e.currentTarget as HTMLElement).dataset.touchStartX || '0');
                  const endX = touch.clientX;
                  const diff = startX - endX;
                  
                  if (Math.abs(diff) > 50) { // Minimum swipe distance
                    if (diff > 0) {
                      // Swipe left - vote not cinema
                      handleVote(movies[currentIndex].id, 'not-cinema');
                    } else {
                      // Swipe right - vote cinema
                      handleVote(movies[currentIndex].id, 'cinema');
                    }
                  }
                };
                
                return (
                  <div
                    key={movie.id}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    className={`absolute inset-0 transition-all duration-300 transform ${
                      isActive 
                        ? 'scale-100 z-20 rotate-0' 
                        : offset === 1 
                          ? 'scale-95 z-10 rotate-2 translate-x-4'
                          : offset === -1
                            ? 'scale-95 z-10 -rotate-2 -translate-x-4'
                            : 'scale-90 z-0 opacity-0'
                    }`}
                  >
                    <div className="bg-[rgba(16,18,24,0.8)] backdrop-blur-xl border border-[rgba(255,215,0,0.1)] rounded-2xl overflow-hidden shadow-2xl h-full cursor-pointer hover:border-[#FFD700] transition-colors flex flex-col">
                      <div className="flex-grow overflow-hidden">
                        <LazyImage
                          src={movie.poster}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3 sm:p-4 flex-shrink-0">
                        <h3 className="font-bold text-base sm:text-lg text-[#00E0FF] truncate">
                          {movie.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#A6A9B3] truncate">
                          {movie.director} • {movie.year}
                        </p>
                        <p className="text-xs text-[#00E0FF] mt-1">
                          {calculateCinemaPercentage(movie)}% say Cinema
                        </p>
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
                disabled={isSubmittingVerdict || !movies[currentIndex] || !user || userVerdicts[movies[currentIndex]?.id]}
                className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                  userVerdicts[movies[currentIndex]?.id] === 'not-cinema' 
                    ? 'bg-[#FFD700] text-[#0B0B10] ring-2 ring-[#FFD700]' 
                    : 'bg-[#00BFFF] hover:bg-[#0099CC] text-white hover:scale-110 focus:ring-[#00BFFF] disabled:opacity-50'
                }`}
              >
                {isSubmittingVerdict ? (
                  <div className="w-4 h-4 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <X className="w-6 h-6 sm:w-8 sm:h-8" />
                )}
              </button>
              <button
                onClick={() => handleVote(movies[currentIndex]?.id, 'cinema')}
                disabled={isSubmittingVerdict || !movies[currentIndex] || !user || userVerdicts[movies[currentIndex]?.id]}
                className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                  userVerdicts[movies[currentIndex]?.id] === 'cinema' 
                    ? 'bg-[#00E0FF] text-[#0B0B10] ring-2 ring-[#00E0FF] scale-110' 
                    : 'bg-[#00E0FF] hover:bg-[#00C0E0] text-[#0B0B10] hover:scale-110 focus:ring-[#00E0FF] disabled:opacity-50'
                }`}
              >
                {isSubmittingVerdict ? (
                  <div className="w-4 h-4 sm:w-6 sm:h-6 border-2 border-[#0B0B10] border-t-transparent rounded-full animate-spin" />
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
          <div className="bg-[rgba(16,18,24,0.6)] backdrop-blur-xl border border-[rgba(255,215,0,0.1)] rounded-2xl p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-bold font-space-grotesk text-[#00E0FF]">
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
                    className={`bg-[rgba(16,18,24,0.4)] rounded-xl p-3 sm:p-4 transition-colors ${
                      isCinema 
                        ? 'border border-[rgba(0,224,255,0.1)] hover:border-[#00E0FF]' 
                        : 'border border-[rgba(255,215,0,0.1)] hover:border-[#FFD700]'
                    }`}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-12 h-16 sm:w-16 sm:h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <LazyImage
                          src={movie.poster}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold bg-[rgba(0,224,255,0.1)] text-[#00E0FF]">
                              {rank <= 3 ? getRankIcon(rank - 1) : rank}
                            </div>
                            <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                              isCinema 
                                ? 'bg-[#00E0FF] text-[#0B0B10]' 
                                : 'bg-[#FFD700] text-[#0B0B10]'
                            }`}>
                              <span className="hidden sm:inline">Says it's </span>{isCinema ? 'Cinema' : 'NOT Cinema'}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className={`text-xl font-bold ${
                              isCinema ? 'text-[#00E0FF]' : 'text-[#FFD700]'
                            }`}>
                              {cinemaPercentage}%
                            </div>
                          </div>
                        </div>

                        <h4 className="font-bold font-space-grotesk text-sm sm:text-base text-[#F2F4F8] mb-1 truncate">
                          {movie.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-[#A6A9B3] mb-3 truncate">
                          {movie.director} • {movie.year}
                        </p>

                        <div className="flex items-center justify-between text-xs text-[#A6A9B3] mb-3">
                          <span>{(movie.cinemaVotes + movie.notCinemaVotes).toLocaleString()} votes</span>
                          <span className={`font-medium ${
                            isCinema ? 'text-[#00E0FF]' : 'text-[#FFD700]'
                          }`}>
                            #{rank}
                          </span>
                        </div>

                        <div className="flex gap-2 text-xs sm:text-sm">
                          <button
                            onClick={() => handleVoteAction(movie.id, 'cinema')}
                            disabled={isSubmittingVerdict || !user || userVerdicts[movie.id]}
                            className={`flex-1 py-2 px-2 sm:px-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed relative ${
                              userVerdicts[movie.id] === 'cinema'
                                ? 'bg-[#00E0FF] text-[#0B0B10] ring-2 ring-[#00E0FF]'
                                : 'bg-[rgba(0,224,255,0.1)] hover:bg-[rgba(0,224,255,0.2)] text-[#00E0FF] focus:ring-[#00E0FF]'
                            }`}
                          >
                            {isSubmittingVerdict && verdictFeedback?.movieId === movie.id ? (
                              <div className="flex items-center justify-center">
                                <div className="w-3 h-3 border border-[#00E0FF] border-t-transparent rounded-full animate-spin mr-2" />
                                Cinema
                              </div>
                            ) : (
                              userVerdicts[movie.id] === 'cinema' ? '✓ Cinema' : 'Cinema'
                            )}
                          </button>
                          <button
                            onClick={() => handleVoteAction(movie.id, 'not-cinema')}
                            disabled={isSubmittingVerdict || !user || userVerdicts[movie.id]}
                            className={`flex-1 py-2 px-2 sm:px-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed relative ${
                              userVerdicts[movie.id] === 'not-cinema'
                                ? 'bg-[#FFD700] text-[#0B0B10] ring-2 ring-[#FFD700]'
                                : 'bg-[rgba(255,215,0,0.1)] hover:bg-[rgba(255,215,0,0.2)] text-[#FFD700] focus:ring-[#FFD700]'
                            }`}
                          >
                            {isSubmittingVerdict && verdictFeedback?.movieId === movie.id ? (
                              <div className="flex items-center justify-center">
                                <div className="w-3 h-3 border border-[#FFD700] border-t-transparent rounded-full animate-spin mr-2" />
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
                            <div className="inline-block px-2 py-1 bg-[rgba(0,224,255,0.1)] border border-[rgba(0,224,255,0.3)] rounded text-xs text-[#00E0FF]">
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
    </section>
  );
};

export default CommunityPoll;