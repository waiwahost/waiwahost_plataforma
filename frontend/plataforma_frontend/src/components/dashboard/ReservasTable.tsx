import React from 'react';
import { Edit2, Trash2, Eye, Users, CreditCard, Share2, Leaf } from 'lucide-react';
import { IReservaTableData } from '../../interfaces/Reserva';
import PlataformaBadge from '../atoms/PlataformaBadge';
import ScrollableTable from '../ui/ScrollableTable';
import { copyToClipboard } from '../../lib/utils';

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

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    // Si viene como string ISO (2025-12-14T00:00:00.000Z), tomar solo la parte de la fecha
    const fechaParte = dateString.split('T')[0];
    if (!fechaParte) return '-';

    const [year, month, day] = fechaParte.split('-').map(Number);
    // Crear fecha localmente usando los componentes (mes es 0-indexed)
    const date = new Date(year, month - 1, day);

    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('es-ES');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPendingAmountColor = (pendiente: number, total: number) => {
    if (pendiente === 0) return 'text-green-600'; // Totalmente pagado
    if (pendiente === total) return 'text-red-600'; // Sin abonos
    return 'text-orange-600'; // Abono parcial
  };

  const getPaymentStatus = (pagado: number, total: number) => {
    if (pagado === 0) return 'Sin abonos';
    if (pagado >= total) return 'Pagado totalmente';
    return 'Abono parcial';
  };

  const getEstadoBadge = (estado: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";

    switch (estado) {
      case 'pendiente':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'confirmada':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'en_proceso':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'completada':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'cancelada':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
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
  

  return (
    <ScrollableTable className="shadow-sm">
      <table className="min-w-full bg-white scrollable-table">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Código
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Huésped
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Inmueble
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fechas
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Huéspedes
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Reserva
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Pagado
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Pendiente
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Plataforma
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              TRA
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {reservas.length === 0 ? (
            <tr>
              <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                No hay reservas registradas
              </td>
            </tr>
          ) : (
            reservas.map((reserva) => (
              <tr key={reserva.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {reserva.codigo_reserva}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(reserva.fecha_creacion)}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {reserva.huesped_principal.nombre} {reserva.huesped_principal.apellido}
                  </div>
                  <div className="text-xs text-gray-500">
                    {reserva.huesped_principal.email}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {reserva.nombre_inmueble}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div>E: {formatDate(reserva.fecha_inicio)}</div>
                    <div>S: {formatDate(reserva.fecha_fin)}</div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {calcularNoches(reserva.fecha_inicio, reserva.fecha_fin)} noche(s)
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-900 font-medium">
                      {reserva.numero_huespedes}
                    </span>
                    <button
                      onClick={() => onViewHuespedes(reserva)}
                      className="inline-flex items-center p-1 rounded-md text-tourism-teal hover:bg-tourism-teal/10 hover:text-tourism-teal transition-colors"
                      title="Ver lista de huéspedes"
                    >
                      <Users className="h-4 w-4" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {reserva.total_reserva !== null && reserva.total_reserva !== undefined
                      ? formatCurrency(reserva.total_reserva)
                      : <span className="text-gray-500">null</span>
                    }
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {reserva.total_pagado !== null && reserva.total_pagado !== undefined
                      ? formatCurrency(reserva.total_pagado)
                      : <span className="text-gray-500">null</span>
                    }
                  </div>
                  {reserva.total_pagado !== null && reserva.total_pagado !== undefined &&
                    reserva.total_reserva !== null && reserva.total_reserva !== undefined ? (
                    <div className="text-xs text-gray-500">
                      {getPaymentStatus(reserva.total_pagado, reserva.total_reserva)}
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {reserva.total_pendiente !== null && reserva.total_pendiente !== undefined &&
                    reserva.total_reserva !== null && reserva.total_reserva !== undefined ? (
                    <div className={`text-sm font-medium ${getPendingAmountColor(
                      reserva.total_pendiente,
                      reserva.total_reserva
                    )}`}>
                      {formatCurrency(reserva.total_pendiente)}
                    </div>
                  ) : (
                    <div className="text-sm font-medium text-gray-900">
                      <span className="text-gray-500">null</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <PlataformaBadge plataforma={reserva.plataforma_origen} />
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={getEstadoBadge(reserva.estado)}>
                    {reserva.estado.replace('_', ' ')}
                  </span>
                </td>
                

                  <td className="px-4 py-4 whitespace-nowrap">
                  {tarjetas
                    .filter((t) => t.id_reserva === reserva.id) 
                    .map((tarjeta) => (
                      <span key={tarjeta.id} className={getEstadoBadge(tarjeta.estado)}>
                        {tarjeta.estado.replace('_', ' ')}
                      </span>
                    ))}
                  {/* Opcional: Mostrar algo si no hay tarjeta */}
                  {tarjetas.filter(t => t.id_reserva === reserva.id).length === 0 && (
                    <span className="text-gray-400 text-xs italic">No generado</span>
                  )}
                </td>

                <td className="px-1 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-0.5">
                    <button
                      onClick={() => onViewDetail(reserva)}
                      className="inline-flex items-center p-1 rounded-md text-green-600 hover:bg-green-50 hover:text-green-800 transition-colors"
                      title="Ver detalles de la reserva"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onViewPagos(reserva)}
                      className="inline-flex items-center p-1 rounded-md text-tourism-teal hover:bg-tourism-teal/10 hover:text-tourism-teal transition-colors"
                      title="Gestionar pagos"
                    >
                      <CreditCard className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(reserva)}
                      disabled={!canEdit}
                      className={`inline-flex items-center p-1 rounded-md transition-colors ${canEdit
                        ? 'text-blue-600 hover:bg-blue-50 hover:text-blue-800'
                        : 'text-gray-400 cursor-not-allowed'
                        }`}
                      title={canEdit ? 'Editar reserva' : 'No tienes permisos para editar'}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(reserva)}
                      disabled={!canDelete}
                      className={`inline-flex items-center p-1 rounded-md transition-colors ${canDelete
                        ? 'text-red-600 hover:bg-red-50 hover:text-red-800'
                        : 'text-gray-400 cursor-not-allowed'
                        }`}
                      title={canDelete ? 'Eliminar reserva' : 'No tienes permisos para eliminar'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={async () => {
                        const baseUrl = process.env.NEXT_PUBLIC_FORM_URL || window.location.origin.replace('3001', '3000'); // Fallback inteligente
                        const link = `${baseUrl}/checkin?reserva=${reserva.id}`;

                        const success = await copyToClipboard(link);
                        if (success) {
                          alert(`Enlace copiado al portapapeles: ${link}`);
                        } else {
                          alert(`No se pudo copiar el enlace automáticamente. Por favor copia manualmente: ${link}`);
                        }
                      }}
                      className="inline-flex items-center p-1 rounded-md text-purple-600 hover:bg-purple-50 hover:text-purple-800 transition-colors"
                      title="Compartir enlace formulario"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => onViewTarjeta(reserva)}
                      disabled={!canSendTarjeta}
                      className={`inline-flex items-center p-1 rounded-md transition-colors ${canSendTarjeta
                        ? 'text-black-600 hover:bg-black-50 hover:text-black-800'
                        : 'text-gray-400 cursor-not-allowed'
                        }`}
                      title={canSendTarjeta ? 'Enviar TRA' : 'No tienes permisos para eliminar'}
                    >
                      <Leaf className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </ScrollableTable>
  );
};

export default ReservasTable;
