'use client';
import React, { useState, useRef, useEffect } from 'react';

const ProcessoDetalhe = ({ processo, onClose, onEditStart, onAddUpdate, onDelete }) => {
  const [isAddingUpdate, setIsAddingUpdate] = useState(false);
  const [newUpdateText, setNewUpdateText] = useState('');
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const formatCurrency = (value) => {
    const clean = typeof value === 'string'
      ? parseFloat(value.replace('R$', '').replace('.', '').replace(',', '.'))
      : value;
    if (isNaN(clean) || clean === 0) return 'Não definido';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(clean);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (newUpdateText.trim()) {
      onAddUpdate(newUpdateText.trim());
      setNewUpdateText('');
      setIsAddingUpdate(false);
    }
  };

  return (
    <div
      ref={panelRef}
      className="fixed top-0 right-0 w-[420px] h-full bg-white shadow-2xl z-40 flex flex-col border-l border-[#EDE8E5]"
    >
      {/* Cabeçalho */}
      <div className="bg-[#610013] px-5 py-4 flex justify-between items-start flex-shrink-0">
        <div>
          <h2 className="font-display text-lg font-bold text-white leading-tight">
            {processo.nomeCliente}
          </h2>
          {processo.fase && (
            <span className="text-[#D69957] text-xs font-medium mt-0.5 block">
              {processo.fase}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-[#F0D9CC]/70 hover:text-white text-2xl leading-none mt-0.5 transition-colors"
        >
          &times;
        </button>
      </div>

      {/* Conteúdo rolável */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <Section title="Informações Gerais">
          <DetailItem label="Valor da Causa" value={formatCurrency(processo.valorCausa)} />
          <DetailItem label="Contato" value={processo.contato || 'Não informado'} />
          <DetailItem label="Fase" value={processo.fase || 'N/A'} />
          <DetailItem label="Tipo" value={processo.tipo || 'N/A'} />
        </Section>

        <Section title="Prazos">
          <DetailItem label="Prazo Final" value={formatDate(processo.prazo)} />
          <DetailItem label="Audiência" value={formatDate(processo.audiencia)} />
          <DetailItem label="Último Contato" value={formatDate(processo.ultimoContato)} />
          <DetailItem label="Próximo Passo" value={processo.proximoPasso || 'A definir'} isBold />
        </Section>

        <Section title="Observações">
          {processo.observacao ? (
            <p className="text-sm text-[#161616]/80 italic border-l-2 border-[#D69957] pl-3 bg-[#F0D9CC]/30 py-2 rounded-r">
              {processo.observacao}
            </p>
          ) : (
            <p className="text-sm text-[#AA8F71]">Nenhuma observação registrada.</p>
          )}
        </Section>

        <Section title="Histórico">
          <Timeline historico={processo.historico} />
        </Section>
      </div>

      {/* Rodapé de ações */}
      <div className="flex-shrink-0 p-4 border-t border-[#EDE8E5] bg-[#EDE8E5]/40 space-y-2">
        <button
          className="w-full py-2.5 bg-[#610013] text-white text-sm font-semibold rounded-lg hover:bg-[#4a000f] transition-colors"
          onClick={onEditStart}
        >
          Editar Processo
        </button>

        <button
          className="w-full py-2.5 bg-white text-[#610013] text-sm font-semibold rounded-lg border border-[#AA8F71]/30 hover:bg-[#F0D9CC]/50 transition-colors"
          onClick={() => setIsAddingUpdate(true)}
        >
          + Adicionar Atualização
        </button>

        <button
          className="w-full py-2.5 bg-white text-red-700 text-sm font-semibold rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
          onClick={onDelete}
        >
          Excluir Processo
        </button>

        {isAddingUpdate && (
          <form onSubmit={handleUpdateSubmit} className="pt-2 space-y-2">
            <textarea
              value={newUpdateText}
              onChange={(e) => setNewUpdateText(e.target.value)}
              placeholder="Descreva a atualização..."
              className="w-full p-2.5 border border-[#AA8F71]/40 rounded-lg text-sm focus:outline-none focus:border-[#610013] focus:ring-1 focus:ring-[#610013] resize-none"
              rows="2"
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-[#610013] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#4a000f] transition-colors"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setIsAddingUpdate(false)}
                className="px-4 bg-white text-[#161616]/70 py-2 rounded-lg text-sm border border-[#AA8F71]/30 hover:bg-[#EDE8E5] transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div>
    <h3 className="font-display text-sm font-bold text-[#610013] uppercase tracking-wider mb-2.5 pb-1.5 border-b border-[#EDE8E5]">
      {title}
    </h3>
    <div className="space-y-1.5">{children}</div>
  </div>
);

const DetailItem = ({ label, value, isBold = false }) => (
  <div className="flex justify-between gap-3 text-sm">
    <span className="text-[#AA8F71] flex-shrink-0">{label}</span>
    <span className={`text-right ${isBold ? 'font-semibold text-[#161616]' : 'text-[#161616]/80'}`}>
      {value}
    </span>
  </div>
);

const Timeline = ({ historico }) => (
  <ul className="space-y-2.5">
    {historico && historico.length > 0 ? (
      [...historico].reverse().map((item, index) => (
        <li key={index} className="text-xs border-l-2 border-[#D69957] pl-3">
          <span className="font-semibold text-[#610013]">
            {new Date(item.data).toLocaleDateString('pt-BR')}
          </span>
          <span className="text-[#161616]/70 ml-1">{item.descricao}</span>
        </li>
      ))
    ) : (
      <p className="text-sm text-[#AA8F71]">Nenhuma atualização registrada.</p>
    )}
  </ul>
);

export default ProcessoDetalhe;
