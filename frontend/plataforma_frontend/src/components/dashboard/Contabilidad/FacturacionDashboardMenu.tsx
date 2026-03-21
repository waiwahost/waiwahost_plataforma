import React from 'react';
import { 
  FileText, 
  ClipboardCheck, 
  FileSpreadsheet, 
  Wallet, 
  BookOpen, 
  Calculator, 
  ReceiptText, 
  UserPlus, 
  PackagePlus, 
  FileUp, 
  ShoppingCart,
  ArrowRight
} from 'lucide-react';

interface MenuOptionProps {
  icon: React.ReactNode;
  label: string;
  isNew?: boolean;
  onClick?: () => void;
}

const MenuOption: React.FC<MenuOptionProps> = ({ icon, label, isNew, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center p-6 bg-[#0f172a] hover:bg-[#1e293b] rounded-2xl border border-[#1e293b] hover:border-indigo-500 transition-all cursor-pointer overflow-hidden shadow-lg hover:shadow-indigo-500/20"
      style={{ minHeight: '170px' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {isNew && (
        <span className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-md">
          Nuevo
        </span>
      )}
      
      <div className="w-16 h-16 rounded-full bg-[#1a2234] border border-[#2d3748] flex items-center justify-center mb-4 text-indigo-400 group-hover:text-indigo-300 group-hover:scale-110 transition-transform duration-300 shadow-inner">
        {icon}
      </div>
      
      <h3 className="text-[#e2e8f0] text-[13px] font-medium text-center leading-tight group-hover:text-white transition-colors">
        {label}
      </h3>
      
      <div className="absolute bottom-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
        <ArrowRight size={16} className="text-indigo-400" />
      </div>
    </div>
  );
};

export default function FacturacionDashboardMenu({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const options = [
    { icon: <FileText size={28} strokeWidth={1.5} />, label: "Crea una Factura Electrónica", onClick: () => onNavigate?.('nueva_factura') },
    { icon: <ClipboardCheck size={28} strokeWidth={1.5} />, label: "Registra eventos en factura electrónica de proveedores", onClick: () => onNavigate?.('documentos') },
    { icon: <FileSpreadsheet size={28} strokeWidth={1.5} />, label: "Crea un Documento soporte", onClick: () => onNavigate?.('documentos') },
    { icon: <Wallet size={28} strokeWidth={1.5} />, label: "Registra una Compra o Gasto" },
    { icon: <BookOpen size={28} strokeWidth={1.5} />, label: "Crea un Comprobante contable" },
    { icon: <ReceiptText size={28} strokeWidth={1.5} />, label: "Facturar desde Reserva", isNew: true, onClick: () => onNavigate?.('nueva_factura_reserva') },
    { icon: <Calculator size={28} strokeWidth={1.5} />, label: "Crea un Recibo de caja" },
    { icon: <ReceiptText size={28} strokeWidth={1.5} />, label: "Crea un Recibo de pago" },
    { icon: <UserPlus size={28} strokeWidth={1.5} />, label: "Crea un Tercero", onClick: () => onNavigate?.('clientes') },
    { icon: <PackagePlus size={28} strokeWidth={1.5} />, label: "Crea un Producto o Servicio" },
    { icon: <FileUp size={28} strokeWidth={1.5} />, label: "Importa una Compra o Gasto desde XML o ZIP", isNew: true },
    { icon: <ShoppingCart size={28} strokeWidth={1.5} />, label: "Comprar nuevos planes" },
  ];

  return (
    <div className="p-8 max-w-[1100px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 border-b border-[#1e293b] pb-6">
        <h2 className="text-[22px] font-bold text-[#e2e8f0] tracking-tight">
          Te damos la bienvenida, ¿Qué deseas hacer?
        </h2>
        <p className="text-[#64748b] mt-2 text-[13px]">
          Selecciona una de las opciones a continuación para gestionar tu facturación y contabilidad. Las opciones disponibles se activarán dependiendo de tu configuración.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {options.map((opt, idx) => (
          <MenuOption 
            key={idx} 
            icon={opt.icon} 
            label={opt.label} 
            isNew={opt.isNew} 
            onClick={opt.onClick}
          />
        ))}
      </div>
    </div>
  );
}
