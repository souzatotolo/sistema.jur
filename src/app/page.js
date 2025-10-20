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
import { compareProcessosByPriority } from '../utils/priority-utils'; // NOVO: Importação do utilitário de ordenação

// --- CONFIGURAÇÃO DA API ---
const API_BASE_URL = 'https://api-sistema-jur.onrender.com/api';
const API_PROCESSOS_URL = `${API_BASE_URL}/processos`;

// --- CONSTANTES ---
const FASES = [
  'Pré-processual',
  'Analise de Doc.',
  'Processual',
  'Finalizado',
  'Arquivado',
];

const TIPOS_PROCESSO = ['Cível', 'Trabalhista', 'Criminal', 'Previdenciário'];

// NOTA: Esta lista PRIORIDADES deve ser atualizada para refletir a ordem do PRIORITY_RANK no utils/priority-utils.js
const PRIORIDADES = [
  'Prazo Processual',
  'Fazer com prioridade',
  'Aguardando (Cliente)',
  'Aguardando (Andamento Processual)',
  'Normal',
  'Em analise - Iraci',
  'Em analise - Ivana',
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
        'Token de autenticação ausente. Redirecionando para Login.'
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
        'Sessão expirada ou acesso negado. Faça login novamente.'
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
    let allFiltered = [];
    FASES.forEach((fase) => {
      allFiltered = allFiltered.concat(filteredProcessosGrouped[fase] || []);
    });
    // Sort by priority (highest priority first) using the utility function
    return allFiltered.sort(compareProcessosByPriority);
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
        }
      );

      if (!response.ok) throw new Error('Falha ao salvar edição');

      const updatedProcess = await response.json();
      const oldFaseId = selectedProcesso.fase;
      const newFaseId = updatedProcess.fase;
      const newProcessos = { ...processos };

      const sourceList = newProcessos[oldFaseId] || [];
      const processIndex = sourceList.findIndex(
        (p) => p._id === updatedProcess._id
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
          }`
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
        }
      );

      if (!response.ok) throw new Error('Falha ao adicionar atualização');

      const updatedProcess = await response.json();
      const newProcessos = { ...processos };
      const fase = updatedProcess.fase;
      const processIndex = (newProcessos[fase] || []).findIndex(
        (p) => p._id === processId
      );

      if (processIndex !== -1)
        newProcessos[fase][processIndex] = updatedProcess;

      setProcessos(newProcessos);
      setSelectedProcesso(updatedProcess);
    } catch (error) {
      console.error('Erro ao adicionar atualização:', error);
      // Substituído por alerta para compatibilidade, mas idealmente seria um modal
      alert(
        'Erro ao adicionar atualização. Faça login novamente se necessário.'
      );
    }
  };

  const handleDeleteProcesso = async (processId, faseId) => {
    // NOTE: Este confirm deve ser substituído por um modal/diálogo customizado
    if (
      !confirm(
        'Tem certeza que deseja excluir este processo? Esta ação é permanente.'
      )
    )
      return;

    try {
      const response = await fetchProtected(
        `${API_PROCESSOS_URL}/${processId}`,
        {
          method: 'DELETE',
          headers: {},
        }
      );

      if (!response.ok) throw new Error('Falha ao excluir processo');

      const newProcessos = { ...processos };
      newProcessos[faseId] = (newProcessos[faseId] || []).filter(
        (p) => p._id !== processId
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
      <div className="flex items-center justify-center min-h-screen text-xl text-gray-500">
        Verificando autenticação...
      </div>
    );
  }

  if (!isAuthenticated || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl text-gray-500">
        Carregando processos...
      </div>
    );
  }

  const tabClass = (mode) =>
    `py-2 px-4 font-semibold text-lg transition-colors border-b-4 ${
      viewMode === mode
        ? 'border-red-600 text-red-600'
        : 'border-transparent text-gray-500 hover:text-red-500'
    }`;

  return (
    <div className="flex min-h-screen w-screen overflow-x-hidden relative">
      <Sidebar current="Processos" onLogout={logout} />

      <div className="flex-1 flex flex-col h-screen transition-all max-w-full overflow-hidden ml-64">
        <div className="p-6">
          {/* Header e Botão Novo Processo */}
          <header className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold text-gray-900">
              Gerenciamento de Processos
            </h2>
            <button
              className="bg-[#A03232] hover:bg-red-800 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-md"
              onClick={handleNewProcessStart}
            >
              + Novo Processo
            </button>
          </header>

          {/* Tabs de Visualização */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setViewMode('table')}
              className={tabClass('table')}
            >
              Tabela (Prioridade)
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={tabClass('kanban')}
            >
              Quadro (Kanban)
            </button>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-4 rounded-xl shadow-lg border border-gray-200">
            <input
              type="text"
              placeholder="Buscar por Cliente, N° Processo ou Próximo Passo"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[200px] p-2 border border-gray-300 rounded-lg shadow-inner focus:ring-red-500 focus:border-red-500"
            />
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg shadow-inner focus:ring-red-500 focus:border-red-500 bg-white min-w-[150px]"
            >
              <option value="">Todos os Tipos</option>
              {TIPOS_PROCESSO.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
            <select
              value={filterPrioridade}
              onChange={(e) => setFilterPrioridade(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg shadow-inner focus:ring-red-500 focus:border-red-500 bg-white min-w-[180px]"
            >
              <option value="">Todas as Prioridades</option>
              {PRIORIDADES.map((prioridade) => (
                <option key={prioridade} value={prioridade}>
                  {prioridade}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterTipo('');
                setFilterPrioridade('');
              }}
              className="bg-gray-300 text-gray-800 font-bold py-3 w-25 px-4 rounded-lg hover:bg-gray-400 transition-colors shadow-md"
            >
              Limpar
            </button>
          </div>
        </div>

        <div className="flex-grow overflow-auto px-6">
          {viewMode === 'kanban' ? (
            /* Conteúdo Kanban */
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex space-x-4 overflow-x-auto pb-4 w-full h-full">
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
            /* Conteúdo Tabela */
            <ProcessosTable
              processos={filteredProcessosTable}
              onProcessoClick={handleSelectProcesso}
            />
          )}
        </div>
      </div>

      {(isCreating || selectedProcesso) && (
        <div className="absolute top-0 right-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 overflow-auto transition-transform">
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
                  selectedProcesso.fase
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
