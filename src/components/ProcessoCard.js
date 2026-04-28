'use client';
import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

const getPriorityBorderColor = (status) => {
  switch (status) {
    case 'Prazo Processual':
      return 'border-l-red-600';
    case 'Fazer com prioridade':
      return 'border-l-orange-500';
    case 'Aguardando (Cliente)':
      return 'border-l-amber-500';
    case 'Aguardando (Andamento Processual)':
      return 'border-l-yellow-500';
    case 'Audiência Marcada':
      return 'border-l-purple-500';
    case 'Em Perícia':
      return 'border-l-purple-500';
    case 'Finalizado':
      return 'border-l-green-500';
    case 'Arquivado':
      return 'border-l-[#AA8F71]';
    default:
      return 'border-l-[#D69957]';
  }
};

const getPriorityTextColor = (status) => {
  switch (status) {
    case 'Prazo Processual':
      return 'text-red-700';
    case 'Fazer com prioridade':
      return 'text-orange-700';
    case 'Aguardando (Cliente)':
      return 'text-amber-700';
    case 'Aguardando (Andamento Processual)':
      return 'text-yellow-700';
    case 'Audiência Marcada':
      return 'text-purple-700';
    case 'Em Perícia':
      return 'text-purple-700';
    case 'Finalizado':
      return 'text-green-700';
    case 'Arquivado':
      return 'text-[#AA8F71]';
    default:
      return 'text-[#610013]';
  }
};

const ProcessoCard = ({ processo, onClick, index }) => {
  const borderColor = getPriorityBorderColor(processo.statusPrioridade);
  const textColor = getPriorityTextColor(processo.statusPrioridade);

  return (
    <Draggable draggableId={processo._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-lg border border-[#EDE8E5] border-l-4 ${borderColor} p-3.5 cursor-pointer transition-shadow ${
            snapshot.isDragging ? 'shadow-lg rotate-1' : 'hover:shadow-md'
          }`}
          onClick={() => onClick(processo)}
        >
          <h3 className="font-semibold text-[#161616] text-sm mb-0.5 leading-snug">
            {processo.nomeCliente}
          </h3>
          <p className="text-xs text-[#AA8F71] mb-2">
            {processo.numProcesso || 'Nº Pendente'}
          </p>

          <span className={`text-xs font-semibold ${textColor} block mb-2`}>
            {processo.statusPrioridade}
          </span>

          {processo.tipo && (
            <span className="inline-block bg-[#F0D9CC] text-[#610013] text-xs font-medium px-2 py-0.5 rounded-full mb-2">
              {processo.tipo}
            </span>
          )}

          {processo.prazo && (
            <p className="text-xs text-red-600 font-medium">
              Prazo: {new Date(processo.prazo).toLocaleDateString('pt-BR')}
            </p>
          )}

          {processo.proximoPasso && (
            <p className="text-xs text-[#161616]/60 mt-1 truncate">
              {processo.proximoPasso}
            </p>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default ProcessoCard;
