import { create } from 'zustand';
import { supabase, type Ticket, type TicketInteraction } from '../lib/supabase';
import { Alert } from 'react-native';

interface TicketState {
  tickets: Ticket[];
  currentTicket: Ticket | null;
  interactions: TicketInteraction[];
  loading: boolean;
  filters: {
    status: string;
    problemType: string;
    search: string;
  };
  fetchTickets: (isAdmin?: boolean) => Promise<void>;
  fetchTicketById: (id: string) => Promise<void>;
  createTicket: (ticket: Partial<Ticket>) => Promise<boolean>;
  updateTicketStatus: (id: string, status: string) => Promise<boolean>;
  addInteraction: (ticketId: string, message: string, type?: string) => Promise<boolean>;
  fetchInteractions: (ticketId: string) => Promise<void>;
  setFilters: (filters: Partial<TicketState['filters']>) => void;
}

export const useTicketStore = create<TicketState>((set, get) => ({
  tickets: [],
  currentTicket: null,
  interactions: [],
  loading: false,
  filters: {
    status: '',
    problemType: '',
    search: '',
  },

  fetchTickets: async (isAdmin = false) => {
    try {
      set({ loading: true });
      
      console.log('Fetching tickets - isAdmin:', isAdmin);
      
      let query = supabase
        .from('tickets')
        .select(`
          *,
          profiles (
            username,
            full_name,
            role
          )
        `)
        .order('created_at', { ascending: false });

      // Verificar se o usuário atual é admin
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user?.id);
      
      // Buscar perfil do usuário para verificar role
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        console.log('User profile:', profileData);
        
        // Se não for admin, filtrar apenas tickets do usuário
        if (!isAdmin || profileData?.role !== 'admin') {
          console.log('Filtering tickets for non-admin user');
          query = query.eq('user_id', user.id);
        } else {
          console.log('Admin user - fetching all tickets');
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      
      console.log('Tickets fetched:', data?.length || 0);
      set({ tickets: data || [] });
    } catch (error) {
      console.error('Erro ao buscar tickets:', error);
      Alert.alert('Erro', 'Erro ao carregar tickets');
    } finally {
      set({ loading: false });
    }
  },

  fetchTicketById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          profiles (
            username,
            full_name,
            role
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      set({ currentTicket: data });
    } catch (error) {
      console.error('Erro ao buscar ticket:', error);
      Alert.alert('Erro', 'Erro ao carregar ticket');
    }
  },

  createTicket: async (ticketData: Partial<Ticket>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('tickets')
        .insert({
          ...ticketData,
          user_id: user.id,
        });

      if (error) throw error;
      
      Alert.alert('Sucesso', 'Ticket criado com sucesso!');
      get().fetchTickets();
      return true;
    } catch (error) {
      console.error('Erro ao criar ticket:', error);
      Alert.alert('Erro', 'Erro ao criar ticket');
      return false;
    }
  },

  updateTicketStatus: async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      // Adicionar interação de mudança de status
      await get().addInteraction(id, `Status alterado para: ${status}`, 'status_change');
      
      get().fetchTickets(true);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      Alert.alert('Erro', 'Erro ao atualizar status');
      return false;
    }
  },

  addInteraction: async (ticketId: string, message: string, type = 'comment') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('ticket_interactions')
        .insert({
          ticket_id: ticketId,
          user_id: user.id,
          message,
          interaction_type: type,
        });

      if (error) throw error;
      
      get().fetchInteractions(ticketId);
      return true;
    } catch (error) {
      console.error('Erro ao adicionar interação:', error);
      Alert.alert('Erro', 'Erro ao adicionar comentário');
      return false;
    }
  },

  fetchInteractions: async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('ticket_interactions')
        .select(`
          *,
          profiles (
            username,
            full_name,
            role
          )
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      set({ interactions: data || [] });
    } catch (error) {
      console.error('Erro ao buscar interações:', error);
      Alert.alert('Erro', 'Erro ao carregar comentários');
    }
  },

  setFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters } });
  },
}));