import { apiFetch } from './apiFetch';
import { IPropietarioTableData, IPropietarioEditableFields } from '../interfaces/Propietario';

// Obtener todos los propietarios
export const getPropietariosApi = async (id_empresa?: number): Promise<IPropietarioTableData[]> => {
  try {
    const url = id_empresa 
      ? `/api/propietarios/getPropietarios?id_empresa=${id_empresa}`
      : '/api/propietarios/getPropietarios';
    
    const response = await apiFetch(url, {
      method: 'GET',
    });

    if (response.isError) {
      throw new Error(response.message || 'Error al obtener propietarios');
    }

    return response.data;
  } catch (error) {
    console.error('Error en getPropietariosApi:', error);
    throw error;
  }
};

// Crear nuevo propietario
export const createPropietarioApi = async (propietarioData: any): Promise<IPropietarioTableData> => {
  try {
    const response = await apiFetch('/api/propietarios/createPropietario', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(propietarioData),
    });

    if (response.isError) {
      throw new Error(response.message || 'Error al crear propietario');
    }

    return response.data;
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

    const response = await apiFetch(`/api/propietarios/editPropietario?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editableFields),
    });

    if (response.isError) {
      throw new Error(response.message || 'Error al actualizar propietario');
    }

    return response.data;
  } catch (error) {
    console.error('Error en editPropietarioApi:', error);
    throw error;
  }
};

// Eliminar propietario
export const deletePropietarioApi = async (id: number): Promise<void> => {
  try {
    const response = await apiFetch(`/api/propietarios/deletePropietario?id=${id}`, {
      method: 'DELETE',
    });

    if (response.isError) {
      throw new Error(response.message || 'Error al eliminar propietario');
    }
  } catch (error) {
    console.error('Error en deletePropietarioApi:', error);
    throw error;
  }
};

// Obtener inmuebles de un propietario
export const getInmueblesPropietarioApi = async (propietarioId: number) => {
  try {
    const response = await apiFetch(`/api/propietarios/getInmueblesPropietario?propietario_id=${propietarioId}`, {
      method: 'GET',
    });

    if (response.isError) {
      throw new Error(response.message || 'Error al obtener inmuebles del propietario');
    }

    return response.data;
  } catch (error) {
    console.error('Error en getInmueblesPropietarioApi:', error);
    throw error;
  }
};

// Obtener detalle de un inmueble
export const getInmuebleDetalleApi = async (inmuebleId: string) => {
  try {
    const response = await apiFetch(`/api/inmuebles/getInmuebleDetalle?id=${inmuebleId}`, {
      method: 'GET',
    });

    if (!response.success) {
      throw new Error(response.message || 'Error al obtener detalle del inmueble');
    }

    return response.data;
  } catch (error) {
    console.error('Error en getInmuebleDetalleApi:', error);
    throw error;
  }
};
