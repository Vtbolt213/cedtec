import React, { useEffect, useState } from 'react';
import { X, Clock, User, MapPin, MessageCircle, Send } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTicketStore } from '../../stores/ticketStore';
import { useAuthStore } from '../../stores/authStore';

interface TicketDetailModalProps {
  ticketId: string;
  onClose: () => void;
  isAdmin: boolean;
}

const TicketDetailModal: React.FC<TicketDetailModalProps> = ({ 
  ticketId, 
  onClose, 
  isAdmin 
}) => {
  const { profile } = useAuthStore();
  const { 
    currentTicket, 
    interactions, 
    fetchTicketById, 
    fetchInteractions,
    updateTicketStatus,
    addInteraction 
  } = useTicketStore();

  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTicketById(ticketId);
    fetchInteractions(ticketId);
  }, [ticketId]);

  const handleStatusChange = async (newStatus: string) => {
    if (currentTicket) {
      await updateTicketStatus(currentTicket.id, newStatus);
      fetchTicketById(ticketId); // Refresh ticket data
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    const success = await addInteraction(ticketId, newComment.trim());
    if (success) {
      setNewComment('');
    }
    setIsSubmitting(false);
  };

  if (!currentTicket) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto"></div>
        </div>
      </div>
    );
  }

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
        return 'text-red-600 bg-red-50';
      case 'Alta':
        return 'text-orange-600 bg-orange-50';
      case 'Normal':
        return 'text-blue-600 bg-blue-50';
      case 'Baixa':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Detalhes do Chamado
            </h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(currentTicket.status)}`}>
              {currentTicket.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Ticket Info */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  {currentTicket.title}
                </h4>
                <p className="text-gray-600 mb-4">
                  {currentTicket.description}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-700">Tipo:</span>
                    <span className="text-gray-600">{currentTicket.problem_type}</span>
                  </div>
                  {currentTicket.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{currentTicket.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Criado por: {currentTicket.profiles?.full_name || currentTicket.profiles?.username}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {format(new Date(currentTicket.created_at), 'dd/MM/yyyy às HH:mm', { locale: ptBR })}
                  </span>
                </div>

                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(currentTicket.priority)}`}>
                  Prioridade: {currentTicket.priority}
                </div>

                {isAdmin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alterar Status
                    </label>
                    <select
                      value={currentTicket.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Aberto">Aberto</option>
                      <option value="Em andamento">Em Andamento</option>
                      <option value="Resolvido">Resolvido</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interactions */}
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Comentários e Interações</span>
            </h4>
            
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {interactions.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhum comentário ainda
                </p>
              ) : (
                interactions.map((interaction) => (
                  <div key={interaction.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {interaction.profiles?.full_name || interaction.profiles?.username}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          ({interaction.profiles?.role})
                        </span>
                        {interaction.interaction_type === 'status_change' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Status alterado
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {format(new Date(interaction.created_at), 'dd/MM HH:mm', { locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{interaction.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Comment */}
          <form onSubmit={handleAddComment} className="border-t border-gray-200 pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adicionar Comentário
            </label>
            <div className="flex space-x-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite seu comentário..."
              />
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>Enviar</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailModal;