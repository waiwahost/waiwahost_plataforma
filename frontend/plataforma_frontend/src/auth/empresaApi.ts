/* eslint-disable @typescript-eslint/no-explicit-any */
import { IEmpresa } from '../interfaces/Empresa';

export interface EmpresaApiResponse<T = any> {
    isError: boolean;
    data: T;
    code: number;
    timestamp: string;
    message?: string;
}

const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

export async function getEmpresasApi(): Promise<EmpresaApiResponse<IEmpresa[]>> {
    try {
        const token = getToken();
        const response = await fetch('/api/empresas/getEmpresas', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        const result: EmpresaApiResponse<IEmpresa[]> = await response.json();
        return result;
    } catch (error: any) {
        console.error('❌ Error in getEmpresasApi:', error);
        return {
            isError: true,
            data: [],
            code: 500,
            timestamp: new Date().toISOString(),
            message: error.message || 'Error desconocido'
        };
    }
}

export async function createEmpresaApi(empresaData: IEmpresa): Promise<EmpresaApiResponse<IEmpresa | null>> {
    try {
        const token = getToken();
        const response = await fetch('/api/empresas/createEmpresa', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(empresaData),
        });

        const result: EmpresaApiResponse<IEmpresa | null> = await response.json();
        return result;
    } catch (error: any) {
        console.error('❌ Error in createEmpresaApi:', error);
        return {
            isError: true,
            data: null,
            code: 500,
            timestamp: new Date().toISOString(),
            message: error.message || 'Error desconocido'
        };
    }
}

export async function editEmpresaApi(id: number | string, empresaData: Partial<IEmpresa>): Promise<EmpresaApiResponse<IEmpresa | null>> {
    try {
        const token = getToken();
        const response = await fetch(`/api/empresas/editEmpresa?id=${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(empresaData),
        });

        const result: EmpresaApiResponse<IEmpresa | null> = await response.json();
        return result;
    } catch (error: any) {
        console.error('❌ Error in editEmpresaApi:', error);
        return {
            isError: true,
            data: null,
            code: 500,
            timestamp: new Date().toISOString(),
            message: error.message || 'Error desconocido'
        };
    }
}

export async function softEmpresaApi(id: number | string): Promise<EmpresaApiResponse<IEmpresa | null>> {
    try {
        const token = getToken();
        const response = await fetch(`/api/empresas/softEmpresa?id=${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        const result: EmpresaApiResponse<IEmpresa | null> = await response.json();
        return result;
    } catch (error: any) {
        console.error('❌ Error in softEmpresaApi:', error);
        return {
            isError: true,
            data: null,
            code: 500,
            timestamp: new Date().toISOString(),
            message: error.message || 'Error desconocido'
        };
    }
}

export async function deleteEmpresaApi(id: number | string): Promise<EmpresaApiResponse<IEmpresa | null>> {
    try {
        const token = getToken();
        const response = await fetch(`/api/empresas/deleteEmpresa?id=${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        const result: EmpresaApiResponse<IEmpresa | null> = await response.json();
        return result;
    } catch (error: any) {
        console.error('❌ Error in deleteEmpresaApi:', error);
        return {
            isError: true,
            data: null,
            code: 500,
            timestamp: new Date().toISOString(),
            message: error.message || 'Error desconocido'
        };
    }
}
