import { apiFetch } from './apiFetch';

// ============================================================
// INTERFACES
// ============================================================

export interface IFactusConfig {
    id?: number;
    id_empresa?: number;
    client_id: string;
    client_secret?: string;
    factus_username: string;
    factus_password?: string;
    ambiente: 'sandbox' | 'produccion';
    access_token?: string | null;
    estado?: string;
}

export interface IClienteFacturacion {
    id?: number;
    id_empresa?: number;
    tipo_persona: 'natural' | 'juridica';
    tipo_documento: 'CC' | 'NIT' | 'CE' | 'PP' | 'TI' | 'DIE' | 'NUIP';
    numero_documento: string;
    digito_verificacion?: string;
    nombres?: string;
    apellidos?: string;
    razon_social?: string;
    email?: string;
    telefono?: string;
    direccion?: string;
    codigo_municipio?: string | null;
    nombre_municipio?: string | null;
    nombre_comercial?: string | null;
    codigo_postal?: string | null;
    responsabilidades_fiscales?: string;
    regimen?: string;
    estado?: string;
}

export interface IFacturaItem {
    codigo_producto?: string;
    descripcion: string;
    unidad_medida?: number;
    cantidad: number;
    precio_unitario: number;
    porcentaje_descuento?: number;
    tributos?: { tributo: string; porcentaje: number }[];
    total_item?: number;
}

export interface IFacturaElectronica {
    id?: number;
    id_cliente: number;
    id_reserva?: number;
    id_rango_numeracion: number;
    fecha_emision: string;
    fecha_vencimiento?: string;
    numero?: string;
    prefijo?: string;
    cufe?: string;
    subtotal?: number;
    total_iva?: number;
    total?: number;
    estado?: string;
    estado_dian?: string;
    notas?: string;
    observaciones?: string;
    items: IFacturaItem[];
    // Joins
    nombres?: string;
    apellidos?: string;
    razon_social?: string;
    numero_documento?: string;
}

export interface INotaCredito {
    id?: number;
    id_factura_referencia?: number;
    id_cliente?: number;
    id_rango_numeracion: number;
    fecha_emision: string;
    codigo_motivo: '1' | '2' | '3' | '4' | '5';
    descripcion_motivo?: string;
    subtotal?: number;
    total?: number;
    estado?: string;
    notas?: string;
    items: IFacturaItem[];
}

export interface INotaDebito {
    id?: number;
    id_factura_referencia?: number;
    id_cliente?: number;
    id_rango_numeracion: number;
    fecha_emision: string;
    codigo_motivo: '1' | '2' | '3';
    descripcion_motivo?: string;
    total?: number;
    estado?: string;
    notas?: string;
    items: IFacturaItem[];
}

export interface IDocumentoSoporte {
    id?: number;
    id_rango_numeracion: number;
    tipo_documento_proveedor?: string;
    numero_documento_proveedor: string;
    nombre_proveedor: string;
    fecha_emision: string;
    descripcion?: string;
    total?: number;
    estado?: string;
    notas?: string;
    items: IFacturaItem[];
}

export interface IDeclaracionTercero {
    id?: number;
    id_propietario: number;
    id_rango_numeracion: number;
    fecha_emision: string;
    periodo_inicio?: string;
    periodo_fin?: string;
    total_ingresos_bruto?: number;
    comision_waiwa?: number;
    total_neto_propietario?: number;
    total?: number;
    estado?: string;
    notas?: string;
    propietario_nombre?: string;
    propietario_apellido?: string;
}

export interface IPaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
}

// ============================================================
// HELPERS
// ============================================================
const base = '/api/factus';

// ============================================================
// CONFIG FACTUS
// ============================================================

export async function getFactusConfig(): Promise<{ success: boolean; data?: IFactusConfig; message?: string }> {
    try {
        const data = await apiFetch(`${base}/config`, { method: 'GET' });
        return { success: true, data };
    } catch (error) {
        console.error('Error getFactusConfig:', error);
        return { success: false, message: error instanceof Error ? error.message : 'Error' };
    }
}

export async function saveFactusConfig(payload: Omit<IFactusConfig, 'id' | 'id_empresa'>): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
        const data = await apiFetch(`${base}/config`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Error al guardar config' };
    }
}

export async function testFactusConnection(): Promise<{ success: boolean; data?: { success: boolean; message: string }; message?: string }> {
    try {
        const data = await apiFetch(`${base}/config/test`, { method: 'POST' });
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Error de conexión' };
    }
}

