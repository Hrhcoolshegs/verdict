import React, { useState, useEffect } from 'react';
import { Clock, DollarSign, Camera, Award, Sparkles } from 'lucide-react';
import FilmStripBorder from './FilmStripBorder';
import { Movie, calculateCinemaPercentage, formatRuntime, formatBudget, getGenreColor } from '../../data/movies';

interface CinematicMovieCardProps {
  movie: Movie;
  onClick?: () => void;
  variant?: 'default' | 'compact' | 'detailed';
  showVerdictButton?: boolean;
  onVerdictClick?: (verdict: 'cinema' | 'not-cinema') => void;
  isVoting?: boolean;
  userVerdict?: 'cinema' | 'not-cinema' | null;
  className?: string;
}

const CinematicMovieCard: React.FC<CinematicMovieCardProps> = ({
  movie,
  onClick,
  variant = 'default',
  showVerdictButton = false,
  onVerdictClick,
  isVoting = false,
  userVerdict,
  className = ''
}) => {
  const [dominantColor, setDominantColor] = useState<string>('#00E0FF');
  const [imageLoaded, setImageLoaded] = useState(false);
  const cinemaPercentage = calculateCinemaPercentage(movie);
  const isCinema = cinemaPercentage >= 70;

  // Extract dominant color from poster (simplified version)
  useEffect(() => {
    if (movie.dominant_colors?.primary) {
      setDominantColor(movie.dominant_colors.primary);
    } else if (movie.micro_genres && movie.micro_genres.length > 0) {
      setDominantColor(getGenreColor(movie.micro_genres[0]));
    }
  }, [movie]);

  const cardVariants = {
    default: 'w-full max-w-sm',
    compact: 'w-full max-w-xs',
    detailed: 'w-full max-w-lg'
  };

  const handleCardClick = () => {
    if (onClick && !showVerdictButton) {
      onClick();
    }
  };

  return (
    <div 
      className={`${cardVariants[variant]} ${className} group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:z-10`}
      onClick={handleCardClick}
      style={{
        filter: `drop-shadow(0 10px 20px ${dominantColor}20)`
      }}
    >
      <FilmStripBorder 
        variant="card" 
        animated={isVoting}
        className="bg-gradient-to-br from-[rgba(16,18,24,0.95)] to-[rgba(16,18,24,0.8)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] transition-all duration-300"
      >
        <div className="space-y-4">
          {/* Movie Poster */}
          <div className="relative overflow-hidden rounded-lg aspect-[2/3] group-hover:shadow-2xl transition-shadow duration-300">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse flex items-center justify-center">
                <Camera className="w-12 h-12 text-gray-600" />
              </div>
            )}
            <img
              src={movie.poster}
              alt={`${movie.title} poster`}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
            
            {/* Verdict Overlay */}
            <div className="absolute top-2 right-2">
              <div 
                className={`px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${
                  isCinema 
                    ? 'bg-[#00E0FF]/80 text-[#0B0B10]' 
                    : 'bg-[#FFD700]/80 text-[#0B0B10]'
                }`}
              >
                {cinemaPercentage}% Cinema
              </div>
            </div>

            {/* User Verdict Indicator */}
            {userVerdict && (
              <div className="absolute top-2 left-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  userVerdict === 'cinema' 
                    ? 'bg-[#00E0FF] text-[#0B0B10]' 
                    : 'bg-[#FFD700] text-[#0B0B10]'
                }`}>
                  {userVerdict === 'cinema' ? '✓' : '✗'}
                </div>
              </div>
            )}

            {/* Aspect Ratio Indicator */}
            {movie.aspect_ratio && variant === 'detailed' && (
              <div className="absolute bottom-2 left-2">
                <div className="px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-white">
                  {movie.aspect_ratio}
                </div>
              </div>
            )}
          </div>

          {/* Movie Information */}
          <div className="space-y-3">
            <div>
              <h3 
                className="font-bold text-lg leading-tight mb-1 group-hover:text-[#00E0FF] transition-colors duration-300"
                style={{ 
                  fontFamily: cinemaPercentage >= 80 ? 'Bebas Neue, sans-serif' : 'inherit',
                  fontSize: cinemaPercentage >= 80 ? '1.25rem' : '1.125rem'
                }}
              >
                {movie.title}
              </h3>
              <p className="text-[#A6A9B3] text-sm">
                {movie.director} • {movie.year}
              </p>
            </div>

            {/* Micro-genres */}
            {movie.micro_genres && movie.micro_genres.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {movie.micro_genres.slice(0, 3).map((genre, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs rounded-full border"
                    style={{
                      backgroundColor: `${getGenreColor(genre)}20`,
                      borderColor: `${getGenreColor(genre)}40`,
                      color: getGenreColor(genre)
                    }}
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Technical Details (for detailed variant) */}
            {variant === 'detailed' && (
              <div className="grid grid-cols-2 gap-2 text-xs text-[#A6A9B3]">
                {movie.runtime_minutes && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatRuntime(movie.runtime_minutes)}
                  </div>
                )}
                {movie.budget_usd && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {formatBudget(movie.budget_usd)}
                  </div>
                )}
                {movie.awards && Object.keys(movie.awards).length > 0 && (
                  <div className="flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Awards
                  </div>
                )}
                {movie.technical_craftsmanship && movie.technical_craftsmanship >= 8 && (
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Technical Excellence
                  </div>
                )}
              </div>
            )}

            {/* AI Rationale Preview */}
            {movie.ai_rationale && variant !== 'compact' && (
              <p className="text-xs text-[#A6A9B3] line-clamp-2 italic">
                "{movie.ai_rationale.substring(0, 100)}..."
              </p>
            )}

            {/* Verdict Buttons */}
            {showVerdictButton && onVerdictClick && (
              <div className="flex gap-2 pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onVerdictClick('not-cinema');
                  }}
                  disabled={isVoting || !!userVerdict}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all duration-200 ${
                    userVerdict === 'not-cinema'
                      ? 'bg-[#FFD700] text-[#0B0B10] ring-2 ring-[#FFD700]'
                      : 'bg-[rgba(255,215,0,0.1)] hover:bg-[rgba(255,215,0,0.2)] text-[#FFD700] disabled:opacity-50'
                  }`}
                >
                  {isVoting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Judging...
                    </div>
                  ) : userVerdict === 'not-cinema' ? (
                    '✗ Not Cinema'
                  ) : (
                    'Not Cinema'
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onVerdictClick('cinema');
                  }}
                  disabled={isVoting || !!userVerdict}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all duration-200 ${
                    userVerdict === 'cinema'
                      ? 'bg-[#00E0FF] text-[#0B0B10] ring-2 ring-[#00E0FF]'
                      : 'bg-[rgba(0,224,255,0.1)] hover:bg-[rgba(0,224,255,0.2)] text-[#00E0FF] disabled:opacity-50'
                  }`}
                >
                  {isVoting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Judging...
                    </div>
                  ) : userVerdict === 'cinema' ? (
                    '✓ Cinema'
                  ) : (
                    'Cinema'
                  )}
                </button>
              </div>
            )}

            {/* Vote Count */}
            <div className="text-center text-xs text-[#A6A9B3] pt-1">
              {(movie.cinemaVotes + movie.notCinemaVotes).toLocaleString()} verdicts cast
            </div>
          </div>
        </div>
      </FilmStripBorder>
    </div>
  );
};

export default CinematicMovieCard;