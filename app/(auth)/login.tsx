import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/authStore';
import { router } from 'expo-router';

interface LoginFormData {
  username: string;
  password: string;
}

interface RegisterFormData extends LoginFormData {
  fullName: string;
  role: 'professor' | 'admin';
  confirmPassword: string;
}

export default function LoginScreen() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signIn, signUp, loading } = useAuthStore();

  const { control, handleSubmit, formState: { errors }, reset } = useForm<LoginFormData | RegisterFormData>({
    defaultValues: isRegisterMode ? { role: 'professor' } : {}
  });

  const onSubmit = async (data: LoginFormData | RegisterFormData) => {
    try {
      if (isRegisterMode) {
        const registerData = data as RegisterFormData;
        if (registerData.password !== registerData.confirmPassword) {
          Alert.alert('Erro', 'As senhas não coincidem');
          return;
        }
        const success = await signUp(
          registerData.username,
          registerData.password,
          registerData.fullName,
          registerData.role
        );
        if (success) {
          Alert.alert('Sucesso', 'Conta criada com sucesso! Faça login para continuar.');
          setIsRegisterMode(false);
          reset();
        }
      } else {
        const loginData = data as LoginFormData;
        const success = await signIn(loginData.username, loginData.password);
        if (success) {
          router.replace('/(tabs)');
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro inesperado');
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    reset();
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="laptop-outline" size={48} color="#ffffff" />
          </View>
          <Text style={styles.title}>CEDTEC Tickets</Text>
          <Text style={styles.subtitle}>
            {isRegisterMode ? 'Criar nova conta' : 'Sistema de Gerenciamento de TI'}
          </Text>
        </View>

        <View style={styles.formContainer}>
          {isRegisterMode && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nome Completo</Text>
              <Controller
                control={control}
                name="fullName"
                rules={{ required: 'Nome completo é obrigatório' }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, errors.fullName && styles.inputError]}
                    placeholder="Digite seu nome completo"
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="words"
                  />
                )}
              />
              {errors.fullName && (
                <Text style={styles.errorText}>{errors.fullName.message}</Text>
              )}
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <Controller
              control={control}
              name="username"
              rules={{ required: 'Username é obrigatório' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.username && styles.inputError]}
                  placeholder="Digite seu username"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="none"
                />
              )}
            />
            {errors.username && (
              <Text style={styles.errorText}>{errors.username.message}</Text>
            )}
          </View>

          {isRegisterMode && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tipo de Usuário</Text>
              <Controller
                control={control}
                name="role"
                rules={{ required: 'Tipo de usuário é obrigatório' }}
                render={({ field: { onChange, value } }) => (
                  <View style={styles.roleContainer}>
                    <TouchableOpacity
                      style={[styles.roleButton, value === 'professor' && styles.roleButtonActive]}
                      onPress={() => onChange('professor')}
                    >
                      <Text style={[styles.roleButtonText, value === 'professor' && styles.roleButtonTextActive]}>
                        Professor
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.roleButton, value === 'admin' && styles.roleButtonActive]}
                      onPress={() => onChange('admin')}
                    >
                      <Text style={[styles.roleButtonText, value === 'admin' && styles.roleButtonTextActive]}>
                        Administrador
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.passwordContainer}>
              <Controller
                control={control}
                name="password"
                rules={{ 
                  required: 'Senha é obrigatória',
                  minLength: { value: 6, message: 'Senha deve ter pelo menos 6 caracteres' }
                }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.passwordInput, errors.password && styles.inputError]}
                    placeholder="Digite sua senha"
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                )}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={24} 
                  color="#6B7280" 
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password.message}</Text>
            )}
          </View>

          {isRegisterMode && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmar Senha</Text>
              <View style={styles.passwordContainer}>
                <Controller
                  control={control}
                  name="confirmPassword"
                  rules={{ required: 'Confirmação de senha é obrigatória' }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={[styles.passwordInput, errors.confirmPassword && styles.inputError]}
                      placeholder="Confirme sua senha"
                      value={value}
                      onChangeText={onChange}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                    />
                  )}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                    size={24} 
                    color="#6B7280" 
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
              )}
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Ionicons 
                  name={isRegisterMode ? "person-add-outline" : "log-in-outline"} 
                  size={20} 
                  color="#ffffff" 
                  style={styles.buttonIcon}
                />
                <Text style={styles.submitButtonText}>
                  {isRegisterMode ? 'Criar Conta' : 'Entrar'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.toggleButton} onPress={toggleMode}>
            <Text style={styles.toggleButtonText}>
              {isRegisterMode 
                ? 'Já tem uma conta? Fazer login' 
                : 'Não tem uma conta? Criar conta'
              }
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E40AF',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeButton: {
    padding: 12,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
  },
  roleButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  roleButtonTextActive: {
    color: '#ffffff',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#1E40AF',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#1E40AF',
    fontSize: 16,
    fontWeight: '500',
  },
});