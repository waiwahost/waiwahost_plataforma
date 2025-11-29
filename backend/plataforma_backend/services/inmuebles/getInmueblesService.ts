import { InmueblesRepository } from '../../repositories/inmuebles.repository';
import { ROLES } from '../../constants/globalConstants';

const inmueblesRepository = new InmueblesRepository();

/**
 * Obtiene los inmuebles visibles para el usuario autenticado según su rol y permisos.
 * @param userContext - Contexto del usuario autenticado
 * @param idEmpresa - ID de empresa opcional del query parameter
 * @param idInmueble - ID de inmueble específico opcional
 * @returns lista de inmuebles visibles o error
 */
export async function getInmueblesService(
  userContext: {
    id: number;
    id_roles: number;
    role: string;
    empresaId: number | null;
  },
  idEmpresa?: number,
  idInmueble?: number
) {
  try {
    // Si se solicita un inmueble específico por ID
    if (idInmueble) {
      const { data: inmueble, error } = await inmueblesRepository.getInmuebleById(idInmueble);
      
      if (error) {
        return { data: null, error: { status: 500, message: 'Error al obtener el inmueble', details: error } };
      }

      if (!inmueble) {
        return { data: null, error: { status: 404, message: 'Inmueble no encontrado', details: null } };
      }

      // Verificar permisos para ver este inmueble específico
      if (userContext.id_roles === ROLES.SUPERADMIN) {
        // Superadmin puede ver cualquier inmueble
        return { data: inmueble, error: null };
      }

      if (userContext.id_roles === ROLES.EMPRESA || userContext.id_roles === ROLES.ADMINISTRADOR) {
        // Verificar que el inmueble pertenezca a su empresa
        if (inmueble.id_empresa !== userContext.empresaId) {
          return { data: null, error: { status: 403, message: 'No tiene permisos para ver este inmueble', details: null } };
        }
        return { data: inmueble, error: null };
      }

      if (userContext.id_roles === ROLES.PROPIETARIO) {
        // Verificar que el inmueble pertenezca al propietario y a su empresa
        const { data: propietarioId, error: propError } = await inmueblesRepository.getPropietarioIdByUserId(userContext.id);
        if (propError || !propietarioId) {
          return { data: null, error: { status: 403, message: 'Usuario no está registrado como propietario', details: propError } };
        }

        if (inmueble.id_empresa !== userContext.empresaId || inmueble.id_propietario !== propietarioId) {
          return { data: null, error: { status: 403, message: 'No tiene permisos para ver este inmueble', details: null } };
        }
        return { data: inmueble, error: null };
      }

      return { data: null, error: { status: 403, message: 'Rol no autorizado', details: null } };
    }

    // Superadmin: puede ver todos los inmuebles o filtrar por empresa
    if (userContext.id_roles === ROLES.SUPERADMIN) {
      if (idEmpresa) {
        // Si se proporciona id_empresa, filtrar por empresa
        const { data: inmuebles, error } = await inmueblesRepository.getInmueblesByEmpresa(idEmpresa);
        if (error) {
          return { data: null, error: { status: 500, message: 'Error al obtener los inmuebles', details: error } };
        }
        return { data: inmuebles, error: null };
      } else {
        // Si no se proporciona id_empresa, mostrar todos
        const { data: inmuebles, error } = await inmueblesRepository.getAllInmuebles();
        if (error) {
          return { data: null, error: { status: 500, message: 'Error al obtener los inmuebles', details: error } };
        }
        return { data: inmuebles, error: null };
      }
    }

    // Empresa o Administrador: solo pueden ver inmuebles de su empresa
    if (userContext.id_roles === ROLES.EMPRESA || userContext.id_roles === ROLES.ADMINISTRADOR) {
      if (!userContext.empresaId) {
        return { data: null, error: { status: 403, message: 'Usuario no tiene empresa asignada', details: null } };
      }

      const { data: inmuebles, error } = await inmueblesRepository.getInmueblesByEmpresa(userContext.empresaId);
      if (error) {
        return { data: null, error: { status: 500, message: 'Error al obtener los inmuebles', details: error } };
      }
      return { data: inmuebles, error: null };
    }

    // Propietario: solo puede ver inmuebles de su empresa y que le pertenezcan
    if (userContext.id_roles === ROLES.PROPIETARIO) {
      if (!userContext.empresaId) {
        return { data: null, error: { status: 403, message: 'Usuario no tiene empresa asignada', details: null } };
      }

      // Obtener el id_propietario del usuario
      const { data: propietarioId, error: propError } = await inmueblesRepository.getPropietarioIdByUserId(userContext.id);
      if (propError) {
        return { data: null, error: { status: 500, message: 'Error al obtener información del propietario', details: propError } };
      }

      if (!propietarioId) {
        return { data: null, error: { status: 403, message: 'Usuario no está registrado como propietario', details: null } };
      }

      const { data: inmuebles, error } = await inmueblesRepository.getInmueblesByEmpresaAndPropietario(
        userContext.empresaId,
        propietarioId
      );
      if (error) {
        return { data: null, error: { status: 500, message: 'Error al obtener los inmuebles', details: error } };
      }
      return { data: inmuebles, error: null };
    }

    // Rol no reconocido
    return { data: null, error: { status: 403, message: 'Rol de usuario no autorizado para consultar inmuebles', details: null } };
  } catch (error) {
    return { data: null, error: { status: 500, message: 'Error interno del servidor', details: error } };
  }
}