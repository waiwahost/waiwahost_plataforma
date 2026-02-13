import React from 'react';
import { IEmpresa } from '../../interfaces/Empresa';
import { X, Building2, FileText } from 'lucide-react';

interface ShowDetailsCompaniesProps {
    open: boolean;
    onClose: () => void;
    empresa: IEmpresa | null;
}

const ShowDetailsCompanies: React.FC<ShowDetailsCompaniesProps> = ({ open, onClose, empresa }) => {
    if (!open || !empresa) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-tourism-teal/10 rounded-lg">
                            <Building2 className="h-6 w-6 text-tourism-teal" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{empresa.nombre}</h2>
                            <p className="text-sm text-gray-500">Detalles de la empresa</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Información Principal */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-tourism-teal" />
                            Información General
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500 block">Identificación (NIT)</span>
                                <span className="font-medium text-gray-900">{empresa.nit || 'No registrado'}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">ID Interno</span>
                                <span className="font-medium text-gray-900">#{empresa.id_empresa}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShowDetailsCompanies;
