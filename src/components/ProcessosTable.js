'use client';
import React from 'react';
import { getPriorityColor } from '@/utils/priority-utils';

const formatDate = (isoString) => {
  if (!isoString) return '-';
  try {
    return new Date(isoString).toLocaleDateString('pt-BR');
  } catch {
    return '-';
  }
};

const formatDeadlineDate = (isoString) => {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return isoString || '-';
  }
};

const getDeadlinePillClass = (isoString) => {
  if (!isoString) return 'text-[#AA8F71]';
  try {
    const deadlineDate = new Date(isoString);
    if (isNaN(deadlineDate.getTime())) return 'text-[#AA8F71]';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(deadlineDate);
    deadline.setHours(0, 0, 0, 0);

    const diffTime = deadline.getTime() - today.getTime();
    const base =
      'px-2 py-0.5 rounded text-xs font-semibold inline-flex items-center';

    if (diffTime <= 0)
      return `${base} bg-red-100 text-red-700 border border-red-300`;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) return `${base} bg-red-50 text-red-700`;
    if (diffDays <= 14) return `${base} bg-orange-50 text-orange-700`;
    if (diffDays <= 21) return `${base} bg-amber-50 text-amber-700`;
    return `${base} text-[#161616]/60`;
  } catch {
    return 'text-[#AA8F71]';
  }
};

const getPriorityBadgeClasses = (status) => {
  const color = getPriorityColor(status);
  const base = 'px-2.5 py-0.5 rounded-full text-xs font-semibold border';
  switch (color) {
    case 'red':
      return `${base} bg-red-50 text-red-800 border-red-200`;
    case 'orange':
      return `${base} bg-orange-50 text-orange-800 border-orange-200`;
    case 'blue':
      return `${base} bg-blue-50 text-blue-800 border-blue-200`;
    case 'purple':
      return `${base} bg-purple-50 text-purple-800 border-purple-200`;
    case 'amber':
      return `${base} bg-amber-50 text-amber-800 border-amber-200`;
    case 'green':
      return `${base} bg-green-50 text-green-800 border-green-200`;
    default:
      return `${base} bg-[#EDE8E5] text-[#161616]/70 border-[#AA8F71]/30`;
  }
};

const ProcessosTable = ({ processos, onProcessoClick }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-[#AA8F71]/20 shadow-sm overflow-x-auto">
      <table className="min-w-full divide-y divide-[#EDE8E5]">
        <thead>
          <tr className="bg-[#610013]">
            {[
              'Cliente',
              'Prioridade',
              'Prazo',
              'Último Contato',
              'Audiência',
              'Parceria',
              'Próximo Passo',
              'Processo Nº',
              '',
            ].map((col) => (
              <th
                key={col}
                className="px-5 py-3.5 text-left text-xs font-semibold text-[#F0D9CC]/80 uppercase tracking-wider"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EDE8E5]">
          {processos.length === 0 ? (
            <tr>
              <td colSpan="9" className="px-6 py-12 text-center text-[#AA8F71]">
                Nenhum processo encontrado com os filtros aplicados.
              </td>
            </tr>
          ) : (
            processos.map((processo, i) => (
              <tr
                key={processo._id}
                className={`cursor-pointer transition-colors duration-100 hover:bg-[#F0D9CC]/40 ${i % 2 === 0 ? 'bg-white' : 'bg-[#EDE8E5]/30'}`}
                onClick={() => onProcessoClick(processo)}
              >
                <td className="px-5 py-3.5 text-sm font-semibold text-[#161616]">
                  {processo.nomeCliente || 'N/A'}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={getPriorityBadgeClasses(
                      processo.statusPrioridade,
                    )}
                  >
                    {processo.statusPrioridade || 'Normal'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-sm">
                  <span className={getDeadlinePillClass(processo.prazo)}>
                    {formatDeadlineDate(processo.prazo)}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-sm text-[#161616]/60">
                  {formatDeadlineDate(processo.ultimoContato)}
                </td>
                <td className="px-5 py-3.5 text-sm font-semibold text-[#610013]">
                  {formatDate(processo.audiencia)}
                </td>
                <td className="px-5 py-3.5 text-sm text-[#161616]/60 max-w-[140px] truncate">
                  {processo.parceria || '-'}
                </td>
                <td className="px-5 py-3.5 text-sm text-[#161616]/70 max-w-[180px] truncate">
                  {processo.proximoPasso || '-'}
                </td>
                <td className="px-5 py-3.5 text-sm text-[#161616]/60">
                  {processo.numProcesso || '-'}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onProcessoClick(processo);
                    }}
                    className="text-xs font-semibold text-[#610013] hover:text-[#D69957] transition-colors uppercase tracking-wider"
                  >
                    Ver
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
