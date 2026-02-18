/// <reference path="../types/fastify.d.ts" />
import { FastifyRequest, FastifyReply } from 'fastify';
import pool from '../libs/db';
import { UserService } from '../services/user.service';
import { User } from '../interfaces/user.interface';
import { UserSchema } from '../schemas/user.schema';
import { checkUserPermission } from '../middlewares/checkUserPermission';
import { successResponse, errorResponse } from '../libs/responseHelper';
import { getVisibleUsers } from '../services/users/getUsersService';
import { deleteUserService } from '../services/users/deleteUserService';
import { createUserService } from '../services/users/createUserService';

const userService = new UserService();

export const userController = {
  list: async (req: FastifyRequest, reply: FastifyReply) => {
    const ctx = req.userContext;
    if (!ctx || !ctx.id) {
      return reply.status(401).send(errorResponse({ message: 'No autenticado', code: 401, error: 'Unauthorized' }));
    }
    try {
      const { data, error } = await getVisibleUsers(ctx.id);
      if (error) {
        return reply.status(403).send(errorResponse({ message: error.message, code: 403, error: 'Forbidden' }));
      }
      return reply.send(successResponse(data));
    } catch (err) {
      return reply.status(500).send(errorResponse({ message: 'Error al obtener usuarios', code: 500, error: err }));
    }
  },
  create: async (req: FastifyRequest, reply: FastifyReply) => {
    const ctx = req.userContext;
    if (!ctx || !ctx.id) {
      return reply.status(401).send(errorResponse({ message: 'No autenticado', code: 401, error: 'Unauthorized' }));
    }
    const parse = UserSchema.safeParse(req.body);
    if (!parse.success) {
      console.error('Error al validar datos de usuario:', parse.error);
      return reply.status(400).send(errorResponse({ message: 'Datos inválidos', code: 400, error: parse.error }));
    }
    const result = await createUserService(Number(ctx.id), parse.data);
    if (result.error) {
      console.error('Error al crear usuario:', result.error);
      return reply.status(result.error.status || 400).send(errorResponse({ message: result.error.message, code: result.error.status || 400, error: result.error }));
    }
    const responseData = 'data' in result ? result.data : result;
    return reply.status(201).send(successResponse(responseData, 201));
  },
  getById: async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const { data, error } = await userService.getById(id);
    if (error) return reply.status(404).send(errorResponse({ message: error.message, code: 404, error }));
    // Validar permiso para ver usuario específico
    const permiso = checkUserPermission(req, 'ver', {
      id_roles: data?.id_roles,
      id_empresa: data?.id_empresa ?? null,
    });
    if (!permiso.allowed) {
      return reply.status(403).send(errorResponse({ message: permiso.reason || 'No tiene permisos para ver este usuario', code: 403, error: 'Forbidden' }));
    }
    return reply.send(successResponse(data));
  },
  login: async (req: FastifyRequest, reply: FastifyReply) => {
    const { identifier, password } = req.body as { identifier: string; password: string };
    if (!identifier || !password) return reply.status(400).send(errorResponse({ message: 'Usuario/email y contraseña requeridos', code: 400 }));
    const { user, error } = await userService.login(identifier, password);
    if (error) return reply.status(error.status || 401).send(errorResponse({ message: error.message, code: error.status || 401, error }));
    try {
      const permisosQuery = `SELECT p.key FROM roles_permissions rp JOIN permissions p ON rp.id_permission = p.id_permission WHERE rp.id_rol = $1`;
      const { rows: permisosRows } = await pool.query(permisosQuery, [user.id_roles]);
      const permisosList = permisosRows.map((p: any) => p.key);
      const token = reply.server.jwt.sign({
        id: user.id_usuario,
        nombre: user.nombre,
        id_roles: user.id_roles,
        role: user.rol_name,
        permisos: permisosList,
        empresaId: user.id_empresa,
        propietarioId: user.id_propietario ?? null,
        inmuebles: user.id_inmueble ? [user.id_inmueble] : [],
      });
      return reply.send(successResponse({
        token,
        user: {
          id: user.id_usuario,
          nombre: user.nombre,
          id_roles: user.id_roles,
          email: user.email,
          role: user.rol_name,
          permisos: permisosList,
          empresaId: user.id_empresa,
          propietarioId: user.id_propietario ?? null,
          inmuebles: user.id_inmueble ? [user.id_inmueble] : [],
        },
      }));
    } catch (permisosError) {
      return reply.status(500).send(errorResponse({ message: 'Error obteniendo permisos', code: 500, error: permisosError }));
    }
  },
  resetPassword: async (req: FastifyRequest, reply: FastifyReply) => {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) return reply.status(400).send(errorResponse({ message: 'Datos requeridos', code: 400 }));
    const { success, error } = await userService.resetPassword(email, password);
    if (error) return reply.status(error.status || 500).send(errorResponse({ message: error.message, code: error.status || 500, error }));
    return reply.send(successResponse({ success: true }));
  },
  update: async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const { data: userTarget, error: errorTarget } = await userService.getById(id);
    if (errorTarget || !userTarget) return reply.status(404).send(errorResponse({ message: 'Usuario no encontrado', code: 404, error: errorTarget }));
    // Validar permisos antes de actualizar
    //const permiso = checkUserPermission(req, 'editar', {
    //  id_roles: userTarget?.id_roles,
    //  id_empresa: userTarget?.id_empresa ?? null,
    //});
    //if (!permiso.allowed) {
    //  return reply.status(403).send(errorResponse({ message: permiso.reason || 'No tiene permisos para editar este usuario', code: 403, error: 'Forbidden' }));
    //}
    // Actualizar usuario
    const result = await userService.update(id, req.body as Partial<Omit<User, 'id_usuario' | 'email' | 'username'>>);
    if (result.error) {
      return reply.status(result.error.status || 500).send(errorResponse({ message: result.error.message, code: result.error.status || 500, error: result.error }));
    }
    return reply.send(successResponse({ success: true, message: 'Usuario actualizado correctamente' }));
  },
  delete: async (req: FastifyRequest, reply: FastifyReply) => {
    const ctx = req.userContext;
    if (!ctx || !ctx.id) {
      return reply.status(401).send(errorResponse({ message: 'No autenticado', code: 401, error: 'Unauthorized' }));
    }
    const { id } = req.params as { id: string };
    const result = await deleteUserService(Number(ctx.id), Number(id));
    if (result.error) {
      return reply.status(result.error.status || 403).send(errorResponse({ message: result.error.message, code: result.error.status || 403, error: result.error }));
    }
    return reply.send(successResponse({ success: true, message: 'Usuario eliminado correctamente' }));
  },
};
