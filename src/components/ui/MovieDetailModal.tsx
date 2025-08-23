import React, { useState, useEffect } from 'react';
import { X, Clock, DollarSign, Camera, Award, Users, Star, Calendar, MapPin, Palette, Film, Quote } from 'lucide-react';
import FilmStripBorder from './FilmStripBorder';
import { Movie, calculateCinemaPercentage, formatRuntime, formatBudget, getGenreColor, CastCrewMember } from '../../data/movies';

interface MovieDetailModalProps {
  movie: Movie;
  isOpen: boolean;
  onClose: () => void;
  onVerdictClick?: (verdict: 'cinema' | 'not-cinema') => void;
  isVoting?: boolean;
  userVerdict?: 'cinema' | 'not-cinema' | null;
  castCrew?: CastCrewMember[];
}

const MovieDetailModal: React.FC<MovieDetailModalProps> = ({
  movie,
  isOpen,
  onClose,
  onVerdictClick,
  isVoting = false,
  userVerdict,
  castCrew = []
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'technical' | 'cultural' | 'cast'>('overview');
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const cinemaPercentage = calculateCinemaPercentage(movie);
  const isCinema = cinemaPercentage >= 70;
  const totalVotes = movie.cinemaVotes + movie.notCinemaVotes;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Film },
    { id: 'technical', label: 'Technical', icon: Camera },
    { id: 'cultural', label: 'Cultural', icon: Quote },
    { id: 'cast', label: 'Cast & Crew', icon: Users }
  ];

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Plot */}
      {movie.plot && (
        <div>
          <h4 className="text-lg font-semibold text-[#00E0FF] mb-3">Synopsis</h4>
          <p className="text-[#F2F4F8] leading-relaxed">{movie.plot}</p>
        </div>
      )}

      {/* AI Rationale */}
      {movie.ai_rationale && (
        <div>
          <h4 className="text-lg font-semibold text-[#00E0FF] mb-3">Cinema Analysis</h4>
          <div className="bg-[rgba(0,224,255,0.05)] border border-[rgba(0,224,255,0.1)] rounded-lg p-4">
            <p className="text-[#F2F4F8] leading-relaxed italic">"{movie.ai_rationale}"</p>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {movie.technical_craftsmanship && (
          <div className="text-center p-3 bg-[rgba(16,18,24,0.6)] rounded-lg">
            <div className="text-2xl font-bold text-[#00E0FF]">{movie.technical_craftsmanship}/10</div>
            <div className="text-xs text-[#A6A9B3]">Technical Craft</div>
          </div>
        )}
        {movie.narrative_depth && (
          <div className="text-center p-3 bg-[rgba(16,18,24,0.6)] rounded-lg">
            <div className="text-2xl font-bold text-[#00E0FF]">{movie.narrative_depth}/10</div>
            <div className="text-xs text-[#A6A9B3]">Narrative Depth</div>
          </div>
        )}
        {movie.artistic_ambition && (
          <div className="text-center p-3 bg-[rgba(16,18,24,0.6)] rounded-lg">
            <div className="text-2xl font-bold text-[#00E0FF]">{movie.artistic_ambition}/10</div>
            <div className="text-xs text-[#A6A9B3]">Artistic Ambition</div>
          </div>
        )}
        <div className="text-center p-3 bg-[rgba(16,18,24,0.6)] rounded-lg">
          <div className="text-2xl font-bold text-[#00E0FF]">{cinemaPercentage}%</div>
          <div className="text-xs text-[#A6A9B3]">Cinema Score</div>
        </div>
      </div>
    </div>
  );

  const renderTechnicalTab = () => (
    <div className="space-y-6">
      {/* Basic Technical Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {movie.runtime_minutes && (
          <div className="flex items-center gap-3 p-3 bg-[rgba(16,18,24,0.6)] rounded-lg">
            <Clock className="w-5 h-5 text-[#00E0FF]" />
            <div>
              <div className="font-medium text-[#F2F4F8]">{formatRuntime(movie.runtime_minutes)}</div>
              <div className="text-xs text-[#A6A9B3]">Runtime</div>
            </div>
          </div>
        )}
        {movie.budget_usd && (
          <div className="flex items-center gap-3 p-3 bg-[rgba(16,18,24,0.6)] rounded-lg">
            <DollarSign className="w-5 h-5 text-[#00E0FF]" />
            <div>
              <div className="font-medium text-[#F2F4F8]">{formatBudget(movie.budget_usd)}</div>
              <div className="text-xs text-[#A6A9B3]">Budget</div>
            </div>
          </div>
        )}
        {movie.aspect_ratio && (
          <div className="flex items-center gap-3 p-3 bg-[rgba(16,18,24,0.6)] rounded-lg">
            <Camera className="w-5 h-5 text-[#00E0FF]" />
            <div>
              <div className="font-medium text-[#F2F4F8]">{movie.aspect_ratio}</div>
              <div className="text-xs text-[#A6A9B3]">Aspect Ratio</div>
            </div>
          </div>
        )}
        <div className="flex items-center gap-3 p-3 bg-[rgba(16,18,24,0.6)] rounded-lg">
          <Calendar className="w-5 h-5 text-[#00E0FF]" />
          <div>
            <div className="font-medium text-[#F2F4F8]">{movie.year}</div>
            <div className="text-xs text-[#A6A9B3]">Release Year</div>
          </div>
        </div>
      </div>

      {/* Camera Equipment */}
      {movie.camera_equipment && Object.keys(movie.camera_equipment).length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-[#00E0FF] mb-3">Camera Equipment</h4>
          <div className="bg-[rgba(16,18,24,0.6)] rounded-lg p-4">
            <pre className="text-sm text-[#F2F4F8] whitespace-pre-wrap">
              {JSON.stringify(movie.camera_equipment, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Filming Locations */}
      {movie.filming_locations && movie.filming_locations.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-[#00E0FF] mb-3">Filming Locations</h4>
          <div className="flex flex-wrap gap-2">
            {movie.filming_locations.map((location, index) => (
              <div key={index} className="flex items-center gap-2 px-3 py-2 bg-[rgba(16,18,24,0.6)] rounded-lg">
                <MapPin className="w-4 h-4 text-[#00E0FF]" />
                <span className="text-sm text-[#F2F4F8]">{location}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cinematography Techniques */}
      {movie.cinematography_techniques && movie.cinematography_techniques.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-[#00E0FF] mb-3">Cinematography Techniques</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {movie.cinematography_techniques.map((technique, index) => (
              <div key={index} className="flex items-center gap-2 px-3 py-2 bg-[rgba(16,18,24,0.6)] rounded-lg">
                <Palette className="w-4 h-4 text-[#00E0FF]" />
                <span className="text-sm text-[#F2F4F8]">{technique}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderCulturalTab = () => (
    <div className="space-y-6">
      {/* Cultural Movements */}
      {movie.cultural_movements && movie.cultural_movements.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-[#00E0FF] mb-3">Cultural Movements</h4>
          <div className="flex flex-wrap gap-2">
            {movie.cultural_movements.map((movement, index) => (
              <span
                key={index}
                className="px-3 py-2 bg-[rgba(0,224,255,0.1)] border border-[rgba(0,224,255,0.2)] rounded-lg text-sm text-[#00E0FF]"
              >
                {movement}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Controversies */}
      {movie.controversies && Object.keys(movie.controversies).length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-[#00E0FF] mb-3">Cultural Context</h4>
          <div className="bg-[rgba(16,18,24,0.6)] rounded-lg p-4">
            <pre className="text-sm text-[#F2F4F8] whitespace-pre-wrap">
              {JSON.stringify(movie.controversies, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Awards */}
      {movie.awards && Object.keys(movie.awards).length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-[#00E0FF] mb-3">Awards & Recognition</h4>
          <div className="bg-[rgba(16,18,24,0.6)] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-[#FFD700]" />
              <span className="font-medium text-[#F2F4F8]">Accolades</span>
            </div>
            <pre className="text-sm text-[#F2F4F8] whitespace-pre-wrap">
              {JSON.stringify(movie.awards, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Critical Evolution */}
      {movie.critical_evolution && Object.keys(movie.critical_evolution).length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-[#00E0FF] mb-3">Critical Evolution</h4>
          <div className="bg-[rgba(16,18,24,0.6)] rounded-lg p-4">
            <pre className="text-sm text-[#F2F4F8] whitespace-pre-wrap">
              {JSON.stringify(movie.critical_evolution, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );

  const renderCastTab = () => (
    <div className="space-y-6">
      {castCrew.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {castCrew.map((person) => (
            <div key={person.id} className="bg-[rgba(16,18,24,0.6)] rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00E0FF] to-[#00BFFF] rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-[#F2F4F8]">{person.name}</h5>
                  {person.role_type && (
                    <p className="text-sm text-[#00E0FF] capitalize">{person.role_type}</p>
                  )}
                  {person.character_name && (
                    <p className="text-sm text-[#A6A9B3]">as {person.character_name}</p>
                  )}
                  {person.nationality && (
                    <p className="text-xs text-[#A6A9B3] mt-1">{person.nationality}</p>
                  )}
                  {person.biography && (
                    <p className="text-xs text-[#A6A9B3] mt-2 line-clamp-3">{person.biography}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-[#A6A9B3] mx-auto mb-3" />
          <p className="text-[#A6A9B3]">Cast and crew information not available</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <FilmStripBorder variant="modal" className="bg-[rgba(16,18,24,0.98)] backdrop-blur-xl border border-[rgba(0,224,255,0.2)]">
          <div className="flex flex-col h-full max-h-[80vh]">
            {/* Header */}
            <div className="flex items-start gap-6 pb-6 border-b border-[rgba(0,224,255,0.1)]">
              {/* Poster */}
              <div className="relative w-32 h-48 flex-shrink-0 rounded-lg overflow-hidden">
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse flex items-center justify-center">
                    <Camera className="w-8 h-8 text-gray-600" />
                  </div>
                )}
                <img
                  src={movie.poster}
                  alt={`${movie.title} poster`}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                />
              </div>

              {/* Movie Info */}
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-[#F2F4F8] mb-2">{movie.title}</h2>
                    <p className="text-lg text-[#A6A9B3]">{movie.director} • {movie.year}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-[rgba(0,224,255,0.1)] rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-[#A6A9B3]" />
                  </button>
                </div>

                {/* Genres */}
                {movie.micro_genres && movie.micro_genres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {movie.micro_genres.map((genre, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-sm rounded-full border"
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

                {/* Verdict Stats */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${isCinema ? 'text-[#00E0FF]' : 'text-[#FFD700]'}`}>
                      {cinemaPercentage}%
                    </div>
                    <div className="text-sm text-[#A6A9B3]">Cinema Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#F2F4F8]">
                      {totalVotes.toLocaleString()}
                    </div>
                    <div className="text-sm text-[#A6A9B3]">Total Verdicts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#00E0FF]">
                      {movie.cinemaVotes.toLocaleString()}
                    </div>
                    <div className="text-sm text-[#A6A9B3]">Cinema</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#FFD700]">
                      {movie.notCinemaVotes.toLocaleString()}
                    </div>
                    <div className="text-sm text-[#A6A9B3]">Not Cinema</div>
                  </div>
                </div>

                {/* Verdict Buttons */}
                {onVerdictClick && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => onVerdictClick('not-cinema')}
                      disabled={isVoting || !!userVerdict}
                      className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                        userVerdict === 'not-cinema'
                          ? 'bg-[#FFD700] text-[#0B0B10] ring-2 ring-[#FFD700]'
                          : 'bg-[rgba(255,215,0,0.1)] hover:bg-[rgba(255,215,0,0.2)] text-[#FFD700] disabled:opacity-50'
                      }`}
                    >
                      {isVoting ? 'Casting Verdict...' : userVerdict === 'not-cinema' ? '✗ Not Cinema' : 'Not Cinema'}
                    </button>
                    <button
                      onClick={() => onVerdictClick('cinema')}
                      disabled={isVoting || !!userVerdict}
                      className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                        userVerdict === 'cinema'
                          ? 'bg-[#00E0FF] text-[#0B0B10] ring-2 ring-[#00E0FF]'
                          : 'bg-[rgba(0,224,255,0.1)] hover:bg-[rgba(0,224,255,0.2)] text-[#00E0FF] disabled:opacity-50'
                      }`}
                    >
                      {isVoting ? 'Casting Verdict...' : userVerdict === 'cinema' ? '✓ Cinema' : 'Cinema'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 py-4 border-b border-[rgba(0,224,255,0.1)]">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-[#00E0FF] text-[#0B0B10]'
                        : 'text-[#A6A9B3] hover:text-[#F2F4F8] hover:bg-[rgba(0,224,255,0.1)]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto py-6">
              {activeTab === 'overview' && renderOverviewTab()}
              {activeTab === 'technical' && renderTechnicalTab()}
              {activeTab === 'cultural' && renderCulturalTab()}
              {activeTab === 'cast' && renderCastTab()}
            </div>
          </div>
        </FilmStripBorder>
      </div>
    </div>
  );
};

export default MovieDetailModal;