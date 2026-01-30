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
  const formatDeadlineDate = (isoString) => {
    if (!isoString) return '-';
    try {
      const date = new Date(isoString);
      // Verifica se a data é válida
      if (isNaN(date.getTime())) return isoString;

      // Usa toLocaleDateString para formato DD/MM/YYYY
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (e) {
      // Em caso de erro, retorna a string original ou um fallback
      return isoString || '-';
    }
  };

  // Função para retornar as classes de cor e estilo do prazo com base na proximidade da data
  const getDeadlinePillClass = (isoString) => {
    if (!isoString) {
      return 'text-gray-500 font-normal';
    }

    try {
      const deadlineDate = new Date(isoString);
      if (isNaN(deadlineDate.getTime())) {
        return 'text-gray-500 font-normal';
      }

      // Zera o tempo para comparar apenas as datas (meia-noite de hoje)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const deadline = new Date(deadlineDate);
      deadline.setHours(0, 0, 0, 0);

      const diffTime = deadline.getTime() - today.getTime();
      const baseClass =
        'px-2 py-1 inline-flex text-sm leading-5 font-semibold ';

      // Se o prazo já expirou (incluindo hoje), ou é muito curto
      if (diffTime <= 0) {
        // Vermelho sólido para prazo expirado
        return `${baseClass} bg-red-200 text-red-700 rounded border border-red-400`;
      }

      // Diferença em dias
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // 1. Vermelho: Faltando menos de 1 semana (<= 7 dias)
      if (diffDays <= 7) {
        return `${baseClass}  text-red-700 `;
      }

      // 2. Laranja: Faltando até 2 semanas (<= 14 dias)
      if (diffDays <= 14) {
        return `${baseClass} text-orange-600 `;
      }

      // 3. Amarelo (Âmbar): Faltando até 3 semanas (<= 21 dias)
      if (diffDays <= 21) {
        return `${baseClass} text-amber-700 `;
      }

      // 4. Cinza (Normal): Mais de 1 mês (30 dias) ou período entre 21 e 30 dias
      return `${baseClass} text-gray-600 `;
    } catch (e) {
      return 'text-gray-500 font-normal';
    }
  };

  const getPriorityPillClass = (priority) => {
    const color = getPriorityColor(priority);
    let base = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full';

    switch (color) {
      case 'red':
        return `${base} bg-red-100 text-red-800 border border-red-300`;
      case 'orange':
        return `${base} bg-orange-100 text-orange-800 border border-orange-300`;
      case 'blue':
        return `${base} bg-blue-100 text-blue-800 border border-blue-300`;
      case 'green':
      default:
        return `${base} bg-green-100 text-green-800 border border-green-300`;
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
              Prazo
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6"
            >
              Ultimo Contato
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6"
            >
              Audiencia
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6"
            >
              Indicação
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4"
            >
              Próximo Passo
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4"
            >
              Processo Nº
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
                colSpan="8"
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
                      processo.statusPrioridade,
                    )}
                  >
                    {processo.statusPrioridade || 'Normal'}
                  </span>
                </td>
                {console.log('Processo:', processo)}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <span className={getDeadlinePillClass(processo.prazo)}>
                    {formatDeadlineDate(processo.prazo) || '-'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {formatDeadlineDate(processo.ultimoContato) || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {formatDate(processo.audiencia) || '-'}
                </td>
                <td className="px-6 py-4 whitespace-normal text-sm text-gray-700 max-w-xs">
                  {processo.indicacao || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {processo.proximoPasso || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {processo.numProcesso || '-'}
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
