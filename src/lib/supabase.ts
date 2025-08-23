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
      user_verdicts: {
        Row: {
          id: string;
          user_email: string;
          movie_id: number;
          verdict_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_email: string;
          movie_id: number;
          verdict_type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_email?: string;
          movie_id?: number;
          verdict_type?: string;
          created_at?: string;
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
      has_user_already_judged: {
        Args: {
          p_user_email: string;
          p_movie_id: number;
        };
        Returns: boolean;
      };
      record_user_verdict: {
        Args: {
          p_user_email: string;
          p_movie_id: number;
          p_verdict_type: string;
        };
        Returns: {
          success: boolean;
          error?: string;
          message?: string;
        };
      };
      get_user_verdict: {
        Args: {
          p_user_email: string;
          p_movie_id: number;
        };
        Returns: string;
      };
    };
  };
};