// Helper robusto: desanida cualquier nivel de respuesta de Factus
// Factus a veces devuelve: [...], { data: [...] }, { data: { data: [...] } }
function extractArray(raw: any): any[] {
    if (Array.isArray(raw)) return raw;
    if (raw && Array.isArray(raw.data)) return raw.data;
    if (raw && raw.data && Array.isArray(raw.data.data)) return raw.data.data;
    if (raw && Array.isArray(raw.items)) return raw.items;
    if (raw && raw.data && Array.isArray(raw.data.items)) return raw.data.items;
    console.warn('[factusApi] extractArray: estructura inesperada', raw);
    return [];
}

export async function getNumeracionFactus(): Promise<{ success: boolean; data?: any[]; message?: string }> {
    try {
        const raw = await apiFetch(`${base}/numeracion`, { method: 'GET' });
        console.log('[factusApi] numeracion raw:', raw);
        return { success: true, data: extractArray(raw) };
    } catch (error) {
        return { success: false, data: [], message: error instanceof Error ? error.message : 'Error al obtener numeración' };
    }
}

export async function getMunicipiosFactus(search?: string): Promise<{ success: boolean; data?: any[]; message?: string }> {
    try {
        const q = search ? `?search=${encodeURIComponent(search)}` : '';
        const raw = await apiFetch(`${base}/municipios${q}`, { method: 'GET' });
        return { success: true, data: extractArray(raw) };
    } catch (error) {
        return { success: false, data: [], message: error instanceof Error ? error.message : 'Error' };
    }
}

export async function getTributosFactus(): Promise<{ success: boolean; data?: any[]; message?: string }> {
    try {
        const raw = await apiFetch(`${base}/tributos`, { method: 'GET' });
        return { success: true, data: extractArray(raw) };
    } catch (error) {
        return { success: false, data: [], message: error instanceof Error ? error.message : 'Error' };
    }
}

// ============================================================
// CLIENTES FACTURACIÓN
// ============================================================

export async function getClientesFacturacion(params?: { search?: string; page?: number; limit?: number }): Promise<{ success: boolean; data?: IPaginatedResponse<IClienteFacturacion>; message?: string }> {
    try {
        const q = new URLSearchParams();
        if (params?.search) q.set('search', params.search);
        if (params?.page) q.set('page', String(params.page));
        if (params?.limit) q.set('limit', String(params.limit));
        const url = `${base}/clientes${q.toString() ? `?${q}` : ''}`;
        const data = await apiFetch(url, { method: 'GET' });
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Error' };
    }
}

export async function getClienteFacturacionById(id: number): Promise<{ success: boolean; data?: IClienteFacturacion; message?: string }> {
    try {
        const data = await apiFetch(`${base}/clientes/${id}`, { method: 'GET' });
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Error' };
    }
}

export async function createClienteFacturacion(payload: Omit<IClienteFacturacion, 'id' | 'id_empresa' | 'estado'>): Promise<{ success: boolean; data?: IClienteFacturacion; message?: string }> {
    try {
        const data = await apiFetch(`${base}/clientes`, { method: 'POST', body: JSON.stringify(payload) });
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Error al crear cliente' };
    }
}

