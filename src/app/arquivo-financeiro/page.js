'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Importa o hook de autenticação
import { useAuth } from '@/hooks/useAuth';

// Componentes
import Sidebar from '../../components/Sidebar';
import PagamentoForm from '../../components/PagamentoForm';

// --- CONFIGURAÇÃO DA API ---
const API_BASE_URL = 'https://api-sistema-jur.onrender.com/api';
const API_PROCESSOS_URL = `${API_BASE_URL}/processos`;

// Função para formatar a data
const formatDate = (isoString) => {
  if (!isoString) return '-';
  try {
    return new Date(isoString).toLocaleDateString('pt-BR');
  } catch (e) {
    return '-';
  }
};

// Função para formatar moeda
const formatCurrency = (value) => {
  if (value == null) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const ArquivoFinanceiro = () => {
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    getToken,
    logout,
  } = useAuth();
  const router = useRouter();

  const [processos, setProcessos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProcesso, setSelectedProcesso] = useState(null);
  const [isEditingPagamento, setIsEditingPagamento] = useState(false);

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

  // --- CARREGAR PROCESSOS FINALIZADOS/ARQUIVADOS ---
  const loadProcessos = async () => {
    setIsLoading(true);
    try {
      const response = await fetchProtected(API_PROCESSOS_URL, {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Falha ao carregar dados da API');
      const data = await response.json();

      // Filtrar processos finalizados ou arquivados
      const allProcesses = [];
      Object.values(data).forEach((fase) => {
        allProcesses.push(...fase);
      });
      const filtered = allProcesses.filter(
        (p) => p.statusPrioridade === 'Finalizado' || p.statusPrioridade === 'Arquivado'
      );
      setProcessos(filtered);
    } catch (error) {
      console.error('Erro ao buscar processos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProcesso = (processo) => {
    setSelectedProcesso(processo);
    setIsEditingPagamento(true);
  };

  const handleSavePagamento = async (pagamentoData) => {
    try {
      const response = await fetchProtected(
        `${API_PROCESSOS_URL}/${selectedProcesso._id}`,
        {
          method: 'PUT',
          body: JSON.stringify({ pagamento: pagamentoData }),
        },
      );

      if (!response.ok) throw new Error('Falha ao salvar pagamento');

      const updated = await response.json();
      setProcessos(processos.map(p => p._id === updated._id ? updated : p));
      setSelectedProcesso(updated);
      setIsEditingPagamento(false);
    } catch (error) {
      console.error('Erro ao salvar pagamento:', error);
      alert('Erro ao salvar pagamento.');
    }
  };

  const handleCancelPagamento = () => {
    setIsEditingPagamento(false);
    setSelectedProcesso(null);
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
        Carregando arquivo financeiro...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-screen overflow-x-hidden relative">
      <Sidebar current="Arquivo / Financeiro" onLogout={logout} />

      <div className="flex-1 flex flex-col h-screen transition-all max-w-full overflow-hidden ml-64">
        <div className="p-6">
          <header className="mb-4">
            <h2 className="text-3xl font-bold text-gray-900">
              Arquivo / Financeiro
            </h2>
            <p className="text-gray-600">
              Processos finalizados ou arquivados com informações de pagamento.
            </p>
          </header>
        </div>

        <div className="flex-grow overflow-auto px-6">
          <div className="bg-white rounded-xl shadow-lg overflow-x-auto border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status Pagamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Pagamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parcelas
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {processos.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500 text-lg">
                      Nenhum processo finalizado ou arquivado encontrado.
                    </td>
                  </tr>
                ) : (
                  processos.map((processo) => (
                    <tr
                      key={processo._id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleSelectProcesso(processo)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {processo.nomeCliente || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {processo.statusPrioridade || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {processo.pagamento?.status || 'Não Pago'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatCurrency(processo.pagamento?.totalPago)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatDate(processo.pagamento?.dataPagamento)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {processo.pagamento?.parcelas && processo.pagamento.parcelas.length > 0 ? (
                          <div>
                            <ul className="list-disc list-inside">
                              {processo.pagamento.parcelas.map((parcela, index) => (
                                <li key={index} className={parcela.pago ? 'text-green-600' : 'text-red-600'}>
                                  Parcela {parcela.numero}: {formatCurrency(parcela.valor)} - {parcela.pago ? 'Pago' : 'Pendente'} {parcela.data ? `(${formatDate(parcela.data)})` : ''}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedProcesso && (
        <div className="absolute top-0 right-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 overflow-auto transition-transform">
          <PagamentoForm
            processo={selectedProcesso}
            onSave={handleSavePagamento}
            onCancel={handleCancelPagamento}
          />
        </div>
      )}
    </div>
  );
};

export default ArquivoFinanceiro;