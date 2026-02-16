import { z } from 'zod';
import { CONCEPTOS_INGRESOS, CONCEPTOS_EGRESOS, CONCEPTOS_DEDUCIBLES } from '../interfaces/movimiento.interface';
import { PLATAFORMAS_ORIGEN, isPlataformaValida } from '../constants/plataformas';

// Schema para validar fecha en formato YYYY-MM-DD
const fechaSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: "La fecha debe tener formato YYYY-MM-DD"
});

  // Schema para validar que la fecha no sea futura
  const fechaNoFuturaSchema = fechaSchema.refine((fecha) => {
    const fechaMovimiento = new Date(fecha);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const maximo = new Date();
    maximo.setMonth(maximo.getMonth() + 5);
    maximo.setHours(23, 59, 59, 999);

    return (
      fechaMovimiento >= hoy &&
      fechaMovimiento <= maximo
    );
  }, {
    message: "La fecha debe estar entre hoy y máximo 5 meses después"
  });


// Schema para validar monto
const montoSchema = z.number().min(0.01, {
  message: "El monto debe ser mayor a 0"
});

// Schema para validar id_reserva (convertir cadenas vacías a null)
const idReservaSchema = z.string().optional().nullable().transform((val) => {
  // Convertir cadenas vacías o solo espacios a null
  if (val === '' || (val && val.trim() === '')) {
    return null;
  }
  return val;
});

// Schema para validar plataforma de origen
const plataformaOrigenSchema = z.string().refine((plataforma) => {
  return isPlataformaValida(plataforma);
}, {
  message: `La plataforma debe ser una de: ${PLATAFORMAS_ORIGEN.join(', ')}`
}).optional().nullable();

// Schema para validar concepto según tipo
const conceptoSchema = z.string().min(1, {
  message: "El concepto es requerido"
});

// Schema para validar descripción
const descripcionSchema = z.string().min(3, {
  message: "La descripción debe tener al menos 3 caracteres"
});

// Schema base para movimientos
const movimientoBaseSchema = z.object({
  fecha: fechaNoFuturaSchema,
  tipo: z.enum(['ingreso', 'egreso', 'deducible'], {
    errorMap: () => ({ message: "El tipo debe ser 'ingreso', 'egreso' o 'deducible'" })
  }),
  concepto: conceptoSchema,
  descripcion: descripcionSchema,
  monto: montoSchema,
  id_inmueble: z.string().min(1, { message: "El ID del inmueble es requerido" }),
  id_reserva: idReservaSchema,
  metodo_pago: z.enum(
    ['efectivo', 'transferencia', 'tarjeta', 'otro'],
    {
      errorMap: () => ({
        message: "El método de pago debe ser 'efectivo', 'transferencia', 'tarjeta' u 'otro'"
      })
    }
  ).optional().nullable(),
  comprobante: z.string().optional().nullable(),

  // id_empresa: z.string().min(1, { message: "El ID de la empresa es requerido" }),

  
  plataforma_origen: plataformaOrigenSchema
});

// Schema para crear movimiento con validación de concepto y plataforma
export const CreateMovimientoSchema = movimientoBaseSchema
.refine((data) => {
  // Validar concepto según tipo
  if (data.tipo === 'ingreso') {
    return CONCEPTOS_INGRESOS.includes(data.concepto as any);
  } else if (data.tipo === 'egreso') {
    return CONCEPTOS_EGRESOS.includes(data.concepto as any);
  } else if (data.tipo === 'deducible') {
    return CONCEPTOS_DEDUCIBLES.includes(data.concepto as any);
  }
}, {
  message: "El concepto no es válido para el tipo de movimiento especificado",
  path: ["concepto"]
}).refine((data) => {
  // Validar que plataforma_origen solo se use en ingresos de reserva
  if (data.plataforma_origen && (data.tipo !== 'ingreso' || data.concepto !== 'reserva')) {
    return false;
  }
  return true;
}, {
  message: "La plataforma de origen solo es válida para movimientos de tipo 'ingreso' con concepto 'reserva'",
  path: ["plataforma_origen"]
})
.refine((data) => {
  // Validar que metodo_pago solo se use en deducibles
  if (data.tipo !== 'deducible' && !data.metodo_pago) {
    return false;
  }
  return true;
}, {
  message: "El método de pago es obligatorio para ingresos y egresos",
  path: ["metodo_pago"]
});

