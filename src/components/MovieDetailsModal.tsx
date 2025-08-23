import React from 'react';
import { X, Clock, DollarSign, Camera, MapPin, Palette, Star, Brain, Award } from 'lucide-react';
import type { EnhancedMovie } from '../utils/movieSeeder';

interface MovieDetailsModalProps {
  movie: EnhancedMovie | null;
  isOpen: boolean;
  onClose: () => void;
}

const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({ movie, isOpen, onClose }) => {
  if (!isOpen || !movie) return null;

  const formatBudget = (budget?: number) => {
    if (!budget) return 'Unknown';
    if (budget >= 1000000) {
      return `$${(budget / 1000000).toFixed(1)}M`;
    }
    return `$${(budget / 1000).toFixed(0)}K`;
  };

  const formatRuntime = (minutes?: number) => {
    if (!minutes) return 'Unknown';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const cinemaPercentage = () => {
    const total = movie.cinemaVotes + movie.notCinemaVotes;
    if (total === 0) return 0;
    return Math.round((movie.cinemaVotes / total) * 100);
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
                {movie.title}
              </h2>
              <p className="director-credit text-[#A6A9B3]">{movie.director} • {movie.year}</p>
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
              {/* Main Info Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Poster */}
                <div className="space-y-4 parallax-slow">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full max-w-sm mx-auto rounded-xl shadow-lg film-strip-border aspect-185 cinema-card-enhanced"
                  />
                  
                  {/* Verdict */}
                  <div className="text-center">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                      cinemaPercentage() >= 79 
                        ? 'bg-[#00E0FF] text-[#0B0B10] cinema-glow' 
                        : 'bg-[#FFD700] text-[#0B0B10] not-cinema-matte'
                    }`}>
                      <Star className="w-4 h-4" />
                      <span className="font-medium cinema-title">
                        {cinemaPercentage()}% say Cinema
                      </span>
                    </div>
                    <p className="text-sm text-[#A6A9B3] mt-2 director-credit">
                      {movie.cinemaVotes + movie.notCinemaVotes} total votes
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-4 parallax-medium">
                  {/* Plot */}
                  {movie.plot && (
                    <div>
                      <h3 className="cinema-title text-lg text-[#00E0FF] mb-2 text-shadow-cinema">Plot</h3>
                      <p className="text-[#F2F4F8] leading-relaxed">{movie.plot}</p>
                    </div>
                  )}

                  {/* Technical Specs */}
                  <div className="grid grid-cols-2 gap-4">
                    {movie.runtime_minutes && (
                      <div className="flex items-center gap-2 cinema-card-enhanced p-2 rounded">
                        <Clock className="w-4 h-4 text-[#00E0FF]" />
                        <span className="text-sm text-[#A6A9B3]">Runtime:</span>
                        <span className="text-sm text-[#F2F4F8]">{formatRuntime(movie.runtime_minutes)}</span>
                      </div>
                    )}
                    
                    {movie.budget_usd && (
                      <div className="flex items-center gap-2 cinema-card-enhanced p-2 rounded">
                        <DollarSign className="w-4 h-4 text-[#00E0FF]" />
                        <span className="text-sm text-[#A6A9B3]">Budget:</span>
                        <span className="text-sm text-[#F2F4F8]">{formatBudget(movie.budget_usd)}</span>
                      </div>
                    )}
                    
                    {movie.aspect_ratio && (
                      <div className="flex items-center gap-2 cinema-card-enhanced p-2 rounded">
                        <Camera className="w-4 h-4 text-[#00E0FF]" />
                        <span className="text-sm text-[#A6A9B3]">Aspect:</span>
                        <span className="text-sm text-[#F2F4F8]">{movie.aspect_ratio}</span>
                      </div>
                    )}
                  </div>

                  {/* AI Rationale */}
                  {movie.ai_rationale && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-[#00E0FF]" />
                        <h3 className="cinema-title text-lg text-[#00E0FF] text-shadow-cinema">AI Analysis</h3>
                      </div>
                      <p className="text-[#F2F4F8] leading-relaxed italic director-credit">{movie.ai_rationale}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Technical Scores */}
              {(movie.technical_craftsmanship || movie.narrative_depth || movie.artistic_ambition) && (
                <div className="parallax-fast">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-[#00E0FF]" />
                    <h3 className="cinema-title text-lg text-[#00E0FF] text-shadow-cinema">Technical Analysis</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {movie.technical_craftsmanship && (
                      <div className="text-center cinema-card-enhanced p-3 rounded">
                        <div className="text-2xl font-bold text-[#00E0FF] cinema-title">{movie.technical_craftsmanship}/10</div>
                        <div className="text-sm text-[#A6A9B3] director-credit">Technical Craft</div>
                      </div>
                    )}
                    {movie.narrative_depth && (
                      <div className="text-center cinema-card-enhanced p-3 rounded">
                        <div className="text-2xl font-bold text-[#00E0FF] cinema-title">{movie.narrative_depth}/10</div>
                        <div className="text-sm text-[#A6A9B3] director-credit">Narrative Depth</div>
                      </div>
                    )}
                    {movie.artistic_ambition && (
                      <div className="text-center cinema-card-enhanced p-3 rounded">
                        <div className="text-2xl font-bold text-[#00E0FF] cinema-title">{movie.artistic_ambition}/10</div>
                        <div className="text-sm text-[#A6A9B3] director-credit">Artistic Ambition</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Micro Genres */}
              {movie.micro_genres && movie.micro_genres.length > 0 && (
                <div>
                  <h3 className="cinema-title text-lg text-[#00E0FF] mb-3 text-shadow-cinema">Micro-Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.micro_genres.map((genre, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 border border-[rgba(0,224,255,0.2)] rounded-full text-sm text-[#00E0FF] genre-icon-${genre.split('-')[0]} bg-opacity-20 border-opacity-30 transition-all duration-300 cinema-card-enhanced`}
                      >
                        {genre.replace(/-/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Cultural Movements */}
              {movie.cultural_movements && movie.cultural_movements.length > 0 && (
                <div>
                  <h3 className="cinema-title text-lg text-[#00E0FF] mb-3 text-shadow-cinema">Cultural Context</h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.cultural_movements.map((movement, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[rgba(255,215,0,0.1)] border border-[rgba(255,215,0,0.2)] rounded-full text-sm text-[#FFD700] transition-all duration-300 cinema-card-enhanced not-cinema-matte"
                      >
                        {movement}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Filming Locations */}
              {movie.filming_locations && movie.filming_locations.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-[#00E0FF]" />
                    <h3 className="cinema-title text-lg text-[#00E0FF] text-shadow-cinema">Filming Locations</h3>
                  </div>
                  <div className="space-y-1">
                    {movie.filming_locations.map((location, index) => (
                      <div key={index} className="text-sm text-[#F2F4F8] director-credit parallax-fast">• {location}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cinematography Techniques */}
              {movie.cinematography_techniques && movie.cinematography_techniques.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Camera className="w-4 h-4 text-[#00E0FF]" />
                    <h3 className="cinema-title text-lg text-[#00E0FF] text-shadow-cinema">Cinematography</h3>
                  </div>
                  <div className="space-y-1">
                    {movie.cinematography_techniques.map((technique, index) => (
                      <div key={index} className="text-sm text-[#F2F4F8] director-credit parallax-medium">• {technique}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Camera Equipment */}
              {movie.camera_equipment && (
                <div>
                  <h3 className="cinema-title text-lg text-[#00E0FF] mb-3 text-shadow-cinema">Camera Equipment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {movie.camera_equipment.primary_camera && (
                      <div className="cinema-card-enhanced p-2 rounded">
                        <span className="text-[#A6A9B3]">Camera:</span>
                        <div className="text-[#F2F4F8]">{movie.camera_equipment.primary_camera}</div>
                      </div>
                    )}
                    {movie.camera_equipment.lenses && (
                      <div className="cinema-card-enhanced p-2 rounded">
                        <span className="text-[#A6A9B3]">Lenses:</span>
                        <div className="text-[#F2F4F8]">{movie.camera_equipment.lenses.join(', ')}</div>
                      </div>
                    )}
                    {movie.camera_equipment.film_stock && (
                      <div className="cinema-card-enhanced p-2 rounded">
                        <span className="text-[#A6A9B3]">Format:</span>
                        <div className="text-[#F2F4F8]">{movie.camera_equipment.film_stock}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Color Palette */}
              {movie.dominant_colors && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Palette className="w-4 h-4 text-[#00E0FF]" />
                    <h3 className="cinema-title text-lg text-[#00E0FF] text-shadow-cinema">Color Palette</h3>
                  </div>
                  <div className="flex gap-4">
                    {movie.dominant_colors.primary && (
                      <div className="flex items-center gap-2 cinema-card-enhanced p-2 rounded">
                        <div 
                          className="w-6 h-6 rounded-full border border-[rgba(255,255,255,0.2)] cinema-border"
                          style={{ backgroundColor: movie.dominant_colors.primary }}
                        />
                        <span className="text-sm text-[#A6A9B3]">Primary</span>
                      </div>
                    )}
                    {movie.dominant_colors.secondary && (
                      <div className="flex items-center gap-2 cinema-card-enhanced p-2 rounded">
                        <div 
                          className="w-6 h-6 rounded-full border border-[rgba(255,255,255,0.2)] cinema-border"
                          style={{ backgroundColor: movie.dominant_colors.secondary }}
                        />
                        <span className="text-sm text-[#A6A9B3]">Secondary</span>
                      </div>
                    )}
                    {movie.dominant_colors.accent && (
                      <div className="flex items-center gap-2 cinema-card-enhanced p-2 rounded">
                        <div 
                          className="w-6 h-6 rounded-full border border-[rgba(255,255,255,0.2)] cinema-border"
                          style={{ backgroundColor: movie.dominant_colors.accent }}
                        />
                        <span className="text-sm text-[#A6A9B3]">Accent</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MovieDetailsModal;