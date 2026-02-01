import { z } from "zod";

const TipoAcomodacionSchema = z.enum([
    'Apartamento',
    'Casa',
    'Habitación',
    'Suite',
    'Cama',
    'Finca',
    'Camping',
    'Otro'
]);

const MotivoViajeSchema = z.enum([
    'Negocios',
    'Vacaciones',
    'Visitas',
    'Educacion',
    'Salud',
    'Religion',
    'Compras',
    'Transito',
    'Otros'
]);


export const PayloadTarjetaAlojamientoSchema = z.object({
    tipo_identificacion: z.string().min(1, "Tipo de identificación es requerido"),
    numero_identificacion: z.number().min(1, "Número de identificación es requerido"),
    nombres: z.string().min(1, "Nombres es requerido"),
    apellidos: z.string().min(1, "Apellidos es requerido"),
    cuidad_residencia: z.string().min(1, "Ciudad de residencia es requerida"),
    cuidad_procedencia: z.string().min(1, "Ciudad de procedencia es requerida"),
    motivo: MotivoViajeSchema,
    numero_acompanantes: z.number(),
    numero_habitacion: z.string().min(1, "Número de habitación es requerido"),
    tipo_acomodacion: TipoAcomodacionSchema,
    nombre_establecimiento: z.string().min(1, "Nombre del establecimiento es requerido"),
    rnt_establecimiento: z.number().min(1, "RNT del establecimiento es requerido"),
    costo: z.string().min(1, "Costo es requerido"),
    check_in: z.string().min(1, "Check-in es requerido"),
    check_out: z.string().min(1, "Check-out es requerido"),
});

const EstadoTarjetaSchema = z.enum([
  'pendiente',
  'enviado',
  'confirmado',
  'error',
  'reintento'
]);


export const CreateTarjetaAlojamientoSchema = z.object({
    id_reserva: z.number(),
    id_huesped: z.number(),
    id_inmueble: z.number(),

    estado: EstadoTarjetaSchema.default("pendiente"),
    fecha: z.string().default(() => new Date().toISOString()),
    intentos: z.number().default(0),
    ultimo_error: z.string().nullable().optional(),

    payload: PayloadTarjetaAlojamientoSchema,
    respuesta_tra: z.record(z.any()).optional(),


    created_at: z.string().default(() => new Date().toISOString()),
    updated_at: z.string().default(() => new Date().toISOString()),
});

export const EditTarjetaAlojamientoSchema = z.object({
    payload: PayloadTarjetaAlojamientoSchema.optional(),
    respuesta_tra: z.record(z.any()).optional(),
    ultimo_error: z.string().nullable().optional(),
    intentos: z.number().optional(),
    estado: EstadoTarjetaSchema.optional(),
    fecha: z.string().optional(),
    updated_at: z.string().optional(),
});


export const EditPayloadTarjetaAlojamientoSchema = z.object({
    tipo_identificacion: z.string().optional(),
    numero_identificacion: z.number().optional(),
    nombres: z.string().optional(),
    apellidos: z.string().optional(),
    numero_acompanantes: z.number().optional(),
    cuidad_residencia: z.string().optional(),
    cuidad_procedencia: z.string().optional(),
    motivo: z.string().optional(),
    numero_habitacion: z.string().optional(),
    tipo_acomodacion: z.string().optional(),
    nombre_establecimiento: z.string().optional(),
    rnt_establecimiento: z.string().optional(),
    costo: z.string().optional(),
    check_in: z.string().optional(),
    check_out: z.string().optional(),
})

export const EditTarjetaAlojamientoQuerySchema = z.object({
    id: z.number(),
    estado: z.string().optional(),
    fecha: z.string().optional()
}); 

export const GetTarjetaAlojamientoQuerySchema = z.object({
    id: z.number().optional(),
    id_reserva: z.number().optional(),
    id_huesped: z.number().optional(),
    id_inmueble: z.number().optional(),
    estado: z.string().optional(),
    fecha: z.string().optional(),
});

export type CreateTarjetaAlojamientoInput = z.infer<typeof CreateTarjetaAlojamientoSchema>;
export type EditPayloadTarjetaAlojamientoInput = z.infer<typeof EditPayloadTarjetaAlojamientoSchema>;
export type EditTarjetaAlojamientoInput = z.infer<typeof EditTarjetaAlojamientoSchema>;
export type EditTarjetaAlojamientoQueryInput = z.infer<typeof EditTarjetaAlojamientoQuerySchema>;
export type GetTarjetaAlojamientoQueryInput = z.infer<typeof GetTarjetaAlojamientoQuerySchema>;
export type PayloadTarjetaAlojamientoInput = z.infer<typeof PayloadTarjetaAlojamientoSchema>;