// Schema para editar movimiento (todos los campos opcionales)
export const EditMovimientoSchema = z.object({
  fecha: fechaNoFuturaSchema.optional(),
  tipo: z.enum(['ingreso', 'egreso', 'deducible']).optional(),
  concepto: conceptoSchema.optional(),
  descripcion: descripcionSchema.optional(),
  monto: montoSchema.optional(),
  id_inmueble: z.string().min(1).optional(),
  id_reserva: idReservaSchema,
  metodo_pago: z.enum(['efectivo', 'transferencia', 'tarjeta', 'otro']).optional(),
  comprobante: z.string().optional().nullable(),
  plataforma_origen: plataformaOrigenSchema
}).refine((data) => {
  // Si se especifica tipo y concepto, validar que sean compatibles
  if (data.tipo && data.concepto) {
    if (data.tipo === 'ingreso') {
      return CONCEPTOS_INGRESOS.includes(data.concepto as any);
    } else if (data.tipo === 'egreso') {
      return CONCEPTOS_EGRESOS.includes(data.concepto as any);
    } else if (data.tipo === 'deducible') {
      return CONCEPTOS_DEDUCIBLES.includes(data.concepto as any);
    }
  }
  return true;
}, {
  message: "El concepto no es válido para el tipo de movimiento especificado",
  path: ["concepto"]
}).refine((data) => {
  // Validar que plataforma_origen solo se use en ingresos de reserva
  if (data.plataforma_origen && data.tipo && data.concepto &&
    (data.tipo !== 'ingreso' || data.concepto !== 'reserva')) {
    return false;
  }
  return true;
}, {
  message: "La plataforma de origen solo es válida para movimientos de tipo 'ingreso' con concepto 'reserva'",
  path: ["plataforma_origen"]
});

// Schema para query parameters de obtener movimientos por fecha
export const MovimientosFechaQuerySchema = z.object({
  empresa_id: z.string().min(1, { message: "El ID de empresa es requerido" }),
  plataforma_origen: z.string().optional() // Filtro opcional por plataforma
});

// Schema para query parameters de obtener movimientos por inmueble
export const MovimientosInmuebleQuerySchema = z.object({
  id_inmueble: z.string().min(1, { message: "El ID del inmueble es requerido" }),
  fecha: fechaSchema
});

// Schema para parámetros de path
export const MovimientoIdParamSchema = z.object({
  id: z.string().min(1, { message: "El ID del movimiento es requerido" })
});

export const FechaParamSchema = z.object({
  fecha: fechaSchema
});

// Schema para query de inmuebles selector
export const InmueblesSelectorrQuerySchema = z.object({
  empresa_id: z.string().optional()
});

// Tipos TypeScript derivados de los schemas
export type CreateMovimientoInput = z.infer<typeof CreateMovimientoSchema>;
export type EditMovimientoInput = z.infer<typeof EditMovimientoSchema>;
export type MovimientosFechaQuery = z.infer<typeof MovimientosFechaQuerySchema>;
export type MovimientosInmuebleQuery = z.infer<typeof MovimientosInmuebleQuerySchema>;
export type MovimientoIdParam = z.infer<typeof MovimientoIdParamSchema>;
export type FechaParam = z.infer<typeof FechaParamSchema>;
export type InmueblesSelectorrQuery = z.infer<typeof InmueblesSelectorrQuerySchema>;