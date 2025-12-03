import { apiFetch } from './apiFetch';
import { IHuespedTableData, IHuespedEditableFields, IHuespedDetailData } from '../interfaces/Huesped';

// Obtener todos los huéspedes
export const getHuespedesApi = async (id_empresa?: number): Promise<IHuespedTableData[]> => {
  try {
    const url = id_empresa
      ? `/api/huespedes/getHuespedes?id_empresa=${id_empresa}`
      : '/api/huespedes';

    const data = await apiFetch(url, {
      method: 'GET',
    });

    return data as IHuespedTableData[];
  } catch (error) {
    console.error('Error en getHuespedesApi:', error);
    throw error;
  }
};

// Crear nuevo huésped
export const createHuespedApi = async (huespedData: any): Promise<IHuespedTableData> => {
  try {
    const data = await apiFetch('/api/huespedes/createHuesped', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(huespedData),
    });

    return data as IHuespedTableData;
  } catch (error) {
    console.error('Error en createHuespedApi:', error);
    throw error;
  }
};

// Actualizar huésped (solo campos editables)
export const editHuespedApi = async (id: number, huespedData: any): Promise<IHuespedTableData> => {
  try {
    // Filtrar solo los campos editables
    const editableFields: IHuespedEditableFields = {};

    if (huespedData.nombre !== undefined) editableFields.nombre = huespedData.nombre;
    if (huespedData.apellido !== undefined) editableFields.apellido = huespedData.apellido;
    if (huespedData.email !== undefined) editableFields.email = huespedData.email;
    if (huespedData.telefono !== undefined) editableFields.telefono = huespedData.telefono;
    if (huespedData.direccion !== undefined) editableFields.direccion = huespedData.direccion;
    if (huespedData.fecha_nacimiento !== undefined) editableFields.fecha_nacimiento = huespedData.fecha_nacimiento;
    if (huespedData.estado !== undefined) editableFields.estado = huespedData.estado;
    if (huespedData.id_empresa !== undefined) editableFields.id_empresa = huespedData.id_empresa;

    console.log('Sending editable fields:', editableFields);

    const data = await apiFetch(`/api/huespedes/editHuesped/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editableFields),
    });

    return data as IHuespedTableData;
  } catch (error) {
    console.error('Error en editHuespedApi:', error);
    throw error;
  }
};

// Eliminar huésped
export const deleteHuespedApi = async (id: number): Promise<void> => {
  try {
    await apiFetch(`/api/huespedes/deleteHuesped?id=${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error en deleteHuespedApi:', error);
    throw error;
  }
};

// Obtener detalle de un huésped
export const getHuespedDetalleApi = async (id: number): Promise<IHuespedDetailData> => {
  try {
    const data = await apiFetch(`/api/huespedes/getHuespedDetalle?id=${id}`, {
      method: 'GET',
    });

    return data as IHuespedDetailData;
  } catch (error) {
    console.error('Error en getHuespedDetalleApi:', error);
    throw error;
  }
};