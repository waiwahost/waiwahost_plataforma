import { apiFetch } from './apiFetch';
import { IPais } from '../interfaces/Pais';

export const getPaises = async (): Promise<IPais[]> => {
    return await apiFetch('/api/paises');
};
