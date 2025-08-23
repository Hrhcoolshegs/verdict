import { supabase } from '../lib/supabase';

export interface ImportMovie {
  title: string;
  year: number;
  director: string;
  short_description: string;
}

export interface ImportSummary {
  addedCount: number;
  skippedDuplicates: number;
  invalidRows: number;
  errors: string[];
}

// Normalize title for duplicate detection
const normalizeTitle = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};

// Validate movie data
const validateMovie = (movie: any): movie is ImportMovie => {
  return (
    typeof movie.title === 'string' &&
    movie.title.trim().length > 0 &&
    typeof movie.year === 'number' &&
    movie.year >= 1900 &&
    movie.year <= new Date().getFullYear() + 5 &&
    typeof movie.director === 'string' &&
    movie.director.trim().length > 0 &&
    typeof movie.short_description === 'string' &&
    movie.short_description.trim().length > 0
  );
};

// Generate enhanced metadata for movies
const generateEnhancedMetadata = (movie: ImportMovie) => {
  // Extract genre from description
  const genreMatch = movie.short_description.match(/A (\w+)-tinged tale/);
  const primaryGenre = genreMatch ? genreMatch[1] : 'drama';
  
  // Generate micro-genres based on description keywords
  const microGenres = [];
  const description = movie.short_description.toLowerCase();
  
  if (description.includes('thriller')) microGenres.push('psychological-thriller');
  if (description.includes('romance')) microGenres.push('romantic-drama');
  if (description.includes('sci-fi') || description.includes('sci‑fi')) microGenres.push('speculative-fiction');
  if (description.includes('horror')) microGenres.push('atmospheric-horror');
  if (description.includes('comedy')) microGenres.push('character-comedy');
  if (description.includes('adventure')) microGenres.push('adventure-epic');
  if (description.includes('mystery')) microGenres.push('neo-noir');
  if (description.includes('war')) microGenres.push('war-drama');
  if (description.includes('family')) microGenres.push('family-saga');
  if (description.includes('musical')) microGenres.push('musical-narrative');
  if (description.includes('animation')) microGenres.push('animated-feature');
  if (description.includes('western')) microGenres.push('modern-western');
  if (description.includes('historical')) microGenres.push('period-piece');
  if (description.includes('biopic')) microGenres.push('biographical-drama');
  if (description.includes('satire')) microGenres.push('social-satire');
  if (description.includes('noir')) microGenres.push('neo-noir');
  if (description.includes('crime')) microGenres.push('crime-thriller');
  if (description.includes('sports')) microGenres.push('sports-drama');
  
  // If no micro-genres found, add default based on primary genre
  if (microGenres.length === 0) {
    microGenres.push(`${primaryGenre}-narrative`);
  }

  // Generate runtime based on genre and era
  const baseRuntime = primaryGenre === 'epic' || primaryGenre === 'historical' ? 150 : 
                     primaryGenre === 'comedy' || primaryGenre === 'horror' ? 95 :
                     primaryGenre === 'animation' ? 85 : 110;
  
  const eraModifier = movie.year < 1960 ? -15 : movie.year > 2000 ? 10 : 0;
  const runtime = Math.max(75, Math.min(180, baseRuntime + eraModifier + Math.floor(Math.random() * 20 - 10)));

  // Generate budget based on year and genre
  const baseBudget = movie.year < 1950 ? 500000 :
                     movie.year < 1980 ? 2000000 :
                     movie.year < 2000 ? 15000000 :
                     movie.year < 2010 ? 35000000 : 50000000;
  
  const genreMultiplier = primaryGenre === 'sci-fi' || primaryGenre === 'adventure' ? 1.5 :
                          primaryGenre === 'horror' || primaryGenre === 'comedy' ? 0.7 :
                          primaryGenre === 'animation' ? 1.3 : 1.0;
  
  const budget = Math.floor(baseBudget * genreMultiplier * (0.5 + Math.random()));

  // Generate aspect ratio based on era
  const aspectRatio = movie.year < 1950 ? '1.37:1' :
                      movie.year < 1970 ? '1.85:1' :
                      movie.year < 1990 ? '2.35:1' :
                      Math.random() > 0.3 ? '2.39:1' : '1.85:1';

  // Generate filming locations based on description
  const locations = [];
  if (description.includes('desert')) locations.push('Sahara Desert, Morocco');
  if (description.includes('city')) locations.push('Urban Metropolitan Area');
  if (description.includes('mountain')) locations.push('Mountain Village Location');
  if (description.includes('space')) locations.push('Studio Soundstage (Space Scenes)');
  if (description.includes('island')) locations.push('Remote Island Location');
  if (description.includes('lagos')) locations.push('Lagos, Nigeria');
  if (description.includes('neon')) locations.push('Urban Night District');
  if (description.includes('train')) locations.push('Railway Locations');
  if (description.includes('casino')) locations.push('Casino Interior Sets');
  if (description.includes('archive')) locations.push('Library/Archive Locations');
  
  if (locations.length === 0) {
    locations.push('Studio Backlot', 'Location Shooting');
  }

  // Generate cinematography techniques
  const techniques = [];
  if (primaryGenre === 'noir' || description.includes('noir')) {
    techniques.push('chiaroscuro lighting', 'dutch angles', 'deep focus');
  }
  if (primaryGenre === 'sci-fi' || description.includes('sci')) {
    techniques.push('practical effects', 'miniature work', 'matte painting');
  }
  if (primaryGenre === 'horror') {
    techniques.push('low-key lighting', 'handheld camera', 'close-ups');
  }
  if (movie.year > 1990) {
    techniques.push('steadicam', 'digital color grading');
  }
  if (movie.year > 2000) {
    techniques.push('digital intermediate', 'CGI integration');
  }
  
  // Default techniques if none specified
  if (techniques.length === 0) {
    techniques.push('traditional cinematography', 'natural lighting', 'standard framing');
  }

  // Generate camera equipment based on era
  const cameraEquipment: any = {};
  if (movie.year < 1960) {
    cameraEquipment.primary_camera = 'Mitchell BNC';
    cameraEquipment.lenses = ['Cooke Speed Panchro'];
    cameraEquipment.film_stock = '35mm Black & White';
  } else if (movie.year < 1980) {
    cameraEquipment.primary_camera = 'Panavision Panaflex';
    cameraEquipment.lenses = ['Panavision Primo', 'Zeiss Super Speed'];
    cameraEquipment.film_stock = '35mm Color';
  } else if (movie.year < 2000) {
    cameraEquipment.primary_camera = 'Arriflex 435';
    cameraEquipment.lenses = ['Zeiss Master Prime', 'Cooke S4'];
    cameraEquipment.film_stock = '35mm Color';
  } else {
    cameraEquipment.primary_camera = movie.year > 2010 ? 'ARRI Alexa' : 'Panavision Genesis';
    cameraEquipment.lenses = ['ARRI Master Prime', 'Cooke S7/i'];
    cameraEquipment.film_stock = movie.year > 2005 ? 'Digital' : '35mm Color';
  }

  // Generate cultural movements based on era and genre
  const culturalMovements = [];
  if (movie.year >= 1930 && movie.year <= 1945) culturalMovements.push('Golden Age Hollywood');
  if (movie.year >= 1945 && movie.year <= 1965) culturalMovements.push('Post-War Cinema');
  if (movie.year >= 1960 && movie.year <= 1975) culturalMovements.push('New Hollywood');
  if (movie.year >= 1970 && movie.year <= 1990) culturalMovements.push('Blockbuster Era');
  if (movie.year >= 1990 && movie.year <= 2010) culturalMovements.push('Independent Film Renaissance');
  if (movie.year >= 2000) culturalMovements.push('Digital Cinema Revolution');
  if (movie.year >= 2010) culturalMovements.push('Streaming Era');
  
  // Add genre-specific movements
  if (primaryGenre === 'horror' && movie.year >= 1970) culturalMovements.push('Horror Renaissance');
  if (primaryGenre === 'sci-fi' && movie.year >= 1980) culturalMovements.push('Sci-Fi Golden Age');

  // Generate AI rationale for cinema verdict
  const aiRationale = generateAIRationale(movie, primaryGenre, microGenres);

  // Generate technical scores (1-10)
  const technicalCraftsmanship = Math.floor(Math.random() * 4) + 6; // 6-10
  const narrativeDepth = Math.floor(Math.random() * 5) + 5; // 5-10
  const artisticAmbition = Math.floor(Math.random() * 6) + 4; // 4-10

  // Generate dominant colors based on genre and era
  const dominantColors: any = {};
  if (primaryGenre === 'noir') {
    dominantColors.primary = '#1a1a1a';
    dominantColors.secondary = '#f5f5f5';
    dominantColors.accent = '#8b0000';
  } else if (primaryGenre === 'sci-fi') {
    dominantColors.primary = '#0a0a2e';
    dominantColors.secondary = '#00ffff';
    dominantColors.accent = '#ff6b35';
  } else if (movie.year < 1960) {
    dominantColors.primary = '#2c2c2c';
    dominantColors.secondary = '#f0f0f0';
    dominantColors.accent = '#8b4513';
  } else {
    dominantColors.primary = '#1e3a8a';
    dominantColors.secondary = '#fbbf24';
    dominantColors.accent = '#dc2626';
  }

  return {
    plot: movie.short_description,
    runtime_minutes: runtime,
    budget_usd: budget,
    aspect_ratio: aspectRatio,
    camera_equipment: cameraEquipment,
    filming_locations: locations,
    cinematography_techniques: techniques,
    micro_genres: microGenres,
    cultural_movements: culturalMovements,
    technical_craftsmanship: technicalCraftsmanship,
    narrative_depth: narrativeDepth,
    artistic_ambition: artisticAmbition,
    ai_rationale: aiRationale,
    dominant_colors: dominantColors,
    cinema_votes: Math.floor(Math.random() * 100),
    not_cinema_votes: Math.floor(Math.random() * 50)
  };
};

