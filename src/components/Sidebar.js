'use client';
import React from 'react';
import logo from '../assets/logo.png'; // Comentado para evitar erro se 'logo.png' não estiver disponível
import Image from 'next/image';
import Link from 'next/link'; // Importa Link do Next para navegação
import {
  MdOutlineDocumentScanner,
  MdAssignmentLate,
  MdArchive,
} from 'react-icons/md';

// Ícones SVG simples
// Ícone de Documento (Processos)
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

// Ícone de Logout
const LogoutIcon = (props) => (
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
      d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H9"
    />
  </svg>
);

// Componente principal da Sidebar
const Sidebar = ({ current, onLogout }) => (
  <div className="w-64 h-screen fixed bg-[#ffe8da] text-gray-800 p-5 flex flex-col justify-between shadow-xl">
    <div>
      {/* 1. SEÇÃO DO LOGO */}
      <div className="mb-10 flex flex-col items-start border-b border-gray-700 pb-4">
        <Image src={logo} alt="logotipo" srcset="" />
      </div>

      {/* 2. NAVEGAÇÃO */}
      <nav>
        <NavItem
          icon={<MdOutlineDocumentScanner />}
          label="Processos"
          href="/"
          isActive={current === 'Processos'}
        />
        <NavItem
          icon={<MdArchive />}
          label="Financeiro"
          href="/arquivo-financeiro"
          isActive={current === 'Financeiro'}
        />

        {/* Você pode adicionar mais itens de navegação aqui */}
      </nav>
    </div>

    {/* 3. RODAPÉ e LOGOUT */}
    <div className="text-sm border-t border-gray-300 pt-4">
      {/* NOVO ITEM: LOGOUT */}
      <NavItem
        icon={<LogoutIcon />}
        label="Sair"
        // Não tem href, pois usaremos a função onClick
        onClick={onLogout}
        isLogout={true}
      />

      <p className="text-xs text-gray-500 mt-4">Sistema Jurídico v1.0</p>
    </div>
  </div>
);

// Componente NavItem ajustado para suportar links (Next.js Link) ou botões (onClick)
const NavItem = ({
  icon,
  label,
  href,
  isActive,
  onClick,
  isLogout = false,
}) => {
  const commonClasses = `flex items-center p-3 my-1 rounded-lg transition-all duration-200 font-medium ${
    isActive
      ? 'bg-[#A03232] text-white shadow-lg hover:bg-red-900'
      : isLogout
        ? 'text-gray-600 hover:bg-red-200 hover:text-red-700'
        : 'text-white-700 hover:bg-red-900 hover:text-white '
  }`;

  if (href) {
    return (
      <Link href={href} className={commonClasses}>
        <span className="mr-3">{icon}</span>
        <span>{label}</span>
      </Link>
    );
  }

  // Renderiza como botão se houver onClick
  return (
    <button onClick={onClick} className={`${commonClasses} w-full text-left`}>
      <span className="mr-3">{icon}</span>
      <span>{label}</span>
    </button>
  );
};

export default Sidebar;