export async function updateClienteFacturacion(id: number, payload: Partial<IClienteFacturacion>): Promise<{ success: boolean; data?: IClienteFacturacion; message?: string }> {
    try {
        const data = await apiFetch(`${base}/clientes/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Error al actualizar cliente' };
    }
}

export async function deleteClienteFacturacion(id: number): Promise<{ success: boolean; message?: string }> {
    try {
        await apiFetch(`${base}/clientes/${id}`, { method: 'DELETE' });
        return { success: true };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Error al eliminar' };
    }
}

// ============================================================
// FACTURAS ELECTRÓNICAS
// ============================================================

export async function getFacturas(params?: { estado?: string; fecha_inicio?: string; fecha_fin?: string; page?: number; limit?: number }): Promise<{ success: boolean; data?: IPaginatedResponse<IFacturaElectronica>; message?: string }> {
    try {
        const q = new URLSearchParams();
        if (params?.estado) q.set('estado', params.estado);
        if (params?.fecha_inicio) q.set('fecha_inicio', params.fecha_inicio);
        if (params?.fecha_fin) q.set('fecha_fin', params.fecha_fin);
        if (params?.page) q.set('page', String(params.page));
        if (params?.limit) q.set('limit', String(params.limit));
        const url = `${base}/facturas${q.toString() ? `?${q}` : ''}`;
        const data = await apiFetch(url, { method: 'GET' });
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Error' };
    }
}

export async function getFacturaById(id: number): Promise<{ success: boolean; data?: IFacturaElectronica; message?: string }> {
    try {
        const data = await apiFetch(`${base}/facturas/${id}`, { method: 'GET' });
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Error' };
    }
}

export async function getFacturaDesdeReserva(id_reserva: number): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
        const data = await apiFetch(`${base}/facturas/desde-reserva/${id_reserva}`, { method: 'GET' });
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Error' };
    }
}

export async function createFactura(payload: Omit<IFacturaElectronica, 'id' | 'numero' | 'cufe' | 'estado'>): Promise<{ success: boolean; data?: IFacturaElectronica; message?: string }> {
    try {
        const data = await apiFetch(`${base}/facturas`, { method: 'POST', body: JSON.stringify(payload) });
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Error al crear factura' };
    }
}

export async function enviarFacturaDian(id: number): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
        const data = await apiFetch(`${base}/facturas/${id}?accion=enviar`, { method: 'POST' });
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Error al enviar a DIAN' };
    }
}

export async function descargarFacturaPdf(id: number): Promise<void> {
    try {
        const response: any = await apiFetch(`${base}/facturas/${id}?accion=pdf`, { method: 'GET' });

        let linkSource = '';
        let fileName = `factura_${id}.pdf`;

        if (response instanceof ArrayBuffer) {
            const blob = new Blob([response], { type: 'application/pdf' });
            linkSource = URL.createObjectURL(blob);
        } else {
            // Asume que la API retorna { data: { pdf: "base64_string", file_name: "factura..." } }
            const pdfBase64 = response?.data?.pdf?.pdf_base_64_encoded || response?.data?.file || response?.pdf_base_64_encoded || response?.file;

            if (pdfBase64) {
                linkSource = `data:application/pdf;base64,${pdfBase64}`;
                fileName = response?.data?.pdf?.file_name || response?.pdf?.file_name || `factura_${id}.pdf`;
            }
        }

        if (linkSource) {
            const downloadLink = document.createElement('a');
            downloadLink.href = linkSource;
            downloadLink.download = fileName;
            downloadLink.click();

            if (response instanceof ArrayBuffer) {
                setTimeout(() => URL.revokeObjectURL(linkSource), 100);
            }
        } else {
            console.error('No se recibió el PDF en la respuesta', response);
            alert('El PDF aún no está disponible');
        }
    } catch (e) {
        console.error('Error descargando PDF:', e);
        alert('Error al descargar el PDF');
    }
}

export async function enviarFacturaEmail(id: number, email?: string): Promise<{ success: boolean; message?: string }> {
    try {
        await apiFetch(`${base}/facturas/${id}?accion=email`, { method: 'POST', body: JSON.stringify({ email }) });
        return { success: true };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Error al enviar email' };
    }
}

// ============================================================
// NOTAS DE CRÉDITO
// ============================================================

export async function getNotasCredito(params?: { page?: number; limit?: number }): Promise<{ success: boolean; data?: IPaginatedResponse<INotaCredito>; message?: string }> {
    try {
        const q = new URLSearchParams();
        if (params?.page) q.set('page', String(params.page));
        if (params?.limit) q.set('limit', String(params.limit));
        const data = await apiFetch(`${base}/notas-credito${q.toString() ? `?${q}` : ''}`, { method: 'GET' });
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Error' };
    }
}

export async function getNotaCreditoById(id: number): Promise<{ success: boolean; data?: INotaCredito; message?: string }> {
    try {
        const data = await apiFetch(`${base}/notas-credito/${id}`, { method: 'GET' });
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Error' };
    }
}

export async function createNotaCredito(payload: INotaCredito): Promise<{ success: boolean; data?: INotaCredito; message?: string }> {
    try {
        const data = await apiFetch(`${base}/notas-credito`, { method: 'POST', body: JSON.stringify(payload) });
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Error al crear nota de crédito' };
    }
}

export async function enviarNotaCreditoDian(id: number): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
        const data = await apiFetch(`${base}/notas-credito/${id}?accion=enviar`, { method: 'POST' });
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Error al enviar' };
    }
}

// ============================================================
// NOTAS DE DÉBITO
// ============================================================

export async function getNotasDebito(params?: { page?: number }): Promise<{ success: boolean; data?: IPaginatedResponse<INotaDebito>; message?: string }> {
    try {
        const q = params?.page ? `?page=${params.page}` : '';
        const data = await apiFetch(`${base}/notas-debito${q}`, { method: 'GET' });
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Error' };
    }
}

export async function createNotaDebito(payload: INotaDebito): Promise<{ success: boolean; data?: INotaDebito; message?: string }> {
    try {
        const data = await apiFetch(`${base}/notas-debito`, { method: 'POST', body: JSON.stringify(payload) });
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Error al crear nota de débito' };
    }
}

export async function enviarNotaDebitoDian(id: number): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
        const data = await apiFetch(`${base}/notas-debito/${id}?accion=enviar`, { method: 'POST' });
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Error al enviar' };
    }
}

// ============================================================
// DOCUMENTOS SOPORTE
// ============================================================

export async function getDocumentosSoporte(params?: { page?: number }): Promise<{ success: boolean; data?: IPaginatedResponse<IDocumentoSoporte>; message?: string }> {
    try {
        const q = params?.page ? `?page=${params.page}` : '';
        const data = await apiFetch(`${base}/documentos-soporte${q}`, { method: 'GET' });
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Error' };
    }
}

export async function createDocumentoSoporte(payload: IDocumentoSoporte): Promise<{ success: boolean; data?: IDocumentoSoporte; message?: string }> {
    try {
        const data = await apiFetch(`${base}/documentos-soporte`, { method: 'POST', body: JSON.stringify(payload) });
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Error al crear documento soporte' };
    }
}

export async function enviarDocumentoSoporteDian(id: number): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
        const data = await apiFetch(`${base}/documentos-soporte/${id}?accion=enviar`, { method: 'POST' });
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Error al enviar' };
    }
}

// ============================================================
// DECLARACIONES DE TERCEROS
// ============================================================

export async function getDeclaracionesTerceros(params?: { page?: number }): Promise<{ success: boolean; data?: IPaginatedResponse<IDeclaracionTercero>; message?: string }> {
    try {
        const q = params?.page ? `?page=${params.page}` : '';
        const data = await apiFetch(`${base}/declaraciones-terceros${q}`, { method: 'GET' });
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Error' };
    }
}

export async function createDeclaracionTercero(payload: Partial<IDeclaracionTercero>): Promise<{ success: boolean; data?: IDeclaracionTercero; message?: string }> {
    try {
        const data = await apiFetch(`${base}/declaraciones-terceros`, { method: 'POST', body: JSON.stringify(payload) });
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Error al crear declaración' };
    }
}

export async function generarDeclaracionDesdeMovimientos(payload: {
    id_propietario: number;
    id_rango_numeracion: number;
    periodo_inicio: string;
    periodo_fin: string;
}): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
        const data = await apiFetch(`${base}/declaraciones-terceros/auto`, { method: 'POST', body: JSON.stringify(payload) });
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Error al generar declaración' };
    }
}

export async function enviarDeclaracionTerceroDian(id: number): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
        const data = await apiFetch(`${base}/declaraciones-terceros/${id}?accion=enviar`, { method: 'POST' });
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Error al enviar' };
    }
}

// ============================================================
// PRODUCTOS Y SERVICIOS DE FACTURACIÓN
// ============================================================
export async function getProductosServicios(filters: { search?: string; tipo?: string; page?: number; limit?: number } = {}): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
        const params = new URLSearchParams();
        if (filters.search) params.set('search', filters.search);
        if (filters.tipo) params.set('tipo', filters.tipo);
        if (filters.page) params.set('page', String(filters.page));
        if (filters.limit) params.set('limit', String(filters.limit));
        const qs = params.toString();
        const data = await apiFetch(`${base}/productos-servicios${qs ? `?${qs}` : ''}`);
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Error al obtener productos/servicios' };
    }
}

export async function createProductoServicio(payload: {
    tipo: 'producto' | 'servicio';
    categoria?: string;
    codigo_referencia: string;
    nombre: string;
    descripcion_larga?: string;
    unidad_medida_id?: number;
    unidad_medida_nombre?: string;
    standard_code_id?: number;
    tribute_id?: number;
    impuesto_porcentaje?: number;
    is_excluded?: 0 | 1;
    precio_incluye_iva?: boolean;
    precio_venta_1?: number;
    precio_venta_2?: number;
    retenciones?: Array<{ code: string; withholding_tax_rate: number }>;
}): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
        const data = await apiFetch(`${base}/productos-servicios`, { method: 'POST', body: JSON.stringify(payload) });
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Error al crear producto/servicio' };
    }
}

export async function updateProductoServicio(id: number, payload: Record<string, any>): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
        const data = await apiFetch(`${base}/productos-servicios/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Error al actualizar producto/servicio' };
    }
}

export async function deleteProductoServicio(id: number): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
        const data = await apiFetch(`${base}/productos-servicios/${id}`, { method: 'DELETE' });
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Error al eliminar producto/servicio' };
    }
}

