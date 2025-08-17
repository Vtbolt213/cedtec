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
      
      const email = `${username}@cedtec.local`;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error('Login error:', error);
        Alert.alert('Erro', 'Credenciais inválidas');
        return false;
      }

      if (!data.user) {
        Alert.alert('Erro', 'Erro no login');
        return false;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profileData) {
        console.error('Profile error:', profileError);
        Alert.alert('Erro', 'Perfil não encontrado');
        return false;
      }

      set({ user: data.user, profile: profileData });
      
      try {
        await SecureStore.setItemAsync('user', JSON.stringify(data.user));
        await SecureStore.setItemAsync('profile', JSON.stringify(profileData));
      } catch (storeError) {
        console.warn('SecureStore error:', storeError);
      }
      
      return true;
    } catch (error) {
      console.error('Sign in error:', error);
      Alert.alert('Erro', 'Erro interno no login');
      return false;
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (username: string, password: string, fullName: string, role: 'professor' | 'admin') => {
    try {
      set({ loading: true });
      
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        Alert.alert('Erro', 'Username deve conter apenas letras, números e underscore');
        return false;
      }

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
        console.error('Sign up error:', error);
        
        if (error.message.includes('already registered')) {
          Alert.alert('Erro', 'Este usuário já está cadastrado');
        } else if (error.message.includes('duplicate key')) {
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
      console.error('Sign up error:', error);
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
      
      try {
        await SecureStore.deleteItemAsync('user');
        await SecureStore.deleteItemAsync('profile');
      } catch (storeError) {
        console.warn('SecureStore cleanup error:', storeError);
      }
      
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Erro', 'Erro ao fazer logout');
    }
  },

  initializeAuth: async () => {
    try {
      console.log('Initializing auth...');
      
      // Try to load from SecureStore first
      try {
        const storedUser = await SecureStore.getItemAsync('user');
        const storedProfile = await SecureStore.getItemAsync('profile');
        
        if (storedUser && storedProfile) {
          console.log('Found stored auth data');
          set({ 
            user: JSON.parse(storedUser), 
            profile: JSON.parse(storedProfile) 
          });
        }
      } catch (storeError) {
        console.warn('SecureStore read error:', storeError);
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session:', session ? 'found' : 'not found');
      
      if (session?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError || !profileData) {
          console.error('Profile fetch error:', profileError);
          await supabase.auth.signOut();
          try {
            await SecureStore.deleteItemAsync('user');
            await SecureStore.deleteItemAsync('profile');
          } catch (storeError) {
            console.warn('SecureStore cleanup error:', storeError);
          }
          set({ user: null, profile: null });
        } else {
          console.log('Profile loaded successfully');
          set({ user: session.user, profile: profileData });
          try {
            await SecureStore.setItemAsync('user', JSON.stringify(session.user));
            await SecureStore.setItemAsync('profile', JSON.stringify(profileData));
          } catch (storeError) {
            console.warn('SecureStore save error:', storeError);
          }
        }
      } else {
        console.log('No session found');
        set({ user: null, profile: null });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ user: null, profile: null });
    } finally {
      console.log('Auth initialization complete');
      set({ loading: false });
    }
  },
}));