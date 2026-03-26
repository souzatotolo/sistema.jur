'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '../../components/Sidebar';
import ProcessosTable from '../../components/ProcessosTable';
import ProcessoDetalhe from '../../components/ProcessoDetalhe';
import ProcessoForm from '../../components/ProcessoForm';

const API_BASE_URL = 'https://api-sistema-jur.onrender.com/api';
const API_PROCESSOS_URL = `${API_BASE_URL}/processos`;

const Arquivo = () => {
  const { isAuthenticated, isLoading: isAuthLoading, getToken, logout } = useAuth();
  const router = useRouter();

  const [processosArquivados, setProcessosArquivados] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProcesso, setSelectedProcesso] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('sidebarMinimized');
    if (saved !== null) setSidebarMinimized(saved === 'true');
  }, []);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login');
    }
    if (isAuthenticated) {
      loadProcessos();
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const fetchProtected = async (url, options = {}) => {
    const token = getToken();
    if (!token) {
      logout();
      throw new Error('Token de autenticação ausente.');
    }
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    };
    const response = await fetch(url, config);
    if (response.status === 401 || response.status === 403) {
      logout();
      throw new Error('Sessão expirada. Faça login novamente.');
    }
    return response;
  };

  const loadProcessos = async () => {
    setIsLoading(true);
    try {
      const response = await fetchProtected(API_PROCESSOS_URL, { method: 'GET' });
      if (!response.ok) throw new Error('Falha ao carregar dados da API');
      const data = await response.json();

      const all = [];
      Object.values(data).forEach((fase) => all.push(...(fase || [])));
      setProcessosArquivados(all.filter((p) => p.statusPrioridade === 'Arquivado'));
    } catch (error) {
      console.error('Erro ao buscar processos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSidebar = () => {
    const next = !sidebarMinimized;
    setSidebarMinimized(next);
    localStorage.setItem('sidebarMinimized', String(next));
  };

  const handleSelectProcesso = (processo) => {
    setSelectedProcesso(processo);
    setIsEditing(false);
  };

  const handleCloseDetalhe = () => {
    setSelectedProcesso(null);
    setIsEditing(false);
  };

  const handleEditStart = () => {
    if (selectedProcesso) setIsEditing(true);
  };

  const handleCancelEdit = () => setIsEditing(false);

  const handleSaveEdit = async (editedProcess) => {
    try {
      const response = await fetchProtected(
        `${API_PROCESSOS_URL}/${editedProcess._id}`,
        { method: 'PUT', body: JSON.stringify(editedProcess) },
      );
      if (!response.ok) throw new Error('Falha ao salvar');
      await loadProcessos();
      setIsEditing(false);
      setSelectedProcesso(editedProcess);
    } catch (error) {
      console.error('Erro ao salvar processo:', error);
    }
  };

  const handleAddUpdate = async (processoId, descricao) => {
    try {
      const response = await fetchProtected(
        `${API_PROCESSOS_URL}/${processoId}/historico`,
        { method: 'POST', body: JSON.stringify({ descricao }) },
      );
      if (!response.ok) throw new Error('Falha ao adicionar histórico');
      const updated = await response.json();
      setSelectedProcesso(updated);
      await loadProcessos();
    } catch (error) {
      console.error('Erro ao adicionar histórico:', error);
    }
  };

  const handleDelete = async (processoId) => {
    if (!confirm('Tem certeza que deseja excluir este processo? Esta ação não pode ser desfeita.')) return;
    try {
      await fetchProtected(`${API_PROCESSOS_URL}/${processoId}`, { method: 'DELETE' });
      setSelectedProcesso(null);
      await loadProcessos();
    } catch (error) {
      console.error('Erro ao excluir processo:', error);
    }
  };

  const filtered = processosArquivados.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.nomeCliente?.toLowerCase().includes(term) ||
      p.numProcesso?.toLowerCase().includes(term) ||
      p.proximoPasso?.toLowerCase().includes(term)
    );
  });

  const sidebarWidth = sidebarMinimized ? 'md:pl-14' : 'md:pl-48';

  if (isAuthLoading) return null;

  return (
    <div className="flex min-h-screen bg-[#EDE8E5]">
      <Sidebar
        current="Arquivo"
        onLogout={logout}
        isMinimized={sidebarMinimized}
        onToggleMinimized={handleToggleSidebar}
      />

      <main className={`flex-1 ${sidebarWidth} transition-all duration-300`}>
        <div className="p-6 md:p-8 space-y-6">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-[#610013]">
                Arquivo
              </h1>
              <p className="text-sm text-[#AA8F71] mt-0.5">
                {isLoading ? 'Carregando...' : `${processosArquivados.length} processo${processosArquivados.length !== 1 ? 's' : ''} arquivado${processosArquivados.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          {/* Busca */}
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Buscar por cliente, número ou próximo passo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-white border border-[#AA8F71]/30 rounded-lg text-sm text-[#161616] placeholder-[#AA8F71] focus:outline-none focus:ring-2 focus:ring-[#610013]/20 focus:border-[#610013]/40"
            />
          </div>

          {/* Tabela */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-4 border-[#610013]/20 border-t-[#610013] rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#AA8F71]/20 shadow-sm py-16 text-center">
              <p className="text-[#AA8F71] text-sm">
                {searchTerm ? 'Nenhum resultado encontrado.' : 'Nenhum processo arquivado.'}
              </p>
            </div>
          ) : (
            <ProcessosTable processos={filtered} onProcessoClick={handleSelectProcesso} />
          )}
        </div>
      </main>

      {/* Painel lateral de detalhe */}
      {selectedProcesso && !isEditing && (
        <ProcessoDetalhe
          processo={selectedProcesso}
          onClose={handleCloseDetalhe}
          onEditStart={handleEditStart}
          onAddUpdate={handleAddUpdate}
          onDelete={handleDelete}
        />
      )}

      {isEditing && selectedProcesso && (
        <ProcessoForm
          processo={selectedProcesso}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
};

export default Arquivo;
