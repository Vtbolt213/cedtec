import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, type Profile } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AuthState {
  user: any;
  profile: Profile | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<boolean>;
  signUp: (username: string, password: string, fullName: string, role: 'professor' | 'admin') => Promise<boolean>;
  signOut: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      loading: true,

      signIn: async (username: string, password: string) => {
        try {
          set({ loading: true });
          
          // Criar email baseado no username
          const email = `${username}@cedtec.local`;

          const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
          });

          if (error) {
            console.error('Erro de login:', error);
            toast.error('Credenciais inválidas');
            return false;
          }

          if (!data.user) {
            toast.error('Erro no login');
            return false;
          }

          // Buscar perfil do usuário
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .limit(1);

          if (profileError) {
            console.error('Erro ao buscar perfil:', profileError);
            toast.error('Erro ao carregar perfil do usuário');
            return false;
          }

          const profile = profileData?.[0] || null;
          if (!profile) {
            toast.error('Perfil não encontrado');
            return false;
          }

          set({ user: data.user, profile: profile });
          toast.success(`Bem-vindo, ${profile.full_name || profile.username}!`);
          return true;
        } catch (error) {
          console.error('Erro no login:', error);
          toast.error('Erro interno no login');
          return false;
        } finally {
          set({ loading: false });
        }
      },

      signUp: async (username: string, password: string, fullName: string, role: 'professor' | 'admin') => {
        try {
          set({ loading: true });
          
          // Validar username
          if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            toast.error('Username deve conter apenas letras, números e underscore');
            return false;
          }

          // Criar email baseado no username
          const email = `${username}@cedtec.local`;

          const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
              data: {
                username: username,
                full_name: fullName,
                role: role,
              }
            }
          });

          if (error) {
            console.error('Erro no cadastro:', error);
            
            if (error.message.includes('already registered') || error.message.includes('User already registered')) {
              toast.error('Este usuário já está cadastrado');
            } else if (error.message.includes('duplicate key value')) {
              toast.error('Este username já está em uso');
            } else if (error.message.includes('Password should be at least')) {
              toast.error('A senha deve ter pelo menos 6 caracteres');
            } else {
              toast.error('Erro ao criar conta: ' + error.message);
            }
            return false;
          }

          if (!data.user) {
            toast.error('Erro ao criar usuário');
            return false;
          }

          toast.success('Conta criada com sucesso! Faça login para continuar.');
          return true;
        } catch (error) {
          console.error('Erro no cadastro:', error);
          toast.error('Erro interno no cadastro');
          return false;
        } finally {
          set({ loading: false });
        }
      },

      signOut: async () => {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          
          set({ user: null, profile: null });
          toast.success('Logout realizado com sucesso');
        } catch (error) {
          console.error('Erro no logout:', error);
          toast.error('Erro ao fazer logout');
        }
      },

      initializeAuth: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            // Buscar o profile do usuário
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .limit(1);

            if (profileError) {
              console.error('Erro ao buscar perfil:', profileError);
              // Se não conseguir buscar o perfil, fazer logout
              await supabase.auth.signOut();
              set({ user: null, profile: null });
            } else {
              const profile = profileData?.[0] || null;
              if (profile) {
                set({ user: session.user, profile: profile });
              } else {
                // Se não encontrar perfil, fazer logout
                await supabase.auth.signOut();
                set({ user: null, profile: null });
              }
            }
          }
        } catch (error) {
          console.error('Erro ao inicializar auth:', error);
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'cedtec-auth-storage',
      partialize: (state) => ({ profile: state.profile }),
    }
  )
);