import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://euuweddznrblqdxgodsr.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1dXdlZGR6bnJibHFkeGdvZHNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyOTg4MjUsImV4cCI6MjA3MDg3NDgyNX0.eVgXgiZjCsbGQ7Daxg1WWAToqVNew3JOxRzCMjQIo7s";

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