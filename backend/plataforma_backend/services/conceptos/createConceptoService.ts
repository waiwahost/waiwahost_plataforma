import { ConceptosRepository } from '../../repositories/conceptos.repository';
import { CreateConceptoData } from '../../interfaces/concepto.interface';
import { ROLES } from '../../constants/globalConstants';

const repo = new ConceptosRepository();

interface UserContext {
    id: number;
    id_roles: number;
    role: string;
    empresaId: number | null;
}

export class CreateConceptoServiceClass {
    async execute(userContext: UserContext, input: { nombre: string; slug?: string; tipo_movimiento: ('ingreso' | 'egreso' | 'deducible')[]; id_empresa?: number | null }) {
        try {
            let id_empresa: number | null;

            if (userContext.id_roles === ROLES.SUPERADMIN) {
                // SUPERADMIN puede crear globales (null) o de cualquier empresa
                id_empresa = input.id_empresa ?? null;
            } else {
                // EMPRESA / ADMINISTRADOR: solo puede crear para su propia empresa
                if (!userContext.empresaId) {
                    return { data: null, error: { status: 403, message: 'Usuario sin empresa asignada', details: null } };
                }
                id_empresa = Number(userContext.empresaId);
            }

            // Generar slug si no se proporcionó
            const slug = input.slug
                ? input.slug
                : input.nombre
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9\s_]/g, '')
                    .trim()
                    .replace(/\s+/g, '_');

            // Verificar que el slug no existe ya en el scope del usuario
            const { exists, error: slugError } = await repo.slugExiste(slug, id_empresa);
            if (slugError) return { data: null, error: { status: 500, message: 'Error al verificar el concepto', details: slugError } };

            if (exists) {
                return { data: null, error: { status: 409, message: `Ya existe un concepto con el identificador "${slug}"`, details: null } };
            }

            const data: CreateConceptoData = {
                nombre: input.nombre,
                slug,
                tipo_movimiento: input.tipo_movimiento,
                id_empresa,
            };

            const { data: concepto, error } = await repo.createConcepto(data);
            if (error) return { data: null, error: { status: 500, message: 'Error al crear el concepto', details: error } };

            return { data: concepto, error: null };

        } catch (error) {
            return { data: null, error: { status: 500, message: 'Error interno del servidor', details: error } };
        }
    }
}

export const createConceptoService = new CreateConceptoServiceClass();
