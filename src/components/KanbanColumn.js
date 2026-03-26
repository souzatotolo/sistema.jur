'use client';
import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import ProcessoCard from './ProcessoCard';

const KanbanColumn = ({ title, processos, onCardClick, faseId, onNewProcessClick }) => {
  return (
    <div className="flex-shrink-0 w-80 bg-white rounded-xl border border-[#AA8F71]/20 shadow-sm flex flex-col">
      {/* Cabeçalho da coluna */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-[#EDE8E5]">
        <h3 className="font-display font-semibold text-[#610013] text-sm tracking-wide">
          {title}
        </h3>
        <span className="bg-[#610013] text-[#F0D9CC] text-xs font-semibold px-2 py-0.5 rounded-full min-w-[22px] text-center">
          {processos.length}
        </span>
      </div>

      <Droppable droppableId={faseId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[120px] p-3 space-y-2 overflow-y-auto transition-colors ${
              snapshot.isDraggingOver ? 'bg-[#F0D9CC]/60' : 'bg-transparent'
            }`}
          >
            {processos.map((processo, index) => (
              <ProcessoCard
                key={processo._id}
                processo={processo}
                onClick={onCardClick}
                index={index}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <div className="p-3 border-t border-[#EDE8E5]">
        <button
          className="w-full py-2 text-sm text-[#610013] font-semibold hover:bg-[#F0D9CC]/50 rounded-lg border border-dashed border-[#D69957]/60 transition-colors"
          onClick={onNewProcessClick}
        >
          + Adicionar Processo
        </button>
      </div>
    </div>
  );
};

export default KanbanColumn;
