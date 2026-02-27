'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '../../components/Sidebar';

const API_BASE_URL = 'https://api-sistema-jur.onrender.com/api';

const Calendario = () => {
  const { isAuthenticated, isLoading: isAuthLoading, getToken, logout } = useAuth();
  const router = useRouter();

  const [processos, setProcessos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

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
      throw new Error('Token de autenticação ausente.');
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
      throw new Error('Sessão expirada ou acesso negado.');
    }

    return response;
  };

  // --- CARREGAR PROCESSOS ---
  const loadProcessos = async () => {
    try {
      const response = await fetchProtected(`${API_BASE_URL}/processos`, {
        method: 'GET',
      });
      if (!response.ok) throw new Error('Falha ao carregar processos');
      const data = await response.json();
      const processosList = [];
      Object.values(data).forEach((fase) => {
        processosList.push(...(Array.isArray(fase) ? fase : []));
      });
      setProcessos(processosList);
    } catch (error) {
      console.error('Erro ao buscar processos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- FUNÇÕES AUXILIARES DO CALENDÁRIO ---
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleSelectDate = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(date);
  };

  // --- PRAZOS E AUDIÊNCIAS DO DIA SELECIONADO ---
  const getEventosDodia = () => {
    if (!selectedDate) return [];
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    const eventosProcesso = [];
    processos.forEach((processo) => {
      if (processo.prazo && processo.prazo.split('T')[0] === dateStr) {
        eventosProcesso.push({
          _id: `prazo-${processo._id}`,
          titulo: `Prazo - ${processo.nomeCliente}`,
          tipo: 'Prazo',
          dataInicio: processo.prazo,
          processoId: processo._id,
          nomeCliente: processo.nomeCliente,
        });
      }
      
      if (processo.audiencia && processo.audiencia.split('T')[0] === dateStr) {
        eventosProcesso.push({
          _id: `aud-${processo._id}`,
          titulo: `Audiência - ${processo.nomeCliente}`,
          tipo: 'Audiência',
          dataInicio: processo.audiencia,
          processoId: processo._id,
          nomeCliente: processo.nomeCliente,
        });
      }
    });
    
    return eventosProcesso;
  };

  // --- PRAZOS E AUDIÊNCIAS DO MÊS ---
  const getEventosDoMes = (day) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString()
      .split('T')[0];
    
    // Buscar prazos e audiências de processos
    const eventosProcesso = [];
    processos.forEach((processo) => {
      if (processo.prazo && processo.prazo.split('T')[0] === dateStr) {
        eventosProcesso.push({
          _id: `prazo-${processo._id}`,
          titulo: `Prazo - ${processo.nomeCliente}`,
          tipo: 'Prazo',
          dataInicio: processo.prazo,
          processoId: processo._id,
          nomeCliente: processo.nomeCliente,
        });
      }
      
      if (processo.audiencia && processo.audiencia.split('T')[0] === dateStr) {
        eventosProcesso.push({
          _id: `aud-${processo._id}`,
          titulo: `Audiência - ${processo.nomeCliente}`,
          tipo: 'Audiência',
          dataInicio: processo.audiencia,
          processoId: processo._id,
          nomeCliente: processo.nomeCliente,
        });
      }
    });
    
    return eventosProcesso;
  };

  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const days = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const eventosDodia = getEventosDodia();

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl text-gray-500">
        Carregando calendário...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-screen overflow-x-hidden relative">
      <Sidebar current="Calendário" onLogout={logout} />

      <div className="flex-1 flex flex-col h-screen transition-all max-w-full overflow-hidden ml-64">
        <div className="p-6">
          <header className="mb-4">
            <h2 className="text-3xl font-bold text-gray-900">Calendário e Agenda</h2>
            <p className="text-gray-600">
              Visualize prazos, audiências e datas importantes dos processos.
            </p>
          </header>
        </div>

        <div className="flex-grow overflow-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Calendário */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <button onClick={handlePrevMonth} className="text-gray-600 hover:text-gray-900">
                  ← Anterior
                </button>
                <h3 className="text-2xl font-bold text-gray-900 capitalize">{monthName}</h3>
                <button onClick={handleNextMonth} className="text-gray-600 hover:text-gray-900">
                  Próximo →
                </button>
              </div>

              {/* Dias da semana */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((day) => (
                  <div key={day} className="text-center font-bold text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Dias do mês */}
              <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => (
                  <div
                    key={index}
                    onClick={() => day && handleSelectDate(day)}
                    className={`aspect-square p-2 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                      day
                        ? selectedDate?.getDate() === day &&
                          selectedDate?.getMonth() === currentDate.getMonth()
                          ? 'bg-red-100 border-red-500'
                          : 'bg-gray-50 border-gray-200 hover:border-red-300'
                        : 'bg-gray-100 border-gray-100'
                    }`}
                  >
                    {day && (
                      <>
                        <span className="font-semibold text-gray-900">{day}</span>
                        {getEventosDoMes(day).length > 0 && (
                          <span className="text-xs text-red-600 font-bold">
                            {getEventosDoMes(day).length}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Painel Lateral */}
            <div className="lg:col-span-1 space-y-4">
              {/* Eventos do dia */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-h-96 overflow-auto">
                <h4 className="font-bold text-gray-900 mb-3">
                  {selectedDate ? selectedDate.toLocaleDateString('pt-BR') : 'Selecione um dia'}
                </h4>
                {eventosDodia.length > 0 ? (
                  eventosDodia.map((evento) => (
                    <div
                      key={evento._id}
                      className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500 mb-2 cursor-default"
                    >
                      <div className="font-semibold text-gray-900 text-sm">{evento.titulo}</div>
                      <div className="text-xs text-gray-600">
                        {new Date(evento.dataInicio).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{evento.tipo}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Nenhum evento neste dia</p>
                )}
              </div>

              {/* Próximos eventos */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-h-96 overflow-auto">
                <h4 className="font-bold text-gray-900 mb-3">Próximos Prazos e Audiências</h4>
                {(() => {
                  // Combinar prazos e audiências de processos
                  const proximosEventos = [];
                  
                  processos.forEach((processo) => {
                    if (processo.prazo) {
                      proximosEventos.push({
                        _id: `prazo-${processo._id}`,
                        titulo: `Prazo - ${processo.nomeCliente}`,
                        tipo: 'Prazo',
                        dataInicio: processo.prazo,
                      });
                    }
                    
                    if (processo.audiencia) {
                      proximosEventos.push({
                        _id: `aud-${processo._id}`,
                        titulo: `Audiência - ${processo.nomeCliente}`,
                        tipo: 'Audiência',
                        dataInicio: processo.audiencia,
                      });
                    }
                  });
                  
                  return proximosEventos
                    .filter((e) => new Date(e.dataInicio) >= new Date())
                    .sort((a, b) => new Date(a.dataInicio) - new Date(b.dataInicio))
                    .slice(0, 8)
                    .map((evento) => (
                      <div key={evento._id} className="p-2 bg-gray-50 rounded mb-2 text-xs border-l-2 border-red-400">
                        <div className="font-semibold text-gray-900">{evento.titulo}</div>
                        <div className="text-gray-600">
                          {new Date(evento.dataInicio).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-gray-500 mt-1">{evento.tipo}</div>
                      </div>
                    ));
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Evento */}
    </div>
  );
};

export default Calendario;
