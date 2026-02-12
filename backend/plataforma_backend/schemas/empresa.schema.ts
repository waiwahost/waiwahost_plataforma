import { z } from 'zod';

export const EmpresaSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido'),
    nit: z.string().min(1, 'El NIT es requerido'),
    plan_actual: z.string().min(1, 'El plan es requerido'),
    estado: z.enum(['activa', 'inactiva']).optional(),
    // Usuario administrador de la empresa
    email: z.string().email('Email de usuario requerido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    username: z.string().min(1, 'El nombre de usuario es requerido'),
});
export const EmpresaUpdateSchema = z.object({
    nombre: z.string().min(1).optional(),
    nit: z.string().min(1).optional(),
    plan_actual: z.string().min(1).optional(),
    password: z.string().min(6).optional(),
    username: z.string().min(1).optional(),
    estado: z.enum(['activa', 'inactiva']).optional(),
});


export type EmpresaUpdateInput = z.infer<typeof EmpresaUpdateSchema>;
export type EmpresaInput = z.infer<typeof EmpresaSchema>;
