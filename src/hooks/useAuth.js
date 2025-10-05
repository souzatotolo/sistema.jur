'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Chave para armazenar o token no localStorage
const AUTH_TOKEN_KEY = 'authToken';

// URL da sua API de Autenticação. Corrigi a porta para 3001, que é onde seu server.js está rodando.
const API_URL = 'http://localhost:3001/api/auth/login';

/**
 * Função simples para gerar um token de mock (falso).
 * O formato não importa, desde que seja uma string não vazia.
 */
const generateMockToken = (username) => {
  // Para simplificar, usamos uma string simples que inclui o usuário para identificação
  return `MOCK_TOKEN_${username}_${new Date().getTime()}`;
};

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Indica se a checagem inicial do token foi feita
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Efeito que checa o token no localStorage na montagem do componente
  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false); // O carregamento inicial terminou
  }, []);

  /**
   * Função para realizar o login através da API com um fallback de Mock.
   */
  const login = async (username, password) => {
    let token = null;

    try {
      // 1. Tenta a chamada real à API
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        // Se a resposta não for OK (401, 403, 500 etc.),
        // lançamos um erro para ir para o bloco catch.
        const errorData = await response
          .json()
          .catch(() => ({ message: 'Erro desconhecido da API.' }));
        throw new Error(
          errorData.message ||
            `Falha na autenticação. Status: ${response.status}`
        );
      }

      const data = await response.json();
      token = data.token; // Token real da API
    } catch (error) {
      console.warn(
        `[Mock Login Ativado] Falha na conexão com a API de Login (${error.message}). Gerando token falso...`
      );
      // --- FALLBACK: Gera token de mock em caso de falha ---
      token = generateMockToken(username);
      // Podemos lançar o erro se quisermos que o formulário exiba algo,
      // mas para o mock, vamos apenas continuar.
    }

    // 2. Se um token (real ou mock) foi obtido:
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      setIsAuthenticated(true);
      // Redireciona para a página principal (Kanban)
      router.push('/');
    } else {
      // Se a API falhou e por algum motivo o mock também não gerou,
      // lançamos um erro final.
      throw new Error('Não foi possível obter um token de acesso.');
    }
  };

  /**
   * Função para remover o token e deslogar
   */
  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setIsAuthenticated(false);
    router.push('/'); // Redireciona para o login
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
