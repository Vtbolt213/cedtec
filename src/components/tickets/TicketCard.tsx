import React from 'react';
import { Clock, User, MapPin, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Ticket } from '../../lib/supabase';

interface TicketCardProps {
  ticket: Ticket;
  onClick: () => void;
  showAssignee?: boolean;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, onClick, showAssignee = false }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aberto':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Em andamento':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Resolvido':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgente':
        return 'text-red-600';
      case 'Alta':
        return 'text-orange-600';
      case 'Normal':
        return 'text-blue-600';
      case 'Baixa':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getProblemTypeIcon = (type: string) => {
    switch (type) {
      case 'Rede':
        return '🌐';
      case 'Hardware':
        return '🖥️';
      case 'Software':
        return '💻';
      case 'Projetor':
        return '📽️';
      default:
        return '🔧';
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 p-6 cursor-pointer border border-gray-200 hover:border-blue-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-lg">{getProblemTypeIcon(ticket.problem_type)}</span>
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {ticket.title}
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
              {ticket.status}
            </span>
          </div>
          
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {ticket.description}
          </p>
        </div>

        <div className="ml-4 flex flex-col items-end space-y-2">
          <div className={`flex items-center space-x-1 ${getPriorityColor(ticket.priority)}`}>
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs font-medium">{ticket.priority}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          {showAssignee && ticket.profiles && (
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>{ticket.profiles.full_name || ticket.profiles.username}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-1">
            <span className="font-medium text-gray-700">{ticket.problem_type}</span>
          </div>
          
          {ticket.location && (
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{ticket.location}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-1">
          <Clock className="h-4 w-4" />
          <span>{format(new Date(ticket.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;