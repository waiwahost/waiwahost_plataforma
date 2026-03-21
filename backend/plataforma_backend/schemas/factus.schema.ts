import { z } from 'zod';

// ================================================
// Schema: Configuración Factus por empresa
// ================================================
export const FactusConfigSchema = z.object({
    client_id: z.string().min(1, 'El client_id es requerido'),
    client_secret: z.string().min(1, 'El client_secret es requerido'),
    factus_username: z.string().min(1, 'El usuario de Factus es requerido'),
    factus_password: z.string().min(1, 'La contraseña de Factus es requerida'),
    ambiente: z.enum(['sandbox', 'produccion']).default('sandbox'),
});

export const FactusConfigUpdateSchema = FactusConfigSchema.partial();

// ================================================
// Schema: Cliente de Facturación
// ================================================
export const ClienteFacturacionSchema = z.object({
    tipo_persona: z.enum(['natural', 'juridica']),
    tipo_tercero: z.enum(['propietario', 'empleado', 'huesped', 'otro']).optional().default('otro'),
    tipo_documento: z.enum(['CC', 'NIT', 'CE', 'PP', 'TI', 'DIE', 'NUIP']),
    numero_documento: z.string().min(1, 'El número de documento es requerido'),
    digito_verificacion: z.string().max(2).nullish(),
    nombres: z.string().nullish(),
    apellidos: z.string().nullish(),
    razon_social: z.string().nullish(),
    email: z.string().email('Email inválido').nullish().or(z.literal('')),
    telefono: z.string().nullish(),
    direccion: z.string().nullish(),
    codigo_municipio: z.string().nullish(),
    nombre_municipio: z.string().nullish(),
    nombre_comercial: z.string().nullish(),
    codigo_postal: z.string().nullish(),
    responsabilidades_fiscales: z.string().optional().default('["R-99-PN"]'),
    regimen: z.enum(['simplificado', 'comun', 'gran_contribuyente', 'autorretenedor']).optional().default('simplificado'),
}).superRefine((data, ctx) => {
    if (data.tipo_persona === 'natural' && !data.nombres) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Los nombres son requeridos para persona natural', path: ['nombres'] });
    }
    if (data.tipo_persona === 'juridica' && !data.razon_social) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'La razón social es requerida para persona jurídica', path: ['razon_social'] });
    }
    if (data.tipo_documento === 'NIT' && !data.digito_verificacion) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'El dígito de verificación es requerido para NIT', path: ['digito_verificacion'] });
    }
});

export const ClienteFacturacionUpdateSchema = z.object({
    tipo_persona: z.enum(['natural', 'juridica']).optional(),
    tipo_tercero: z.enum(['propietario', 'empleado', 'huesped', 'otro']).optional(),
    tipo_documento: z.enum(['CC', 'NIT', 'CE', 'PP', 'TI', 'DIE', 'NUIP']).optional(),
    numero_documento: z.string().min(1).optional(),
    digito_verificacion: z.string().max(2).nullish(),
    nombres: z.string().nullish(),
    apellidos: z.string().nullish(),
    razon_social: z.string().nullish(),
    email: z.string().email().nullish().or(z.literal('')),
    telefono: z.string().nullish(),
    direccion: z.string().nullish(),
    codigo_municipio: z.string().nullish(),
    nombre_municipio: z.string().nullish(),
    nombre_comercial: z.string().nullish(),
    codigo_postal: z.string().nullish(),
    responsabilidades_fiscales: z.string().nullish(),
    regimen: z.string().nullish(),
});

export const ClienteFacturacionQuerySchema = z.object({
    search: z.string().optional(),
    tipo_documento: z.string().optional(),
    tipo_tercero: z.string().optional(),
    page: z.string().optional().transform(val => val ? Number(val) : 1),
    limit: z.string().optional().transform(val => val ? Number(val) : 20),
}).strict();

// ================================================
// Schema: Items de Factura / Notas
// ================================================
const TributoSchema = z.object({
    tributo: z.string(), // '01' = IVA 19%, '04' = INC
    porcentaje: z.number(),
});

export const FacturaItemSchema = z.object({
    codigo_producto: z.string().optional().default('1'),
    descripcion: z.string().min(1, 'La descripción es requerida'),
    unidad_medida: z.number().optional().default(70),
    cantidad: z.number().positive('La cantidad debe ser positiva'),
    precio_unitario: z.number().nonnegative('El precio no puede ser negativo'),
    porcentaje_descuento: z.number().min(0).max(100).optional().default(0),
    tributos: z.array(TributoSchema).optional().default([]),
    id_tercero: z.string().optional(),
    nombre_tercero: z.string().optional(),
    es_ingreso_tercero: z.boolean().optional().default(false),
    tipo_doc_mandante: z.string().optional(),
});

