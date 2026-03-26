'use client';
import React, { useState } from 'react';
import logo from '../assets/logo.png';
import martaLogo from '../assets/marta_neumann_logo_iniciais_600x600.jpg';
import BrandStarPng from '../assets/brandStar.png';
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

const ChevronLeftIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
);

const ChevronRightIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5 15.75 12l-7.5 7.5" />
  </svg>
);

const HamburgerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const Sidebar = ({ current, onLogout, isMinimized, onToggleMinimized }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Botão hamburger — apenas mobile */}
      <button
        className="md:hidden fixed top-3 left-3 z-50 p-2 bg-[#610013] text-white rounded-lg shadow-lg"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menu"
      >
        <HamburgerIcon />
      </button>

      {/* Backdrop mobile */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          h-screen fixed top-0 left-0 bg-[#610013] text-white flex flex-col justify-between
          transition-all duration-300 z-50
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          w-56 md:w-auto
          ${isMinimized ? 'md:w-14 md:p-2' : 'md:w-48 md:p-4'}
          p-4
        `}
      >
        <div>
          {/* Botão fechar — apenas mobile */}
          <div className="flex justify-end mb-2 md:hidden">
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg text-[#F0D9CC]/60 hover:bg-white/10 hover:text-white transition-all"
              aria-label="Fechar menu"
            >
              <XIcon />
            </button>
          </div>

          {/* Logo */}
          <div className="mb-6 flex flex-col items-center gap-2">
            <Image
              src={isMinimized ? martaLogo : logo}
              alt="Marta Neumann Advogada"
              className={isMinimized ? 'opacity-90' : 'brightness-0 invert opacity-90'}
              style={{
                maxWidth: isMinimized ? '40px' : '140px',
                height: 'auto',
                width: isMinimized ? '40px' : '140px',
              }}
            />
            {!isMinimized && (
              <p className="text-xs text-[#F0D9CC]/50 text-center tracking-wider uppercase">
                Sistema Jurídico v1.0
              </p>
            )}
          </div>

          {/* Botão toggle — apenas desktop */}
          <div className="hidden md:flex mb-5 justify-center">
            <button
              onClick={onToggleMinimized}
              className="p-2 rounded-lg text-[#F0D9CC]/60 hover:bg-white/10 hover:text-white transition-all duration-200"
              title={isMinimized ? 'Expandir sidebar' : 'Minimizar sidebar'}
            >
              {isMinimized ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </button>
          </div>

          {/* Navegação */}
          <nav className="space-y-1">
            <NavItem
              icon={<MdOutlineDocumentScanner className="w-5 h-5" />}
              label="Processos"
              href="/"
              isActive={current === 'Processos'}
              isMinimized={isMinimized}
              onMobileClose={() => setMobileOpen(false)}
            />
            <NavItem
              icon={<MdArchive className="w-5 h-5" />}
              label="Financeiro"
              href="/arquivo-financeiro"
              isActive={current === 'Financeiro'}
              isMinimized={isMinimized}
              onMobileClose={() => setMobileOpen(false)}
            />
            <NavItem
              icon={<CalendarIcon />}
              label="Calendário"
              href="/calendario"
              isActive={current === 'Calendário'}
              isMinimized={isMinimized}
              onMobileClose={() => setMobileOpen(false)}
            />
          </nav>
        </div>

        {/* Rodapé */}
        <div className="space-y-3">
          {!isMinimized && (
            <div
              className="w-full"
              style={{
                height: '45px',
                backgroundImage: `url(${BrandStarPng.src})`,
                backgroundSize: '400px 400px',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'left',
                mixBlendMode: 'screen',
                opacity: 0.35,
              }}
            />
          )}
          <NavItem
            icon={<LogoutIcon />}
            label="Sair"
            onClick={onLogout}
            isLogout={true}
            isMinimized={isMinimized}
          />
          {isMinimized && (
            <p className="text-xs text-[#F0D9CC]/50 text-center tracking-wider uppercase">
              v1.0
            </p>
          )}
        </div>
      </div>
    </>
  );
};

const NavItem = ({
  icon,
  label,
  href,
  isActive,
  onClick,
  isLogout = false,
  isMinimized = false,
  onMobileClose,
}) => {
  const base =
    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200';

  const classes = isActive
    ? `${base} bg-[#D69957] text-[#161616]`
    : isLogout
      ? `${base} text-[#F0D9CC]/60 hover:bg-white/10 hover:text-white`
      : `${base} text-[#F0D9CC]/80 hover:bg-white/10 hover:text-white`;

  if (href) {
    return (
      <Link
        href={href}
        className={`${classes} ${isMinimized ? 'md:justify-center md:px-2' : ''}`}
        onClick={onMobileClose}
      >
        <span className="flex-shrink-0">{icon}</span>
        <span className={isMinimized ? 'md:hidden' : ''}>{label}</span>
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`${classes} w-full text-left ${isMinimized ? 'md:justify-center md:px-2' : ''}`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className={isMinimized ? 'md:hidden' : ''}>{label}</span>
    </button>
  );
};

export default Sidebar;
