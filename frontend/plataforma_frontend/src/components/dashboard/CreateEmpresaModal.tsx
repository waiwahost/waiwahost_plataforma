import React, { useEffect, useState } from 'react';
import { Button } from '../atoms/Button';
import { IEmpresa } from '../../interfaces/Empresa'; // Ensure this path is correct based on folder structure

interface CreateEmpresaModalProps {
    open: boolean;
    onClose: () => void;
    onCreate: (data: IEmpresa) => void;
    initialData?: IEmpresa;
    isEdit?: boolean;
}

const CreateEmpresaModal: React.FC<CreateEmpresaModalProps> = ({ open, onClose, onCreate, initialData, isEdit }) => {
    const [formData, setFormData] = useState<IEmpresa>({
        nombre: '',
        nit: '',
        plan_actual: 'premium',
        username: '',
        email: '',
        password: ''
    });

    useEffect(() => {
        if (open) {
            if (initialData && isEdit) {
                setFormData({
                    ...initialData,
                    password: '', // Don't show password on edit
                });
            } else {
                // Reset form for create
                setFormData({
                    nombre: '',
                    nit: '',
                    plan_actual: 'premium',
                    username: '',
                    email: '',
                    password: ''
                });
            }
        }
    }, [open, initialData, isEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreate(formData);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl overflow-y-auto max-h-[90vh]">
                <h2 className="text-xl font-bold mb-4">{isEdit ? 'Editar Empresa' : 'Nueva Empresa'}</h2>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Company Info Section */}
                    <div className="border-b pb-4 mb-4">
                        <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Información de la Empresa</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nombre Empresa</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-tourism-teal outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">NIT</label>
                                <input
                                    type="text"
                                    name="nit"
                                    value={formData.nit}
                                    onChange={handleChange}
                                    className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-tourism-teal outline-none"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Admin User Section (Create Only or Edit Optional) */}
                    <div className="border-b pb-4 mb-4">
                        <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                            {isEdit ? 'Actualizar Administrador (Opcional)' : 'Usuario Administrador'}
                        </h3>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nombre Usuario</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-tourism-teal outline-none"
                                    required={!isEdit} // Required only on creation
                                    placeholder={isEdit ? 'Dejar vacío si no cambia' : ''}
                                />
                            </div>

                            {!isEdit && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email Admin</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-tourism-teal outline-none"
                                        required={!isEdit}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-1">Contraseña</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-tourism-teal outline-none"
                                    required={!isEdit} // Required only on creation
                                    placeholder={isEdit ? 'Dejar vacío si no cambia' : ''}
                                    minLength={6}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={onClose}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="bg-tourism-teal text-white hover:bg-tourism-teal/90"
                        >
                            {isEdit ? 'Guardar Cambios' : 'Crear Empresa'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEmpresaModal;
