'use client';
import React, { useState, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import Sidebar from '../components/Sidebar';
import KanbanColumn from '../components/KanbanColumn';
import ProcessoDetalhe from '../components/ProcessoDetalhe';
import ProcessoForm from '../components/ProcessoForm';

// --- CONFIGURAÇÃO DA API ---
const API_URL = 'https://api-sistema-jur.onrender.com/api/processos';
// --------------------------

// --- CONSTANTES ---
const FASES = [
  'Pré-processual',
  'Averiguação de Documentos',
  'Processual',
  'Finalizado/Arquivado',
];
const TIPOS_PROCESSO = ['Cível', 'Trabalhista', 'Criminal', 'Previdenciário'];
const PRIORIDADES = [
  'Fazer com prioridade',
  'Aguardando (Cliente)',
  'Prazo Processual',
  'Aguardando (Andamento Processual)',
  'Normal',
];

const Processos = () => {
  const [processos, setProcessos] = useState({});
  const [selectedProcesso, setSelectedProcesso] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // --- ESTADOS DE FILTRO ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterPrioridade, setFilterPrioridade] = useState('');

  /**
   * FUNÇÃO API: CARREGAR DADOS (GET)
   */
  const loadProcessos = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Falha ao carregar dados da API');
      }
      const data = await response.json();
      setProcessos(data);
    } catch (error) {
      console.error('Erro ao buscar processos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProcessos();
  }, []);

  const handleSelectProcesso = (processo) => {
    setSelectedProcesso(processo);
    setIsEditing(false);
    setIsCreating(false);
  };

  /**
   * FUNÇÃO DE FILTRAGEM (Mantida)
   */
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
      groupedFiltered[fase] = filtered.filter((p) => p.fase === fase);
    });

    return groupedFiltered;
  };

  const filteredProcessos = getFilteredProcesses();

  // --- Funções CRUD CONECTADAS À API ---

  const handleEditStart = () => {
    if (selectedProcesso) {
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  /**
   * FUNÇÃO API: SALVAR EDIÇÃO (PUT)
   */
  const handleSaveEdit = async (editedProcess) => {
    try {
      const response = await fetch(`${API_URL}/${editedProcess._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedProcess),
      });

      if (!response.ok) throw new Error('Falha ao salvar edição');

      const updatedProcess = await response.json();

      const oldFaseId = selectedProcesso.fase;
      const newFaseId = updatedProcess.fase;
      const newProcessos = { ...processos };

      const sourceList = newProcessos[oldFaseId] || [];
      const processIndex = sourceList.findIndex(
        (p) => p._id === updatedProcess._id
      );

      if (processIndex !== -1) {
        sourceList.splice(processIndex, 1);
      }

      if (!newProcessos[newFaseId]) {
        newProcessos[newFaseId] = [];
      }
      newProcessos[newFaseId].unshift(updatedProcess);

      setProcessos(newProcessos);
      setSelectedProcesso(updatedProcess);
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao editar processo:', error);
    }
  };

  const handleNewProcessStart = () => {
    setSelectedProcesso(null);
    setIsEditing(false);
    setIsCreating(true);
  };

  const handleCancelNew = () => {
    setIsCreating(false);
  };

  /**
   * FUNÇÃO API: SALVAR NOVO PROCESSO (POST) - CORRIGIDA
   * Garante que fase e histórico sejam enviados.
   */
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
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      if (!newProcessos[newFaseId]) {
        newProcessos[newFaseId] = [];
      }
      newProcessos[newFaseId].unshift(createdProcess);

      setProcessos(newProcessos);
      setSelectedProcesso(createdProcess);
      setIsCreating(false);
    } catch (error) {
      console.error('Erro ao criar processo:', error);
      alert(`Erro ao salvar: ${error.message}`);
    }
  };

  /**
   * FUNÇÃO API: ADICIONAR ATUALIZAÇÃO (POST para endpoint de histórico)
   */
  const handleAddUpdate = async (processId, newDescription) => {
    try {
      const response = await fetch(`${API_URL}/${processId}/historico`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descricao: newDescription }),
      });

      if (!response.ok) throw new Error('Falha ao adicionar atualização');

      const updatedProcess = await response.json();

      const newProcessos = { ...processos };
      const fase = updatedProcess.fase;

      const processIndex = (newProcessos[fase] || []).findIndex(
        (p) => p._id === processId
      );

      if (processIndex !== -1) {
        newProcessos[fase][processIndex] = updatedProcess;
      }

      setProcessos(newProcessos);
      setSelectedProcesso(updatedProcess);
    } catch (error) {
      console.error('Erro ao adicionar atualização:', error);
    }
  };

  /**
   * FUNÇÃO API: EXCLUIR PROCESSO (DELETE) - NOVO
   */
  const handleDeleteProcesso = async (processId, faseId) => {
    if (
      !window.confirm(
        'Tem certeza que deseja excluir este processo? Esta ação é permanente.'
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${processId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Falha ao excluir processo');

      // LÓGICA DE ATUALIZAÇÃO DO ESTADO (Remove do frontend)
      const newProcessos = { ...processos };

      newProcessos[faseId] = (newProcessos[faseId] || []).filter(
        (p) => p._id !== processId
      );

      setProcessos(newProcessos);
      setSelectedProcesso(null); // Fecha o painel de detalhes
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao excluir processo:', error);
      alert('Erro ao excluir: ' + error.message);
    }
  };

  /**
   * FUNÇÃO API: DRAG AND DROP (PUT)
   */
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

    // 1. LÓGICA DE ATUALIZAÇÃO OTIMISTA
    const newProcessos = { ...processos };
    const [process] = newProcessos[sourceFaseId].splice(source.index, 1);

    process.fase = destinationFaseId;
    if (!newProcessos[destinationFaseId]) {
      newProcessos[destinationFaseId] = [];
    }
    newProcessos[destinationFaseId].splice(destination.index, 0, process);
    setProcessos(newProcessos);

    if (selectedProcesso && selectedProcesso._id === draggableId) {
      setSelectedProcesso({ ...process });
    }

    // 2. CHAMA A API REAL
    try {
      await fetch(`${API_URL}/${process._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(process),
      });
    } catch (error) {
      console.error('Falha ao mover o processo na API.', error);
      loadProcessos();
    }
  };

  if (isLoading) {
    return (
      <div className="p-10 text-center text-xl text-gray-500">
        Carregando dados...
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar current="Processos" />
      <div
        className={`flex-1 p-6 transition-all ${
          selectedProcesso || isCreating ? 'ml-64 pr-96' : 'ml-64'
        }`}
      >
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-red-900">
            Gerenciamento de Processos
          </h2>
          <button
            className="bg-[#A03232] hover:bg-red-800 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            onClick={handleNewProcessStart}
          >
            + Novo Processo
          </button>
        </header>

        {/* ÁREA DE FILTROS */}
        <div className="flex space-x-4 mb-6 bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
          <input
            type="text"
            placeholder="Buscar por Cliente, N° Processo ou Próximo Passo"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />

          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
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
            className="p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
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
            className="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Limpar
          </button>
        </div>
        {/* FIM DA ÁREA DE FILTROS */}

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex space-x-4 overflow-x-auto pb-4 h-[calc(100vh-270px)]">
            {FASES.map((fase) => (
              <KanbanColumn
                key={fase}
                title={fase}
                faseId={fase}
                processos={filteredProcessos[fase] || []}
                onCardClick={handleSelectProcesso}
                onNewProcessClick={handleNewProcessStart}
              />
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* PAINEL LATERAL CONDICIONAL */}
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
          // PASSA A FUNÇÃO DE EXCLUSÃO
          onDelete={() =>
            handleDeleteProcesso(selectedProcesso._id, selectedProcesso.fase)
          }
        />
      ) : null}
    </div>
  );
};

export default Processos;
