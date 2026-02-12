'use client';

import { apiFetch } from '../../auth/apiFetch';
import React, { useEffect, useState } from 'react';
import TenantSwitcher from '../../components/TenantSwitcher';
import MainPanel from '../../components/dashboard/MainPanel';
import Bookings from '../../components/dashboard/Bookings';
import Properties from '../../components/dashboard/Properties';
import Guests from '../../components/dashboard/Guests';
import Availability from '../../components/dashboard/Availability';
import Companies from '../../components/dashboard/Companies';
import NuevoReporteFinanciero from '../../components/dashboard/Reports';
import Cashbox from '../../components/dashboard/Cashbox';
import Incomes from '../../components/dashboard/Incomes';
import Deductions from '../../components/dashboard/Deductions';

import { useAuth, User as AuthUser } from '../../auth/AuthContext';

// Extend AuthUser or define compatible interface
interface DashboardUser extends AuthUser {
  id: string; // auth context uses string
  nombre: string;
  email: string;
  role?: string;
  rol?: string; // some parts might use rol
  id_roles?: number; // Backend usually returns number for IDs
  permisos?: string[];
  empresaId?: number | null;
}

const TABS = [
  { key: 'main', label: 'Panel Principal', component: <MainPanel /> },
  { key: 'bookings', label: 'Reservas', component: <Bookings /> },
  { key: 'properties', label: 'Propiedades', component: <Properties /> },
  { key: 'guests', label: 'Huéspedes', component: <Guests /> },
  { key: 'availability', label: 'Disponibilidad', component: <Availability /> },
  { key: 'reports', label: 'Reportes (Nuevo)', component: <NuevoReporteFinanciero /> },
  { key: 'cashbox', label: 'Caja', component: <Cashbox /> },
  { key: 'incomes', label: 'Ingresos', component: <Incomes /> },
  { key: 'deductions', label: 'Egresos', component: <Deductions /> },
  { key: 'companies', label: 'Empresas', component: <Companies /> },
];

export default function DashboardPage() {
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('main');

  // Cast authUser to DashboardUser to access potentially missing properties in AuthContext type
  const currentUser = authUser as DashboardUser | null;

  useEffect(() => {
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/users`)
      .then((data) => setUsers(data as DashboardUser[]))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  // Determine if user is SUPERADMIN
  // Check both 'id_roles' (number 1) and 'role' string for robustness.
  // The user provided: { id_roles: 1, role: "SUPERADMIN", ... }
  const isSuperAdmin = currentUser && (
    currentUser.id_roles === 1 ||
    currentUser.role === 'SUPERADMIN' ||
    String(currentUser.rol) === '1'
  );

  const visibleTabs = [...TABS];
  if (isSuperAdmin) {
    visibleTabs.push({ key: 'companies', label: 'Empresas', component: <Companies /> });
  }

  return (
    <div className="p-8">
      <TenantSwitcher />
      <div className="flex flex-wrap gap-2 mb-6">
        {visibleTabs.map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-2 rounded font-medium border transition-colors ${activeTab === tab.key ? 'bg-tourism-teal text-white' : 'bg-white border-gray-200 text-tourism-navy hover:bg-tourism-sage/20'}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        {visibleTabs.find(tab => tab.key === activeTab)?.component}
      </div>
      {error && <div className="text-red-500">{error}</div>}
      <ul className="space-y-2">
        {users.map((u) => (
          <li key={u.id} className="border p-2 rounded">
            {u.nombre} ({u.email}) - Rol: {u.role ?? u.rol ?? 'N/A'}
          </li>
        ))}
      </ul>
    </div>
  );
}
