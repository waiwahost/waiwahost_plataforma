import React from 'react';
import { Eye, Edit2, Trash2, Share2 } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { IInmueble } from '../../interfaces/Inmueble';
import { copyToClipboard } from '../../lib/utils';

export interface IDataInmuebleIn extends IInmueble { }

interface InmueblesTableProps {
  inmuebles: IDataInmuebleIn[];
  onEdit: (inmueble: IDataInmuebleIn) => void;
  onDelete: (inmueble: IDataInmuebleIn) => void;
  onViewDetail: (inmueble: IDataInmuebleIn) => void;
}

const InmueblesTable: React.FC<InmueblesTableProps> = ({ inmuebles, onEdit, onDelete, onViewDetail }) => {
  const { user } = useAuth();
  const canEdit = user?.permisos?.includes('editar_inmuebles') || true; // TEMPORAL: siempre true para debugging
  const canDelete = user?.permisos?.includes('eliminar_inmuebles') || true; // TEMPORAL: siempre true para debugging

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID Inmueble
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Edificio
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Apartamento
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Comisión
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID Propietario
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {inmuebles.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                No hay inmuebles registrados
              </td>
            </tr>
          ) : (
            inmuebles.map((inmueble) => (
              <tr key={inmueble.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {inmueble.id_inmueble || inmueble.id}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{inmueble.edificio}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{inmueble.apartamento}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatCurrency(inmueble.comision)}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{inmueble.id_propietario}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onViewDetail(inmueble)}
                      className="inline-flex items-center p-2 rounded-md text-green-600 hover:bg-green-50 hover:text-green-800 transition-colors"
                      title="Ver detalle del inmueble"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(inmueble)}
                      disabled={!canEdit}
                      className={`inline-flex items-center p-2 rounded-md transition-colors ${canEdit
                        ? 'text-blue-600 hover:bg-blue-50 hover:text-blue-800'
                        : 'text-gray-400 cursor-not-allowed'
                        }`}
                      title={canEdit ? 'Editar inmueble' : 'No tienes permisos para editar'}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(inmueble)}
                      disabled={!canDelete}
                      className={`inline-flex items-center p-2 rounded-md transition-colors ${canDelete
                        ? 'text-red-600 hover:bg-red-50 hover:text-red-800'
                        : 'text-gray-400 cursor-not-allowed'
                        }`}
                      title={canDelete ? 'Eliminar inmueble' : 'No tienes permisos para eliminar'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={async () => {
                        const baseUrl = process.env.NEXT_PUBLIC_FORM_URL || window.location.origin.replace('3001', '3000'); // Fallback inteligente
                        const link = `${baseUrl}/checkin?inmueble=${inmueble.id_inmueble || inmueble.id}`;

                        const success = await copyToClipboard(link);
                        if (success) {
                          alert(`Enlace copiado al portapapeles: ${link}`);
                        } else {
                          alert(`No se pudo copiar el enlace automáticamente. Por favor copia manualmente: ${link}`);
                        }
                      }}
                      className="inline-flex items-center p-2 rounded-md text-purple-600 hover:bg-purple-50 hover:text-purple-800 transition-colors"
                      title="Compartir enlace formulario"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InmueblesTable;
