import React from 'react';
import {
  Building2,
  Home,
  Calendar,
  Users,
  BarChart3,
  CreditCard,
  FileText,
  UserCheck,
  Receipt,
  Settings,
  FileCheck,
  PackagePlus,
  Files
} from 'lucide-react';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu as SidebarMenuList,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../ui/sidebar';
import { useAuth } from '../../auth/AuthContext';

const menuItems = [
  { key: 'main', title: 'Calendario', icon: Home },
  { key: 'bookings', title: 'Reservas', icon: Calendar },
  { key: 'properties', title: 'Inmuebles', icon: Building2 },
  { key: 'propietarios', title: 'Propietarios', icon: UserCheck },
  { key: 'guests', title: 'Huéspedes', icon: Users },
];

const analyticsItems = [
  { key: 'reports', title: 'Reportes', icon: BarChart3 },
  { key: 'cashbox', title: 'Caja', icon: CreditCard },
  { key: 'incomes', title: 'Ingresos', icon: CreditCard },
  { key: 'deductions', title: 'Egresos', icon: FileText },
];

// Mapeo de permisos a claves de menú
const PERMISO_MENU_MAP: Record<string, string> = {
  ver_inmuebles: 'properties',
  ver_propietarios: 'propietarios',
  ver_reservas: 'bookings',
  crear_reserva: 'bookings',
  ver_reportes: 'reports',
  ver_huespedes: 'guests',
  ver_caja: 'cashbox',
  ver_ingresos: 'incomes',
  ver_egresos: 'deductions',
  ver_usuarios: 'usuarios',
  // Agrega más mapeos según tus claves de permisos
};

interface SidebarMenuProps {
  activeKey: string;
  onSelect: (key: string) => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ activeKey, onSelect }) => {
  const { user } = useAuth();
  const permisos = user?.permisos || [];

  // Detectar rol propietario
  const isPropietario = user && (
    String(user.role) === 'PROPIETARIO' ||
    String(user.role) === '4' ||
    (user as any).id_roles === 4
  );

  const allowedKeys: Set<string> = new Set(
    (permisos as string[])
      .map((p: string) => PERMISO_MENU_MAP[p])
      .filter(Boolean)
  );
  // Siempre mostrar el panel principal
  allowedKeys.add('main');

  const usuariosItem = { key: 'usuarios', title: 'Usuarios', icon: Users };
  const companiesItem = { key: 'companies', title: 'Empresas', icon: Building2 };

  // Agregar la opción de Usuarios si el permiso existe
  const showUsuarios = permisos.includes('ver_usuarios');

  // Agregar la opción de Empresas solo para SUPERADMIN
  const isSuperAdmin = user && (String(user.role) === '1' || String(user.role) === 'SUPERADMIN' || (user as any).id_roles === 1);
  const isEmpresa = user && (user as any).id_roles === 2;
  const showCompanies = isSuperAdmin;
  const showFacturacion = isSuperAdmin || isEmpresa;

  const renderMenuItem = (key: string, icon: any, title: string) => (
    <SidebarMenuItem key={key}>
      <SidebarMenuButton
        className={`flex items-center transition-all duration-300 md:justify-center md:group-hover:justify-start px-3 md:px-0 md:group-hover:px-3 hover:bg-waiwa-mauve/10 hover:text-waiwa-forest ${activeKey === key ? 'bg-waiwa-amber/15 text-waiwa-forest border-r-2 border-waiwa-amber' : ''}`}
        onClick={() => onSelect(key)}
        data-active={activeKey === key}
      >
        {React.createElement(icon, { className: "h-8 w-8 shrink-0" })}
        <span className="overflow-hidden whitespace-nowrap transition-all duration-300 ml-3 md:ml-0 md:group-hover:ml-3 md:max-w-0 md:opacity-0 md:group-hover:max-w-[200px] md:group-hover:opacity-100">{title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <nav className="flex flex-col gap-0 px-2 mt-4 rounded-lg">
      <SidebarGroup>
        <SidebarGroupLabel className="text-waiwa-forest font-semibold md:max-w-0 md:opacity-0 md:group-hover:max-w-full md:group-hover:opacity-100 overflow-hidden whitespace-nowrap transition-all duration-300">Gestión Principal</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenuList>

            {menuItems.filter(item => allowedKeys.has(item.key) && !(isPropietario && item.key === 'bookings')).map((item) => (
              renderMenuItem(item.key, item.icon, item.title)
            ))}
            
            {showUsuarios && renderMenuItem(usuariosItem.key, usuariosItem.icon, usuariosItem.title)}
            {showCompanies && renderMenuItem(companiesItem.key, companiesItem.icon, companiesItem.title)}

          </SidebarMenuList>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel className="text-waiwa-forest font-semibold md:max-w-0 md:opacity-0 md:group-hover:max-w-full md:group-hover:opacity-100 overflow-hidden whitespace-nowrap transition-all duration-300">Análisis y Finanzas</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenuList>
            {analyticsItems.filter(item => allowedKeys.has(item.key)).map((item) => (
              renderMenuItem(item.key, item.icon, item.title)
            ))}
          </SidebarMenuList>
        </SidebarGroupContent>
      </SidebarGroup>
      {showFacturacion && (
        <SidebarGroup>
          <SidebarGroupLabel className="text-waiwa-forest font-semibold md:max-w-0 md:opacity-0 md:group-hover:max-w-full md:group-hover:opacity-100 overflow-hidden whitespace-nowrap transition-all duration-300">Facturación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenuList>
              {renderMenuItem('facturacion', Home, 'Inicio Facturación')}
              {renderMenuItem('facturacion_facturas', Receipt, 'Documentos Electrónicos')}
              {renderMenuItem('facturacion_clientes', Users, 'Terceros y Clientes')}
              {renderMenuItem('facturacion_documentos', Files, 'Soporte / Notas')}
              {renderMenuItem('facturacion_config', Settings, 'Configuración DIAN')}
            </SidebarMenuList>
          </SidebarGroupContent>
        </SidebarGroup>
      )}
    </nav>
  );
};

export default SidebarMenu;
