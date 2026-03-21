"use client";
import React, { useState, useEffect } from 'react';

import { PanelRightClose, PanelRightOpen, Home } from "lucide-react"

import Logo from '../atoms/Logo';
import UserMenu from '../molecules/UserMenu';
import ThemeSwitcher from '../atoms/ThemeSwitcher';
import SidebarMenu from '../organisms/SidebarMenu';
import MainPanel from '../dashboard/MainPanel';
import Bookings from '../dashboard/Bookings';
import Properties from '../dashboard/Properties';
import Propietarios from '../dashboard/Propietarios';
import Guests from '../dashboard/Guests';
import Availability from '../dashboard/Availability';
import Reports from '../dashboard/Reports';
import Cashbox from '../dashboard/Cashbox';
import Incomes from '../dashboard/Incomes';
import Deductions from '../dashboard/Deductions';
import Companies from '../dashboard/Companies';
import Usuarios from '../dashboard/Usuarios';
import Facturacion from '../dashboard/Contabilidad/Facturacion';
import { useAuth } from '../../auth/AuthContext';


const COMPONENTS: Record<string, React.ReactNode> = {
  main: <MainPanel />,
  bookings: <Bookings />,
  properties: <Properties />,
  propietarios: <Propietarios />,
  guests: <Guests />,
  availability: <Availability />,
  reports: <Reports />,
  cashbox: <Cashbox />,
  incomes: <Incomes />,
  deductions: <Deductions />,
  usuarios: <Usuarios />,
  companies: <Companies />,
};

