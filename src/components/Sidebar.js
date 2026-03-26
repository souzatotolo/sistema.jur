'use client';
import React from 'react';
import logo from '../assets/logo.png';
import Image from 'next/image';
import Link from 'next/link';
import { MdOutlineDocumentScanner, MdArchive } from 'react-icons/md';

const CalendarIcon = (props) => (
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
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
    />
  </svg>
);

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

const Sidebar = ({ current, onLogout }) => (
  <div className="w-64 h-screen fixed bg-[#610013] text-white p-5 flex flex-col justify-between">
    <div>
      {/* Logo */}
      <div className="mb-8 pb-6 border-b border-[#D69957]/30 flex items-center justify-center">
        <Image
          src={logo}
          alt="Marta Neumann Advogada"
          className="brightness-0 invert opacity-90"
          style={{ maxHeight: '80px', width: 'auto' }}
        />
      </div>

      {/* Navegação */}
      <nav className="space-y-1">
        <NavItem
          icon={<MdOutlineDocumentScanner className="w-5 h-5" />}
          label="Processos"
          href="/"
          isActive={current === 'Processos'}
        />
        <NavItem
          icon={<MdArchive className="w-5 h-5" />}
          label="Financeiro"
          href="/arquivo-financeiro"
          isActive={current === 'Financeiro'}
        />
        <NavItem
          icon={<CalendarIcon />}
          label="Calendário"
          href="/calendario"
          isActive={current === 'Calendário'}
        />
      </nav>
    </div>

    {/* Rodapé */}
    <div className="border-t border-[#D69957]/30 pt-4 space-y-3">
      <NavItem
        icon={<LogoutIcon />}
        label="Sair"
        onClick={onLogout}
        isLogout={true}
      />
      <p className="text-xs text-[#F0D9CC]/50 text-center tracking-wider uppercase">
        Sistema Jurídico v1.0
      </p>
    </div>
  </div>
);

const NavItem = ({ icon, label, href, isActive, onClick, isLogout = false }) => {
  const base = 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200';

  const classes = isActive
    ? `${base} bg-[#D69957] text-[#161616]`
    : isLogout
    ? `${base} text-[#F0D9CC]/60 hover:bg-white/10 hover:text-white`
    : `${base} text-[#F0D9CC]/80 hover:bg-white/10 hover:text-white`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        <span className="flex-shrink-0">{icon}</span>
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={`${classes} w-full text-left`}>
      <span className="flex-shrink-0">{icon}</span>
      <span>{label}</span>
    </button>
  );
};

export default Sidebar;
