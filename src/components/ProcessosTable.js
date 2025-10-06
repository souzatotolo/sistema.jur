'use client';
import React from 'react';
import { getPriorityColor, PRIORITY_RANK } from '@/utils/priority-utils';

// Função para formatar a data (opcional, assumindo que Processo possui um campo de data relevante)
const formatDate = (isoString) => {
  if (!isoString) return '-';
  try {
    return new Date(isoString).toLocaleDateString('pt-BR');
  } catch (e) {
    return '-';
  }
};

// Componente Tabela de Processos
const ProcessosTable = ({ processos, onProcessoClick }) => {
  // Função auxiliar para determinar a cor do badge de prioridade
  const getPriorityBadgeClasses = (status) => {
    const color = getPriorityColor(status);
    const base = 'px-3 py-1 rounded-full text-xs font-semibold';

    switch (color) {
      case 'red':
        return `${base} bg-red-100 text-red-800 border border-red-300`;
      case 'orange':
        return `${base} bg-orange-100 text-orange-800 border border-orange-300`;
      case 'blue':
        return `${base} bg-blue-100 text-blue-800 border border-blue-300`;
      case 'green':
        return `${base} bg-green-100 text-green-800 border border-green-300`;
      default:
        return `${base} bg-gray-200 text-gray-700 border border-gray-400`;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-x-auto border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5"
            >
              Cliente
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6"
            >
              Prioridade
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6"
            >
              N° Processo
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6"
            >
              Fase
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4"
            >
              Próximo Passo
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Detalhes</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {processos.length === 0 ? (
            <tr>
              <td
                colSpan="6"
                className="px-6 py-8 text-center text-gray-500 text-lg"
              >
                Nenhum processo encontrado com os filtros aplicados.
              </td>
            </tr>
          ) : (
            processos.map((processo) => (
              <tr
                key={processo._id}
                className="hover:bg-gray-50 cursor-pointer transition duration-150 ease-in-out"
                onClick={() => onProcessoClick(processo)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {processo.nomeCliente || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={getPriorityBadgeClasses(
                      processo.statusPrioridade
                    )}
                  >
                    {processo.statusPrioridade || 'Normal'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {processo.numProcesso || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {processo.fase || '-'}
                </td>
                <td className="px-6 py-4 whitespace-normal text-sm text-gray-700 max-w-xs">
                  {processo.proximoPasso || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Previne a abertura dupla do detalhe
                      onProcessoClick(processo);
                    }}
                    className="text-[#A03232] hover:text-red-700 transition-colors"
                  >
                    Detalhes
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProcessosTable;
