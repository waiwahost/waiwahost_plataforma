import React from 'react';
import { Eye, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { IMovimiento } from '../../interfaces/Movimiento';
import PlataformaBadge from '../atoms/PlataformaBadge';

interface MovimientosTableProps {
  movimientos: IMovimiento[];
  loading: boolean;
  onView: (movimiento: IMovimiento) => void;
  onEdit: (movimiento: IMovimiento) => void;
  onDelete: (movimiento: IMovimiento) => void;
}

const MovimientosTable: React.FC<MovimientosTableProps> = ({
  movimientos,
  loading,
  onView,
  onEdit,
  onDelete
}) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConceptoLabel = (concepto: string): string => {
    const conceptos: Record<string, string> = {
      reserva: 'Reserva',
      limpieza: 'Limpieza',
      deposito_garantia: 'Depósito de Garantía',
      servicios_adicionales: 'Servicios Adicionales',
      multa: 'Multa',
      mantenimiento: 'Mantenimiento',
      servicios_publicos: 'Servicios Públicos',
      suministros: 'Suministros',
      comision: 'Comisión',
      devolucion: 'Devolución',
      impuestos: 'Impuestos',
      otro: 'Otro'
    };
    return conceptos[concepto] || concepto;
  };

  const getMetodoPagoLabel = (metodo: string): string => {
    const metodos: Record<string, string> = {
      efectivo: 'Efectivo',
      transferencia: 'Transferencia',
      tarjeta: 'Tarjeta',
      otro: 'Otro'
    };
    return metodos[metodo] || metodo;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-tourism-navy">Movimientos del Día</h3>
        </div>
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-tourism-navy">Movimientos del Día</h3>
      </div>
      
      {movimientos.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-500">No hay movimientos registrados para esta fecha</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hora
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Concepto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inmueble
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reserva
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plataforma
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {movimientos.map((movimiento) => (
                <tr key={movimiento.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {formatTime(movimiento.fecha_creacion)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      {movimiento.tipo === 'ingreso' ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`font-medium capitalize ${
                        movimiento.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movimiento.tipo}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {getConceptoLabel(movimiento.concepto)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                    {movimiento.descripcion}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                    {movimiento.nombre_inmueble}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {movimiento.codigo_reserva ? (
                      <span className="text-tourism-teal font-medium">
                        {movimiento.codigo_reserva}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <PlataformaBadge plataforma={movimiento.plataforma_origen} showEmpty={false} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {getMetodoPagoLabel(movimiento.metodo_pago)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium">
                    <span className={movimiento.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}>
                      {movimiento.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(movimiento.monto)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onView(movimiento)}
                        className="p-1.5 text-gray-600 hover:text-tourism-teal hover:bg-tourism-teal/10 rounded transition-colors"
                        title="Ver detalle"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEdit(movimiento)}
                        className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(movimiento)}
                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MovimientosTable;