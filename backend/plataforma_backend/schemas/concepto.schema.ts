import { z } from 'zod';

const tipoMovimientoEnum = z.enum(['ingreso', 'egreso', 'deducible']);

// Schema para crear un concepto
export const CreateConceptoSchema = z.object({
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
    slug: z.string()
        .min(2)
        .max(100)
        .regex(/^[a-z0-9_]+$/, 'El slug solo puede contener letras minúsculas, números y guiones bajos')
        .optional(),
    tipo_movimiento: z
        .array(tipoMovimientoEnum)
        .min(1, 'Debe indicar al menos un tipo de movimiento'),
    id_empresa: z.number().optional().nullable(),
});

// Schema para editar un concepto
export const EditConceptoSchema = z.object({
    nombre: z.string().min(2).max(100).optional(),
    slug: z.string()
        .min(2)
        .max(100)
        .regex(/^[a-z0-9_]+$/, 'El slug solo puede contener letras minúsculas, números y guiones bajos')
        .optional(),
    tipo_movimiento: z.array(tipoMovimientoEnum).min(1).optional(),
    estado: z.enum(['activo', 'inactivo']).optional(),
});

// Schema para query params del GET
export const GetConceptosQuerySchema = z.object({
    tipo: tipoMovimientoEnum.optional(),
    busqueda: z.string().optional(),
    id_empresa: z
        .string()
        .optional()
        .transform((val) => (val ? Number(val) : undefined)),
}).strict();

// Schema para query param de ID
export const ConceptoIdQuerySchema = z.object({
    id: z.string().transform((val) => Number(val)),
}).strict();

// Tipos inferidos
export type CreateConceptoInput = z.infer<typeof CreateConceptoSchema>;
export type EditConceptoInput = z.infer<typeof EditConceptoSchema>;
export type GetConceptosQuery = z.infer<typeof GetConceptosQuerySchema>;
