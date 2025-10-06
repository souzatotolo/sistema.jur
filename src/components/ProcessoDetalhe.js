'use client';
import React, { useState, useRef, useEffect } from 'react'; // Importar useRef e useEffect

// Adiciona onDelete nas props
const ProcessoDetalhe = ({
  processo,
  onClose,
  onEditStart,
  onAddUpdate,
  onDelete,
}) => {
  const [isAddingUpdate, setIsAddingUpdate] = useState(false);
  const [newUpdateText, setNewUpdateText] = useState('');

  // 1. CRIA A REFERÊNCIA
  const panelRef = useRef(null);

  // 2. LÓGICA PARA FECHAR AO CLICAR FORA
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Verifica se o clique ocorreu fora do elemento referenciado
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose(); // Chama a função de fechar passada pelo Processos.jsx
      }
    };

    // Adiciona o listener quando o componente é montado
    document.addEventListener('mousedown', handleClickOutside);

    // Remove o listener quando o componente é desmontado (limpeza)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]); // Dependência: só precisa redefinir se onClose mudar (o que não deve acontecer)

  const formatCurrency = (value) => {
    const cleanValue =
      typeof value === 'string'
        ? parseFloat(value.replace('R$', '').replace('.', '').replace(',', '.'))
        : value;
    if (isNaN(cleanValue) || cleanValue === 0) return 'Não Definido';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cleanValue);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  // Handler para submeter a nova atualização
  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (newUpdateText.trim()) {
      onAddUpdate(newUpdateText.trim()); // CHAMA A FUNÇÃO NO Processos.jsx
      setNewUpdateText('');
      setIsAddingUpdate(false);
    }
  };

  return (
    // 3. ATRIBUI A REFERÊNCIA AO CONTAINER PRINCIPAL
    <div
      ref={panelRef} // Referencia o painel
      className="fixed top-0 right-0 w-150 h-full bg-white shadow-2xl z-40 overflow-y-auto border-l border-gray-200"
    >
      {/* Cabeçalho do Painel */}
      <div className="p-5 border-b sticky top-0 bg-[#ffe8da6f] z-10 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">
          {processo.nomeCliente}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-900 text-2xl"
        >
          &times;
        </button>
      </div>

      <div className="p-5 space-y-6">
        <Section title="Informações Gerais">
          <DetailItem
            label="Valor da Causa"
            value={formatCurrency(processo.valorCausa)}
          />
          <DetailItem
            label="Contato"
            value={processo.contato || 'Não Informado'}
          />
          <DetailItem label="Fase Atual" value={processo.fase} />
          {/* Adicione mais DetailItems aqui... */}
        </Section>

        {/* Exemplo de outra seção */}
        <Section title="Prazos e Tipos">
          <DetailItem label="Tipo Processual" value={processo.tipo || 'N/A'} />
          <DetailItem label="Prazo Final" value={formatDate(processo.prazo)} />
          <DetailItem
            label="Próximo Passo"
            value={processo.proximoPasso || 'A definir'}
            isBold
          />
        </Section>
        {/* Fim da seção de exemplo */}

        <Section title="Observações e Histórico">
          <h4 className="font-semibold text-gray-700 mt-4 mb-2">
            Última Observação:
          </h4>
          <p className="text-sm italic text-gray-600 border-l-2 border-yellow-400 pl-3 bg-yellow-50 p-2 rounded">
            {processo.observacao || 'Nenhuma observação recente.'}
          </p>
          <h4 className="font-semibold text-gray-700 mt-4 mb-2">
            Timeline de Eventos:
          </h4>
          <Timeline historico={processo.historico} />
        </Section>
      </div>

      {/* ÁREA DE AÇÕES */}
      <div className="p-5 border-t sticky bottom-0 bg-white z-10 flex flex-col space-y-2">
        {/* Botão Editar Processo */}
        <button
          className="bg-blue-700 text-white py-2 rounded hover:bg-blue-800 transition"
          onClick={onEditStart}
        >
          Editar Processo
        </button>

        {/* Botão Adicionar Atualização */}
        <button
          className="bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 transition"
          onClick={() => setIsAddingUpdate(true)}
        >
          + Adicionar Atualização
        </button>

        {/* NOVO BOTÃO DE EXCLUSÃO */}
        <button
          className="bg-red-800 text-white py-2 rounded hover:bg-red-900 transition"
          onClick={onDelete} // Chama a função que envia o DELETE para a API
        >
          Excluir Processo
        </button>

        {/* Input de Adicionar Atualização (Condicional) */}
        {isAddingUpdate && (
          <form onSubmit={handleUpdateSubmit} className="mt-2 space-y-2">
            <textarea
              value={newUpdateText}
              onChange={(e) => setNewUpdateText(e.target.value)}
              placeholder="Descreva a atualização (ex: 'Documentos recebidos hoje')"
              className="w-full p-2 border border-gray-300 rounded text-sm focus:border-blue-500"
              rows="2"
              required
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                className="flex-1 bg-green-500 text-white py-1 rounded text-sm hover:bg-green-600"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setIsAddingUpdate(false)}
                className="bg-gray-400 text-gray-800 py-1 px-3 rounded text-sm hover:bg-gray-500"
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

// Componentes auxiliares (Section, DetailItem, Timeline) - Mantidos
const Section = ({ title, children }) => (
  <div className="border-b pb-4">
    <h3 className="text-lg font-bold text-gray-800 mb-3">{title}</h3>
    {children}
  </div>
);

const DetailItem = ({ label, value, isBold = false }) => (
  <p className={`text-sm ${isBold ? 'font-bold' : ''}`}>
    <span className="font-medium text-gray-600">{label}:</span> {value}
  </p>
);

const Timeline = ({ historico }) => (
  <ul className="space-y-2">
    {historico && historico.length > 0 ? (
      historico.map((item, index) => (
        <li
          key={index}
          className="text-xs text-gray-700 border-l-2 border-gray-300 pl-3"
        >
          <span className="font-semibold">
            {new Date(item.data).toLocaleDateString('pt-BR')}:
          </span>{' '}
          {item.descricao}
        </li>
      ))
    ) : (
      <p className="text-sm text-gray-500">Nenhuma atualização registrada.</p>
    )}
  </ul>
);

export default ProcessoDetalhe;