const generateAIRationale = (movie: ImportMovie, genre: string, microGenres: string[]): string => {
  const rationales = [
    `"${movie.title}" demonstrates ${genre === 'noir' ? 'masterful' : 'compelling'} visual storytelling through its ${movie.year < 1960 ? 'classical' : 'modern'} approach to ${microGenres[0] || 'narrative cinema'}.`,
    `The film's exploration of ${genre === 'sci-fi' ? 'speculative themes' : 'human condition'} elevates it beyond mere entertainment into the realm of cinematic art.`,
    `${movie.director}'s direction showcases a deep understanding of ${movie.year < 1980 ? 'traditional' : 'contemporary'} filmmaking techniques that serve the story's emotional core.`,
    `This ${movie.year} work represents a significant contribution to ${genre} cinema, with its innovative approach to ${microGenres.includes('neo-noir') ? 'visual narrative' : 'character development'}.`,
    `The film's ${movie.year < 1970 ? 'classical' : 'modern'} sensibilities combined with ${genre === 'animation' ? 'artistic animation' : 'compelling performances'} create a lasting cinematic experience.`
  ];
  
  return rationales[Math.floor(Math.random() * rationales.length)];
};

// Generate next available movie ID
const getNextMovieId = async (): Promise<number> => {
  const { data, error } = await supabase
    .from('movies')
    .select('id')
    .order('id', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error getting max ID:', error);
    return 1;
  }

  return data && data.length > 0 ? data[0].id + 1 : 1;
};

