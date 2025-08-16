import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/authStore';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { profile, signOut } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          }
        },
      ]
    );
  };

  const ProfileItem = ({ icon, label, value, onPress }: any) => (
    <TouchableOpacity style={styles.profileItem} onPress={onPress} disabled={!onPress}>
      <View style={styles.profileItemLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={20} color="#1E40AF" />
        </View>
        <View style={styles.profileItemContent}>
          <Text style={styles.profileItemLabel}>{label}</Text>
          <Text style={styles.profileItemValue}>{value}</Text>
        </View>
      </View>
      {onPress && (
        <Ionicons name="chevron-forward-outline" size={20} color="#9CA3AF" />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={48} color="#ffffff" />
        </View>
        <Text style={styles.userName}>
          {profile?.full_name || profile?.username}
        </Text>
        <Text style={styles.userRole}>
          {profile?.role === 'admin' ? 'Administrador' : 'Professor'}
        </Text>
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>Informações Pessoais</Text>
        
        <ProfileItem
          icon="person-outline"
          label="Nome Completo"
          value={profile?.full_name || 'Não informado'}
        />
        
        <ProfileItem
          icon="at-outline"
          label="Username"
          value={profile?.username}
        />
        
        <ProfileItem
          icon="shield-outline"
          label="Tipo de Usuário"
          value={profile?.role === 'admin' ? 'Administrador' : 'Professor'}
        />
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>Configurações</Text>
        
        <ProfileItem
          icon="notifications-outline"
          label="Notificações"
          value="Ativadas"
          onPress={() => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento')}
        />
        
        <ProfileItem
          icon="help-circle-outline"
          label="Ajuda e Suporte"
          value="Central de Ajuda"
          onPress={() => Alert.alert('Suporte', 'Entre em contato com a equipe de TI')}
        />
        
        <ProfileItem
          icon="information-circle-outline"
          label="Sobre o App"
          value="Versão 1.0.0"
          onPress={() => Alert.alert('CEDTEC Tickets', 'Sistema de Gerenciamento de TI\nVersão 1.0.0')}
        />
      </View>

      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.signOutText}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>CEDTEC Tickets</Text>
        <Text style={styles.footerSubtext}>Sistema de Gerenciamento de TI</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#1E40AF',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  profileSection: {
    backgroundColor: '#ffffff',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileItemContent: {
    flex: 1,
  },
  profileItemLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  profileItemValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  actionsSection: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  signOutButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});