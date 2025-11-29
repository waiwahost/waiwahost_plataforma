import { InmuebleRepository } from '../repositories/inmueble.repository';
import { InmuebleUpdate } from '../schemas/inmueble.schema';

export class InmuebleService {
  private repo: InmuebleRepository;

  constructor() {
    this.repo = new InmuebleRepository();
  }

  async getById(id: string) {
    return await this.repo.getById(id);
  }

  async update(id: string, data: InmuebleUpdate, userContext: {
    role: string;
    empresaId?: number;
    propietarioId?: number;
  }) {
    // Obtener inmueble para validar que existe y verificar permisos
    const { data: inmueble, error } = await this.repo.getById(id);
    if (error || !inmueble) {
      return { error: { status: 404, message: 'Inmueble no encontrado' } };
    }

    // Verificar permisos según el rol
    const permissionCheck = this.checkUpdatePermission(inmueble, userContext);
    if (!permissionCheck.allowed) {
      return { error: { status: 403, message: permissionCheck.reason || 'No tiene permisos para actualizar este inmueble' } };
    }

    // Eliminar campos no editables si existen en el payload
    const editableFields = { ...data };
    delete (editableFields as any).id_inmueble;
    delete (editableFields as any).creado_en;
    delete (editableFields as any).actualizado_en;

    if (Object.keys(editableFields).length === 0) {
      return { error: { status: 400, message: 'No hay campos editables proporcionados' } };
    }

    const { success, error: updateError } = await this.repo.updateById(id, editableFields);
    if (updateError) {
      return { error: { status: 500, message: updateError.message } };
    }

    if (!success) {
      return { error: { status: 404, message: 'Inmueble no encontrado o no actualizado' } };
    }

    return { success: true };
  }

  private checkUpdatePermission(inmueble: any, userContext: {
    role: string;
    empresaId?: number;
    propietarioId?: number;
  }) {
    const { role, empresaId, propietarioId } = userContext;

    // Superadmin puede actualizar cualquier inmueble
    if (role === 'superadmin') {
      return { allowed: true };
    }

    // Empresa/Admin puede actualizar inmuebles de su empresa
    if (role === 'empresa' || role === 'administrador') {
      if (inmueble.id_empresa === empresaId) {
        return { allowed: true };
      }
      return { allowed: false, reason: 'Solo puede actualizar inmuebles de su empresa' };
    }

    // Propietario puede actualizar solo inmuebles de su empresa y que estén asociados a su id_propietario
    if (role === 'propietario') {
      if (inmueble.id_empresa !== empresaId) {
        return { allowed: false, reason: 'Solo puede actualizar inmuebles de su empresa' };
      }
      if (inmueble.id_propietario !== propietarioId) {
        return { allowed: false, reason: 'Solo puede actualizar sus propios inmuebles' };
      }
      return { allowed: true };
    }

    return { allowed: false, reason: 'Rol no autorizado' };
  }

  // Método público para verificar permisos de visualización
  checkViewPermission(inmueble: any, userContext: {
    role: string;
    empresaId?: number;
    propietarioId?: number;
  }) {
    return this.checkUpdatePermission(inmueble, userContext);
  }

  async list(userContext: {
    role: string;
    empresaId?: number;
    propietarioId?: number;
  }) {
    const { role, empresaId, propietarioId } = userContext;

    // Superadmin puede ver todos los inmuebles
    if (role === 'superadmin') {
      return await this.repo.list();
    }

    // Empresa/Admin puede ver inmuebles de su empresa
    if (role === 'empresa' || role === 'administrador') {
      if (empresaId) {
        return await this.repo.getByEmpresa(empresaId);
      }
    }

    // Propietario puede ver solo sus inmuebles
    if (role === 'propietario') {
      if (propietarioId) {
        return await this.repo.getByPropietario(propietarioId);
      }
    }

    return { data: [], error: null };
  }
}