// Check if movie already exists
const movieExists = async (normalizedTitle: string, year: number): Promise<boolean> => {
  const { data, error } = await supabase
    .from('movies')
    .select('id')
    .eq('year', year)
    .ilike('title', `%${normalizedTitle.replace(/\s+/g, '%')}%`)
    .limit(1);

  if (error) {
    console.error('Error checking movie existence:', error);
    return false;
  }

  return data && data.length > 0;
};

// Seed movies from JSON data
export const seedMoviesFromJSON = async (moviesData: ImportMovie[]): Promise<ImportSummary> => {
  const summary: ImportSummary = {
    addedCount: 0,
    skippedDuplicates: 0,
    invalidRows: 0,
    errors: []
  };

  let currentId = await getNextMovieId();

  for (const movieData of moviesData) {
    try {
      // Validate movie data
      if (!validateMovie(movieData)) {
        summary.invalidRows++;
        summary.errors.push(`Invalid data for movie: ${movieData.title || 'Unknown'}`);
        continue;
      }

      const normalizedTitle = normalizeTitle(movieData.title);
      
      // Check for duplicates
      if (await movieExists(normalizedTitle, movieData.year)) {
        summary.skippedDuplicates++;
        continue;
      }

      // Generate enhanced metadata
      const enhancedData = generateEnhancedMetadata(movieData);

      // Generate poster URL (using a placeholder service)
      const posterUrl = `https://images.pexels.com/photos/${1000000 + (currentId % 1000000)}/pexels-photo-${1000000 + (currentId % 1000000)}.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop`;

      // Insert movie into database
      const { error } = await supabase
        .from('movies')
        .insert({
          id: currentId,
          title: movieData.title.trim(),
          director: movieData.director.trim(),
          year: movieData.year,
          poster: posterUrl,
          plot: enhancedData.plot,
          runtime_minutes: enhancedData.runtime_minutes,
          budget_usd: enhancedData.budget_usd,
          aspect_ratio: enhancedData.aspect_ratio,
          camera_equipment: enhancedData.camera_equipment,
          filming_locations: enhancedData.filming_locations,
          cinematography_techniques: enhancedData.cinematography_techniques,
          micro_genres: enhancedData.micro_genres,
          cultural_movements: enhancedData.cultural_movements,
          technical_craftsmanship: enhancedData.technical_craftsmanship,
          narrative_depth: enhancedData.narrative_depth,
          artistic_ambition: enhancedData.artistic_ambition,
          ai_rationale: enhancedData.ai_rationale,
          dominant_colors: enhancedData.dominant_colors,
          cinema_votes: enhancedData.cinema_votes,
          not_cinema_votes: enhancedData.not_cinema_votes
        });

      if (error) {
        summary.errors.push(`Failed to insert ${movieData.title}: ${error.message}`);
        continue;
      }

      summary.addedCount++;
      currentId++;

    } catch (error) {
      summary.errors.push(`Error processing ${movieData.title}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      summary.invalidRows++;
    }
  }

  return summary;
};

// Enhanced movie interface for display
export interface EnhancedMovie {
  id: number;
  title: string;
  director: string;
  year: number;
  poster: string;
  plot?: string;
  runtime_minutes?: number;
  budget_usd?: number;
  aspect_ratio?: string;
  camera_equipment?: any;
  filming_locations?: string[];
  cinematography_techniques?: string[];
  micro_genres?: string[];
  cultural_movements?: string[];
  technical_craftsmanship?: number;
  narrative_depth?: number;
  artistic_ambition?: number;
  ai_rationale?: string;
  dominant_colors?: any;
  cinemaVotes: number;
  notCinemaVotes: number;
}

// Transform database row to enhanced movie interface
export const transformDbRowToEnhancedMovie = (row: any): EnhancedMovie => ({
  id: row.id,
  title: row.title,
  director: row.director,
  year: row.year,
  poster: row.poster,
  plot: row.plot,
  runtime_minutes: row.runtime_minutes,
  budget_usd: row.budget_usd,
  aspect_ratio: row.aspect_ratio,
  camera_equipment: row.camera_equipment,
  filming_locations: row.filming_locations,
  cinematography_techniques: row.cinematography_techniques,
  micro_genres: row.micro_genres,
  cultural_movements: row.cultural_movements,
  technical_craftsmanship: row.technical_craftsmanship,
  narrative_depth: row.narrative_depth,
  artistic_ambition: row.artistic_ambition,
  ai_rationale: row.ai_rationale,
  dominant_colors: row.dominant_colors,
  cinemaVotes: row.cinema_votes || 0,
  notCinemaVotes: row.not_cinema_votes || 0,
});