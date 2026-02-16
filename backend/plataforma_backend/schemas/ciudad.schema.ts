import { z } from 'zod';

export const CreateCiudadSchema = z.object({
    nombre: z.string().min(1, 'El nombre de la ciudad es requerido').max(120, 'El nombre no puede exceder 120 caracteres'),
    id_pais: z.number().min(1, 'El ID del país es requerido'),
}).strict();

export const EditCiudadSchema = z.object({
    nombre: z.string().min(1, 'El nombre de la ciudad es requerido').max(120, 'El nombre no puede exceder 120 caracteres').optional(),
}).strict();

export const CiudadQuerySchema = z.object({
    id: z.string().optional().transform((val) => (val ? Number(val) : undefined)),
    id_pais: z.string().optional().transform((val) => (val ? Number(val) : undefined)),
}).strict();

export const CiudadIdParamSchema = z.object({
    id: z.string().transform((val) => Number(val)),
}).strict();
