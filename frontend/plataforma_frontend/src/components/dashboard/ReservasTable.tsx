import React from 'react';
import { Edit2, Trash2, Eye, Users, CreditCard, Share2, Leaf } from 'lucide-react';
import { IReservaTableData } from '../../interfaces/Reserva';
import PlataformaBadge from '../atoms/PlataformaBadge';
import { copyToClipboard } from '../../lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReservasTableProps {
  reservas: IReservaTableData[];
  onEdit: (reserva: IReservaTableData) => void;
  onDelete: (reserva: IReservaTableData) => void;
  onViewDetail: (reserva: IReservaTableData) => void;
  onViewHuespedes: (reserva: IReservaTableData) => void;
  onViewPagos: (reserva: IReservaTableData) => void;
  onViewTarjeta: (reserva: IReservaTableData) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canSendTarjeta?: boolean;
  tarjetas: any[];
}

const ReservasTable: React.FC<ReservasTableProps> = ({
  reservas,
  tarjetas = [],
  onEdit,
  onDelete,
  onViewDetail,
  onViewHuespedes,
  onViewPagos,
  onViewTarjeta,
  canEdit = true,
  canDelete = true,
  canSendTarjeta = true
}) => {

  const formatShortDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    return format(localDate, "MMM dd, yyyy", { locale: es });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getEstadoBadge = (estado: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap inline-flex items-center justify-center capitalize";
    switch (estado) {
      case 'pendiente':
        return `${baseClasses} bg-[#fef9c3] text-[#a16207] dark:bg-[#fef9c3]/10 dark:text-[#fef9c3]`; // Yellow
      case 'confirmada':
      case 'en_proceso':
        return `${baseClasses} bg-[#e0eafe] text-[#2463eb] dark:bg-[#e0eafe]/10 dark:text-[#e0eafe]`; // Blue
      case 'completada':
        return `${baseClasses} bg-[#dcfce7] text-[#15803d] dark:bg-[#dcfce7]/10 dark:text-[#dcfce7]`; // Green
      case 'cancelada':
        return `${baseClasses} bg-[#fee2e2] text-[#b91c1c] dark:bg-[#fee2e2]/10 dark:text-[#fee2e2]`; // Red
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-secondary dark:text-gray-300`;
    }
  };

  const calcularNoches = (fechaEntrada: string, fechaSalida: string) => {
    const entrada = new Date(fechaEntrada);
    const salida = new Date(fechaSalida);
    if (isNaN(entrada.getTime()) || isNaN(salida.getTime())) return '-';
    const diffTime = Math.abs(salida.getTime() - entrada.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPaymentStatusText = (pagado: number, total: number) => {
    if (pagado === 0) return 'Sin abonos';
    if (pagado >= total) return 'Pagado totalmente';
    return 'Abono parcial';
  };

  const getPendingAmountColor = (pendiente: number, total: number) => {
    if (pendiente === 0) return 'text-green-600 dark:text-green-400';
    if (pendiente === total) return 'text-red-600 dark:text-red-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getPaymentStatus = (pendiente: number | null | undefined, total: number | null | undefined) => {
    if (pendiente === null || pendiente === undefined || total === null || total === undefined) {
      return { text: 'N/A', dot: 'bg-gray-400 dark:bg-gray-600' };
    }
    if (pendiente === 0) return { text: 'Pagado', dot: 'bg-[#3b82f6]' }; // Blue dot
    if (Math.abs(pendiente - total) < 0.01) return { text: 'Sin pagar', dot: 'bg-[#ef4444]' }; // Red dot
    return { text: 'Parcial', dot: 'bg-yellow-500' }; // Yellow dot
  };

  return (
    <div className="rounded-[1rem] border border-gray-100 dark:border-border overflow-hidden bg-white dark:bg-card shadow-sm w-full">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-sm text-left relative">
          <thead className="bg-waiwa-sky dark:bg-waiwa-amber text-[#64748b] dark:text-muted-foreground text-[13px] font-semibold border-b border-gray-100 dark:border-border">
            <tr>
              <th className="px-5 py-4 whitespace-nowrap font-medium dark:text-black">Código</th>
              <th className="px-5 py-4 whitespace-nowrap font-medium dark:text-black">Huésped</th>
              <th className="px-5 py-4 whitespace-nowrap font-medium dark:text-black">Inmueble</th>
              <th className="px-5 py-4 whitespace-nowrap font-medium dark:text-black">Fechas</th>
              <th className="px-5 py-4 whitespace-nowrap font-medium dark:text-black">Noches</th>
              <th className="px-5 py-4 whitespace-nowrap font-medium text-center dark:text-black">Huéspedes</th>
              <th className="px-5 py-4 whitespace-nowrap font-medium dark:text-black">Total Reserva</th>
              <th className="px-5 py-4 whitespace-nowrap font-medium dark:text-black">Total Pagado</th>
              <th className="px-5 py-4 whitespace-nowrap font-medium dark:text-black">Total Pendiente</th>
              <th className="px-5 py-4 whitespace-nowrap font-medium dark:text-black">Estado de Pago</th>
              <th className="px-5 py-4 whitespace-nowrap font-medium text-center dark:text-black">Plataforma</th>
              <th className="px-5 py-4 whitespace-nowrap font-medium text-center dark:text-black">Estado</th>
              <th className="px-5 py-4 whitespace-nowrap font-medium text-center dark:text-black">TRA</th>
              <th className="px-5 py-4 whitespace-nowrap dark:text-black font-medium text-center sticky right-0 bg-waiwa-sky dark:bg-waiwa-amber shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] border-l border-gray-100 dark:border-border z-10 w-[200px]">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-border/50 bg-white dark:bg-card">
            {reservas.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-6 py-12 text-center text-gray-500 dark:text-muted-foreground">
                  No hay reservas registradas
                </td>
              </tr>
            ) : (
              reservas.map((reserva) => {
                const noches = calcularNoches(reserva.fecha_inicio, reserva.fecha_fin);
                const paymentInfo = getPaymentStatus(reserva.total_pendiente, reserva.total_reserva);

                return (
                  <tr key={reserva.id} className="hover:bg-gray-50/80 dark:hover:bg-muted/20 transition-colors group">
                    <td className="px-5 py-2 whitespace-nowrap">
                      <div className="font-semibold text-gray-900 dark:text-foreground">
                        {reserva.codigo_reserva}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-muted-foreground mt-0.5">
                        {formatShortDate(reserva.fecha_creacion)}
                      </div>
                    </td>

                    <td className="px-5 py-2 whitespace-nowrap">
                      <div className="font-semibold text-gray-900 dark:text-foreground text-wrap">
                        {reserva.huesped_principal?.nombre} {reserva.huesped_principal?.apellido}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-muted-foreground mt-0.5">
                        {reserva.huesped_principal?.email}
                      </div>
                    </td>

                    <td className="px-5 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-700 dark:bg-gray-300"></div>
                        <span className="text-gray-600 dark:text-gray-300 font-medium text-[13px]">{reserva.nombre_inmueble}</span>
                      </div>
                    </td>

                    <td className="px-5 py-2 whitespace-nowrap text-gray-600 dark:text-gray-400 text-[13px]">
                      <div>E: {formatShortDate(reserva.fecha_inicio)}</div>
                      <div>S: {formatShortDate(reserva.fecha_fin)}</div>
                    </td>

                    <td className="px-5 py-2 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1.5 text-gray-600 dark:text-gray-400">
                        <div className="text-xs text-gray-400 dark:text-muted-foreground mt-0.5 font-medium">
                          {noches} noche(s)
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-2 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1.5 text-gray-600 dark:text-gray-400">
                        <span className="font-medium text-[13px]">{reserva.numero_huespedes}</span>
                        <button
                          onClick={() => onViewHuespedes(reserva)}
                          className="hover:text-tourism-teal transition-colors"
                          title="Ver lista de huéspedes"
                        >
                          <Users className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>

                    <td className="px-5 py-2 whitespace-nowrap">
                      <div className="text-[13px] font-semibold text-gray-900 dark:text-foreground">
                        {reserva.total_reserva !== null && reserva.total_reserva !== undefined
                          ? formatCurrency(reserva.total_reserva)
                          : <span className="text-gray-400">null</span>
                        }
                      </div>
                    </td>

                    <td className="px-5 py-2 whitespace-nowrap">
                      <div className="text-[13px] font-semibold text-gray-900 dark:text-foreground">
                        {reserva.total_pagado !== null && reserva.total_pagado !== undefined
                          ? formatCurrency(reserva.total_pagado)
                          : <span className="text-gray-400">null</span>
                        }
                      </div>
                      {reserva.total_pagado !== null && reserva.total_pagado !== undefined &&
                        reserva.total_reserva !== null && reserva.total_reserva !== undefined ? (
                        <div className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5">
                          {getPaymentStatusText(reserva.total_pagado, reserva.total_reserva)}
                        </div>
                      ) : null}
                    </td>

                    <td className="px-5 py-2 whitespace-nowrap">
                      {reserva.total_pendiente !== null && reserva.total_pendiente !== undefined &&
                        reserva.total_reserva !== null && reserva.total_reserva !== undefined ? (
                        <div className={`text-[13px] font-bold ${getPendingAmountColor(
                          reserva.total_pendiente,
                          reserva.total_reserva
                        )}`}>
                          {formatCurrency(reserva.total_pendiente)}
                        </div>
                      ) : (
                        <div className="text-[13px] font-semibold text-gray-900 dark:text-foreground">
                          <span className="text-gray-400">null</span>
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <div className={`w-1.5 h-1.5 rounded-full ${paymentInfo.dot}`}></div>
                        <span className="text-[13px] font-medium">{paymentInfo.text}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-center">
                      <PlataformaBadge plataforma={reserva.plataforma_origen} />
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-center">
                      <span className={getEstadoBadge(reserva.estado)}>
                        {reserva.estado.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-center">
                      {tarjetas
                        .filter((t) => t.id_reserva === reserva.id)
                        .map((tarjeta) => (
                          <span key={tarjeta.id} className={getEstadoBadge(tarjeta.estado)}>
                            {tarjeta.estado.replace('_', ' ')}
                          </span>
                        ))}
                      {tarjetas.filter(t => t.id_reserva === reserva.id).length === 0 && (
                        <span className="text-gray-400 dark:text-muted-foreground text-xs italic">No generado</span>
                      )}
                    </td>

                    <td className="flex w-full h-full items-center justify-center text-center text-gray-500 dark:text-gray-400 justify-center items-center gap-1 sticky right-0 bg-white dark:bg-card border-l border-gray-100 dark:border-border transition-colors h-full z-100 w-[160px] h-[100px]">
                      <button onClick={() => onViewDetail(reserva)} className="rounded-md hover:bg-green-100 hover:text-green-800 dark:hover:bg-green-900/40 dark:hover:text-green-400 border border-transparent transition-colors items-center justify-center" title="Ver detalle">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => onViewPagos(reserva)} className="rounded-md hover:bg-tourism-teal/10 hover:text-tourism-teal border border-transparent transition-colors items-center justify-center" title="Pagos">
                        <CreditCard className="h-4 w-4" />
                      </button>
                      <button onClick={() => canEdit && onEdit(reserva)} disabled={!canEdit} className={`rounded-md border border-transparent transition-colors items-center justify-center ${canEdit ? "hover:bg-blue-100 hover:text-blue-800 dark:hover:bg-blue-900/40 dark:hover:text-blue-400" : "cursor-not-allowed opacity-50"}`} title="Editar">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => canDelete && onDelete(reserva)} disabled={!canDelete} className={`rounded-md border border-transparent transition-colors items-center justify-center ${canDelete ? "hover:bg-red-100 hover:text-red-800 dark:hover:bg-red-900/40 dark:hover:text-red-400" : "cursor-not-allowed opacity-50"}`} title="Eliminar">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button onClick={async () => {
                        const baseUrl = process.env.NEXT_PUBLIC_FORM_URL || window.location.origin.replace('3001', '3000');
                        const link = `${baseUrl}/checkin?reserva=${reserva.id}`;
                        const success = await copyToClipboard(link);
                        if (success) alert(`Enlace copiado al portapapeles: ${link}`);
                        else alert(`No se pudo copiar el enlace automáticamente: ${link}`);
                      }} className="rounded-md hover:bg-purple-100 hover:text-purple-800 dark:hover:bg-purple-900/40 dark:hover:text-purple-400 border border-transparent transition-colors" title="Compartir Check-in">
                        <Share2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => canSendTarjeta && onViewTarjeta(reserva)} disabled={!canSendTarjeta} className={`rounded-md border border-transparent transition-colors ${canSendTarjeta ? "hover:bg-amber-100 hover:text-amber-800 dark:hover:bg-amber-900/40 dark:hover:text-amber-400" : "cursor-not-allowed opacity-50"}`} title="Enviar TRA">
                        <Leaf className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReservasTable;
