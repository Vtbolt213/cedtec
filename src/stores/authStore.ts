import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { supabase, type Profile } from '../lib/supabase';
import { Alert } from 'react-native';

interface AuthState {
  user: any;
  profile: Profile | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<boolean>;
  signUp: (username: string, password: string, fullName: string, role: 'professor' | 'admin') => Promise<boolean>;
  signOut: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
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
        Alert.alert('Erro', 'Credenciais inválidas');
        return false;
      }

      if (!data.user) {
        Alert.alert('Erro', 'Erro no login');
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
        Alert.alert('Erro', 'Erro ao carregar perfil do usuário');
        return false;
      }

      const profile = profileData?.[0] || null;
      if (!profile) {
        Alert.alert('Erro', 'Perfil não encontrado');
        return false;
      }

      set({ user: data.user, profile: profile });
      
      // Salvar dados no SecureStore
      try {
        await SecureStore.setItemAsync('user', JSON.stringify(data.user));
        await SecureStore.setItemAsync('profile', JSON.stringify(profile));
      } catch (storeError) {
        console.warn('Erro ao salvar no SecureStore:', storeError);
      }
      
      return true;
    } catch (error) {
      console.error('Erro no login:', error);
      Alert.alert('Erro', 'Erro interno no login');
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
        Alert.alert('Erro', 'Username deve conter apenas letras, números e underscore');
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
          Alert.alert('Erro', 'Este usuário já está cadastrado');
        } else if (error.message.includes('duplicate key value')) {
          Alert.alert('Erro', 'Este username já está em uso');
        } else if (error.message.includes('Password should be at least')) {
          Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
        } else {
          Alert.alert('Erro', 'Erro ao criar conta: ' + error.message);
        }
        return false;
      }

      if (!data.user) {
        Alert.alert('Erro', 'Erro ao criar usuário');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro no cadastro:', error);
      Alert.alert('Erro', 'Erro interno no cadastro');
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
      
      // Limpar dados do SecureStore
      try {
        await SecureStore.deleteItemAsync('user');
        await SecureStore.deleteItemAsync('profile');
      } catch (storeError) {
        console.warn('Erro ao limpar SecureStore:', storeError);
      }
      
    } catch (error) {
      console.error('Erro no logout:', error);
      Alert.alert('Erro', 'Erro ao fazer logout');
    }
  },

  initializeAuth: async () => {
    try {
      // Tentar carregar dados do SecureStore primeiro
      try {
        const storedUser = await SecureStore.getItemAsync('user');
        const storedProfile = await SecureStore.getItemAsync('profile');
        
        if (storedUser && storedProfile) {
          set({ 
            user: JSON.parse(storedUser), 
            profile: JSON.parse(storedProfile) 
          });
        }
      } catch (storeError) {
        console.warn('Erro ao carregar do SecureStore:', storeError);
      }
      
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
          try {
            await SecureStore.deleteItemAsync('user');
            await SecureStore.deleteItemAsync('profile');
          } catch (storeError) {
            console.warn('Erro ao limpar SecureStore:', storeError);
          }
          set({ user: null, profile: null });
        } else {
          const profile = profileData?.[0] || null;
          if (profile) {
            set({ user: session.user, profile: profile });
            try {
              await SecureStore.setItemAsync('user', JSON.stringify(session.user));
              await SecureStore.setItemAsync('profile', JSON.stringify(profile));
            } catch (storeError) {
              console.warn('Erro ao salvar no SecureStore:', storeError);
            }
          } else {
            // Se não encontrar perfil, fazer logout
            await supabase.auth.signOut();
            try {
              await SecureStore.deleteItemAsync('user');
              await SecureStore.deleteItemAsync('profile');
            } catch (storeError) {
              console.warn('Erro ao limpar SecureStore:', storeError);
            }
            set({ user: null, profile: null });
          }
        }
      } else {
        set({ user: null, profile: null });
      }
    } catch (error) {
      console.error('Erro ao inicializar auth:', error);
      set({ user: null, profile: null });
    } finally {
      set({ loading: false });
    }
  },
}));