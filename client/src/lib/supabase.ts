import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      knowledge_bases: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['knowledge_bases']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['knowledge_bases']['Insert']>;
      };
      categories: {
        Row: {
          id: string;
          knowledge_base_id: string;
          name: string;
          slug: string;
          description: string | null;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
      };
      articles: {
        Row: {
          id: string;
          category_id: string;
          parent_id: string | null;
          title: string;
          slug: string;
          content: string;
          published: boolean;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['articles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['articles']['Insert']>;
      };
    };
  };
};

export type KnowledgeBase = Database['public']['Tables']['knowledge_bases']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Article = Database['public']['Tables']['articles']['Row'];
