'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { useRouter } from 'next/navigation';

// Importa o hook de autenticação
import { useAuth } from '@/hooks/useAuth';

// Componentes
import Sidebar from '../components/Sidebar';
import KanbanColumn from '../components/KanbanColumn';
import ProcessoDetalhe from '../components/ProcessoDetalhe';
import ProcessoForm from '../components/ProcessoForm';
import ProcessosTable from '../components/ProcessosTable'; // NOVO: Importação do componente de Tabela
import { compareProcessosForTable } from '../utils/priority-utils';

// --- CONFIGURAÇÃO DA API ---
const API_BASE_URL = 'https://api-sistema-jur.onrender.com/api';
const API_PROCESSOS_URL = `${API_BASE_URL}/processos`;

// --- CONSTANTES ---
const FASES = [
  'Pré-processual',
  'Analise de Doc.',
  'Extra-Judicial',
  'Judicial',
];

const TIPOS_PROCESSO = [
  'Cível',
  'Trabalhista',
  'Divorcio',
  'Previdenciário',
  'Familia e Sucessões',
  'Consumidor',
  'Contratual',
  'Indenizatória',
  'Imobiliária',
  'Outros',
];

// NOTA: Esta lista PRIORIDADES deve ser atualizada para refletir a ordem do PRIORITY_RANK no utils/priority-utils.js
const PRIORIDADES = [
  'Prazo Processual',
  'Fazer com prioridade',
  'Aguardando (Cliente)',
  'Aguardando (Andamento Processual)',
  'Normal',
  'Em analise - Iraci',
  'Em analise - Ivana',
  'Audiência Marcada',
  'Finalizado',
  'Arquivado',
];

