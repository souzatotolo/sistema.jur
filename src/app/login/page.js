'use client';
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const LoginForm = () => {
  // Pega a função de login do hook de autenticação
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Usa as credenciais REAIS do formulário
      await login(username, password);
    } catch (err) {
      // Captura o erro da API (ex: "Credenciais inválidas.")
      setError(err.message || 'Ocorreu um erro desconhecido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Acesso ao Sistema
        </h2>
        <p className="text-center text-gray-500">
          Bem-vinda, Dra. Marta Neumann Advogada
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo Usuário */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Usuário
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-red focus:border-red-500"
            />
          </div>

          {/* Campo Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-red focus:border-red-500"
            />
          </div>

          {/* Mensagem de Erro */}
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          {/* Botão de Submissão */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white rounded-md font-semibold transition-colors ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#A03232] hover:bg-red-800' // Cor da marca
            }`}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center pt-4 border-t">
          Use as credenciais que você cadastrou na API.
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
