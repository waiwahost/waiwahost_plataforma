import { z } from 'zod';

export const PropietarioSchema = z.object({
  nombre: z.string().min(1, 'Nombre es requerido'),
  apellido: z.string().min(1, 'Apellido es requerido'),
  email: z.string().email('Email inválido'),
  telefono: z.string().min(1, 'Teléfono es requerido'),
  direccion: z.string().min(1, 'Dirección es requerida'),
  cedula: z.string().min(1, 'Cédula es requerida'),
  estado: z.enum(['activo', 'inactivo']).default('activo'),
  id_empresa: z.number().positive('ID de empresa debe ser positivo'),
});

export const CreatePropietarioSchema = z.object({
  nombre: z.string().min(1, 'Nombre es requerido'),
  apellido: z.string().min(1, 'Apellido es requerido'),
  email: z.string().email('Email inválido'),
  telefono: z.string().min(1, 'Teléfono es requerido'),
  direccion: z.string().min(1, 'Dirección es requerida'),
  cedula: z.string().min(1, 'Cédula es requerida'),
  estado: z.enum(['activo', 'inactivo']).default('activo'),
  id_empresa: z.number().positive('ID de empresa debe ser positivo'),
});

export const EditPropietarioSchema = z.object({
  nombre: z.string().min(1, 'Nombre no puede estar vacío').optional(),
  apellido: z.string().min(1, 'Apellido no puede estar vacío').optional(),
  email: z.string().email('Email inválido').optional(),
  telefono: z.string().min(1, 'Teléfono no puede estar vacío').optional(),
  direccion: z.string().min(1, 'Dirección no puede estar vacía').optional(),
  estado: z.enum(['activo', 'inactivo']).optional(),
  id_empresa: z.number().positive('ID de empresa debe ser positivo').optional(),
}).refine(
  (data) => {
    // Verificar que al menos un campo esté presente
    const fields = Object.values(data);
    return fields.some(field => field !== undefined);
  },
  {
    message: 'Debe proporcionar al menos un campo para actualizar',
  }
);

export const EditPropietarioQuerySchema = z.object({
  id: z.number().positive('ID debe ser un número positivo'),
});

export const GetPropietariosQuerySchema = z.object({
  id_empresa: z.number().positive().optional(),
});

export type PropietarioInput = z.infer<typeof PropietarioSchema>;
export type CreatePropietarioInput = z.infer<typeof CreatePropietarioSchema>;
export type EditPropietarioInput = z.infer<typeof EditPropietarioSchema>;
export type EditPropietarioQueryInput = z.infer<typeof EditPropietarioQuerySchema>;
export type GetPropietariosQueryInput = z.infer<typeof GetPropietariosQuerySchema>;
