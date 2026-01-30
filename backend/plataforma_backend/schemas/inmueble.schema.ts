import { z } from 'zod';

export const InmueblesQuerySchema = z.object({
  id_empresa: z.string().optional().transform((val) => (val ? Number(val) : undefined)),
  id: z.string().optional().transform((val) => (val ? Number(val) : undefined)),
}).strict();

export const CreateInmuebleSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
  direccion: z.string().min(1, 'La dirección es requerida'),
  ciudad: z.string().optional(),
  capacidad: z.number().min(1, 'La capacidad debe ser mayor a 0'),
  id_propietario: z.number().min(1, 'El ID del propietario es requerido'),
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
  rnt: z.string().min(1, 'El RNT del inmueble es requerido'),
  tra_token: z.string().min(1, 'El token del inmueble es requerido'),
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
  especificacion_acomodacion: z.string().optional()
}).strict().superRefine((data, ctx) => { 
  // Validar Especificacion de Inmueble, si no es un Apartamento
  const tieneEdificioYApto = data.edificio && data.apartamento;
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
  //id_propietario: z.number().min(1, 'El ID del propietario es requerido').optional(),
  //id_empresa: z.number().optional(),
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
}).strict();

export const EditInmuebleQuerySchema = z.object({
  id: z.number().min(1, 'El ID del inmueble es requerido'),
}).strict();