const Processos = () => {
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    getToken,
    logout,
  } = useAuth();
  const router = useRouter();

  const [processos, setProcessos] = useState({});
  const [selectedProcesso, setSelectedProcesso] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // --- NOVO ESTADO DE VISUALIZAÇÃO ---
  const [viewMode, setViewMode] = useState('table'); // 'kanban' ou 'table'

  // --- ESTADOS DE FILTRO ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterPrioridade, setFilterPrioridade] = useState('');

  // --- PROTEÇÃO DE ROTA ---
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login');
    }
    if (isAuthenticated) {
      loadProcessos();
    }
  }, [isAuthenticated, isAuthLoading, router]);

  // --- FUNÇÃO AUXILIAR PARA REQUISIÇÕES PROTEGIDAS ---
  const fetchProtected = async (url, options = {}) => {
    const token = getToken();
    if (!token) {
      logout();
      throw new Error(
        'Token de autenticação ausente. Redirecionando para Login.',
      );
    }

    const defaultHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const config = {
      ...options,
      headers: { ...defaultHeaders, ...options.headers },
    };

    const response = await fetch(url, config);

    if (response.status === 401 || response.status === 403) {
      logout();
      throw new Error(
        'Sessão expirada ou acesso negado. Faça login novamente.',
      );
    }

    return response;
  };

  // --- CARREGAR PROCESSOS ---
  const loadProcessos = async () => {
    setIsLoading(true);
    try {
      const response = await fetchProtected(API_PROCESSOS_URL, {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Falha ao carregar dados da API');
      const data = await response.json();
      setProcessos(data);
    } catch (error) {
      console.error('Erro ao buscar processos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProcesso = (processo) => {
    setSelectedProcesso(processo);
    setIsEditing(false);
    setIsCreating(false);
  };

  // --- FILTRAGEM (Retorna agrupado por fase - Ideal para Kanban) ---
  const getFilteredProcesses = () => {
    let allProcesses = [];
    FASES.forEach((fase) => {
      allProcesses = allProcesses.concat(processos[fase] || []);
    });

    const filtered = allProcesses.filter((processo) => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const matchSearch = searchTerm
        ? processo.nomeCliente?.toLowerCase().includes(lowerSearchTerm) ||
          processo.numProcesso?.toLowerCase().includes(lowerSearchTerm) ||
          processo.proximoPasso?.toLowerCase().includes(lowerSearchTerm)
        : true;

      const matchTipo = filterTipo ? processo.tipo === filterTipo : true;
      const matchPrioridade = filterPrioridade
        ? processo.statusPrioridade === filterPrioridade
        : true;

      return matchSearch && matchTipo && matchPrioridade;
    });

    const groupedFiltered = {};
    FASES.forEach((fase) => {
      // Nota: Não ordenamos aqui para manter a ordem do Kanban (se existir)
      groupedFiltered[fase] = filtered.filter((p) => p.fase === fase);
    });

    return groupedFiltered;
  };

  const filteredProcessosGrouped = getFilteredProcesses();

  // --- FILTRAGEM E ORDENAÇÃO GLOBAL (Retorna lista plana e ordenada - Ideal para Tabela) ---
  const getTableProcesses = () => {
    // Get all processes from all phases
    let allProcesses = [];
    Object.values(processos).forEach((fase) => {
      allProcesses = allProcesses.concat(fase || []);
    });

    // Apply search and filter
    const filtered = allProcesses.filter((processo) => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const matchSearch = searchTerm
        ? processo.nomeCliente?.toLowerCase().includes(lowerSearchTerm) ||
          processo.numProcesso?.toLowerCase().includes(lowerSearchTerm) ||
          processo.proximoPasso?.toLowerCase().includes(lowerSearchTerm)
        : true;

      const matchTipo = filterTipo ? processo.tipo === filterTipo : true;
      const matchPrioridade = filterPrioridade
        ? processo.statusPrioridade === filterPrioridade
        : true;

      return matchSearch && matchTipo && matchPrioridade;
    });

    // Filter to only active processes (not finalized or archived)
    const activeFiltered = filtered.filter(
      (p) => p.statusPrioridade !== 'Arquivado',
    );

    // Sort based on prazo/audiência e, em seguida, prioridade
    return activeFiltered.sort(compareProcessosForTable);
  };

  const filteredProcessosTable = getTableProcesses();

  // --- FUNÇÕES CRUD ---
  const handleEditStart = () => {
    if (selectedProcesso) setIsEditing(true);
  };

  const handleCancelEdit = () => setIsEditing(false);

  const handleSaveEdit = async (editedProcess) => {
    try {
      const response = await fetchProtected(
        `${API_PROCESSOS_URL}/${editedProcess._id}`,
        {
          method: 'PUT',
          body: JSON.stringify(editedProcess),
        },
      );

      if (!response.ok) throw new Error('Falha ao salvar edição');

      const updatedProcess = await response.json();
      const oldFaseId = selectedProcesso.fase;
      const newFaseId = updatedProcess.fase;
      const newProcessos = { ...processos };

      const sourceList = newProcessos[oldFaseId] || [];
      const processIndex = sourceList.findIndex(
        (p) => p._id === updatedProcess._id,
      );

      if (processIndex !== -1) sourceList.splice(processIndex, 1);

      if (!newProcessos[newFaseId]) newProcessos[newFaseId] = [];
      newProcessos[newFaseId].unshift(updatedProcess);

      setProcessos(newProcessos);
      setSelectedProcesso(updatedProcess);
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao editar processo:', error);
      // Substituído por alerta para compatibilidade, mas idealmente seria um modal
      alert('Erro ao salvar edição. Faça login novamente se necessário.');
    }
  };

  const handleNewProcessStart = () => {
    setSelectedProcesso(null);
    setIsEditing(false);
    setIsCreating(true);
  };

  const handleCancelNew = () => setIsCreating(false);

  const handleSaveNew = async (newProcess) => {
    const processToSend = {
      ...newProcess,
      fase: newProcess.fase || FASES[0],
      historico:
        newProcess.historico && newProcess.historico.length > 0
          ? newProcess.historico
          : [
              {
                descricao: 'Processo criado no sistema.',
                data: new Date().toISOString(),
              },
            ],
      _id: undefined,
    };

    try {
      const response = await fetchProtected(API_PROCESSOS_URL, {
        method: 'POST',
        body: JSON.stringify(processToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Falha ao criar novo processo: ${
            errorData.message || response.statusText
          }`,
        );
      }

      const createdProcess = await response.json();
      const newFaseId = createdProcess.fase;
      const newProcessos = { ...processos };

      if (!newProcessos[newFaseId]) newProcessos[newFaseId] = [];
      newProcessos[newFaseId].unshift(createdProcess);

      setProcessos(newProcessos);
      setSelectedProcesso(createdProcess);
      setIsCreating(false);
    } catch (error) {
      console.error('Erro ao criar processo:', error);
      // Substituído por alerta para compatibilidade, mas idealmente seria um modal
      alert(`Erro ao salvar: ${error.message}`);
    }
  };

  const handleAddUpdate = async (processId, newDescription) => {
    try {
      const response = await fetchProtected(
        `${API_PROCESSOS_URL}/${processId}/historico`,
        {
          method: 'POST',
          body: JSON.stringify({ descricao: newDescription }),
        },
      );

      if (!response.ok) throw new Error('Falha ao adicionar atualização');

      const updatedProcess = await response.json();
      const newProcessos = { ...processos };
      const fase = updatedProcess.fase;
      const processIndex = (newProcessos[fase] || []).findIndex(
        (p) => p._id === processId,
      );

      if (processIndex !== -1)
        newProcessos[fase][processIndex] = updatedProcess;

      setProcessos(newProcessos);
      setSelectedProcesso(updatedProcess);
    } catch (error) {
      console.error('Erro ao adicionar atualização:', error);
      // Substituído por alerta para compatibilidade, mas idealmente seria um modal
      alert(
        'Erro ao adicionar atualização. Faça login novamente se necessário.',
      );
    }
  };

  const handleDeleteProcesso = async (processId, faseId) => {
    // NOTE: Este confirm deve ser substituído por um modal/diálogo customizado
    if (
      !confirm(
        'Tem certeza que deseja excluir este processo? Esta ação é permanente.',
      )
    )
      return;

    try {
      const response = await fetchProtected(
        `${API_PROCESSOS_URL}/${processId}`,
        {
          method: 'DELETE',
          headers: {},
        },
      );

      if (!response.ok) throw new Error('Falha ao excluir processo');

      const newProcessos = { ...processos };
      newProcessos[faseId] = (newProcessos[faseId] || []).filter(
        (p) => p._id !== processId,
      );

      setProcessos(newProcessos);
      setSelectedProcesso(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao excluir processo:', error);
      // Substituído por alerta para compatibilidade, mas idealmente seria um modal
      alert('Erro ao excluir: ' + error.message);
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    const sourceFaseId = source.droppableId;
    const destinationFaseId = destination.droppableId;
    if (
      sourceFaseId === destinationFaseId &&
      source.index === destination.index
    )
      return;

    const newProcessos = { ...processos };
    const [process] = newProcessos[sourceFaseId].splice(source.index, 1);
    process.fase = destinationFaseId;

    if (!newProcessos[destinationFaseId]) newProcessos[destinationFaseId] = [];
    newProcessos[destinationFaseId].splice(destination.index, 0, process);

    setProcessos(newProcessos);
    if (selectedProcesso && selectedProcesso._id === draggableId) {
      setSelectedProcesso({ ...process });
    }

    try {
      await fetchProtected(`${API_PROCESSOS_URL}/${process._id}`, {
        method: 'PUT',
        body: JSON.stringify(process),
      });
    } catch (error) {
      console.error('Falha ao mover o processo na API.', error);
      loadProcessos();
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#EDE8E5]">
        <p className="text-[#AA8F71] text-sm">Verificando autenticação...</p>
      </div>
    );
  }

  if (!isAuthenticated || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#EDE8E5]">
        <p className="text-[#AA8F71] text-sm">Carregando processos...</p>
      </div>
    );
  }

  const tabClass = (mode) =>
    `py-2 px-4 text-sm font-semibold transition-colors border-b-2 ${
      viewMode === mode
        ? 'border-[#610013] text-[#610013]'
        : 'border-transparent text-[#AA8F71] hover:text-[#610013]'
    }`;

  return (
    <div className="flex min-h-screen w-screen overflow-x-hidden relative bg-[#EDE8E5]">
      <Sidebar current="Processos" onLogout={logout} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden ml-64">
        {/* Topbar */}
        <div className="bg-white border-b border-[#AA8F71]/20 px-6 py-4 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-display text-2xl font-bold text-[#161616]">
                Processos
              </h1>
              <p className="text-xs text-[#AA8F71] mt-0.5">
                {filteredProcessosTable.length} processo
                {filteredProcessosTable.length !== 1 ? 's' : ''} ativo
                {filteredProcessosTable.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              className="bg-[#610013] hover:bg-[#4a000f] text-white text-sm font-semibold py-2.5 px-5 rounded-lg transition-colors"
              onClick={handleNewProcessStart}
            >
              + Novo Processo
            </button>
          </div>

          {/* Tabs */}
        </div>

        {/* Filtros */}
        <div className="px-6 py-3 bg-white border-b border-[#AA8F71]/20 flex-shrink-0">
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Buscar por cliente, processo ou próximo passo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[220px] px-3 py-2 border border-[#AA8F71]/30 rounded-lg text-sm text-[#161616] bg-[#EDE8E5]/50 focus:outline-none focus:border-[#610013] focus:ring-1 focus:ring-[#610013] transition-colors"
            />
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="px-3 py-2 border border-[#AA8F71]/30 rounded-lg text-sm text-[#161616] bg-[#EDE8E5]/50 focus:outline-none focus:border-[#610013] transition-colors min-w-[140px]"
            >
              <option value="">Todos os tipos</option>
              {TIPOS_PROCESSO.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
            <select
              value={filterPrioridade}
              onChange={(e) => setFilterPrioridade(e.target.value)}
              className="px-3 py-2 border border-[#AA8F71]/30 rounded-lg text-sm text-[#161616] bg-[#EDE8E5]/50 focus:outline-none focus:border-[#610013] transition-colors min-w-[160px]"
            >
              <option value="">Todas as prioridades</option>
              {PRIORIDADES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {(searchTerm || filterTipo || filterPrioridade) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterTipo('');
                  setFilterPrioridade('');
                }}
                className="px-3 py-2 text-sm text-[#AA8F71] hover:text-[#610013] border border-[#AA8F71]/30 rounded-lg bg-white transition-colors"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-auto p-6">
          {viewMode === 'kanban' ? (
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex gap-4 overflow-x-auto pb-4 h-full">
                {FASES.map((fase) => (
                  <KanbanColumn
                    key={fase}
                    title={fase}
                    faseId={fase}
                    processos={filteredProcessosGrouped[fase] || []}
                    onCardClick={handleSelectProcesso}
                    onNewProcessClick={handleNewProcessStart}
                  />
                ))}
              </div>
            </DragDropContext>
          ) : (
            <ProcessosTable
              processos={filteredProcessosTable}
              onProcessoClick={handleSelectProcesso}
            />
          )}
        </div>
      </div>

      {(isCreating || selectedProcesso) && (
        <div className="fixed top-0 right-0 h-full z-50">
          {isCreating ? (
            <ProcessoForm
              processo={{}}
              fases={FASES}
              tipos={TIPOS_PROCESSO}
              prioridades={PRIORIDADES}
              onSave={handleSaveNew}
              onCancel={handleCancelNew}
              isNew={true}
            />
          ) : selectedProcesso && isEditing ? (
            <ProcessoForm
              processo={selectedProcesso}
              fases={FASES}
              tipos={TIPOS_PROCESSO}
              prioridades={PRIORIDADES}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
            />
          ) : selectedProcesso && !isEditing ? (
            <ProcessoDetalhe
              processo={selectedProcesso}
              onClose={() => setSelectedProcesso(null)}
              onEditStart={handleEditStart}
              onAddUpdate={(description) =>
                handleAddUpdate(selectedProcesso._id, description)
              }
              onDelete={() =>
                handleDeleteProcesso(
                  selectedProcesso._id,
                  selectedProcesso.fase,
                )
              }
            />
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Processos;
