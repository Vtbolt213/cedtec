import React, { useEffect, useState } from 'react';
import { Users, Filter, Search, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { useTicketStore } from '../../stores/ticketStore';
import { useAuthStore } from '../../stores/authStore';
import TicketCard from '../tickets/TicketCard';
import TicketDetailModal from '../tickets/TicketDetailModal';

const AdminDashboard: React.FC = () => {
  const { profile } = useAuthStore();
  const { tickets, loading, fetchTickets, filters, setFilters } = useTicketStore();
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  useEffect(() => {
    console.log('AdminDashboard mounted - loading tickets');
    fetchTickets(true); // true = é admin
  }, [fetchTickets]);

  useEffect(() => {
    console.log('Tickets updated in AdminDashboard:', tickets.length);
  }, [tickets]);

  const filteredTickets = tickets.filter(ticket => {
    if (filters.status && ticket.status !== filters.status) return false;
    if (filters.problemType && ticket.problem_type !== filters.problemType) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        ticket.title.toLowerCase().includes(searchLower) ||
        ticket.description.toLowerCase().includes(searchLower) ||
        ticket.profiles?.username?.toLowerCase().includes(searchLower) ||
        ticket.profiles?.full_name?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const ticketCounts = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'Aberto').length,
    inProgress: tickets.filter(t => t.status === 'Em andamento').length,
    resolved: tickets.filter(t => t.status === 'Resolvido').length,
  };

  const problemTypeCounts = {
    Rede: tickets.filter(t => t.problem_type === 'Rede').length,
    Hardware: tickets.filter(t => t.problem_type === 'Hardware').length,
    Software: tickets.filter(t => t.problem_type === 'Software').length,
    Projetor: tickets.filter(t => t.problem_type === 'Projetor').length,
    Outros: tickets.filter(t => t.problem_type === 'Outros').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Painel Administrativo
        </h1>
        <p className="text-gray-600">Gerencie todos os chamados técnicos da escola</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{ticketCounts.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Clock className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aguardando</p>
              <p className="text-2xl font-bold text-gray-900">{ticketCounts.open}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Em Progresso</p>
              <p className="text-2xl font-bold text-gray-900">{ticketCounts.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resolvidos</p>
              <p className="text-2xl font-bold text-gray-900">{ticketCounts.resolved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Problem Types Overview */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tipos de Problemas</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(problemTypeCounts).map(([type, count]) => (
            <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-sm text-gray-600">{type}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filtros:</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por título, descrição ou usuário..."
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full sm:w-72"
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos os Status</option>
              <option value="Aberto">Aberto</option>
              <option value="Em andamento">Em Andamento</option>
              <option value="Resolvido">Resolvido</option>
            </select>

            <select
              value={filters.problemType}
              onChange={(e) => setFilters({ problemType: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos os Tipos</option>
              <option value="Rede">Rede</option>
              <option value="Hardware">Hardware</option>
              <option value="Software">Software</option>
              <option value="Projetor">Projetor</option>
              <option value="Outros">Outros</option>
            </select>

            {(filters.status || filters.problemType || filters.search) && (
              <button
                onClick={() => setFilters({ status: '', problemType: '', search: '' })}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
              >
                Limpar Filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {tickets.length === 0 ? 'Nenhum ticket registrado' : 'Nenhum ticket encontrado'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {tickets.length === 0 
                ? 'Os tickets criados pelos professores aparecerão aqui.'
                : 'Tente ajustar os filtros de busca.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Tickets ({filteredTickets.length})
              </h2>
              <div className="text-sm text-gray-500">
                Mostrando {filteredTickets.length} de {tickets.length} tickets
              </div>
            </div>
            
            {filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onClick={() => setSelectedTicketId(ticket.id)}
                showAssignee={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicketId && (
        <TicketDetailModal
          ticketId={selectedTicketId}
          onClose={() => setSelectedTicketId(null)}
          isAdmin={true}
        />
      )}
    </div>
  );
};

export default AdminDashboard;