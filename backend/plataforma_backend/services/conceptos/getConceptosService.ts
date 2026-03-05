import { ConceptosRepository } from '../../repositories/conceptos.repository';
import { ROLES } from '../../constants/globalConstants';

const repo = new ConceptosRepository();

interface UserContext {
    id: number;
    id_roles: number;
    role: string;
    empresaId: number | null;
}

export class GetConceptosServiceClass {
    async execute(
        userContext: UserContext,
        params: { tipo?: string; busqueda?: string; id_empresa?: number }
    ) {
        try {
            // SUPERADMIN puede ver todos los conceptos o filtrar por empresa
            if (userContext.id_roles === ROLES.SUPERADMIN) {
                const { data, error } = await repo.getConceptos({
                    tipo: params.tipo,
                    busqueda: params.busqueda,
                    id_empresa: params.id_empresa, // undefined = todos
                });
                if (error) return { data: null, error: { status: 500, message: 'Error al obtener conceptos', details: error } };
                return { data, error: null };
            }

            // EMPRESA / ADMINISTRADOR / PROPIETARIO: solo globales + su empresa
            const empresaId = Number(userContext.empresaId);
            if (!empresaId) {
                return { data: null, error: { status: 403, message: 'Usuario sin empresa asignada', details: null } };
            }

            const { data, error } = await repo.getConceptos({
                tipo: params.tipo,
                busqueda: params.busqueda,
                id_empresa: empresaId,
            });
            if (error) return { data: null, error: { status: 500, message: 'Error al obtener conceptos', details: error } };
            return { data, error: null };

        } catch (error) {
            return { data: null, error: { status: 500, message: 'Error interno del servidor', details: error } };
        }
    }
}

export const getConceptosService = new GetConceptosServiceClass();
