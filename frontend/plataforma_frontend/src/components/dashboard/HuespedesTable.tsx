import React from 'react';
import { Edit2, Eye } from 'lucide-react';
import { IHuespedTableData } from '../../interfaces/Huesped';

interface HuespedesTableProps {
  huespedes: IHuespedTableData[];
  onEdit: (huesped: IHuespedTableData) => void;
  onViewDetail: (huesped: IHuespedTableData) => void;
  canEdit?: boolean;
}

const HuespedesTable: React.FC<HuespedesTableProps> = ({
  huespedes,
  onEdit,
  onViewDetail,
  canEdit = true
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Apellido
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Documento
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Correo
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contacto
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {huespedes.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                No hay huéspedes registrados
              </td>
            </tr>
          ) : (
            huespedes.map((huesped) => (
              <tr key={huesped.id_huesped} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {huesped.id_huesped}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{huesped.nombre}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{huesped.apellido}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{huesped.documento_numero}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{huesped.email}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{huesped.telefono}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      //onClick={() => onViewDetail(huesped)}
                      //className="inline-flex items-center p-2 rounded-md text-green-600 hover:bg-green-50 hover:text-green-800 transition-colors"
                      //title="Ver detalle del huésped"
                      onClick={() => { }}
                      disabled={true}
                      className="inline-flex items-center p-2 rounded-md text-gray-400 cursor-not-allowed"
                      title="Ver detalle del huésped (Deshabilitado)"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      //onClick={() => onEdit(huesped)}
                      //disabled={!canEdit}
                      //className={`inline-flex items-center p-2 rounded-md transition-colors ${
                      //  canEdit
                      //    ? 'text-blue-600 hover:bg-blue-50 hover:text-blue-800'
                      //    : 'text-gray-400 cursor-not-allowed'
                      //}`}
                      //title={canEdit ? 'Editar huésped' : 'No tienes permisos para editar'}
                      onClick={() => { }}
                      disabled={true}
                      className="inline-flex items-center p-2 rounded-md text-gray-400 cursor-not-allowed"
                      title="Editar huésped (Deshabilitado)"
                    >
                      <Edit2 className="h-4 w-4" />
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

export default HuespedesTable;
export type { IHuespedTableData };