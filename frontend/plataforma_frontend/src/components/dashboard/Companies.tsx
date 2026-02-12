import React, { useEffect, useState } from 'react';
import { Button } from '../atoms/Button';
import { Plus, AlertTriangle } from 'lucide-react';
import { IEmpresa } from '../../interfaces/Empresa';
import {
    getEmpresasApi,
    createEmpresaApi,
    editEmpresaApi,
    softEmpresaApi,
    deleteEmpresaApi
} from '../../auth/empresaApi';
import CreateEmpresaModal from './CreateEmpresaModal';
import TableCompanies from './TableCompanies';
import ShowDetailsCompanies from './ShowDetailsCompanies';

const Companies: React.FC = () => {
    const [empresas, setEmpresas] = useState<IEmpresa[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedEmpresa, setSelectedEmpresa] = useState<IEmpresa | undefined>(undefined);

    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedEmpresaDetails, setSelectedEmpresaDetails] = useState<IEmpresa | null>(null);

    const fetchEmpresas = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getEmpresasApi();
            console.log("Empresas", result);

            if (result.isError) {
                if (result.code === 403) throw new Error("No tienes permisos para ver empresas.");
                throw new Error(result.message || 'Error al cargar empresas');
            }
            setEmpresas(result.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmpresas();
    }, []);

    const handleCreate = () => {
        setSelectedEmpresa(undefined);
        setIsEditMode(false);
        setIsModalOpen(true);
    };

    const handleEdit = (empresa: IEmpresa) => {
        setSelectedEmpresa(empresa);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleViewDetails = (empresa: IEmpresa) => {
        setSelectedEmpresaDetails(empresa);
        setIsDetailsOpen(true);
    };

    const handleSave = async (data: IEmpresa) => {
        try {
            let result;
            if (isEditMode && selectedEmpresa?.id_empresa) {
                // Edit
                result = await editEmpresaApi(selectedEmpresa.id_empresa, data);
            } else {
                // Create
                result = await createEmpresaApi(data);
            }

            if (result.isError) {
                throw new Error(result.message || 'Error al guardar empresa');
            }

            alert(isEditMode ? 'Empresa actualizada' : 'Empresa creada');
            setIsModalOpen(false);
            fetchEmpresas();
        } catch (err: any) {
            console.error(err);
            alert(err.message || 'Error en la operación');
        }
    };

    const handleSoftDelete = async (id: number | string) => {
        if (!window.confirm("¿Estás seguro de desactivar esta empresa? Los usuarios no podrán acceder.")) return;

        try {
            const result = await softEmpresaApi(id);
            if (result.isError) throw new Error(result.message);

            alert("Empresa desactivada exitosamente.");
            fetchEmpresas();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleHardDelete = async (id: number | string) => {
        const confirm1 = window.confirm("⚠️ ATENCIÓN: Estás a punto de eliminar PERMANENTEMENTE esta empresa y TODOS sus datos (Reservas, Inmuebles, Usuarios, etc).");
        if (!confirm1) return;

        const confirm2 = window.confirm("¿Estás realmente seguro? Esta acción NO se puede deshacer.");
        if (!confirm2) return;

        try {
            const result = await deleteEmpresaApi(id);
            if (result.isError) throw new Error(result.message);

            alert("Empresa eliminada permanentemente.");
            fetchEmpresas();
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Gestión de Empresas</h2>
                    <p className="text-gray-500 text-sm">Administración centralizada de todas las empresas en la plataforma.</p>
                </div>
                <Button
                    onClick={handleCreate}
                    className="bg-tourism-teal text-white flex items-center gap-2 hover:bg-tourism-teal/90"
                >
                    <Plus className="h-4 w-4" />
                    Nueva Empresa
                </Button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    {error}
                </div>
            )}

            <TableCompanies
                empresas={empresas}
                loading={loading}
                onEdit={handleEdit}
                onSoftDelete={(id) => handleSoftDelete(id)}
                onHardDelete={(id) => handleHardDelete(id)}
                onViewDetails={handleViewDetails}
            />

            <CreateEmpresaModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleSave}
                initialData={selectedEmpresa}
                isEdit={isEditMode}
            />

            <ShowDetailsCompanies
                open={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                empresa={selectedEmpresaDetails}
            />
        </div>
    );
};

export default Companies;
