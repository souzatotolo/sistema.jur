'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '../../components/Sidebar';
import { MdOutlineOpenInNew, MdCheck, MdAdd, MdClose } from 'react-icons/md';

const API_BASE_URL = 'https://api-sistema-jur.onrender.com/api';

const TIPOS = ['Intimação', 'Despacho', 'Sentença', 'Acórdão', 'Edital', 'Outro'];

const TRIBUNAIS = [
  { sigla: 'TJRS', nome: 'TJ Rio Grande do Sul', djeUrl: 'https://www.tjrs.jus.br/novo/publicacao/pesquisa-de-publicacoes/' },
  { sigla: 'TJSP', nome: 'TJ São Paulo', djeUrl: 'https://www.dje.tjsp.jus.br/cdje/index.do' },
  { sigla: 'TJRJ', nome: 'TJ Rio de Janeiro', djeUrl: 'https://www3.tjrj.jus.br/consultadje/' },
  { sigla: 'TJMG', nome: 'TJ Minas Gerais', djeUrl: 'https://www.tjmg.jus.br/portal-tjmg/processos/publicacoes-diario/' },
  { sigla: 'TJPR', nome: 'TJ Paraná', djeUrl: 'https://www.tjpr.jus.br/dje' },
  { sigla: 'TJSC', nome: 'TJ Santa Catarina', djeUrl: 'https://busca.tjsc.jus.br/dje/' },
  { sigla: 'STJ', nome: 'STJ', djeUrl: 'https://scon.stj.jus.br/SCON/pesquisa_pronta.jsp' },
  { sigla: 'TST', nome: 'TST', djeUrl: 'https://dejt.jus.br/dejt/' },
];

const TIPO_COLORS = {
  'Intimação': 'bg-red-50 text-red-700 border-red-200',
  'Despacho': 'bg-blue-50 text-blue-700 border-blue-200',
  'Sentença': 'bg-purple-50 text-purple-700 border-purple-200',
  'Acórdão': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Edital': 'bg-amber-50 text-amber-700 border-amber-200',
  'Outro': 'bg-[#EDE8E5] text-[#AA8F71] border-[#AA8F71]/30',
};

const formatDate = (iso) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('pt-BR');
};

const emptyForm = {
  titulo: '',
  conteudo: '',
  dataPublicacao: new Date().toISOString().split('T')[0],
  tribunal: '',
  numeroProcesso: '',
  tipo: 'Outro',
};

