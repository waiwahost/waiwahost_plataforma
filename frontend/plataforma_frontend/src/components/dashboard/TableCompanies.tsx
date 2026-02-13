import React from 'react';
import { Edit2, Trash2, PowerOff, Eye } from 'lucide-react';
import { IEmpresa } from '../../interfaces/Empresa';

interface TableCompaniesProps {
    empresas: IEmpresa[];
    loading: boolean;
    onEdit: (empresa: IEmpresa) => void;
    onSoftDelete: (id: number) => void;
    onHardDelete: (id: number) => void;
    onViewDetails: (empresa: IEmpresa) => void;
}

const TableCompanies: React.FC<TableCompaniesProps> = ({
    empresas,
    loading,
    onEdit,
    onSoftDelete,
    onHardDelete,
    onViewDetails
}) => {
    return (
        <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIT</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                        <tr><td colSpan={6} className="text-center py-8 text-gray-500">Cargando empresas...</td></tr>
                    ) : empresas.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-8 text-gray-500">No hay empresas registradas.</td></tr>
                    ) : (
                        empresas.map((emp) => (
                            <tr key={emp.id_empresa} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.id_empresa}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{emp.nombre}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.nit}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => onViewDetails(emp)}
                                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                            title="Ver Detalles"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => onEdit(emp)}
                                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                                            title="Editar"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>

                                            <button
                                                onClick={() => onSoftDelete(emp.id_empresa!)}
                                                className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50"
                                                title="Desactivar"
                                            >
                                                <PowerOff className="h-4 w-4" />
                                            </button>

                                        <button
                                            onClick={() => onHardDelete(emp.id_empresa!)}
                                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                            title="Eliminar Permanentemente"
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

export default TableCompanies;
