'use client';
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import Logo from '../../assets/logo.png'; // importa o logo

// Ícones SVG simples para Olho Aberto/Fechado
const EyeIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.173a1.012 1.012 0 0 1 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.173Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    />
  </svg>
);

const EyeSlashIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.98 8.223A10.477 10.477 0 0112 5.25c4.78 0 
         8.846 3.018 9.949 7.178a10.451 10.451 0 
         01-1.67 3.385m-2.86 2.86A10.45 10.45 0 
         0112 18.75c-4.638 0-8.573-3.007-9.963-7.173a10.45 
         10.45 0 012.87-4.314"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 01-3 3m0-6a3 3 0 
         013 3m-6 0a3 3 0 003-3m0 6a3 3 0 
         01-3-3m0 0l9 9m-9-9L3 3"
    />
  </svg>
);

const LoginForm = () => {
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || 'Ocorreu um erro desconhecido.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-100">
      {/* Logo no background */}
      <div className="absolute inset-0 flex justify-start mt-60 justify-center opacity-10">
        <Image
          src={Logo}
          alt="Logo"
          width={1500}
          height={1500}
          className="object-contain"
          priority
        />
      </div>

      {/* Card de login */}
      <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-2xl">
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
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-red focus:border-red-500 pr-10"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {/* Erro */}
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          {/* Botão */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white rounded-md font-semibold transition-colors ${
              loading ? 'bg-gray-200 ' : 'bg-[#A03232] hover:bg-red-800'
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
