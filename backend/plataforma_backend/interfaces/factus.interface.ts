// ==========================================
// Interfaces para Factus API y módulo contable
// ==========================================

// --- Config Factus por Empresa ---
export interface FactusConfig {
    id?: number;
    id_empresa: number;
    client_id: string;
    client_secret: string;
    factus_username: string;
    factus_password: string;
    ambiente: 'sandbox' | 'produccion';
    access_token?: string | null;
    refresh_token?: string | null;
    token_expires_at?: Date | null;
    estado?: 'activo' | 'inactivo';
    creado_en?: Date;
    actualizado_en?: Date;
}

export interface FactusConfigCreate {
    id_empresa: number;
    client_id: string;
    client_secret: string;
    factus_username: string;
    factus_password: string;
    ambiente: 'sandbox' | 'produccion';
}

export interface FactusTokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
}

// --- Cliente de Facturación ---
export interface ClienteFacturacion {
    id?: number;
    id_empresa: number;
    tipo_persona: 'natural' | 'juridica';
    tipo_tercero?: 'propietario' | 'empleado' | 'huesped' | 'otro';
    tipo_documento: 'CC' | 'NIT' | 'CE' | 'PP' | 'TI' | 'DIE' | 'NUIP';
    numero_documento: string;
    digito_verificacion?: string | null;
    nombres?: string | null;
    apellidos?: string | null;
    razon_social?: string | null;
    email?: string | null;
    telefono?: string | null;
    direccion?: string | null;
    codigo_municipio?: string | null;
    nombre_municipio?: string | null;
    responsabilidades_fiscales?: string;
    regimen?: string;
    estado?: string;
    creado_en?: Date;
}

export interface ClienteFacturacionCreate {
    id_empresa: number;
    tipo_persona: 'natural' | 'juridica';
    tipo_tercero?: 'propietario' | 'empleado' | 'huesped' | 'otro';
    tipo_documento: 'CC' | 'NIT' | 'CE' | 'PP' | 'TI' | 'DIE' | 'NUIP';
    numero_documento: string;
    digito_verificacion?: string;
    nombres?: string;
    apellidos?: string;
    razon_social?: string;
    email?: string;
    telefono?: string;
    direccion?: string;
    codigo_municipio?: string;
    nombre_municipio?: string;
    responsabilidades_fiscales?: string;
    regimen?: string;
}

export interface ClienteFacturacionUpdate extends Partial<ClienteFacturacionCreate> { }

// --- Items de Factura ---
export interface FacturaItem {
    id?: number;
    id_factura?: number;
    codigo_producto?: string;
    descripcion: string;
    unidad_medida?: number;
    cantidad: number;
    precio_unitario: number;
    porcentaje_descuento?: number;
    tributos?: TributoItem[];
    total_item: number;
    id_tercero?: string;
    nombre_tercero?: string;
}

export interface TributoItem {
    tributo: string; // '01' = IVA, '04' = INC
    porcentaje: number;
    monto?: number;
}

// --- Factura Electrónica ---
export interface FacturaElectronica {
    id?: number;
    id_empresa: number;
    id_cliente?: number | null;
    id_reserva?: number | null;
    id_rango_numeracion?: number | null;
    numero?: string | null;
    prefijo?: string | null;
    cufe?: string | null;
    qr_data?: string | null;
    fecha_emision: string;
    fecha_vencimiento?: string | null;
    subtotal?: number;
    total_descuento?: number;
    total_iva?: number;
    total?: number;
    estado?: 'borrador' | 'enviada' | 'aprobada' | 'rechazada' | 'anulada';
    estado_dian?: string | null;
    estado_dian_descripcion?: string | null;
    payload_enviado?: object | null;
    respuesta_factus?: object | null;
    pdf_url?: string | null;
    xml_url?: string | null;
    notas?: string | null;
    observaciones?: string | null;
    creado_por?: number | null;
    creado_en?: Date;
    // Relations
    items?: FacturaItem[];
    cliente?: ClienteFacturacion;
}

