'use client';
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import Logo from '../../assets/logo.png';
import BrandArrowPng from '../../assets/brandArrow.png';
import BrandStarPng from '../../assets/brandStar.png';

const EyeIcon = () => (
  <svg
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

const EyeSlashIcon = () => (
  <svg
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
      d="M3.98 8.223A10.477 10.477 0 0112 5.25c4.78 0 8.846 3.018 9.949 7.178a10.451 10.451 0 01-1.67 3.385m-2.86 2.86A10.45 10.45 0 0112 18.75c-4.638 0-8.573-3.007-9.963-7.173a10.45 10.45 0 012.87-4.314"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 01-3 3m0-6a3 3 0 013 3m-6 0a3 3 0 003-3m0 0l9 9m-9-9L3 3"
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

  return (
    <div className="min-h-screen flex">
      {/* ── Painel esquerdo — branding (apenas desktop) ── */}
      <div className="hidden lg:relative lg:flex w-1/2 bg-[#610013] overflow-hidden">
        {/* Faixa brandStar — lateral esquerda apenas, como na capa do manual */}
        <div
          className="absolute left-0 top-0 bottom-0 pointer-events-none"
          style={{
            width: '180px',
            backgroundImage: `url(${BrandStarPng.src})`,
            backgroundSize: '600px 600px',
            backgroundRepeat: 'repeat-y',
            mixBlendMode: 'screen',
            opacity: 0.55,
          }}
        />

        {/* Conteúdo: logo + tagline juntos, sobre a textura */}
        <div className="relative flex flex-col justify-center flex-1 items-center px-12 py-14 gap-4">
          <Image
            src={Logo}
            alt="Marta Neumann Advogada"
            className="brightness-0 invert opacity-90"
            style={{ maxWidth: '300px', width: '100%', height: 'auto' }}
            priority
          />
          <p className="font-sans font-light text-[#D69957]/70 text-xs tracking-[0.3em] uppercase">
            Cuidando de cada detalhe
          </p>
        </div>
      </div>

      {/* ── Painel direito — formulário ── */}
      <div className="flex-1 flex flex-col justify-center items-center bg-[#F0D9CC] p-8 relative overflow-hidden">
        {/* Logo mobile */}
        <div className="lg:hidden mb-10">
          <Image
            src={Logo}
            alt="Marta Neumann Advogada"
            style={{ maxWidth: '200px', width: '100%', height: 'auto' }}
            priority
          />
        </div>

        <div className="w-full max-w-sm">
          {/* Cabeçalho */}
          <div className="mb-8">
            <div className="flex items-center gap-2.5 mb-2">
              <Image
                src={BrandArrowPng}
                alt=""
                width={13}
                height={10}
                style={{ opacity: 0.9 }}
              />
              <h1 className="font-display text-3xl font-bold text-[#610013]">
                Bem-vinda
              </h1>
            </div>
            <div className="h-px w-12 bg-[#D69957] ml-5 mb-3" />
            <p className="text-[#AA8F71] text-sm ml-5">
              Acesse o sistema de gestão jurídica
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#161616] mb-1.5">
                Usuário
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white/75 border border-[#AA8F71]/40 rounded-lg text-[#161616] placeholder-[#AA8F71] focus:outline-none focus:border-[#610013] focus:ring-1 focus:ring-[#610013] transition-colors"
                placeholder="seu usuário"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#161616] mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/75 border border-[#AA8F71]/40 rounded-lg text-[#161616] placeholder-[#AA8F71] focus:outline-none focus:border-[#610013] focus:ring-1 focus:ring-[#610013] transition-colors pr-11"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#AA8F71] hover:text-[#610013] transition-colors"
                >
                  {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#610013] text-white font-semibold rounded-lg hover:bg-[#4a000f] disabled:bg-[#AA8F71] transition-colors tracking-wide"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
