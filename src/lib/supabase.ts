import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Tipos TypeScript
export interface Profile {
  id: string;
  username: string;
  role: 'professor' | 'admin';
  full_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  user_id: string;
  title: string;
  description: string;
  problem_type: 'Rede' | 'Hardware' | 'Software' | 'Projetor' | 'Outros';
  status: 'Aberto' | 'Em andamento' | 'Resolvido';
  priority: 'Baixa' | 'Normal' | 'Alta' | 'Urgente';
  location?: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface TicketInteraction {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  interaction_type: 'comment' | 'status_change' | 'assignment';
  created_at: string;
  profiles?: Profile;
}