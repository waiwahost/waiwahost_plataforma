"use client";

import React, { useState, useEffect } from 'react';

import { PanelRightClose, PanelRightOpen } from "lucide-react"

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
import Usuarios from '../dashboard/Usuarios';

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
};

const BaseLayout: React.FC = () => {
  const [activeKey, setActiveKey] = useState('main');
  const [open, setOpen] = useState(false);


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
    <div className="flex min-h-screen bg-white text-foreground max-w-full overflow-hidden">
      {/* Sidebar a la izquierda, ocupa toda la altura */}
      <aside className={`${open ? "translate-x-0 w-64" : "-translate-x-full w-0"} 
    transition-all duration-300 ease-in-out md:relative flex-shrink-0 border-r border-gray-200 bg-gradient-to-br 
    from-tourism-navy via-tourism-teal to-tourism-sage shadow-md flex flex-col rounded-tr-2xl rounded-br-2xl overflow-hidden`}>
        <div className="border-b border-gray-200 bg-white px-3 py-4 flex items-center space-x-3">
          <div className="bg-tourism-gold p-2 rounded-lg">
            <Logo />
          </div>
          <div>
            <h1 className="font-bold text-lg text-tourism-navy">Waiwahost</h1>
            <p className="text-xs text-gray-500">Gestión Inmobiliaria</p>
          </div>
          
        </div>
        <div className="flex-1 bg-white">
          <SidebarMenu activeKey={activeKey} onSelect={handleMenuSelect} />
        </div>
        <div className="border-t border-gray-200 bg-white p-4 text-center">
          <p className="text-xs text-gray-500">© 2025 Waiwahost</p>
          <p className="text-xs text-gray-400">Versión 1.1.0</p>
        </div>
      </aside>
      {/* Área derecha: header arriba, content abajo */}
      <div className="flex flex-col flex-1 min-h-screen bg-white min-w-0">
        {/* Header solo sobre el content, no sobre el sidebar */}
        <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setOpen(!open)}
                className={`!p-0  !hover:bg-transparent !border-0 !shadow-none flex items-center justify-center ${open ? "!pr-9 !md:p-0" : "!p-0"}`}
              >
                {open ? (
                  <PanelRightOpen size={20} color="#575757ff" />
                ) : (
                  <PanelRightClose size={20} color="#575757ff" />
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
        {/* Main content debajo del header */}
        <main className="flex-1 p-8 bg-white min-h-[calc(100vh-4rem)] overflow-hidden">
          <div className="w-full h-full overflow-auto">
            {COMPONENTS[activeKey]}
          </div>
        </main>
        {/* Footer adaptado visualmente */}
        <footer className="border-t border-gray-200 bg-white px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>© 2025 Waiwahost. Todos los derechos reservados.</span>
            </div>
            <div className="flex items-center space-x-4 mt-2 sm:mt-0">
              <a href="#" className="hover:text-tourism-navy transition-colors">Política de Privacidad</a>
              <span>•</span>
              <a href="#" className="hover:text-tourism-navy transition-colors">Términos de Servicio</a>
              <span>•</span>
              <a href="#" className="hover:text-tourism-navy transition-colors">Soporte</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default BaseLayout;