export default function Publicacoes() {
  const { isAuthenticated, isLoading: isAuthLoading, getToken, logout } = useAuth();
  const router = useRouter();

  const [publicacoes, setPublicacoes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filterLida, setFilterLida] = useState('todas');
  const [filterTipo, setFilterTipo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sidebarMinimized');
    if (saved !== null) setSidebarMinimized(saved === 'true');
  }, []);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) router.push('/login');
    if (isAuthenticated) loadPublicacoes();
  }, [isAuthenticated, isAuthLoading, router]);

  const fetchProtected = async (url, options = {}) => {
    const token = getToken();
    if (!token) { logout(); throw new Error('Sem token'); }
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
    if (response.status === 401 || response.status === 403) { logout(); throw new Error('Sessão expirada'); }
    return response;
  };

  const loadPublicacoes = async () => {
    setIsLoading(true);
    try {
      const res = await fetchProtected(`${API_BASE_URL}/publicacoes`);
      if (!res.ok) throw new Error();
      setPublicacoes(await res.json());
    } catch {
      console.error('Erro ao carregar publicacoes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSidebar = () => {
    const next = !sidebarMinimized;
    setSidebarMinimized(next);
    localStorage.setItem('sidebarMinimized', String(next));
  };

  const handleOpenForm = (pub = null) => {
    if (pub) {
      setEditingId(pub._id);
      setForm({
        titulo: pub.titulo || '',
        conteudo: pub.conteudo || '',
        dataPublicacao: pub.dataPublicacao ? pub.dataPublicacao.split('T')[0] : '',
        tribunal: pub.tribunal || '',
        numeroProcesso: pub.numeroProcesso || '',
        tipo: pub.tipo || 'Outro',
      });
    } else {
      setEditingId(null);
      setForm(emptyForm);
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId
        ? `${API_BASE_URL}/publicacoes/${editingId}`
        : `${API_BASE_URL}/publicacoes`;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetchProtected(url, { method, body: JSON.stringify(form) });
      if (!res.ok) throw new Error();
      await loadPublicacoes();
      handleCloseForm();
    } catch {
      alert('Erro ao salvar publicacao.');
    } finally {
      setSaving(false);
    }
  };

  const handleMarcarLida = async (pub) => {
    try {
      await fetchProtected(`${API_BASE_URL}/publicacoes/${pub._id}`, {
        method: 'PUT',
        body: JSON.stringify({ lida: !pub.lida }),
      });
      setPublicacoes((prev) =>
        prev.map((p) => (p._id === pub._id ? { ...p, lida: !p.lida } : p)),
      );
    } catch {
      console.error('Erro ao marcar publicacao');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Excluir esta publicacao?')) return;
    try {
      await fetchProtected(`${API_BASE_URL}/publicacoes/${id}`, { method: 'DELETE' });
      setPublicacoes((prev) => prev.filter((p) => p._id !== id));
    } catch {
      alert('Erro ao excluir.');
    }
  };

  const filtered = publicacoes.filter((p) => {
    const matchLida =
      filterLida === 'todas' ? true : filterLida === 'nao-lidas' ? !p.lida : p.lida;
    const matchTipo = filterTipo ? p.tipo === filterTipo : true;
    const matchSearch = searchTerm
      ? p.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.numeroProcesso?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.conteudo?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchLida && matchTipo && matchSearch;
  });

  const naoLidas = publicacoes.filter((p) => !p.lida).length;
  const sidebarWidth = sidebarMinimized ? 'md:pl-14' : 'md:pl-48';

  if (isAuthLoading) return null;

  return (
    <div className="flex min-h-screen bg-[#EDE8E5]">
      <Sidebar
        current="Publicações"
        onLogout={logout}
        isMinimized={sidebarMinimized}
        onToggleMinimized={handleToggleSidebar}
      />

      <main className={`flex-1 ${sidebarWidth} transition-all duration-300`}>
        <div className="p-6 md:p-8 space-y-5">

          {/* Cabecalho */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-2xl font-bold text-[#610013]">Publicações</h1>
              <p className="text-sm text-[#AA8F71] mt-0.5">
                {isLoading
                  ? 'Carregando...'
                  : `${publicacoes.length} registro${publicacoes.length !== 1 ? 's' : ''}${naoLidas > 0 ? ` · ${naoLidas} não lida${naoLidas !== 1 ? 's' : ''}` : ''}`}
              </p>
            </div>
            <button
              onClick={() => handleOpenForm()}
              className="flex items-center gap-2 bg-[#610013] hover:bg-[#4a000f] text-white text-sm font-semibold py-2.5 px-5 rounded-lg transition-colors"
            >
              <MdAdd className="w-4 h-4" />
              Nova Publicação
            </button>
          </div>

          {/* Acesso ao DJe por tribunal */}
          <div className="bg-white rounded-xl border border-[#AA8F71]/20 shadow-sm p-4">
            <p className="text-xs font-bold text-[#610013] uppercase tracking-wider mb-3">
              Abrir DJe por Tribunal
            </p>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {TRIBUNAIS.map((t) => (
                <a
                  key={t.sigla}
                  href={t.djeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={t.nome}
                  className="flex items-center justify-between gap-1 px-2.5 py-2 rounded-lg border border-[#AA8F71]/20 hover:border-[#610013]/30 hover:bg-[#F0D9CC]/30 transition-colors group"
                >
                  <span className="text-xs font-semibold text-[#161616]/80 group-hover:text-[#610013]">
                    {t.sigla}
                  </span>
                  <MdOutlineOpenInNew className="w-3 h-3 text-[#AA8F71] group-hover:text-[#610013] flex-shrink-0" />
                </a>
              ))}
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Buscar por título, nº processo ou conteúdo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[220px] px-4 py-2.5 bg-white border border-[#AA8F71]/30 rounded-lg text-sm text-[#161616] placeholder-[#AA8F71] focus:outline-none focus:ring-2 focus:ring-[#610013]/20 focus:border-[#610013]/40"
            />
            <select
              value={filterLida}
              onChange={(e) => setFilterLida(e.target.value)}
              className="px-3 py-2.5 bg-white border border-[#AA8F71]/30 rounded-lg text-sm text-[#161616] focus:outline-none focus:border-[#610013]/40"
            >
              <option value="todas">Todas</option>
              <option value="nao-lidas">Não lidas</option>
              <option value="lidas">Lidas</option>
            </select>
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="px-3 py-2.5 bg-white border border-[#AA8F71]/30 rounded-lg text-sm text-[#161616] focus:outline-none focus:border-[#610013]/40"
            >
              <option value="">Todos os tipos</option>
              {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Lista */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-8 h-8 border-4 border-[#610013]/20 border-t-[#610013] rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#AA8F71]/20 shadow-sm py-16 text-center">
              <p className="text-[#AA8F71] text-sm">
                {publicacoes.length === 0
                  ? 'Nenhuma publicação registrada. Clique em "Nova Publicação" para adicionar.'
                  : 'Nenhum resultado para os filtros aplicados.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((pub) => (
                <div
                  key={pub._id}
                  className={`bg-white rounded-xl border shadow-sm p-4 transition-all ${pub.lida ? 'border-[#AA8F71]/15 opacity-70' : 'border-[#AA8F71]/25'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${pub.lida ? 'bg-transparent border border-[#AA8F71]/30' : 'bg-[#610013]'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${TIPO_COLORS[pub.tipo] || TIPO_COLORS['Outro']}`}>
                            {pub.tipo}
                          </span>
                          {pub.tribunal && (
                            <span className="text-xs text-[#AA8F71] font-medium">{pub.tribunal}</span>
                          )}
                          <span className="text-xs text-[#AA8F71]">{formatDate(pub.dataPublicacao)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleMarcarLida(pub)}
                            title={pub.lida ? 'Marcar como não lida' : 'Marcar como lida'}
                            className={`p-1.5 rounded-lg transition-colors ${pub.lida ? 'text-[#AA8F71] hover:bg-[#EDE8E5]' : 'text-green-600 hover:bg-green-50'}`}
                          >
                            <MdCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenForm(pub)}
                            className="px-2 py-1.5 rounded-lg text-[#AA8F71] hover:text-[#610013] hover:bg-[#F0D9CC]/40 transition-colors text-xs font-medium"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(pub._id)}
                            className="p-1.5 rounded-lg text-[#AA8F71] hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <MdClose className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <h3 className={`text-sm font-semibold mt-1.5 ${pub.lida ? 'text-[#161616]/50' : 'text-[#161616]'}`}>
                        {pub.titulo}
                      </h3>
                      {pub.numeroProcesso && (
                        <p className="text-xs text-[#AA8F71] mt-0.5">
                          Processo: <span className="font-mono">{pub.numeroProcesso}</span>
                        </p>
                      )}
                      {pub.conteudo && (
                        <p className="text-xs text-[#161616]/60 mt-1.5 line-clamp-2 leading-relaxed">
                          {pub.conteudo}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Formulario lateral */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={handleCloseForm} />
          <div className="relative w-full max-w-md h-full bg-white shadow-2xl border-l border-[#EDE8E5] flex flex-col">
            <div className="bg-[#610013] px-5 py-4 flex justify-between items-center flex-shrink-0">
              <h2 className="font-display text-lg font-bold text-white">
                {editingId ? 'Editar Publicação' : 'Nova Publicação'}
              </h2>
              <button onClick={handleCloseForm} className="text-[#F0D9CC]/70 hover:text-white text-2xl transition-colors">
                &times;
              </button>
            </div>
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#610013] uppercase tracking-wider mb-1.5">Título *</label>
                <input
                  required
                  value={form.titulo}
                  onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-[#AA8F71]/30 rounded-lg text-sm focus:outline-none focus:border-[#610013]/50 focus:ring-1 focus:ring-[#610013]/20"
                  placeholder="Ex: Intimação para apresentar defesa"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#610013] uppercase tracking-wider mb-1.5">Tipo</label>
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-[#AA8F71]/30 rounded-lg text-sm focus:outline-none focus:border-[#610013]/50"
                  >
                    {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#610013] uppercase tracking-wider mb-1.5">Data</label>
                  <input
                    type="date"
                    value={form.dataPublicacao}
                    onChange={(e) => setForm((f) => ({ ...f, dataPublicacao: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-[#AA8F71]/30 rounded-lg text-sm focus:outline-none focus:border-[#610013]/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#610013] uppercase tracking-wider mb-1.5">Tribunal</label>
                  <select
                    value={form.tribunal}
                    onChange={(e) => setForm((f) => ({ ...f, tribunal: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-[#AA8F71]/30 rounded-lg text-sm focus:outline-none focus:border-[#610013]/50"
                  >
                    <option value="">Selecionar</option>
                    {TRIBUNAIS.map((t) => <option key={t.sigla} value={t.sigla}>{t.sigla} — {t.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#610013] uppercase tracking-wider mb-1.5">Nº Processo</label>
                  <input
                    value={form.numeroProcesso}
                    onChange={(e) => setForm((f) => ({ ...f, numeroProcesso: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-[#AA8F71]/30 rounded-lg text-sm focus:outline-none focus:border-[#610013]/50 font-mono"
                    placeholder="0000000-00.0000.0.00.0000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#610013] uppercase tracking-wider mb-1.5">Conteúdo / Observações</label>
                <textarea
                  value={form.conteudo}
                  onChange={(e) => setForm((f) => ({ ...f, conteudo: e.target.value }))}
                  rows={5}
                  className="w-full px-3 py-2.5 border border-[#AA8F71]/30 rounded-lg text-sm focus:outline-none focus:border-[#610013]/50 resize-none"
                  placeholder="Cole aqui o conteúdo da publicação ou escreva observações..."
                />
              </div>
            </form>
            <div className="flex-shrink-0 p-4 border-t border-[#EDE8E5] bg-[#EDE8E5]/40 flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving || !form.titulo}
                className="flex-1 py-2.5 bg-[#610013] text-white text-sm font-semibold rounded-lg hover:bg-[#4a000f] transition-colors disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                onClick={handleCloseForm}
                className="px-5 py-2.5 bg-white text-[#161616]/70 text-sm font-semibold rounded-lg border border-[#AA8F71]/30 hover:bg-[#EDE8E5] transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
