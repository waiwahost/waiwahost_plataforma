import React from 'react';
import { Edit2, Trash2, Eye } from 'lucide-react';
import { IPropietarioTableData } from '../../interfaces/Propietario';

interface PropietariosTableProps {
  propietarios: IPropietarioTableData[];
  onEdit: (propietario: IPropietarioTableData) => void;
  onDelete: (propietario: IPropietarioTableData) => void;
  onViewDetail: (propietario: IPropietarioTableData) => void;
  onInmuebleClick: (inmuebleId: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const PropietariosTable: React.FC<PropietariosTableProps> = ({
  propietarios = [],
  onEdit,
  onDelete,
  onViewDetail,
  onInmuebleClick,
  canEdit = true,
  canDelete = true
}) => {
  const renderInmuebles = (inmuebles?: string[]) => {
    if (!inmuebles || inmuebles.length === 0) {
      return <span className="text-gray-400 text-sm">Sin inmuebles</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {inmuebles.map((inmuebleId) => (
          <button
            key={inmuebleId}
            onClick={() => onInmuebleClick(inmuebleId)}
            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
            title="Ver detalle del inmueble"
          >
            {inmuebleId}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre Completo
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cédula
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Teléfono
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Inmuebles
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {propietarios.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                No hay propietarios registrados
              </td>
            </tr>
          ) : (
            propietarios.map((propietario) => (
              <tr key={propietario.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {propietario.nombre} {propietario.apellido}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{propietario.cedula}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{propietario.email}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{propietario.telefono}</div>
                </td>
                <td className="px-4 py-4">
                  {renderInmuebles(propietario.inmuebles)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onViewDetail(propietario)}
                      className="inline-flex items-center p-2 rounded-md text-green-600 hover:bg-green-50 hover:text-green-800 transition-colors"
                      title="Ver detalle del propietario"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(propietario)}
                      disabled={!canEdit}
                      className={`inline-flex items-center p-2 rounded-md transition-colors ${canEdit
                          ? 'text-blue-600 hover:bg-blue-50 hover:text-blue-800'
                          : 'text-gray-400 cursor-not-allowed'
                        }`}
                      title={canEdit ? 'Editar propietario' : 'No tienes permisos para editar'}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(propietario)}
                      disabled={!canDelete}
                      className={`inline-flex items-center p-2 rounded-md transition-colors ${canDelete
                          ? 'text-red-600 hover:bg-red-50 hover:text-red-800'
                          : 'text-gray-400 cursor-not-allowed'
                        }`}
                      title={canDelete ? 'Eliminar propietario' : 'No tienes permisos para eliminar'}
                    >
                      <Trash2 className="h-4 w-4" />
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

export default PropietariosTable;
export type { IPropietarioTableData };
