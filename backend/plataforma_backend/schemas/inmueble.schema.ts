import { z } from 'zod';

export const InmueblesQuerySchema = z.object({
  id_empresa: z.string().optional().transform((val: string | undefined) => (val ? Number(val) : undefined)),
  id: z.string().optional().transform((val: string | undefined) => (val ? Number(val) : undefined)),
}).strict();

export const CreateInmuebleSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
  direccion: z.string().optional(),
  ciudad: z.string().optional(),
  capacidad: z.number().min(1, 'La capacidad debe ser mayor a 0'),
  id_propietario: z.number().optional(),
  id_empresa: z.number().optional(),
  edificio: z.string().optional(),
  apartamento: z.string().optional(),
  id_prod_sigo: z.string().optional(),
  comision: z.number().optional(),
  precio_limpieza: z.number().optional(),
  capacidad_maxima: z.number().optional(),
  nro_habitaciones: z.number().optional(),
  nro_bahnos: z.number().optional(),
  cocina: z.boolean().optional(),
  rnt: z.string().optional(),
  tra_token: z.string().optional(),
  tipo_acomodacion: z.enum([
    'Apartamento',
    'Casa',
    'Habitación',
    'Suite',
    'Cama',
    'Finca',
    'Camping',
    'Otro'
  ], {
    required_error: 'La acomodación es requerida'
  }),
  especificacion_acomodacion: z.string().optional(),
  parent_id: z.number().optional().nullable(),
  tipo_registro: z.enum(['edificio', 'unidad', 'independiente']).optional().default('independiente'),
  area_m2: z.number().optional().default(0)
}).superRefine((data: any, ctx: z.RefinementCtx) => {
  // Si es un edificio o independiente (no tiene padre), ciertos campos son requeridos
  const sinPadre = !data.parent_id && data.tipo_registro !== 'unidad';

  if (sinPadre) {
    if (!data.direccion) {
      ctx.addIssue({ path: ['direccion'], message: 'La dirección es requerida', code: z.ZodIssueCode.custom });
    }
    if (!data.id_propietario) {
      ctx.addIssue({ path: ['id_propietario'], message: 'El ID del propietario es requerido', code: z.ZodIssueCode.custom });
    }
    if (!data.rnt) {
      ctx.addIssue({ path: ['rnt'], message: 'El RNT es requerido', code: z.ZodIssueCode.custom });
    }
    if (!data.tra_token) {
      ctx.addIssue({ path: ['tra_token'], message: 'El token de transacciones es requerido', code: z.ZodIssueCode.custom });
    }
  }

  // Si es un edificio, no requiere especificar acomodación interna
  if (data.tipo_registro === 'edificio') return;

  // Validar Especificacion de Inmueble, si no es un Apartamento
  const tieneEdificioYApto = (data.edificio && data.apartamento) || (data.parent_id && data.apartamento);
  const tieneEspecificacion = data.especificacion_acomodacion;

  if (!tieneEdificioYApto && !tieneEspecificacion) {
    ctx.addIssue({
      path: ['especificacion_acomodacion'],
      message: 'Debe indicar edificio y apartamento, o una especificación de acomodación',
      code: z.ZodIssueCode.custom
    });
  }
});



export const EditInmuebleSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').optional(),
  descripcion: z.string().optional(),
  direccion: z.string().min(1, 'La dirección es requerida').optional(),
  ciudad: z.string().optional(),
  capacidad: z.number().min(1, 'La capacidad debe ser mayor a 0').optional(),
  id_propietario: z.number().min(1, 'El ID del propietario es requerido').optional(),
  id_empresa: z.number().optional(),
  estado: z.enum(['activo', 'inactivo']).optional(),
  edificio: z.string().optional(),
  apartamento: z.string().optional(),
  id_prod_sigo: z.string().optional(),
  comision: z.number().optional(),
  precio_limpieza: z.number().optional(),
  capacidad_maxima: z.number().optional(),
  nro_habitaciones: z.number().optional(),
  nro_bahnos: z.number().optional(),
  cocina: z.boolean().optional(),
  rnt: z.string().optional(),
  tra_token: z.string().optional(),
  tipo_acomodacion: z.enum([
    'Apartamento',
    'Casa',
    'Habitación',
    'Suite',
    'Cama',
    'Finca',
    'Camping',
    'Otro'
  ]).optional(),
  especificacion_acomodacion: z.string().optional(),
  parent_id: z.number().optional().nullable(),
  tipo_registro: z.enum(['edificio', 'unidad', 'independiente']).optional(),
  area_m2: z.number().optional()
});

export type InmuebleUpdate = z.infer<typeof EditInmuebleSchema>;

export const EditInmuebleQuerySchema = z.object({
  id: z.number().min(1, 'El ID del inmueble es requerido'),
}).strict();