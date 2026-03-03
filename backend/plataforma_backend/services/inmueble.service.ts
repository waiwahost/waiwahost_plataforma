import { InmueblesRepository } from '../repositories/inmuebles.repository';
import { InmuebleUpdate } from '../interfaces/inmueble.interface';

export class InmuebleService {
  private repo: InmueblesRepository;

  constructor() {
    this.repo = new InmueblesRepository();
  }

  async getById(id: number) {
    return await this.repo.getInmuebleById(id);
  }

  async update(id: number, data: InmuebleUpdate, userContext: {
    role: string;
    empresaId?: number;
    propietarioId?: number;
  }) {
    // Obtener inmueble para validar que existe y verificar permisos
    const { data: inmueble, error } = await this.repo.getInmuebleById(id);

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

    const { data: updatedInmueble, error: updateError } = await this.repo.updateInmueble(id, editableFields);

    if (updateError) {
      return { error: { status: 500, message: updateError.message } };
    }

    if (!updatedInmueble) {
      return { error: { status: 404, message: 'Inmueble no encontrado o no actualizado' } };
    }

    return { success: true, data: updatedInmueble };
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
      if (Number(inmueble.id_empresa) === Number(empresaId)) {
        return { allowed: true };
      }
      return { allowed: false, reason: 'Solo puede actualizar inmuebles de su empresa' };
    }

    // Propietario puede actualizar solo inmuebles de su empresa y que estén asociados a su id_propietario
    if (role === 'propietario') {
      if (Number(inmueble.id_empresa) !== Number(empresaId)) {
        return { allowed: false, reason: 'Solo puede actualizar inmuebles de su empresa' };
      }
      if (Number(inmueble.id_propietario) !== Number(propietarioId)) {
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