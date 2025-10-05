'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Chave para armazenar o token no localStorage
const AUTH_TOKEN_KEY = 'authToken';

// URL BASE da sua API (Use a porta 3001 para desenvolvimento local)
// const BASE_API_URL = 'http://localhost:3001/api';
// Use 'https://api-sistema-jur.onrender.com/api' se for em produção
const BASE_API_URL = 'https://api-sistema-jur.onrender.com/api';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Indica se a checagem inicial do token foi feita
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Efeito que checa o token no localStorage na montagem do componente
  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    // Para validade mais robusta, aqui você poderia checar a validade do token (data de expiração)
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false); // O carregamento inicial terminou
  }, []);

  /**
   * Função para realizar o login através da API (Sem Mock).
   */
  const login = async (username, password) => {
    try {
      const response = await fetch(`${BASE_API_URL}/auth/login`, {
        // Endpoint de login
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        // Se a resposta não for OK (401, 403, 500 etc.)
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 'Credenciais inválidas. Tente novamente.'
        );
      }

      const data = await response.json();
      const token = data.token; // Token real da API

      if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        setIsAuthenticated(true);
        // Redireciona para a página principal (Kanban)
        router.push('/');
      } else {
        throw new Error('Não foi possível obter um token de acesso.');
      }
    } catch (error) {
      // Lança o erro para o componente LoginForm lidar com ele
      throw error;
    }
  };

  /**
   * Função para remover o token e deslogar
   */
  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setIsAuthenticated(false);
    router.push('/login'); // Redireciona para a tela de login
  };

  /**
   * Função auxiliar para obter o token para chamadas de API
   */
  const getToken = () => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    getToken,
  };
};
