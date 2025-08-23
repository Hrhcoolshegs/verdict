import React from 'react';
import { X, TrendingUp, Film, Award, Calendar, Target, Download, Trash2 } from 'lucide-react';
import { usePersonalJourney } from '../hooks/usePersonalJourney';
import type { Movie } from '../data/movies';

interface PersonalStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  allMovies: Movie[];
}

const PersonalStatsModal: React.FC<PersonalStatsModalProps> = ({ isOpen, onClose, allMovies }) => {
  const { 
    verdicts, 
    tasteProfile, 
    getPersonalStats, 
    getRecommendations, 
    getBlindSpots,
    clearAllData,
    exportData 
  } = usePersonalJourney();

  if (!isOpen) return null;

  const stats = getPersonalStats();
  const recommendations = getRecommendations(allMovies);
  const blindSpots = getBlindSpots(allMovies);

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all your personal data? This cannot be undone.')) {
      clearAllData();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-[rgba(16,18,24,0.95)] backdrop-blur-cinema border border-[rgba(0,224,255,0.1)] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden pointer-events-auto film-grain cinema-border cinema-card-enhanced">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[rgba(0,224,255,0.1)]">
            <div>
              <h2 className="cinema-title text-2xl text-[#00E0FF] text-shadow-cinema">
                Your Cinema Journey
              </h2>
              <p className="director-credit text-[#A6A9B3]">Personal taste evolution & insights</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[rgba(0,224,255,0.1)] rounded-lg transition-all duration-300 cinema-card-enhanced"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="p-6 space-y-6">
              {stats.totalMoviesJudged === 0 ? (
                <div className="text-center py-12">
                  <Film className="w-16 h-16 text-[#A6A9B3] mx-auto mb-4 opacity-50" />
                  <h3 className="cinema-title text-xl text-[#A6A9B3] mb-2">Start Your Journey</h3>
                  <p className="text-[#A6A9B3] director-credit">
                    Judge some movies to see your personal cinema insights and taste evolution.
                  </p>
                </div>
              ) : (
                <>
                  {/* Overview Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="cinema-card-enhanced p-4 rounded-xl text-center parallax-slow">
                      <div className="text-3xl font-bold text-[#00E0FF] cinema-title mb-1">
                        {stats.totalMoviesJudged}
                      </div>
                      <div className="text-sm text-[#A6A9B3] director-credit">Movies Judged</div>
                    </div>
                    
                    <div className="cinema-card-enhanced p-4 rounded-xl text-center parallax-medium">
                      <div className="text-3xl font-bold text-[#00E0FF] cinema-title mb-1">
                        {stats.cinemaPercentage}%
                      </div>
                      <div className="text-sm text-[#A6A9B3] director-credit">Cinema Rate</div>
                    </div>
                    
                    <div className="cinema-card-enhanced p-4 rounded-xl text-center parallax-fast">
                      <div className="text-3xl font-bold text-[#00E0FF] cinema-title mb-1">
                        {stats.judgingStreak}
                      </div>
                      <div className="text-sm text-[#A6A9B3] director-credit">Day Streak</div>
                    </div>
                    
                    <div className="cinema-card-enhanced p-4 rounded-xl text-center parallax-slow">
                      <div className="text-3xl font-bold text-[#00E0FF] cinema-title mb-1">
                        {stats.averageConfidence}
                      </div>
                      <div className="text-sm text-[#A6A9B3] director-credit">Avg Confidence</div>
                    </div>
                  </div>

                  {/* Taste Evolution Chart */}
                  <div className="cinema-card-enhanced p-6 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-[#00E0FF]" />
                      <h3 className="cinema-title text-lg text-[#00E0FF] text-shadow-cinema">Taste Evolution</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#A6A9B3] director-credit">Cinema Preference</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-[rgba(0,224,255,0.1)] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#00E0FF] rounded-full transition-all duration-500 cinema-glow"
                              style={{ width: `${stats.cinemaPercentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-[#F2F4F8] font-medium">{stats.cinemaPercentage}%</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#A6A9B3] director-credit">Confidence Level</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-[rgba(255,215,0,0.1)] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#FFD700] rounded-full transition-all duration-500 not-cinema-matte"
                              style={{ width: `${(stats.averageConfidence / 10) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-[#F2F4F8] font-medium">{stats.averageConfidence}/10</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Verdicts */}
                  <div className="cinema-card-enhanced p-6 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <Film className="w-5 h-5 text-[#00E0FF]" />
                      <h3 className="cinema-title text-lg text-[#00E0FF] text-shadow-cinema">Recent Verdicts</h3>
                    </div>
                    
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {verdicts.slice(0, 10).map((verdict) => (
                        <div key={verdict.movieId} className="flex items-center justify-between p-3 bg-[rgba(16,18,24,0.4)] rounded-lg">
                          <div>
                            <div className="text-sm font-medium text-[#F2F4F8]">{verdict.movieTitle}</div>
                            <div className="text-xs text-[#A6A9B3] director-credit">
                              {new Date(verdict.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            verdict.verdict === 'cinema' 
                              ? 'bg-[rgba(0,224,255,0.1)] text-[#00E0FF] border border-[rgba(0,224,255,0.2)]' 
                              : 'bg-[rgba(255,215,0,0.1)] text-[#FFD700] border border-[rgba(255,215,0,0.2)]'
                          }`}>
                            {verdict.verdict === 'cinema' ? 'Cinema' : 'Not Cinema'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  {recommendations.length > 0 && (
                    <div className="cinema-card-enhanced p-6 rounded-xl">
                      <div className="flex items-center gap-2 mb-4">
                        <Award className="w-5 h-5 text-[#00E0FF]" />
                        <h3 className="cinema-title text-lg text-[#00E0FF] text-shadow-cinema">Recommended for You</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {recommendations.slice(0, 4).map((movie) => (
                          <div key={movie.id} className="flex items-center gap-3 p-3 bg-[rgba(16,18,24,0.4)] rounded-lg hover:bg-[rgba(16,18,24,0.6)] transition-colors">
                            <img
                              src={movie.poster}
                              alt={movie.title}
                              className="w-12 h-16 object-cover rounded film-strip-border"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-[#F2F4F8] truncate">{movie.title}</div>
                              <div className="text-xs text-[#A6A9B3] director-credit">{movie.director} • {movie.year}</div>
                              <div className="text-xs text-[#00E0FF] mt-1">
                                {Math.round((movie.cinemaVotes / (movie.cinemaVotes + movie.notCinemaVotes)) * 100)}% Cinema
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Blind Spots */}
                  {blindSpots.length > 0 && (
                    <div className="cinema-card-enhanced p-6 rounded-xl">
                      <div className="flex items-center gap-2 mb-4">
                        <Target className="w-5 h-5 text-[#FFD700]" />
                        <h3 className="cinema-title text-lg text-[#FFD700] text-shadow-cinema">Your Blind Spots</h3>
                      </div>
                      
                      <div className="space-y-2">
                        {blindSpots.map((blindSpot) => (
                          <div key={blindSpot.movieId} className="p-3 bg-[rgba(255,215,0,0.05)] border border-[rgba(255,215,0,0.1)] rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium text-[#F2F4F8]">{blindSpot.title}</div>
                                <div className="text-xs text-[#A6A9B3] director-credit">
                                  {blindSpot.director} • {blindSpot.year}
                                </div>
                              </div>
                              <div className="text-xs text-[#FFD700] font-medium px-2 py-1 bg-[rgba(255,215,0,0.1)] rounded">
                                {blindSpot.importance}
                              </div>
                            </div>
                            <div className="text-xs text-[#A6A9B3] mt-2 director-credit">{blindSpot.reason}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Data Management */}
                  <div className="cinema-card-enhanced p-6 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="w-5 h-5 text-[#00E0FF]" />
                      <h3 className="cinema-title text-lg text-[#00E0FF] text-shadow-cinema">Data Management</h3>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={exportData}
                        className="flex items-center gap-2 px-4 py-2 bg-[rgba(0,224,255,0.1)] border border-[rgba(0,224,255,0.2)] rounded-lg hover:border-[#00E0FF] transition-all duration-300 text-sm cinema-card-enhanced"
                      >
                        <Download className="w-4 h-4" />
                        Export Data
                      </button>
                      
                      <button
                        onClick={handleClearData}
                        className="flex items-center gap-2 px-4 py-2 bg-[rgba(255,0,0,0.1)] border border-[rgba(255,0,0,0.2)] rounded-lg hover:border-red-400 transition-all duration-300 text-sm text-red-400 cinema-card-enhanced"
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear All Data
                      </button>
                    </div>
                    
                    <div className="mt-4 text-xs text-[#A6A9B3] director-credit">
                      All data is stored locally on your device. Last updated: {stats.lastJudgedDate || 'Never'}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PersonalStatsModal;