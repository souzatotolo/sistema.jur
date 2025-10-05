'use client';
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth'; // O hook de autenticação que criamos

const LoginForm = () => {
  // Pega a função de login do hook de autenticação
  const { login } = useAuth();

  // Mantemos os estados, mas eles não serão usados para a lógica de login fixo
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // --- ALTERAÇÃO PRINCIPAL AQUI ---
      // IGNORA as credenciais do formulário e usa as fixas.
      const fixedUsername = 'martancouto';
      const fixedPassword = 'admin';

      // Chama a função de login.
      // O useAuth.js ainda tentará fazer a requisição HTTP.
      // Para funcionar sem o backend, você DEVE trocar o useAuth.js também.

      // O Ideal é que o seu `useAuth.js` seja alterado para um "mock" de login
      // se você quiser evitar o erro de rede ao tentar se conectar ao backend.

      // Por enquanto, vamos manter a chamada, mas ela só funcionará se
      // o backend estiver online, mesmo com o usuário fixo.
      // Se você quer um login que funcione **SEMPRE**, independente do backend,
      // a lógica de mock precisa estar no `useAuth.js`.

      await login(fixedUsername, fixedPassword);
    } catch (err) {
      // O erro só aparecerá se a API estiver fora do ar ou se houver falha de rede.
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
        <p className="text-center text-gray-500">Dra. Marta Neumann Advogada</p>

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
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Lembrete de cadastro inicial */}
        <p className="text-xs text-gray-500 text-center pt-4 border-t">
          Clique em **Entrar** para logar automaticamente como **martancouto**.
          O backend deve estar online para gerar o token.
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
