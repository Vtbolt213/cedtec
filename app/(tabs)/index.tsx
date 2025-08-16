import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/authStore';
import { useTicketStore } from '../../src/stores/ticketStore';
import { router } from 'expo-router';

export default function DashboardScreen() {
  const { profile } = useAuthStore();
  const { tickets, loading, fetchTickets } = useTicketStore();
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    fetchTickets(isAdmin);
  }, [isAdmin]);

  const onRefresh = () => {
    fetchTickets(isAdmin);
  };

  const ticketCounts = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'Aberto').length,
    inProgress: tickets.filter(t => t.status === 'Em andamento').length,
    resolved: tickets.filter(t => t.status === 'Resolvido').length,
  };

  const StatCard = ({ title, count, color, icon }: any) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statContent}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.statText}>
          <Text style={styles.statCount}>{count}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Bem-vindo, {profile?.full_name || profile?.username}
        </Text>
        <Text style={styles.roleText}>
          {isAdmin ? 'Administrador' : 'Professor'}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <StatCard
          title="Total"
          count={ticketCounts.total}
          color="#3B82F6"
          icon="stats-chart-outline"
        />
        <StatCard
          title="Abertos"
          count={ticketCounts.open}
          color="#EF4444"
          icon="time-outline"
        />
        <StatCard
          title="Em Andamento"
          count={ticketCounts.inProgress}
          color="#F59E0B"
          icon="hourglass-outline"
        />
        <StatCard
          title="Resolvidos"
          count={ticketCounts.resolved}
          color="#10B981"
          icon="checkmark-circle-outline"
        />
      </View>

      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        
        {!isAdmin && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/create')}
          >
            <Ionicons name="add-circle-outline" size={24} color="#1E40AF" />
            <Text style={styles.actionButtonText}>Criar Novo Ticket</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/tickets')}
        >
          <Ionicons name="list-outline" size={24} color="#1E40AF" />
          <Text style={styles.actionButtonText}>Ver Todos os Tickets</Text>
          <Ionicons name="chevron-forward-outline" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {isAdmin && (
        <View style={styles.adminSection}>
          <Text style={styles.sectionTitle}>Painel Administrativo</Text>
          <View style={styles.adminStats}>
            <Text style={styles.adminStatsText}>
              Gerencie todos os chamados técnicos da escola
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  roleText: {
    fontSize: 16,
    color: '#6B7280',
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    flex: 1,
  },
  statCount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  statTitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  actionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 12,
  },
  adminSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  adminStats: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adminStatsText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});