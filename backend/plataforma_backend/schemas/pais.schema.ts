import { z } from 'zod';

export const CreatePaisSchema = z.object({
    nombre: z.string().min(1, 'El nombre del país es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
    codigo_iso2: z.string().length(2, 'El código ISO2 debe tener exactamente 2 caracteres').toUpperCase(),
    codigo_iso3: z.string().length(3, 'El código ISO3 debe tener exactamente 3 caracteres').toUpperCase().optional(),
}).strict();

export const EditPaisSchema = z.object({
    nombre: z.string().min(1, 'El nombre del país es requerido').max(100, 'El nombre no puede exceder 100 caracteres').optional(),
    codigo_iso2: z.string().length(2, 'El código ISO2 debe tener exactamente 2 caracteres').toUpperCase().optional(),
    codigo_iso3: z.string().length(3, 'El código ISO3 debe tener exactamente 3 caracteres').toUpperCase().optional(),
}).strict();

export const PaisQuerySchema = z.object({
    id: z.string().optional().transform((val) => (val ? Number(val) : undefined)),
}).strict();

export const PaisIdParamSchema = z.object({
    id: z.string().transform((val) => Number(val)),
}).strict();
