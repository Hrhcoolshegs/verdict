import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please connect to Supabase first.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
          cinema_votes?: number;
          not_cinema_votes?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      increment_movie_verdict: {
        Args: {
          movie_id: number;
          verdict_type: string;
        };
        Returns: void;
      };
    };
  };
};