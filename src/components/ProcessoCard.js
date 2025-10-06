'use client';
import React from 'react';
import { Draggable } from 'react-beautiful-dnd'; // Importação DND

const getPriorityColor = (status) => {
  // ... (Mantido o mesmo código de cores)
  switch (status) {
    case 'Fazer com prioridade':
      return 'border-orange-500';
    case 'Aguardando (Cliente)':
      return 'border-yellow-500';
    case 'Aguardando (Andamento Processual)':
      return 'border-green-500';
    case 'Prazo Processual':
      return 'border-red-500';
    case 'Audiência agendada':
      return 'border-purple-500';
    default:
      return 'border-green-500';
  }
};

// Adicionei o index como prop
const ProcessoCard = ({ processo, onClick, index }) => {
  const colorClass = getPriorityColor(processo.statusPrioridade);

  // Início da Área Draggable
  return (
    <Draggable draggableId={processo._id} index={index}>
      {(provided) => (
        <div
          // provided.draggableProps e provided.dragHandleProps são obrigatórios
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white shadow-md rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow border-l-7 ${colorClass}`}
          onClick={() => onClick(processo)}
          // A classe mb-4 foi movida para o KanbanColumn para melhor espaçamento DND
        >
          <h3 className="font-semibold text-gray-800 mb-1">
            {processo.nomeCliente}
          </h3>
          <p className="text-xs text-gray-500 mb-2">
            {processo.numProcesso || 'Nº Pendente'}
          </p>
          <b
            className={`text-sm mb-2 inline-block ${colorClass.replace(
              'border-',
              'text-'
            )}`}
          >
            {processo.statusPrioridade}
          </b>
          <br />

          {/* Tag Tipo */}
          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mb-2">
            #{processo.tipo}
          </span>

          {/* Detalhes Críticos */}
          <div className="text-sm">
            {processo.prazo && (
              <p className="text-red-600">
                Prazo: {new Date(processo.prazo).toLocaleDateString('pt-BR')}
              </p>
            )}
            <b className="text-gray-600">
              Próximo Passo: {processo.proximoPasso}
            </b>
          </div>
        </div>
      )}
    </Draggable>
  );
  // Fim da Área Draggable
};

export default ProcessoCard;