export interface FacturaCreate {
    id_empresa: number;
    id_cliente: number;
    id_reserva?: number;
    id_rango_numeracion: number;
    fecha_emision: string;
    fecha_vencimiento?: string;
    notas?: string;
    observaciones?: string;
    items: FacturaItem[];
    creado_por?: number;
}

// --- Nota de Crédito ---
export interface NotaCredito {
    id?: number;
    id_empresa: number;
    id_factura_referencia?: number | null;
    id_cliente?: number | null;
    id_rango_numeracion?: number | null;
    numero?: string | null;
    prefijo?: string | null;
    cufe?: string | null;
    fecha_emision: string;
    codigo_motivo: string;
    descripcion_motivo?: string | null;
    subtotal?: number;
    total_iva?: number;
    total?: number;
    estado?: string;
    estado_dian?: string | null;
    payload_enviado?: object | null;
    respuesta_factus?: object | null;
    pdf_url?: string | null;
    xml_url?: string | null;
    notas?: string | null;
    creado_por?: number | null;
    creado_en?: Date;
    items?: NotaItem[];
}

// --- Nota de Débito ---
export interface NotaDebito {
    id?: number;
    id_empresa: number;
    id_factura_referencia?: number | null;
    id_cliente?: number | null;
    id_rango_numeracion?: number | null;
    numero?: string | null;
    prefijo?: string | null;
    cufe?: string | null;
    fecha_emision: string;
    codigo_motivo: string;
    descripcion_motivo?: string | null;
    subtotal?: number;
    total_iva?: number;
    total?: number;
    estado?: string;
    estado_dian?: string | null;
    payload_enviado?: object | null;
    respuesta_factus?: object | null;
    pdf_url?: string | null;
    xml_url?: string | null;
    notas?: string | null;
    creado_por?: number | null;
    creado_en?: Date;
    items?: NotaItem[];
}

export interface NotaItem {
    id?: number;
    descripcion: string;
    cantidad: number;
    precio_unitario: number;
    tributos?: TributoItem[];
    total_item: number;
}

// --- Documento Soporte ---
export interface DocumentoSoporte {
    id?: number;
    id_empresa: number;
    id_rango_numeracion?: number | null;
    numero?: string | null;
    prefijo?: string | null;
    cufe?: string | null;
    tipo_documento_proveedor?: string;
    numero_documento_proveedor: string;
    nombre_proveedor: string;
    fecha_emision: string;
    subtotal?: number;
    total_iva?: number;
    total?: number;
    descripcion?: string | null;
    estado?: string;
    estado_dian?: string | null;
    payload_enviado?: object | null;
    respuesta_factus?: object | null;
    pdf_url?: string | null;
    xml_url?: string | null;
    notas?: string | null;
    creado_por?: number | null;
    creado_en?: Date;
    items?: NotaItem[];
}

// --- Declaración de Terceros ---
export interface DeclaracionTercero {
    id?: number;
    id_empresa: number;
    id_propietario?: number | null;
    id_rango_numeracion?: number | null;
    numero?: string | null;
    prefijo?: string | null;
    cufe?: string | null;
    fecha_emision: string;
    periodo_inicio?: string | null;
    periodo_fin?: string | null;
    total_ingresos_bruto?: number;
    comision_waiwa?: number;
    otros_descuentos?: number;
    total_neto_propietario?: number;
    total?: number;
    estado?: string;
    estado_dian?: string | null;
    payload_enviado?: object | null;
    respuesta_factus?: object | null;
    pdf_url?: string | null;
    xml_url?: string | null;
    notas?: string | null;
    creado_por?: number | null;
    creado_en?: Date;
}

// --- Rango de Numeración (respuesta de Factus) ---
export interface RangoNumeracion {
    id: number;
    document: string;
    prefix: string;
    resolution_number: string;
    resolution_date: string;
    technical_key: string;
    from: number;
    to: number;
    generated_count: number;
    next_number?: number;
    is_active: boolean;
}
