import { apiFetch } from './apiFetch';
import { IPropietarioTableData, IPropietarioEditableFields } from '../interfaces/Propietario';

// Obtener todos los propietarios
export const getPropietariosApi = async (): Promise<IPropietarioTableData[]> => {
  try {
    const url = '/api/propietarios/getPropietarios';

    const data = await apiFetch(url, {
      method: 'GET',
    });

    return data as IPropietarioTableData[];
  } catch (error) {
    console.error('Error en getPropietariosApi:', error);
    throw error;
  }
};

// Crear nuevo propietario
export const createPropietarioApi = async (propietarioData: any): Promise<IPropietarioTableData> => {
  try {
    const data = await apiFetch('/api/propietarios/createPropietario', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(propietarioData),
    });

    return data as IPropietarioTableData;
  } catch (error) {
    console.error('Error en createPropietarioApi:', error);
    throw error;
  }
};

// Actualizar propietario (solo campos editables)
export const editPropietarioApi = async (id: number, propietarioData: any): Promise<IPropietarioTableData> => {
  try {
    // Filtrar solo los campos editables
    const editableFields: IPropietarioEditableFields = {};

    if (propietarioData.nombre !== undefined) editableFields.nombre = propietarioData.nombre;
    if (propietarioData.apellido !== undefined) editableFields.apellido = propietarioData.apellido;
    if (propietarioData.email !== undefined) editableFields.email = propietarioData.email;
    if (propietarioData.telefono !== undefined) editableFields.telefono = propietarioData.telefono;
    if (propietarioData.direccion !== undefined) editableFields.direccion = propietarioData.direccion;
    if (propietarioData.estado !== undefined) editableFields.estado = propietarioData.estado;
    if (propietarioData.id_empresa !== undefined) editableFields.id_empresa = propietarioData.id_empresa;

    console.log('Sending editable fields:', editableFields);

    const data = await apiFetch(`/api/propietarios/editPropietario?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editableFields),
    });

    return data as IPropietarioTableData;
  } catch (error) {
    console.error('Error en editPropietarioApi:', error);
    throw error;
  }
};

// Eliminar propietario
export const deletePropietarioApi = async (id: number): Promise<void> => {
  try {
    await apiFetch(`/api/propietarios/deletePropietario?id=${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error en deletePropietarioApi:', error);
    throw error;
  }
};

// Obtener inmuebles de un propietario
export const getInmueblesPropietarioApi = async (propietarioId: number) => {
  try {
    const data = await apiFetch(`/api/propietarios/getInmueblesPropietario?propietario_id=${propietarioId}`, {
      method: 'GET',
    });

    return data;
  } catch (error) {
    console.error('Error en getInmueblesPropietarioApi:', error);
    throw error;
  }
};

// Obtener detalle de un inmueble
export const getInmuebleDetalleApi = async (inmuebleId: string) => {
  try {
    const data = await apiFetch(`/api/inmuebles/getInmuebles?id=${inmuebleId}`, {
      method: 'GET',
    });

    return data;
  } catch (error) {
    console.error('Error en getInmuebleDetalleApi:', error);
    throw error;
  }
};
