'use client';
import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import ProcessoCard from './ProcessoCard';

const KanbanColumn = ({
  title,
  processos,
  onCardClick,
  faseId,
  onNewProcessClick,
}) => {
  return (
    <div className="flex-shrink-0 w-85 bg-gray-100 rounded-xl p-3 shadow-inner h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-gray-800">{title}</h3>
        <span className="bg-gray-300 text-gray-700 text-sm font-medium px-2 py-0.5 rounded-full">
          {processos.length}
        </span>
      </div>

      <Droppable droppableId={faseId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[100px] space-y-3 p-1 transition-colors 
                                    ${
                                      snapshot.isDraggingOver
                                        ? 'bg-[#A03232]'
                                        : ''
                                    } 
                                    overflow-y-auto max-h-[calc(100%-100px)]`}
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

      <button
        className="w-full mt-4 text-red-800 hover:text-red-900 flex items-center justify-center py-2 text-sm rounded-lg border border-dashed border-gray-400"
        onClick={onNewProcessClick}
      >
        + Adicionar Processo
      </button>
    </div>
  );
};

export default KanbanColumn;
