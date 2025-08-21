import React, { useState, useEffect } from 'react';
import { Search, X, RotateCcw, Shuffle, Share2, CheckCircle, XCircle, Mail, LogOut } from 'lucide-react';
import { useMovieJudge } from '../hooks/useMovieJudge';

interface MovieJudgePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const MovieJudgePanel: React.FC<MovieJudgePanelProps> = ({ isOpen, onClose }) => {
  const movieJudge = useMovieJudge();
  const [showVerdictAnimation, setShowVerdictAnimation] = useState(false);

  // Animate verdict when it changes
  useEffect(() => {
    if (movieJudge.verdict) {
      setShowVerdictAnimation(true);
      const timer = setTimeout(() => setShowVerdictAnimation(false), 600);
      return () => clearTimeout(timer);
    }
  }, [movieJudge.verdict]);

  const handleSearch = () => {
    movieJudge.handleSearch();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getVerdictMessage = () => {
    const messages = {
      cinema: [
        "A masterpiece of visual storytelling.",
        "This is what happens when art meets commerce and wins.",
        "Pure cinematic poetry that transcends boundaries.",
        "Bold choices that redefine the medium.",
        "Cinema at its finest."
      ],
      'not-cinema': [
        "Entertaining, but lacks the depth of true Cinema.",
        "Fun popcorn entertainment, nothing more.",
        "Technically sound but spiritually vacant.",
        "More product than art.",
        "Good movie, but not quite Cinema."
      ]
    };
    
    const relevantMessages = messages[movieJudge.verdict || 'cinema'];
    return relevantMessages[Math.floor(Math.random() * relevantMessages.length)];
  };

  const getMoodRecommendations = () => {
    const recommendations = {
      'Friday Night Laughs': [
        { title: 'The Grand Budapest Hotel', director: 'Wes Anderson', year: 2014 },
        { title: 'Knives Out', director: 'Rian Johnson', year: 2019 },
        { title: 'What We Do in the Shadows', director: 'Taika Waititi', year: 2014 }
      ],
      'Slow Burn & Feels': [
        { title: 'Her', director: 'Spike Jonze', year: 2013 },
        { title: 'Lost in Translation', director: 'Sofia Coppola', year: 2003 },
        { title: 'The Tree of Life', director: 'Terrence Malick', year: 2011 }
      ],
      'Epic Action': [
        { title: 'Mad Max: Fury Road', director: 'George Miller', year: 2015 },
        { title: 'Dune', director: 'Denis Villeneuve', year: 2021 },
        { title: 'The Matrix', director: 'The Wachowskis', year: 1999 }
      ],
      'Indie Gems': [
        { title: 'Moonlight', director: 'Barry Jenkins', year: 2016 },
        { title: 'The Lighthouse', director: 'Robert Eggers', year: 2019 },
        { title: 'Parasite', director: 'Bong Joon-ho', year: 2019 }
      ]
    };
    return recommendations[movieJudge.selectedMood as keyof typeof recommendations] || [];
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Desktop Panel */}
      <div className="fixed top-0 left-0 h-full w-96 bg-[rgba(16,18,24,0.95)] backdrop-blur-xl border-r border-[rgba(0,224,255,0.1)] z-40 transform transition-transform duration-300 ease-out translate-x-0 hidden md:flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pt-24 border-b border-[rgba(0,224,255,0.1)]">
          <h2 className="text-xl font-bold font-space-grotesk text-[#00E0FF]">Judge a Movie</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[rgba(0,224,255,0.1)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Email Prompt Section - shown after user tries to vote */}
          {!movieJudge.user && movieJudge.showEmailPrompt && (
            <div className="bg-[rgba(16,18,24,0.6)] border border-[rgba(0,224,255,0.1)] rounded-xl p-6">
              <h4 className="text-lg font-medium font-space-grotesk mb-4 text-[#00E0FF]">
                Enter Your Email to Vote
              </h4>
              <p className="text-sm text-[#A6A9B3] mb-4">
                Your vote for "{movieJudge.searchQuery}" will be recorded immediately. We'll send a verification link for future votes.
              </p>
              
              {!movieJudge.isEmailVerificationSent && !movieJudge.isSubmittingVerdict ? (
                <div className="space-y-3">
                  <input
                    type="email"
                    value={movieJudge.userEmail}
                    onChange={(e) => movieJudge.handleEmailChange(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 bg-[rgba(16,18,24,0.8)] border border-[rgba(0,224,255,0.2)] rounded-lg focus:border-[#00E0FF] focus:outline-none transition-colors text-[#F2F4F8] placeholder-[#A6A9B3]"
                  />
                  <button
                    onClick={movieJudge.sendVerificationEmail}
                    disabled={movieJudge.isSubmittingVerdict}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#00E0FF] text-[#0B0B10] rounded-lg hover:bg-[#00C0E0] transition-colors font-medium"
                  >
                    <Mail className="w-4 h-4" />
                    {movieJudge.isSubmittingVerdict ? 'Recording Vote...' : 'Submit Vote'}
                  </button>
                </div>
              ) : movieJudge.isSubmittingVerdict ? (
                <div className="text-center">
                  <div className="w-12 h-12 bg-[rgba(0,224,255,0.1)] rounded-full flex items-center justify-center mx-auto mb-3">
                    <div className="w-6 h-6 border-2 border-[#00E0FF] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-sm text-[#00E0FF] mb-2">Recording your vote...</p>
                  <p className="text-xs text-[#A6A9B3]">
                    Please wait while we process your vote for "{movieJudge.searchQuery}".
                  </p>
                </div>
              ) : movieJudge.isEmailVerificationSent ? (
                <div className="text-center">
                  <div className="w-12 h-12 bg-[rgba(0,224,255,0.1)] rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-6 h-6 text-[#00E0FF]" />
                  </div>
                  <p className="text-sm text-[#00E0FF] mb-2">Vote recorded successfully!</p>
                  <p className="text-xs text-[#A6A9B3]">
                    We sent a verification link to <strong>{movieJudge.userEmail}</strong> for future votes.
                    Your vote for "{movieJudge.searchQuery}\" has been counted.
                  </p>
                  <button
                    onClick={movieJudge.closeEmailPrompt}
                    className="mt-3 px-4 py-2 bg-[#00E0FF] text-[#0B0B10] rounded-lg hover:bg-[#00C0E0] transition-colors text-sm font-medium"
                  >
                    Continue
                  </button>
                </div>
              ) : null}
              
              {movieJudge.error && (
                <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">{movieJudge.error}</p>
                </div>
              )}
            </div>
          )}

          {/* Verified User Display */}
          {movieJudge.user && (
            <div className="bg-[rgba(16,18,24,0.6)] border border-[rgba(0,224,255,0.1)] rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[rgba(0,224,255,0.1)] rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-[#00E0FF]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#F2F4F8]">Verified</p>
                    <p className="text-xs text-[#A6A9B3]">{movieJudge.user.email}</p>
                  </div>
                </div>
                <button
                  onClick={movieJudge.signOut}
                  className="p-2 hover:bg-[rgba(0,224,255,0.1)] rounded-lg transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4 text-[#A6A9B3]" />
                </button>
              </div>
            </div>
          )}

          {/* Search Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[#A6A9B3]">
              Movie Title
            </label>
            <div className="relative">
              <input
                type="text"
                value={movieJudge.searchQuery}
                onChange={(e) => movieJudge.handleSearchChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter a movie title..."
                disabled={movieJudge.isLoading}
                className="w-full px-4 py-3 bg-[rgba(16,18,24,0.8)] border border-[rgba(0,224,255,0.2)] rounded-lg focus:border-[#00E0FF] focus:outline-none transition-colors text-[#F2F4F8] placeholder-[#A6A9B3]"
              />
              <button
                onClick={handleSearch}
                disabled={movieJudge.isLoading || !movieJudge.searchQuery.trim()}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#A6A9B3] hover:text-[#00E0FF] transition-colors disabled:opacity-50"
              >
                {movieJudge.isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#00E0FF] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </div>
            {movieJudge.error && (
              <p className="text-sm text-red-400">{movieJudge.error}</p>
            )}
          </div>

          {/* User's Previous Verdict Display */}
          {movieJudge.user && movieJudge.hasAlreadyJudged && movieJudge.userVerdict && (
            <div className="bg-[rgba(16,18,24,0.6)] border border-[rgba(0,224,255,0.1)] rounded-xl p-4">
              <div className="flex items-center gap-3">
                {movieJudge.userVerdict === 'cinema' ? (
                  <CheckCircle className="w-6 h-6 text-[#00E0FF]" />
                ) : (
                  <XCircle className="w-6 h-6 text-[#FFD700]" />
                )}
                <p className="text-sm text-[#A6A9B3]">Your verdict: <span className={`font-medium ${movieJudge.userVerdict === 'cinema' ? 'text-[#00E0FF]' : 'text-[#FFD700]'}`}>{movieJudge.userVerdict === 'cinema' ? 'Cinema' : 'Not Cinema'}</span></p>
              </div>
            </div>
          )}

          {/* Verdict Display */}
          {movieJudge.verdict && (
            <div className={`bg-[rgba(16,18,24,0.6)] border border-[rgba(0,224,255,0.1)] rounded-xl p-6 transform transition-all duration-500 ${
              showVerdictAnimation ? 'scale-105 shadow-2xl' : 'scale-100'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                {movieJudge.verdict === 'cinema' ? (
                  <CheckCircle className="w-8 h-8 text-[#00E0FF]" />
                ) : (
                  <XCircle className="w-8 h-8 text-[#FFD700]" />
                )}
                <h3 className={`text-2xl font-bold font-space-grotesk ${
                  movieJudge.verdict === 'cinema' ? 'text-[#00E0FF]' : 'text-[#FFD700]'
                }`}>
                  {movieJudge.verdict === 'cinema' ? 'Yes. It\'s Cinema.' : 'Not Quite Cinema.'}
                </h3>
              </div>
              <p className="text-sm text-[#A6A9B3] leading-relaxed">
                {getVerdictMessage()}
              </p>
            </div>
          )}

          {/* Manual Verdict Buttons */}
          {movieJudge.searchQuery && !movieJudge.verdict && !movieJudge.isLoading && !movieJudge.currentMovie && !movieJudge.showEmailPrompt && (
            <div className="bg-[rgba(16,18,24,0.6)] border border-[rgba(0,224,255,0.1)] rounded-xl p-6">
              <h4 className="text-lg font-medium font-space-grotesk mb-4 text-[#00E0FF] text-center">
                Your Verdict on "{movieJudge.searchQuery}"
              </h4>
              <div className="flex gap-3">
                <button
                  onClick={() => movieJudge.handleVerdictSubmit('not-cinema')}
                  disabled={movieJudge.isSubmittingVerdict || movieJudge.showEmailPrompt || (movieJudge.user && movieJudge.hasAlreadyJudged)}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#FFD700] hover:bg-[#E0C000] text-[#0B0B10] rounded-lg transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {movieJudge.isSubmittingVerdict ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#0B0B10] border-t-transparent rounded-full animate-spin" />
                      <span className="font-medium">Recording...</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      <span className="font-medium">Not Cinema</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => movieJudge.handleVerdictSubmit('cinema')}
                  disabled={movieJudge.isSubmittingVerdict || movieJudge.showEmailPrompt || (movieJudge.user && movieJudge.hasAlreadyJudged)}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#00E0FF] hover:bg-[#00C0E0] text-[#0B0B10] rounded-lg transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {movieJudge.isSubmittingVerdict ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#0B0B10] border-t-transparent rounded-full animate-spin" />
                      <span className="font-medium">Recording...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Cinema</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Database Movie Verdict Buttons */}
          {movieJudge.currentMovie && !movieJudge.hasAlreadyJudged && !movieJudge.showEmailPrompt && (
            <div className="text-center">
              <p className="text-sm text-[#A6A9B3] mb-4">
                {movieJudge.user ? 'Cast your verdict for this movie:' : 'Click to vote (email required):'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => movieJudge.handleVerdictSubmit('not-cinema')}
                  disabled={movieJudge.isSubmittingVerdict || movieJudge.showEmailPrompt || (movieJudge.user && movieJudge.hasAlreadyJudged)}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#FFD700] hover:bg-[#E0C000] text-[#0B0B10] rounded-lg transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {movieJudge.isSubmittingVerdict ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#0B0B10] border-t-transparent rounded-full animate-spin" />
                      <span className="font-medium">Recording...</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      <span className="font-medium">Not Cinema</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => movieJudge.handleVerdictSubmit('cinema')}
                  disabled={movieJudge.isSubmittingVerdict || movieJudge.showEmailPrompt || (movieJudge.user && movieJudge.hasAlreadyJudged)}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#00E0FF] hover:bg-[#00C0E0] text-[#0B0B10] rounded-lg transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {movieJudge.isSubmittingVerdict ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#0B0B10] border-t-transparent rounded-full animate-spin" />
                      <span className="font-medium">Recording...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Cinema</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Mood Selector */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[#A6A9B3]">
              Current Mood
            </label>
            <div className="grid grid-cols-2 gap-2">
              {movieJudge.moods.map((mood) => (
                <button
                  key={mood}
                  onClick={() => movieJudge.handleMoodChange(mood)}
                  className={`px-3 py-3 text-sm rounded-lg border transition-all ${
                    movieJudge.selectedMood === mood
                      ? 'bg-[#00E0FF] text-[#0B0B10] border-[#00E0FF] shadow-lg'
                      : 'bg-[rgba(16,18,24,0.6)] text-[#A6A9B3] border-[rgba(0,224,255,0.1)] hover:border-[#00E0FF] hover:text-[#00E0FF]'
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>

          {/* Mood Recommendations */}
          <div className="bg-[rgba(16,18,24,0.4)] border border-[rgba(0,224,255,0.05)] rounded-xl p-4">
            <h4 className="text-sm font-medium font-space-grotesk mb-3 text-[#00E0FF]">
              {movieJudge.selectedMood} Picks
            </h4>
            <div className="space-y-2">
              {getMoodRecommendations().map((movie, index) => (
                <div key={index} className="text-sm text-[#A6A9B3] hover:text-[#F2F4F8] transition-colors cursor-pointer">
                  <span className="text-[#F2F4F8] font-medium">{movie.title}</span>
                  <span className="mx-2">•</span>
                  <span>{movie.director} ({movie.year})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex gap-2 p-6 border-t border-[rgba(0,224,255,0.1)]">
          <button
            onClick={movieJudge.resetPanel}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[rgba(16,18,24,0.8)] border border-[rgba(0,224,255,0.1)] rounded-lg hover:border-[#00E0FF] transition-colors text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={movieJudge.randomizeSelection}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[rgba(16,18,24,0.8)] border border-[rgba(0,224,255,0.1)] rounded-lg hover:border-[#00E0FF] transition-colors text-sm"
          >
            <Shuffle className="w-4 h-4" />
            Random
          </button>
          <button
            onClick={movieJudge.shareVerdict}
            disabled={!movieJudge.verdict || !movieJudge.searchQuery}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#00E0FF] text-[#0B0B10] rounded-lg hover:bg-[#00C0E0] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#00E0FF]"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 bg-[rgba(16,18,24,0.95)] backdrop-blur-xl border-t border-[rgba(0,224,255,0.1)] z-40 transform transition-transform duration-300 ease-out translate-y-0 md:hidden flex flex-col" style={{ height: '85vh' }}>
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-[rgba(0,224,255,0.1)]">
          <h2 className="text-lg font-bold font-space-grotesk text-[#00E0FF]">Judge a Movie</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[rgba(0,224,255,0.1)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Mobile Email Prompt Section */}
          {!movieJudge.user && movieJudge.showEmailPrompt && (
            <div className="bg-[rgba(16,18,24,0.6)] border border-[rgba(0,224,255,0.1)] rounded-xl p-4">
              <h4 className="text-base font-medium font-space-grotesk mb-3 text-[#00E0FF]">
                Enter Your Email to Count Your Vote
              </h4>
              <p className="text-sm text-[#A6A9B3] mb-3">
                Your vote will only count after email verification.
              </p>
              
              {!movieJudge.isEmailVerificationSent ? (
                <div className="space-y-2">
                  <input
                    type="email"
                    value={movieJudge.userEmail}
                    onChange={(e) => movieJudge.handleEmailChange(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 bg-[rgba(16,18,24,0.8)] border border-[rgba(0,224,255,0.2)] rounded-lg focus:border-[#00E0FF] focus:outline-none transition-colors text-[#F2F4F8] placeholder-[#A6A9B3] text-base"
                  />
                  <button
                    onClick={movieJudge.sendVerificationEmail}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#00E0FF] text-[#0B0B10] rounded-lg hover:bg-[#00C0E0] transition-colors font-medium"
                  >
                    <Mail className="w-4 h-4" />
                    Send Verification Link
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-10 h-10 bg-[rgba(0,224,255,0.1)] rounded-full flex items-center justify-center mx-auto mb-2">
                    <Mail className="w-5 h-5 text-[#00E0FF]" />
                  </div>
                  <p className="text-sm text-[#00E0FF] mb-1">Check your email to complete your vote!</p>
                  <p className="text-xs text-[#A6A9B3] mb-2">
                    Verification link sent to <strong>{movieJudge.userEmail}</strong>
                  </p>
                  <button
                    onClick={() => movieJudge.sendVerificationEmail()}
                    className="text-xs text-[#00E0FF] hover:underline"
                  >
                    Resend email
                  </button>
                </div>
              )}
            </div>
          )}

          {movieJudge.user && (
            <div className="bg-[rgba(16,18,24,0.6)] border border-[rgba(0,224,255,0.1)] rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#00E0FF]" />
                <span className="text-sm text-[#F2F4F8]">{movieJudge.user.email}</span>
              </div>
              <button onClick={movieJudge.signOut} className="p-1 hover:bg-[rgba(0,224,255,0.1)] rounded">
                <LogOut className="w-4 h-4 text-[#A6A9B3]" />
              </button>
            </div>
          )}

          {/* Search Section */}
          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                value={movieJudge.searchQuery}
                onChange={(e) => movieJudge.handleSearchChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter a movie title..."
                disabled={movieJudge.isLoading}
                className="w-full px-4 py-3 bg-[rgba(16,18,24,0.8)] border border-[rgba(0,224,255,0.2)] rounded-lg focus:border-[#00E0FF] focus:outline-none transition-colors text-[#F2F4F8] placeholder-[#A6A9B3] text-base"
              />
              <button
                onClick={handleSearch}
                disabled={movieJudge.isLoading || !movieJudge.searchQuery.trim()}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#A6A9B3] hover:text-[#00E0FF] transition-colors disabled:opacity-50"
              >
                {movieJudge.isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#00E0FF] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </div>
            {movieJudge.error && (
              <p className="text-sm text-red-400">{movieJudge.error}</p>
            )}
          </div>

          {/* Mobile User's Previous Verdict Display */}
          {movieJudge.user && movieJudge.hasAlreadyJudged && movieJudge.userVerdict && (
            <div className="bg-[rgba(16,18,24,0.6)] border border-[rgba(0,224,255,0.1)] rounded-xl p-3">
              <div className="flex items-center gap-2">
                {movieJudge.userVerdict === 'cinema' ? (
                  <CheckCircle className="w-5 h-5 text-[#00E0FF]" />
                ) : (
                  <XCircle className="w-5 h-5 text-[#FFD700]" />
                )}
                <p className="text-sm text-[#A6A9B3]">Your verdict: <span className={`font-medium ${movieJudge.userVerdict === 'cinema' ? 'text-[#00E0FF]' : 'text-[#FFD700]'}`}>{movieJudge.userVerdict === 'cinema' ? 'Cinema' : 'Not Cinema'}</span></p>
              </div>
            </div>
          )}

          {/* Verdict Display */}
          {movieJudge.verdict && (
            <div className={`bg-[rgba(16,18,24,0.6)] border border-[rgba(0,224,255,0.1)] rounded-xl p-4 transform transition-all duration-500 ${
              showVerdictAnimation ? 'scale-105 shadow-2xl' : 'scale-100'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                {movieJudge.verdict === 'cinema' ? (
                  <CheckCircle className="w-6 h-6 text-[#00E0FF]" />
                ) : (
                  <XCircle className="w-6 h-6 text-[#FFD700]" />
                )}
                <h3 className={`text-xl font-bold font-space-grotesk ${
                  movieJudge.verdict === 'cinema' ? 'text-[#00E0FF]' : 'text-[#FFD700]'
                }`}>
                  {movieJudge.verdict === 'cinema' ? 'Yes. It\'s Cinema.' : 'Not Quite Cinema.'}
                </h3>
              </div>
              <p className="text-sm text-[#A6A9B3] leading-relaxed">
                {getVerdictMessage()}
              </p>
            </div>
          )}

          {/* Manual Verdict Buttons */}
          {movieJudge.searchQuery && !movieJudge.verdict && !movieJudge.isLoading && !movieJudge.currentMovie && !movieJudge.showEmailPrompt && (
            <div className="bg-[rgba(16,18,24,0.6)] border border-[rgba(0,224,255,0.1)] rounded-xl p-4">
              <h4 className="text-base font-medium font-space-grotesk mb-3 text-[#00E0FF] text-center">
                Your Verdict on "{movieJudge.searchQuery}"
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={() => movieJudge.handleVerdictSubmit('not-cinema')}
                  disabled={movieJudge.isSubmittingVerdict || (movieJudge.user && movieJudge.hasAlreadyJudged)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#FFD700] hover:bg-[#E0C000] text-[#0B0B10] rounded-lg transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {movieJudge.isSubmittingVerdict ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#0B0B10] border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm font-medium">Recording...</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Not Cinema</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => movieJudge.handleVerdictSubmit('cinema')}
                  disabled={movieJudge.isSubmittingVerdict || (movieJudge.user && movieJudge.hasAlreadyJudged)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#00E0FF] hover:bg-[#00C0E0] text-[#0B0B10] rounded-lg transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {movieJudge.isSubmittingVerdict ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#0B0B10] border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm font-medium">Recording...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Cinema</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Mood Selector */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#A6A9B3]">
              Current Mood
            </label>
            <div className="grid grid-cols-2 gap-2">
              {movieJudge.moods.map((mood) => (
                <button
                  key={mood}
                  onClick={() => movieJudge.handleMoodChange(mood)}
                  className={`px-3 py-3 text-sm rounded-lg border transition-all ${
                    movieJudge.selectedMood === mood
                      ? 'bg-[#00E0FF] text-[#0B0B10] border-[#00E0FF] shadow-lg'
                      : 'bg-[rgba(16,18,24,0.6)] text-[#A6A9B3] border-[rgba(0,224,255,0.1)] hover:border-[#00E0FF] hover:text-[#00E0FF]'
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>

          {/* Mood Recommendations */}
          <div className="bg-[rgba(16,18,24,0.4)] border border-[rgba(0,224,255,0.05)] rounded-xl p-3">
            <h4 className="text-sm font-medium font-space-grotesk mb-2 text-[#00E0FF]">
              {movieJudge.selectedMood} Picks
            </h4>
            <div className="space-y-1">
              {getMoodRecommendations().map((movie, index) => (
                <div key={index} className="text-sm text-[#A6A9B3] hover:text-[#F2F4F8] transition-colors">
                  <span className="text-[#F2F4F8] font-medium">{movie.title}</span>
                  <span className="mx-2">•</span>
                  <span>{movie.director} ({movie.year})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Actions Footer */}
        <div className="flex gap-2 p-4 border-t border-[rgba(0,224,255,0.1)]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <button
            onClick={movieJudge.resetPanel}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[rgba(16,18,24,0.8)] border border-[rgba(0,224,255,0.1)] rounded-lg hover:border-[#00E0FF] transition-colors text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={movieJudge.randomizeSelection}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[rgba(16,18,24,0.8)] border border-[rgba(0,224,255,0.1)] rounded-lg hover:border-[#00E0FF] transition-colors text-sm"
          >
            <Shuffle className="w-4 h-4" />
            Random
          </button>
          <button
            onClick={movieJudge.shareVerdict}
            disabled={!movieJudge.verdict || !movieJudge.searchQuery}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#00E0FF] text-[#0B0B10] rounded-lg hover:bg-[#00C0E0] transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>

      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-30"
      />
    </>
  );
};

export default MovieJudgePanel;