import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { useTicketStore } from '../../src/stores/ticketStore';
import { router } from 'expo-router';

interface CreateTicketForm {
  title: string;
  description: string;
  problem_type: 'Rede' | 'Hardware' | 'Software' | 'Projetor' | 'Outros';
  priority: 'Baixa' | 'Normal' | 'Alta' | 'Urgente';
  location?: string;
}

export default function CreateTicketScreen() {
  const { createTicket } = useTicketStore();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors }, reset } = useForm<CreateTicketForm>({
    defaultValues: {
      priority: 'Normal',
      problem_type: 'Software',
    }
  });

  const problemTypes = [
    { value: 'Rede', icon: 'wifi-outline', label: 'Rede' },
    { value: 'Hardware', icon: 'desktop-outline', label: 'Hardware' },
    { value: 'Software', icon: 'code-outline', label: 'Software' },
    { value: 'Projetor', icon: 'videocam-outline', label: 'Projetor' },
    { value: 'Outros', icon: 'help-circle-outline', label: 'Outros' },
  ];

  const priorities = [
    { value: 'Baixa', color: '#059669', label: 'Baixa' },
    { value: 'Normal', color: '#0891B2', label: 'Normal' },
    { value: 'Alta', color: '#EA580C', label: 'Alta' },
    { value: 'Urgente', color: '#DC2626', label: 'Urgente' },
  ];

  const onSubmit = async (data: CreateTicketForm) => {
    try {
      setLoading(true);
      const success = await createTicket(data);
      if (success) {
        reset();
        router.push('/(tabs)/tickets');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao criar ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Ionicons name="add-circle-outline" size={32} color="#1E40AF" />
        <Text style={styles.headerTitle}>Novo Chamado</Text>
        <Text style={styles.headerSubtitle}>
          Descreva o problema técnico que você está enfrentando
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Título do Chamado *</Text>
          <Controller
            control={control}
            name="title"
            rules={{ required: 'Título é obrigatório' }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                placeholder="Ex: Computador não liga"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {errors.title && (
            <Text style={styles.errorText}>{errors.title.message}</Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tipo de Problema *</Text>
          <Controller
            control={control}
            name="problem_type"
            render={({ field: { onChange, value } }) => (
              <View style={styles.optionsContainer}>
                {problemTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.optionButton,
                      value === type.value && styles.optionButtonActive
                    ]}
                    onPress={() => onChange(type.value)}
                  >
                    <Ionicons 
                      name={type.icon as any} 
                      size={20} 
                      color={value === type.value ? '#ffffff' : '#6B7280'} 
                    />
                    <Text style={[
                      styles.optionText,
                      value === type.value && styles.optionTextActive
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Prioridade *</Text>
          <Controller
            control={control}
            name="priority"
            render={({ field: { onChange, value } }) => (
              <View style={styles.priorityContainer}>
                {priorities.map((priority) => (
                  <TouchableOpacity
                    key={priority.value}
                    style={[
                      styles.priorityButton,
                      value === priority.value && { 
                        backgroundColor: priority.color + '20',
                        borderColor: priority.color 
                      }
                    ]}
                    onPress={() => onChange(priority.value)}
                  >
                    <View style={[
                      styles.priorityDot,
                      { backgroundColor: priority.color }
                    ]} />
                    <Text style={[
                      styles.priorityText,
                      value === priority.value && { color: priority.color }
                    ]}>
                      {priority.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Localização</Text>
          <Controller
            control={control}
            name="location"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder="Ex: Sala 101, Laboratório de Informática"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Descrição do Problema *</Text>
          <Controller
            control={control}
            name="description"
            rules={{ required: 'Descrição é obrigatória' }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.textArea, errors.description && styles.inputError]}
                placeholder="Descreva detalhadamente o problema que você está enfrentando..."
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            )}
          />
          {errors.description && (
            <Text style={styles.errorText}>{errors.description.message}</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons name="send-outline" size={20} color="#ffffff" />
              <Text style={styles.submitButtonText}>Criar Chamado</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    marginBottom: 24,
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
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    minHeight: 100,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    minWidth: 100,
  },
  optionButtonActive: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
  },
  optionText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  optionTextActive: {
    color: '#ffffff',
  },
  priorityContainer: {
    gap: 8,
  },
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  priorityText: {
    fontSize: 16,
    color: '#374151',
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
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});