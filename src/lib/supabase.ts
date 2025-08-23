import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please connect to Supabase first.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Enhanced type definitions for comprehensive movie data
export type Database = {
  public: {
    Tables: {
      movies: {
        Row: {
          id: number;
          title: string;
          director: string;
          year: number;
          poster: string;
          plot: string | null;
          runtime_minutes: number | null;
          budget_usd: number | null;
          aspect_ratio: string | null;
          camera_equipment: any;
          filming_locations: string[] | null;
          cinematography_techniques: string[] | null;
          micro_genres: string[] | null;
          controversies: any;
          cultural_movements: string[] | null;
          cultural_influence: any;
          academic_analysis: any;
          awards: any;
          technical_craftsmanship: number | null;
          narrative_depth: number | null;
          artistic_ambition: number | null;
          ai_rationale: string | null;
          critical_evolution: any;
          dominant_colors: any;
          cinema_votes: number;
          not_cinema_votes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: number;
          title: string;
          director: string;
          year: number;
          poster: string;
          plot?: string | null;
          runtime_minutes?: number | null;
          budget_usd?: number | null;
          aspect_ratio?: string | null;
          camera_equipment?: any;
          filming_locations?: string[] | null;
          cinematography_techniques?: string[] | null;
          micro_genres?: string[] | null;
          controversies?: any;
          cultural_movements?: string[] | null;
          cultural_influence?: any;
          academic_analysis?: any;
          awards?: any;
          technical_craftsmanship?: number | null;
          narrative_depth?: number | null;
          artistic_ambition?: number | null;
          ai_rationale?: string | null;
          critical_evolution?: any;
          dominant_colors?: any;
          cinema_votes?: number;
          not_cinema_votes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          title?: string;
          director?: string;
          year?: number;
          poster?: string;
          plot?: string | null;
          runtime_minutes?: number | null;
          budget_usd?: number | null;
          aspect_ratio?: string | null;
          camera_equipment?: any;
          filming_locations?: string[] | null;
          cinematography_techniques?: string[] | null;
          micro_genres?: string[] | null;
          controversies?: any;
          cultural_movements?: string[] | null;
          cultural_influence?: any;
          academic_analysis?: any;
          awards?: any;
          technical_craftsmanship?: number | null;
          narrative_depth?: number | null;
          artistic_ambition?: number | null;
          ai_rationale?: string | null;
          critical_evolution?: any;
          dominant_colors?: any;
          cinema_votes?: number;
          not_cinema_votes?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      verdicts: {
        Row: {
          id: string;
          movie_id: number;
          verdict_type: string;
          device_id: string | null;
          confidence_level: number | null;
          reasoning: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          movie_id: number;
          verdict_type: string;
          device_id?: string | null;
          confidence_level?: number | null;
          reasoning?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          movie_id?: number;
          verdict_type?: string;
          device_id?: string | null;
          confidence_level?: number | null;
          reasoning?: string | null;
          created_at?: string;
        };
      };
      cast_crew: {
        Row: {
          id: string;
          name: string;
          birth_year: number | null;
          nationality: string | null;
          biography: string | null;
          filmography: any;
          awards: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          birth_year?: number | null;
          nationality?: string | null;
          biography?: string | null;
          filmography?: any;
          awards?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          birth_year?: number | null;
          nationality?: string | null;
          biography?: string | null;
          filmography?: any;
          awards?: any;
          created_at?: string;
        };
      };
      movie_collections: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          collection_type: string;
          movie_ids: number[] | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          collection_type: string;
          movie_ids?: number[] | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          collection_type?: string;
          movie_ids?: number[] | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      cinema_quotes: {
        Row: {
          id: string;
          quote_text: string;
          author: string;
          author_role: string | null;
          context: string | null;
          movie_id: number | null;
          quote_category: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          quote_text: string;
          author: string;
          author_role?: string | null;
          context?: string | null;
          movie_id?: number | null;
          quote_category?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          quote_text?: string;
          author?: string;
          author_role?: string | null;
          context?: string | null;
          movie_id?: number | null;
          quote_category?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
    };
    Functions: {
      get_random_movie: {
        Args: {
        };
        Returns: {
          id: number;
          title: string;
          director: string;
          year: number;
          poster: string;
          plot: string;
          runtime_minutes: number;
          micro_genres: string[];
          cinema_votes: number;
          not_cinema_votes: number;
          ai_rationale: string;
          dominant_colors: any;
        }[];
      };
      get_personalized_recommendations: {
        Args: {
          user_device_id: string;
          limit_count?: number;
        };
        Returns: {
          id: number;
          title: string;
          director: string;
          year: number;
          poster: string;
          micro_genres: string[];
          cinema_votes: number;
          not_cinema_votes: number;
          recommendation_score: number;
        }[];
      };
      refresh_top_cinema_movies: {
        Args: {
        };
        Returns: void;
      };
    };
  };
};