// ================================================
// Schema: Factura Electrónica
// ================================================
export const FacturaCreateSchema = z.object({
    id_cliente: z.number().positive('El cliente es requerido'),
    id_reserva: z.number().positive().optional(),
    id_rango_numeracion: z.number().positive('El rango de numeración es requerido'),
    fecha_emision: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha: YYYY-MM-DD'),
    fecha_vencimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    notas: z.string().optional(),
    observaciones: z.string().optional(),
    items: z.array(FacturaItemSchema).min(1, 'Se requiere al menos un item'),
});

export const FacturaQuerySchema = z.object({
    estado: z.enum(['borrador', 'enviada', 'aprobada', 'rechazada', 'anulada']).optional(),
    fecha_inicio: z.string().optional(),
    fecha_fin: z.string().optional(),
    id_cliente: z.string().optional().transform(val => val ? Number(val) : undefined),
    page: z.string().optional().transform(val => val ? Number(val) : 1),
    limit: z.string().optional().transform(val => val ? Number(val) : 20),
}).strict();

export const FacturaIdParamSchema = z.object({
    id: z.coerce.number().positive('ID inválido'),
});

// ================================================
// Schema: Nota de Crédito
// ================================================
export const NotaCreditoCreateSchema = z.object({
    id_factura_referencia: z.number().positive().optional(),
    id_cliente: z.number().positive().optional(),
    id_rango_numeracion: z.number().positive('El rango de numeración es requerido'),
    fecha_emision: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    codigo_motivo: z.enum(['1', '2', '3', '4', '5']), // 1=Devolucion, 2=Anulacion, 3=Descuento, 4=Ajuste precio, 5=Otro
    descripcion_motivo: z.string().optional(),
    notas: z.string().optional(),
    items: z.array(FacturaItemSchema).min(1, 'Se requiere al menos un item'),
});

// ================================================
// Schema: Nota de Débito
// ================================================
export const NotaDebitoCreateSchema = z.object({
    id_factura_referencia: z.number().positive().optional(),
    id_cliente: z.number().positive().optional(),
    id_rango_numeracion: z.number().positive('El rango de numeración es requerido'),
    fecha_emision: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    codigo_motivo: z.enum(['1', '2', '3']), // 1=Intereses, 2=Gastos, 3=Cambio de precio
    descripcion_motivo: z.string().optional(),
    notas: z.string().optional(),
    items: z.array(FacturaItemSchema).min(1),
});

// ================================================
// Schema: Documento Soporte
// ================================================
export const DocumentoSoporteCreateSchema = z.object({
    id_rango_numeracion: z.number().positive('El rango de numeración es requerido'),
    tipo_documento_proveedor: z.enum(['CC', 'NIT', 'CE', 'PP', 'TI']).default('CC'),
    numero_documento_proveedor: z.string().min(1, 'El documento del proveedor es requerido'),
    nombre_proveedor: z.string().min(1, 'El nombre del proveedor es requerido'),
    fecha_emision: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    descripcion: z.string().optional(),
    notas: z.string().optional(),
    items: z.array(FacturaItemSchema).min(1),
});

// ================================================
// Schema: Declaración de Tercero
// ================================================
export const DeclaracionTerceroCreateSchema = z.object({
    id_propietario: z.number().positive('El propietario es requerido'),
    id_rango_numeracion: z.number().positive('El rango de numeración es requerido'),
    fecha_emision: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    periodo_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    periodo_fin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    notas: z.string().optional(),
});

export const DeclaracionDesdeMovimientosSchema = z.object({
    id_propietario: z.number().positive(),
    id_rango_numeracion: z.number().positive(),
    periodo_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    periodo_fin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// Tipos inferidos
export type FactusConfigInput = z.infer<typeof FactusConfigSchema>;
export type ClienteFacturacionInput = z.infer<typeof ClienteFacturacionSchema>;
export type ClienteFacturacionUpdateInput = z.infer<typeof ClienteFacturacionUpdateSchema>;
export type FacturaCreateInput = z.infer<typeof FacturaCreateSchema>;
export type NotaCreditoCreateInput = z.infer<typeof NotaCreditoCreateSchema>;
export type NotaDebitoCreateInput = z.infer<typeof NotaDebitoCreateSchema>;
export type DocumentoSoporteCreateInput = z.infer<typeof DocumentoSoporteCreateSchema>;
export type DeclaracionTerceroCreateInput = z.infer<typeof DeclaracionTerceroCreateSchema>;
