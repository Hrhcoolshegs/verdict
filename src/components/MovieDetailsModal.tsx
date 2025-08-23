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
        <div className="bg-[rgba(16,18,24,0.95)] backdrop-blur-xl border border-[rgba(0,224,255,0.1)] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[rgba(0,224,255,0.1)]">
            <div>
              <h2 className="text-2xl font-bold font-space-grotesk text-[#00E0FF]">
                {movie.title}
              </h2>
              <p className="text-[#A6A9B3]">{movie.director} • {movie.year}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[rgba(0,224,255,0.1)] rounded-lg transition-colors"
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
                <div className="space-y-4">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full max-w-sm mx-auto rounded-xl shadow-lg"
                  />
                  
                  {/* Verdict */}
                  <div className="text-center">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                      cinemaPercentage() >= 79 
                        ? 'bg-[#00E0FF] text-[#0B0B10]' 
                        : 'bg-[#FFD700] text-[#0B0B10]'
                    }`}>
                      <Star className="w-4 h-4" />
                      <span className="font-medium">
                        {cinemaPercentage()}% say Cinema
                      </span>
                    </div>
                    <p className="text-sm text-[#A6A9B3] mt-2">
                      {movie.cinemaVotes + movie.notCinemaVotes} total votes
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-4">
                  {/* Plot */}
                  {movie.plot && (
                    <div>
                      <h3 className="text-lg font-semibold text-[#00E0FF] mb-2">Plot</h3>
                      <p className="text-[#F2F4F8] leading-relaxed">{movie.plot}</p>
                    </div>
                  )}

                  {/* Technical Specs */}
                  <div className="grid grid-cols-2 gap-4">
                    {movie.runtime_minutes && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#00E0FF]" />
                        <span className="text-sm text-[#A6A9B3]">Runtime:</span>
                        <span className="text-sm text-[#F2F4F8]">{formatRuntime(movie.runtime_minutes)}</span>
                      </div>
                    )}
                    
                    {movie.budget_usd && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-[#00E0FF]" />
                        <span className="text-sm text-[#A6A9B3]">Budget:</span>
                        <span className="text-sm text-[#F2F4F8]">{formatBudget(movie.budget_usd)}</span>
                      </div>
                    )}
                    
                    {movie.aspect_ratio && (
                      <div className="flex items-center gap-2">
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
                        <h3 className="text-lg font-semibold text-[#00E0FF]">AI Analysis</h3>
                      </div>
                      <p className="text-[#F2F4F8] leading-relaxed italic">{movie.ai_rationale}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Technical Scores */}
              {(movie.technical_craftsmanship || movie.narrative_depth || movie.artistic_ambition) && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-[#00E0FF]" />
                    <h3 className="text-lg font-semibold text-[#00E0FF]">Technical Analysis</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {movie.technical_craftsmanship && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#00E0FF]">{movie.technical_craftsmanship}/10</div>
                        <div className="text-sm text-[#A6A9B3]">Technical Craft</div>
                      </div>
                    )}
                    {movie.narrative_depth && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#00E0FF]">{movie.narrative_depth}/10</div>
                        <div className="text-sm text-[#A6A9B3]">Narrative Depth</div>
                      </div>
                    )}
                    {movie.artistic_ambition && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#00E0FF]">{movie.artistic_ambition}/10</div>
                        <div className="text-sm text-[#A6A9B3]">Artistic Ambition</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Micro Genres */}
              {movie.micro_genres && movie.micro_genres.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-[#00E0FF] mb-3">Micro-Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.micro_genres.map((genre, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[rgba(0,224,255,0.1)] border border-[rgba(0,224,255,0.2)] rounded-full text-sm text-[#00E0FF]"
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
                  <h3 className="text-lg font-semibold text-[#00E0FF] mb-3">Cultural Context</h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.cultural_movements.map((movement, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[rgba(255,215,0,0.1)] border border-[rgba(255,215,0,0.2)] rounded-full text-sm text-[#FFD700]"
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
                    <h3 className="text-lg font-semibold text-[#00E0FF]">Filming Locations</h3>
                  </div>
                  <div className="space-y-1">
                    {movie.filming_locations.map((location, index) => (
                      <div key={index} className="text-sm text-[#F2F4F8]">• {location}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cinematography Techniques */}
              {movie.cinematography_techniques && movie.cinematography_techniques.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Camera className="w-4 h-4 text-[#00E0FF]" />
                    <h3 className="text-lg font-semibold text-[#00E0FF]">Cinematography</h3>
                  </div>
                  <div className="space-y-1">
                    {movie.cinematography_techniques.map((technique, index) => (
                      <div key={index} className="text-sm text-[#F2F4F8]">• {technique}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Camera Equipment */}
              {movie.camera_equipment && (
                <div>
                  <h3 className="text-lg font-semibold text-[#00E0FF] mb-3">Camera Equipment</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {movie.camera_equipment.primary_camera && (
                      <div>
                        <span className="text-[#A6A9B3]">Camera:</span>
                        <div className="text-[#F2F4F8]">{movie.camera_equipment.primary_camera}</div>
                      </div>
                    )}
                    {movie.camera_equipment.lenses && (
                      <div>
                        <span className="text-[#A6A9B3]">Lenses:</span>
                        <div className="text-[#F2F4F8]">{movie.camera_equipment.lenses.join(', ')}</div>
                      </div>
                    )}
                    {movie.camera_equipment.film_stock && (
                      <div>
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
                    <h3 className="text-lg font-semibold text-[#00E0FF]">Color Palette</h3>
                  </div>
                  <div className="flex gap-4">
                    {movie.dominant_colors.primary && (
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded-full border border-[rgba(255,255,255,0.2)]"
                          style={{ backgroundColor: movie.dominant_colors.primary }}
                        />
                        <span className="text-sm text-[#A6A9B3]">Primary</span>
                      </div>
                    )}
                    {movie.dominant_colors.secondary && (
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded-full border border-[rgba(255,255,255,0.2)]"
                          style={{ backgroundColor: movie.dominant_colors.secondary }}
                        />
                        <span className="text-sm text-[#A6A9B3]">Secondary</span>
                      </div>
                    )}
                    {movie.dominant_colors.accent && (
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded-full border border-[rgba(255,255,255,0.2)]"
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