const BaseLayout: React.FC = () => {
  const [activeKey, setActiveKey] = useState('main');
  const [open, setOpen] = useState(false);

  const { user } = useAuth();
  const isPropietario = user && (
    String(user.role) === 'PROPIETARIO' ||
    String(user.role) === '4' ||
    (user as any).id_roles === 4
  );


  // Cerrar SIdebar Automaticamente en celular
  const handleMenuSelect = (key: string) => {
    setActiveKey(key);
    if (window.innerWidth < 768) {
      setOpen(false);
    }
  };

  useEffect(() => {
    const isDesktop = window.innerWidth >= 768;
    setOpen(isDesktop);
  }, []);





  return (
    <div className="flex min-h-screen bg-white dark:bg-background text-foreground max-w-full overflow-hidden">
      {/* Sidebar a la izquierda, ocupa toda la altura */}
      <aside className={`group ${open ? "translate-x-0 w-64 md:w-20 md:hover:w-64" : "-translate-x-full w-0 md:translate-x-0 md:w-20 md:hover:w-64"} 
    transition-[width,transform] duration-300 ease-in-out sticky top-0 h-screen flex-shrink-0 border-r border-gray-300 dark:border-[#13392f] bg-gradient-to-br 
    from-waiwa-forest via-[#0f5245] to-[#1a6b58] shadow-lg flex flex-col rounded-tr-2xl rounded-br-2xl overflow-y-auto overflow-x-hidden z-50`}>
        <div className="border-b border-gray-300 dark:border-[#13392f] bg-white dark:bg-[#0a1f1a] px-3 py-30 h-20 flex items-center shrink-0 md:justify-center md:group-hover:justify-start transition-all duration-300">
          <div className="bg-[#e7b61d] p-1.5 md:p-1 md:group-hover:p-1.5 rounded-lg shrink-0 transition-all duration-300 flex items-center justify-center">
            <Logo />
          </div>
          <div className="flex flex-col ml-3 md:ml-0 md:group-hover:ml-3 md:max-w-0 md:opacity-0 md:group-hover:max-w-[150px] md:group-hover:opacity-100 overflow-hidden whitespace-nowrap transition-all duration-300">
            <h1 className="font-bold text-lg text-waiwa-forest dark:text-waiwa-amber leading-tight">Waiwahost</h1>
            <p className="text-[10px] text-gray-500 dark:text-[#a197ad] leading-tight">Gestión Inmobiliaria</p>
          </div>
        </div>
        <div className="flex-1 bg-white dark:bg-[#0a1f1a] overflow-x-hidden overflow-y-auto custom-scrollbar pb-20">
          <SidebarMenu activeKey={activeKey} onSelect={handleMenuSelect} />
        </div>
        <div className="border-t border-gray-200 dark:border-[#13392f] bg-white dark:bg-[#0a1f1a] p-4 text-center shrink-0">
          <div className="md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
            <p className="text-xs text-gray-500 dark:text-[#a197ad]">© 2025 Waiwahost</p>
            <p className="text-xs text-gray-400 dark:text-[#a197ad]/70">Versión 1.1.0</p>
          </div>
        </div>
      </aside>
      {/* Área derecha: header arriba, content abajo */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden bg-white dark:bg-background min-w-0">
        {/* Header solo sobre el content, no sobre el sidebar */}
        <header className="flex-none w-full border-b border-gray-200 dark:border-[#13392f] bg-white/95 dark:bg-[#0a1f1a]/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-[#0a1f1a]/80 z-40">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setOpen(!open)}
                className={`!p-0 dark:text-white text-[#575757ff] !hover:bg-transparent !border-0 !shadow-none flex items-center justify-center ${open ? "!pr-9 !md:p-0" : "!p-0"}`}
              >
                {open ? (
                  <PanelRightOpen size={20} />
                ) : (
                  <PanelRightClose size={20} />
                )}
              </button>




              {/* Puedes poner aquí un título de página si lo deseas */}
            </div>
            <div className="flex items-center space-x-3">
              <ThemeSwitcher />
              <UserMenu />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-white dark:bg-background">
          {/* Banner de Panel de Propietario */}
          {isPropietario && (
            <div className="flex items-center gap-4 px-8 py-3 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 border-b border-amber-400 shadow-sm">
              <div className="flex items-center justify-center w-8 h-8 bg-white/60 rounded-full">
                <Home className="h-4 w-4 text-amber-800" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-amber-900 text-sm leading-tight">Panel de Propietario</span>
                <span className="text-amber-800 text-xs opacity-80">Vista de solo lectura — Consulta la disponibilidad de tus inmuebles</span>
              </div>
            </div>
          )}
          <div className="w-full p-8">
            {activeKey === 'facturacion' && <Facturacion activeTab="inicio" onNavigate={handleMenuSelect} />}
            {activeKey === 'facturacion_config' && <Facturacion activeTab="config" onNavigate={handleMenuSelect} />}
            {activeKey === 'facturacion_clientes' && <Facturacion activeTab="clientes" onNavigate={handleMenuSelect} />}
            {activeKey === 'facturacion_facturas' && <Facturacion activeTab="facturas" onNavigate={handleMenuSelect} />}
            {activeKey === 'facturacion_documentos' && <Facturacion activeTab="documentos" onNavigate={handleMenuSelect} />}
            {activeKey === 'facturacion_nueva' && <Facturacion activeTab="nueva_factura" onNavigate={handleMenuSelect} />}
            {activeKey === 'facturacion_nueva_reserva' && <Facturacion activeTab="nueva_factura_reserva" onNavigate={handleMenuSelect} />}
            {!activeKey.startsWith('facturacion') && COMPONENTS[activeKey]}
          </div>
        </main>
        {/* Footer adaptado visualmente */}
        <footer className="flex-none w-full border-t border-gray-200 dark:border-[#13392f] bg-white dark:bg-[#0a1f1a] px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 dark:text-[#a197ad]">
            <div className="flex items-center space-x-4">
              <span>© 2025 Waiwahost. Todos los derechos reservados.</span>
            </div>
            <div className="flex items-center space-x-4 mt-2 sm:mt-0">
              <a href="#" className="hover:text-waiwa-forest transition-colors">Política de Privacidad</a>
              <span>•</span>
              <a href="#" className="hover:text-waiwa-forest transition-colors">Términos de Servicio</a>
              <span>•</span>
              <a href="#" className="hover:text-waiwa-forest transition-colors">Soporte</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default BaseLayout;
