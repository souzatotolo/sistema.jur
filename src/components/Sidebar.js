'use client';
import React from 'react';
import logo from '../assets/logo.png';
import Image from 'next/image';

// Ícones SVG simples (substituindo o uso de 'icon=""')
const DocumentIcon = (props) => (
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
      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-2.25a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5A2.25 2.25 0 0 0 18 17.25V9.75M9.75 6.75h-2.25M9.75 9h-2.25M9.75 11.25h-2.25"
    />
  </svg>
);

const Sidebar = ({ current }) => (
  <div className="w-64 h-screen fixed bg-[#ffe8da] text-gray-300 p-5 flex flex-col justify-between">
    <div>
      {/* 1. SEÇÃO DO LOGO (MELHORADA) */}
      <div className="mb-10 flex flex-col items-start border-b border-gray-700 pb-4">
        <Image src={logo} alt="logotipo" srcset="" />
      </div>

      {/* 2. NAVEGAÇÃO */}
      <nav>
        {/* Você pode incluir o Dashboard aqui se quiser */}
        <NavItem
          icon={<DocumentIcon />} // Ícone de Processo
          label="Processos"
          href="/"
          isActive={current === 'Processos'}
        />

        {/* Adicione mais NavItems aqui */}
      </nav>
    </div>

    {/* 3. RODAPÉ (Ex: Versão ou Usuário Logado) */}
    <div className="text-xs text-gray-500 border-t border-gray-700 pt-4">
      <p>Sistema Jurídico v1.0</p>
    </div>
  </div>
);

const NavItem = ({ icon, label, href, isActive }) => (
  <a
    href={href}
    className={`flex items-center p-3 my-1 rounded-lg transition-colors duration-200 
      ${
        isActive
          ? 'bg-[#A03232] text-white shadow-lg'
          : 'hover:bg-gray-700 text-gray-300'
      }
    `}
  >
    <span className="mr-3">{icon}</span>
    <span className="font-medium">{label}</span>
  </a>
);

export default Sidebar;
