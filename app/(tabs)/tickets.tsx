import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/authStore';
import { useTicketStore } from '../../src/stores/ticketStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function TicketsScreen() {
  const { profile } = useAuthStore();
  const { tickets, loading, fetchTickets, filters, setFilters } = useTicketStore();
  const [searchText, setSearchText] = useState('');
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    fetchTickets(isAdmin);
  }, [isAdmin]);

  const onRefresh = () => {
    fetchTickets(isAdmin);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aberto': return '#EF4444';
      case 'Em andamento': return '#F59E0B';
      case 'Resolvido': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgente': return '#DC2626';
      case 'Alta': return '#EA580C';
      case 'Normal': return '#0891B2';
      case 'Baixa': return '#059669';
      default: return '#6B7280';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = !filters.status || ticket.status === filters.status;
    const matchesProblemType = !filters.problemType || ticket.problem_type === filters.problemType;
    
    return matchesSearch && matchesStatus && matchesProblemType;
  });

  const renderTicket = ({ item }: { item: any }) => (
    <View style={styles.ticketCard}>
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketTitle} numberOfLines={1}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>
      
      <Text style={styles.ticketDescription} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.ticketMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="settings-outline" size={16} color="#6B7280" />
          <Text style={styles.metaText}>{item.problem_type}</Text>
        </View>
        
        <View style={styles.metaItem}>
          <Ionicons name="flag-outline" size={16} color={getPriorityColor(item.priority)} />
          <Text style={[styles.metaText, { color: getPriorityColor(item.priority) }]}>
            {item.priority}
          </Text>
        </View>
        
        {item.location && (
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text style={styles.metaText}>{item.location}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.ticketFooter}>
        {isAdmin && item.profiles && (
          <Text style={styles.authorText}>
            Por: {item.profiles.full_name || item.profiles.username}
          </Text>
        )}
        <Text style={styles.dateText}>
          {format(new Date(item.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar tickets..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      <FlatList
        data={filteredTickets}
        renderItem={renderTicket}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>Nenhum ticket encontrado</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  searchContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  listContainer: {
    padding: 16,
  },
  ticketCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ticketDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  ticketMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  authorText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
});