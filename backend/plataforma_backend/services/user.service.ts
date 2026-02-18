import { UserRepository } from '../repositories/user.repository';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../interfaces/user.interface';

const passwordSchema = z.string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(/\d/, 'Al menos 1 número')
  .regex(/[a-z]/, 'Al menos 1 minúscula')
  .regex(/[A-Z]/, 'Al menos 1 mayúscula');

export class UserService {
  private repo: UserRepository;
  constructor() {
    this.repo = new UserRepository();
  }
  async list() {
    return this.repo.list();
  }
  async create(user: any) {
    return this.repo.insert(user);
  }
  async getById(id: string) {
    return this.repo.getById(id);
  }
  async login(identifier: string, password: string) {
    const { data: user, error } = await this.repo.findByEmailOrUsername(identifier);
    if (error || !user) return { error: { status: 401, message: 'Credenciales inválidas' } };
    // Compara el password hasheado
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return { error: { status: 401, message: 'Credenciales inválidas' } };
    return { user };
  }
  async resetPassword(email: string, password: string) {
    // Valida la contraseña antes de hashear
    const parse = passwordSchema.safeParse(password);
    if (!parse.success) {
      return { error: { status: 400, message: parse.error.errors.map(e => e.message).join(', ') } };
    }
    // Verifica que el usuario exista
    const { data: user, error } = await this.repo.findByEmail(email);
    if (error || !user) return { error: { status: 404, message: 'Usuario no encontrado' } };
    // Hashea la nueva contraseña
    const password_hash = await bcrypt.hash(password, 10);
    // Actualiza la contraseña
    const { error: updateError } = await this.repo.updatePassword(email, password_hash);
    if (updateError) return { error: { status: 500, message: updateError.message } };
    return { success: true };
  }
  async delete(id: string) {
    // Obtener usuario para validar superadmin
    const { data: user, error } = await this.repo.getById(id);
    if (error || !user) {
      return { error: { status: 404, message: 'Usuario no encontrado' } };
    }
    // Validar superadmin (puedes ajustar el id o correo según tu base de datos)
    const SUPERADMIN_ID = 4; // Ajusta según tu sistema
    const SUPERADMIN_EMAIL = 'admin@mail.com'; // Ajusta según tu sistema
    if (user.id_usuario === SUPERADMIN_ID || user.email === SUPERADMIN_EMAIL) {
      return { error: { status: 403, message: 'No se puede eliminar el usuario superadmin' } };
    }
    // Eliminar usuario
    const { success, error: deleteError } = await this.repo.deleteById(id);
    if (deleteError) {
      return { error: { status: 500, message: deleteError.message } };
    }
    if (!success) {
      return { error: { status: 404, message: 'Usuario no encontrado o no eliminado' } };
    }
    return { success: true };
  }
  async update(id: string, data: Partial<Omit<User, 'id_usuario' | 'email' | 'username'>>) {
    // Obtener usuario para validar superadmin
    const { data: user, error } = await this.repo.getById(id);
    if (error || !user) {
      return { error: { status: 404, message: 'Usuario no encontrado' } };
    }
    const SUPERADMIN_ID = 4; // Ajusta según tu sistema
    const SUPERADMIN_EMAIL = 'admin@mail.com'; // Ajusta según tu sistema
    if (user.id_usuario === SUPERADMIN_ID || user.email === SUPERADMIN_EMAIL) {
      return { error: { status: 403, message: 'No se puede editar el usuario superadmin' } };
    }
    // Eliminar campos no editables si existen en el payload
    const editableFields = { ...data };
    delete (editableFields as any).id_usuario;
    delete (editableFields as any).email;
    delete (editableFields as any).username;
    if (Object.keys(editableFields).length === 0) {
      return { error: { status: 400, message: 'No hay campos editables proporcionados' } };
    }
    const { success, error: updateError } = await this.repo.updateById(id, editableFields);
    if (updateError) {
      return { error: { status: 500, message: updateError.message } };
    }
    if (!success) {
      return { error: { status: 404, message: 'Usuario no encontrado o no editado' } };
    }
    return { success: true };
  }
}
