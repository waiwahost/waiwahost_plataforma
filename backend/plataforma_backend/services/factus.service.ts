import { factusClient } from '../libs/factusClient';
import { Buffer } from 'buffer';
import {
    FactusConfigRepository, ClientesFacturacionRepository, FacturasElectronicasRepository,
    NotasCreditoRepository, NotasDebitoRepository, DocumentosSoporteRepository,
    DeclaracionesTercerosRepository
} from '../repositories/factus.repository';
import { FACTUS_ENDPOINTS } from '../constants/factusConstants';
import { ROLES } from '../constants/globalConstants';

const factusConfigRepo = new FactusConfigRepository();
const clientesRepo = new ClientesFacturacionRepository();
const facturasRepo = new FacturasElectronicasRepository();
const notasCreditoRepo = new NotasCreditoRepository();
const notasDebitoRepo = new NotasDebitoRepository();
const documentosSoporteRepo = new DocumentosSoporteRepository();
const declaracionesTercerosRepo = new DeclaracionesTercerosRepository();

// ===================================================
// Helpers de error estándar
// ===================================================
const err = (status: number, message: string, details?: any) => ({ status, message, details });

// ===================================================
// FACTUS CONFIG SERVICE
// ===================================================
export class FactusConfigService {

    async getConfig(userContext: any) {
        try {
            const id_empresa = Number(userContext.empresaId);
            const { data, error } = await factusConfigRepo.getByEmpresa(id_empresa);
            if (error) return { data: null, error: err(500, 'Error al obtener configuración Factus', error) };
            // Ocultar credenciales sensibles
            if (data) {
                (data as any).factus_password = '***';
                (data as any).client_secret = '***';
                (data as any).access_token = data.access_token ? '***exists***' : null;
            }
            return { data, error: null };
        } catch (e) {
            return { data: null, error: err(500, 'Error interno', e) };
        }
    }

    async upsertConfig(userContext: any, body: any) {
        try {
            const id_empresa = Number(userContext.empresaId);
            const { data, error } = await factusConfigRepo.upsert({ ...body, id_empresa });
            if (error) return { data: null, error: err(500, 'Error al guardar configuración Factus', error) };
            return { data, error: null };
        } catch (e) {
            return { data: null, error: err(500, 'Error interno', e) };
        }
    }

    async testConnection(userContext: any) {
        try {
            const id_empresa = Number(userContext.empresaId);
            const result = await factusClient.testConnection(id_empresa);
            return { data: result, error: null };
        } catch (e: any) {
            return { data: { success: false, message: e.message }, error: null };
        }
    }

    async getNumeracion(userContext: any) {
        try {
            const id_empresa = Number(userContext.empresaId);
            const data = await factusClient.get(FACTUS_ENDPOINTS.numberingRanges, id_empresa);
            return { data, error: null };
        } catch (e: any) {
            return { data: null, error: err(500, `Error al obtener numeración Factus: ${e.message}`, e) };
        }
    }

    async getMunicipios(userContext: any, search?: string) {
        try {
            const id_empresa = Number(userContext.empresaId);
            let endpoint = FACTUS_ENDPOINTS.municipalities;
            if (search) endpoint += `?search=${encodeURIComponent(search)}`;
            const data = await factusClient.get(endpoint, id_empresa);
            return { data, error: null };
        } catch (e: any) {
            return { data: null, error: err(500, `Error al obtener municipios: ${e.message}`, e) };
        }
    }

    async getTributos(userContext: any) {
        try {
            const id_empresa = Number(userContext.empresaId);
            const data = await factusClient.get(FACTUS_ENDPOINTS.tributes, id_empresa);
            return { data, error: null };
        } catch (e: any) {
            return { data: null, error: err(500, `Error al obtener tributos: ${e.message}`, e) };
        }
    }
}

// ===================================================
// CLIENTES FACTURACIÓN SERVICE
// ===================================================
export class ClientesFacturacionService {

    async getAll(userContext: any, filters: any) {
        try {
            const id_empresa = Number(userContext.empresaId);
            const { data, total, error } = await clientesRepo.getAll(id_empresa, filters.search, filters.page, filters.limit);
            if (error) return { data: null, error: err(500, 'Error al obtener clientes', error) };
            return { data: { items: data, total, page: filters.page, limit: filters.limit }, error: null };
        } catch (e) {
            return { data: null, error: err(500, 'Error interno', e) };
        }
    }

    async getById(userContext: any, id: number) {
        try {
            const id_empresa = Number(userContext.empresaId);
            const { data, error } = await clientesRepo.getById(id, id_empresa);
            if (error) return { data: null, error: err(500, 'Error al obtener cliente', error) };
            if (!data) return { data: null, error: err(404, 'Cliente no encontrado') };
            return { data, error: null };
        } catch (e) {
            return { data: null, error: err(500, 'Error interno', e) };
        }
    }

    async create(userContext: any, body: any) {
        try {
            const id_empresa = Number(userContext.empresaId);
            const { data, error } = await clientesRepo.create({ ...body, id_empresa });
            if (error) return { data: null, error: err(500, 'Error al crear cliente', error) };
            return { data, error: null };
        } catch (e) {
            return { data: null, error: err(500, 'Error interno', e) };
        }
    }

    async update(userContext: any, id: number, body: any) {
        try {
            const id_empresa = Number(userContext.empresaId);
            const { data, error } = await clientesRepo.update(id, id_empresa, body);
            if (error) return { data: null, error: err(500, 'Error al actualizar cliente', error) };
            if (!data) return { data: null, error: err(404, 'Cliente no encontrado') };
            return { data, error: null };
        } catch (e) {
            return { data: null, error: err(500, 'Error interno', e) };
        }
    }

    async softDelete(userContext: any, id: number) {
        try {
            const id_empresa = Number(userContext.empresaId);
            const { data, error } = await clientesRepo.softDelete(id, id_empresa);
            if (error) return { data: null, error: err(500, 'Error al eliminar cliente', error) };
            if (!data) return { data: null, error: err(404, 'Cliente no encontrado') };
            return { data, error: null };
        } catch (e) {
            return { data: null, error: err(500, 'Error interno', e) };
        }
    }
}

// ===================================================
// FACTURAS ELECTRÓNICAS SERVICE
// ===================================================
export class FacturasElectronicasService {

    private calcularTotales(items: any[]): { subtotal: number; total_iva: number; total_descuento: number; total: number } {
        let subtotal = 0, total_iva = 0, total_descuento = 0;
        for (const item of items) {
            const base = item.cantidad * item.precio_unitario;
            const descuento = base * ((item.porcentaje_descuento || 0) / 100);
            const baseConDescuento = base - descuento;
            let iva = 0;
            for (const tributo of (item.tributos || [])) {
                if (tributo.tributo === '01') iva += baseConDescuento * (tributo.porcentaje / 100);
            }
            subtotal += baseConDescuento;
            total_descuento += descuento;
            total_iva += iva;
            item.total_item = baseConDescuento + iva;
        }
        return { subtotal, total_iva, total_descuento, total: subtotal + total_iva };
    }

    private buildFactusPayload(factura: any, cliente: any, items: any[], empresa: any): object {
        const mappedItems = items.map((item: any, idx: number) => {
            let scheme_id = "0";
            let mandate = undefined;
            if (item.es_ingreso_tercero && item.id_tercero) {
                scheme_id = "1";
                mandate = {
                    identification_document_id: mapTipoDocumento(item.tipo_doc_mandante || 'CC'),
                    identification: item.id_tercero
                };
            }
            return {
                code_reference: item.codigo_producto || String(idx + 1),
                name: item.descripcion,
                quantity: Number(item.cantidad) || 1, // Asegurar que sea numérico
                discount_rate: Number(item.porcentaje_descuento) || 0,
                price: Number(item.precio_unitario),
                tax_rate: (item.tributos || []).find((t: any) => t.tributo === '01')?.porcentaje?.toString() || '0.00',
                unit_measure_id: Number(item.unidad_medida) || 70,
                standard_code_id: 1, // 1 = Estándar de adopción del contribuyente
                is_excluded: 0, // 0 = No excluido (grava IVA) o 1 = Excluido
                tribute_id: 1,
                withholding_taxes: [],
                scheme_id,
                ...(mandate ? { mandate } : {})
            };
        });

        const operation_type = mappedItems.some((i: any) => i.scheme_id === "1") ? "11" : (factura.tipo_operacion || "10");

        return {
            numbering_range_id: factura.id_rango_numeracion,
            reference_code: `WW-${factura.id}`,
            observation: factura.observaciones || factura.notas || '',
            payment_method_code: '10', // Efectivo por defecto (puede configurarse)
            operation_type,
            document: "01",
            customer: {
                identification: cliente.numero_documento,
                dv: cliente.digito_verificacion || undefined,
                company: cliente.razon_social || undefined,
                trade_name: cliente.razon_social || undefined,
                names: cliente.nombres ? `${cliente.nombres} ${cliente.apellidos || ''}`.trim() : undefined,
                address: cliente.direccion || 'No aplica',
                email: cliente.email || '',
                phone: cliente.telefono || '',
                identification_document_id: mapTipoDocumento(cliente.tipo_documento),
                legal_organization_id: cliente.tipo_persona === 'juridica' ? "1" : "2",
                municipality_id: Number(cliente.codigo_municipio) > 0 && Number(cliente.codigo_municipio) < 2000 ? String(cliente.codigo_municipio) : "982",
                tribute_id: "21",
                obligations: JSON.parse(cliente.responsabilidades_fiscales || '["R-99-PN"]'),
            },
            items: mappedItems,
        };
    }

    async getAll(userContext: any, filters: any) {
        try {
            const id_empresa = Number(userContext.empresaId);
            const { data, total, error } = await facturasRepo.getAll(id_empresa, filters);
            if (error) return { data: null, error: err(500, 'Error al obtener facturas', error) };
            return { data: { items: data, total, page: filters.page, limit: filters.limit }, error: null };
        } catch (e) {
            return { data: null, error: err(500, 'Error interno', e) };
        }
    }

    async getById(userContext: any, id: number) {
        try {
            const id_empresa = Number(userContext.empresaId);
            const { data, error } = await facturasRepo.getById(id, id_empresa);
            if (error) return { data: null, error: err(500, 'Error al obtener factura', error) };
            if (!data) return { data: null, error: err(404, 'Factura no encontrada') };
            return { data, error: null };
        } catch (e) {
            return { data: null, error: err(500, 'Error interno', e) };
        }
    }

    async getDesdeReserva(userContext: any, id_reserva: number) {
        try {
            const id_empresa = Number(userContext.empresaId);
            const { data, error } = await facturasRepo.getDesdeReserva(id_reserva, id_empresa);
            if (error) return { data: null, error: err(500, 'Error al obtener reserva', error) };
            if (!data) return { data: null, error: err(404, 'Reserva no encontrada') };
            // Pre-armar sugerencia de factura
            const sugerencia = {
                id_reserva: data.id_reserva,
                cliente_sugerido: {
                    tipo_persona: 'natural',
                    tipo_tercero: 'huesped',
                    tipo_documento: data.documento_tipo || 'CC',
                    numero_documento: data.documento_identidad || '',
                    nombres: data.huesped_nombre || '',
                    apellidos: data.huesped_apellido || '',
                    email: data.huesped_email || '',
                    telefono: data.huesped_telefono || '',
                },
                propietario_sugerido: {
                    id_propietario: data.id_propietario,
                    tipo_persona: 'natural',
                    tipo_tercero: 'propietario',
                    tipo_documento: data.propietario_doc_tipo || 'CC',
                    numero_documento: data.propietario_documento_id || '',
                    nombres: data.propietario_nombre || '',
                    apellidos: data.propietario_apellido || '',
                    email: data.propietario_email || '',
                    telefono: data.propietario_telefono || '',
                },
                items_sugeridos: [
                    {
                        descripcion: `Alojamiento en ${data.inmueble_nombre} - ${data.codigo_reserva || ''}`,
                        cantidad: 1,
                        precio_unitario: Number(data.total_reserva) || 0,
                        tributos: [],
                    }
                ]
            };
            return { data: sugerencia, error: null };
        } catch (e) {
            return { data: null, error: err(500, 'Error interno', e) };
        }
    }

    async create(userContext: any, body: any) {
        try {
            const id_empresa = Number(userContext.empresaId);
            const totales = this.calcularTotales(body.items);
            const { data, error } = await facturasRepo.create({
                ...body, ...totales, id_empresa, creado_por: userContext.id
            });
            if (error) return { data: null, error: err(500, 'Error al crear factura', error) };
            return { data, error: null };
        } catch (e) {
            return { data: null, error: err(500, 'Error interno', e) };
        }
    }

    async enviarDian(userContext: any, id: number) {
        try {
            const id_empresa = Number(userContext.empresaId);
            // 1. Obtener factura con todos los datos
            const { data: factura, error: errFactura } = await facturasRepo.getById(id, id_empresa);
            if (errFactura || !factura) return { data: null, error: err(404, 'Factura no encontrada') };
            if (factura.estado !== 'borrador') return { data: null, error: err(400, 'Solo facturas en borrador pueden enviarse') };

            // 2. Obtener cliente
            const { data: cliente } = await clientesRepo.getById(factura.id_cliente, id_empresa);
            if (!cliente) return { data: null, error: err(404, 'Cliente de la factura no encontrado') };

            // 3. Construir payload Factus
            const payload = this.buildFactusPayload(factura, cliente, factura.items, {});

            // 4. Crear y validar en Factus
            const respFactus = await factusClient.post(FACTUS_ENDPOINTS.bills + '/validate', payload, id_empresa);
            const respDian = respFactus; // In Factus, /validate creates and returns the validation response

            // 6. Guardar respuesta en BD
            const { data: updated } = await facturasRepo.updateFactusResponse(id, id_empresa, {
                numero: respFactus?.data?.number || respFactus?.data?.bill?.number,
                prefijo: respFactus?.data?.prefix,
                cufe: respFactus?.data?.cufe || respDian?.data?.cufe,
                qr_data: respFactus?.data?.qr_data,
                estado: 'enviada',
                estado_dian: respDian?.data?.dian_response?.is_valid ? 'aprobada' : 'pendiente',
                estado_dian_descripcion: respDian?.data?.dian_response?.description,
                payload_enviado: payload,
                respuesta_factus: respFactus,
            });

            return { data: { factura: updated, factus: respFactus, dian: respDian }, error: null };
        } catch (e: any) {
            return { data: null, error: err(500, `Error al enviar a DIAN: ${e.message}`, e) };
        }
    }

    async descargarPdf(userContext: any, id: number): Promise<{ buffer: Buffer | null; contentType: string; error: any }> {
        try {
            const id_empresa = Number(userContext.empresaId);
            const { data: factura } = await facturasRepo.getById(id, id_empresa);
            if (!factura) return { buffer: null, contentType: '', error: err(404, 'Factura no encontrada') };
            // Usar número de Factus para descarga
            const factusId = factura.respuesta_factus?.data?.bill?.number || factura.numero;
            if (!factusId) return { buffer: null, contentType: '', error: err(400, 'Factura no enviada a Factus aún') };

            // Factus API: GET /v1/bills/{number}/download-pdf
            const endpoint = FACTUS_ENDPOINTS.billDownloadPdf(factusId);

            const resp = await factusClient.get(endpoint, id_empresa);

            const pdfBase64 = resp?.data?.pdf_base_64_encoded || resp?.data?.file;

            if (!pdfBase64) {
                return { buffer: null, contentType: '', error: err(404, 'PDF base64 no encontrado en la respuesta de Factus.') };
            }

            const buffer = Buffer.from(pdfBase64, 'base64');
            return { buffer, contentType: 'application/pdf', error: null };
        } catch (e: any) {
            return { buffer: null, contentType: '', error: err(500, `Error al descargar PDF: ${e.message}`, e) };
        }
    }

    async enviarEmail(userContext: any, id: number, email?: string) {
        try {
            const id_empresa = Number(userContext.empresaId);
            const { data: factura } = await facturasRepo.getById(id, id_empresa);
            if (!factura) return { data: null, error: err(404, 'Factura no encontrada') };
            const factusId = factura.respuesta_factus?.data?.bill?.number || factura.numero;
            if (!factusId) return { data: null, error: err(400, 'Factura no enviada a Factus aún') };
            const payload: any = {};
            if (email) payload.email = email;
            const resp = await factusClient.post(FACTUS_ENDPOINTS.billSendEmail(factusId), payload, id_empresa);
            return { data: resp, error: null };
        } catch (e: any) {
            return { data: null, error: err(500, `Error al enviar email: ${e.message}`, e) };
        }
    }
}

// ===================================================
// NOTAS DE CRÉDITO SERVICE
// ===================================================
export class NotasCreditoService {

    private calcularTotales(items: any[]) {
        let subtotal = 0, total_iva = 0;
        for (const item of items) {
            const base = item.cantidad * item.precio_unitario;
            for (const t of (item.tributos || [])) {
                if (t.tributo === '01') total_iva += base * (t.porcentaje / 100);
            }
            subtotal += base;
            item.total_item = base + total_iva;
        }
        return { subtotal, total_iva, total: subtotal + total_iva };
    }

    async getAll(userContext: any, filters: any) {
        try {
            const id_empresa = Number(userContext.empresaId);
            const { data, total, error } = await notasCreditoRepo.getAll(id_empresa, filters);
            if (error) return { data: null, error: err(500, 'Error al obtener notas', error) };
            return { data: { items: data, total }, error: null };
        } catch (e) { return { data: null, error: err(500, 'Error interno', e) }; }
    }

    async getById(userContext: any, id: number) {
        try {
            const id_empresa = Number(userContext.empresaId);
            const { data, error } = await notasCreditoRepo.getById(id, id_empresa);
            if (error) return { data: null, error: err(500, 'Error', error) };
            if (!data) return { data: null, error: err(404, 'Nota de crédito no encontrada') };
            return { data, error: null };
        } catch (e) { return { data: null, error: err(500, 'Error interno', e) }; }
    }

    async create(userContext: any, body: any) {
        try {
            const id_empresa = Number(userContext.empresaId);
            const totales = this.calcularTotales(body.items);
            const { data, error } = await notasCreditoRepo.create({ ...body, ...totales, id_empresa, creado_por: userContext.id });
            if (error) return { data: null, error: err(500, 'Error al crear nota de crédito', error) };
            return { data, error: null };
        } catch (e) { return { data: null, error: err(500, 'Error interno', e) }; }
    }

    async enviarDian(userContext: any, id: number) {
        try {
            const id_empresa = Number(userContext.empresaId);
            const { data: nota } = await notasCreditoRepo.getById(id, id_empresa);
            if (!nota) return { data: null, error: err(404, 'Nota de crédito no encontrada') };
            if (nota.estado !== 'borrador') return { data: null, error: err(400, 'Solo borradores pueden enviarse') };

            // Obtener factura referencia si existe
            let facturaRef: any = null;
            if (nota.id_factura_referencia) {
                const { data } = await facturasRepo.getById(nota.id_factura_referencia, id_empresa);
                facturaRef = data;
            }

            const payload: any = {
                numbering_range_id: nota.id_rango_numeracion,
                correction_concept_id: Number(nota.codigo_motivo),
                observation: nota.notas || '',
                items: nota.items.map((item: any) => ({
                    name: item.descripcion,
                    quantity: item.cantidad,
                    price: item.precio_unitario,
                    tax_rate: '0',
                    unit_measure_id: 70,
                    type_item_identification_id: 2,
                    tribute_id: 1,
                    taxes: [],
                })),
            };

            if (facturaRef?.cufe) {
                payload.reference = { invoice_uuid: facturaRef.cufe, issue_date: facturaRef.fecha_emision, prefix: facturaRef.prefijo };
            }

            const respFactus = await factusClient.post(FACTUS_ENDPOINTS.creditNotes + '/validate', payload, id_empresa);
            const respDian = respFactus;

            const { data: updated } = await notasCreditoRepo.updateFactusResponse(id, id_empresa, {
                numero: respFactus?.data?.number || respFactus?.data?.credit_note?.number, cufe: respFactus?.data?.cufe,
                estado: 'enviada', estado_dian: respDian?.data?.dian_response?.is_valid ? 'aprobada' : 'pendiente',
                payload_enviado: payload, respuesta_factus: respFactus,
            });
            return { data: { nota: updated, factus: respFactus, dian: respDian }, error: null };
        } catch (e: any) {
            return { data: null, error: err(500, `Error al enviar nota de crédito: ${e.message}`, e) };
        }
    }

    async descargarPdf(userContext: any, id: number): Promise<{ buffer: Buffer | null; contentType: string; error: any }> {
        try {
            const id_empresa = Number(userContext.empresaId);
            const { data: nota } = await notasCreditoRepo.getById(id, id_empresa);
            if (!nota) return { buffer: null, contentType: '', error: err(404, 'Nota no encontrada') };
            const factusId = nota.respuesta_factus?.data?.id;
            if (!factusId) return { buffer: null, contentType: '', error: err(400, 'Nota no enviada a Factus aún') };
            const { buffer, contentType } = await factusClient.download(FACTUS_ENDPOINTS.creditNoteDownloadPdf(factusId), id_empresa);
            return { buffer, contentType, error: null };
        } catch (e: any) { return { buffer: null, contentType: '', error: err(500, e.message, e) }; }
    }
}

// ===================================================
// NOTAS DE DÉBITO SERVICE
// ===================================================
export class NotasDebitoService {

    async getAll(userContext: any, filters: any) {
        try {
            const id_empresa = Number(userContext.empresaId);
            const { data, total, error } = await notasDebitoRepo.getAll(id_empresa, filters);
            if (error) return { data: null, error: err(500, 'Error', error) };
            return { data: { items: data, total }, error: null };
        } catch (e) { return { data: null, error: err(500, 'Error interno', e) }; }
    }

    async getById(userContext: any, id: number) {
        try {
            const id_empresa = Number(userContext.empresaId);
            const { data, error } = await notasDebitoRepo.getById(id, id_empresa);
            if (error) return { data: null, error: err(500, 'Error', error) };
            if (!data) return { data: null, error: err(404, 'Nota de débito no encontrada') };
            return { data, error: null };
        } catch (e) { return { data: null, error: err(500, 'Error interno', e) }; }
    }

    async create(userContext: any, body: any) {
        try {
            const id_empresa = Number(userContext.empresaId);
            let subtotal = 0, total = 0;
            for (const item of body.items) { subtotal += item.cantidad * item.precio_unitario; item.total_item = item.cantidad * item.precio_unitario; }
            total = subtotal;
            const { data, error } = await notasDebitoRepo.create({ ...body, subtotal, total_iva: 0, total, id_empresa, creado_por: userContext.id });
            if (error) return { data: null, error: err(500, 'Error al crear nota de débito', error) };
            return { data, error: null };
        } catch (e) { return { data: null, error: err(500, 'Error interno', e) }; }
    }

    async enviarDian(userContext: any, id: number) {
        try {
            const id_empresa = Number(userContext.empresaId);
            const { data: nota } = await notasDebitoRepo.getById(id, id_empresa);
            if (!nota) return { data: null, error: err(404, 'Nota de débito no encontrada') };
            if (nota.estado !== 'borrador') return { data: null, error: err(400, 'Solo borradores pueden enviarse') };

            const payload: any = {
                numbering_range_id: nota.id_rango_numeracion,
                discount_concept_id: Number(nota.codigo_motivo),
                observation: nota.notas || '',
                items: nota.items.map((item: any) => ({
                    name: item.descripcion, quantity: item.cantidad, price: item.precio_unitario,
                    tax_rate: '0', unit_measure_id: 70, type_item_identification_id: 2, tribute_id: 1, taxes: [],
                })),
            };

            const respFactus = await factusClient.post(FACTUS_ENDPOINTS.debitNotes + '/validate', payload, id_empresa);

            const { data: updated } = await notasDebitoRepo.updateFactusResponse(id, id_empresa, {
                numero: respFactus?.data?.number || respFactus?.data?.debit_note?.number, cufe: respFactus?.data?.cufe,
                estado: 'enviada', estado_dian: 'pendiente',
                respuesta_factus: respFactus, pdf_url: null,
            });
            return { data: { nota: updated, factus: respFactus }, error: null };
        } catch (e: any) {
            return { data: null, error: err(500, `Error al enviar nota de débito: ${e.message}`, e) };
        }
    }
}

// ===================================================
// DOCUMENTOS SOPORTE SERVICE
// ===================================================
export class DocumentosSoporteService {

    async getAll(userContext: any, filters: any) {
        try {
            const id_empresa = Number(userContext.empresaId);
            const { data, total, error } = await documentosSoporteRepo.getAll(id_empresa, filters);
            if (error) return { data: null, error: err(500, 'Error', error) };
            return { data: { items: data, total }, error: null };
        } catch (e) { return { data: null, error: err(500, 'Error interno', e) }; }
    }

    async getById(userContext: any, id: number) {
        try {
            const id_empresa = Number(userContext.empresaId);
            const { data, error } = await documentosSoporteRepo.getById(id, id_empresa);
            if (error) return { data: null, error: err(500, 'Error', error) };
            if (!data) return { data: null, error: err(404, 'Documento soporte no encontrado') };
            return { data, error: null };
        } catch (e) { return { data: null, error: err(500, 'Error interno', e) }; }
    }

    async create(userContext: any, body: any) {
        try {
            const id_empresa = Number(userContext.empresaId);
            let subtotal = 0, total_iva = 0;
            for (const item of body.items) {
                const base = item.cantidad * item.precio_unitario;
                for (const t of (item.tributos || [])) { if (t.tributo === '01') total_iva += base * (t.porcentaje / 100); }
                subtotal += base;
                item.total_item = base;
            }
            const { data, error } = await documentosSoporteRepo.create({ ...body, subtotal, total_iva, total: subtotal + total_iva, id_empresa, creado_por: userContext.id });
            if (error) return { data: null, error: err(500, 'Error al crear documento soporte', error) };
            return { data, error: null };
        } catch (e) { return { data: null, error: err(500, 'Error interno', e) }; }
    }

    async enviarDian(userContext: any, id: number) {
        try {
            const id_empresa = Number(userContext.empresaId);
            const { data: doc } = await documentosSoporteRepo.getById(id, id_empresa);
            if (!doc) return { data: null, error: err(404, 'Documento soporte no encontrado') };
            if (doc.estado !== 'borrador') return { data: null, error: err(400, 'Solo borradores pueden enviarse') };

            const payload = {
                document: "03",
                numbering_range_id: doc.id_rango_numeracion,
                reference_code: `DS-${doc.id}`,
                observation: doc.descripcion || '',
                payment_method_code: "10",
                customer: {
                    identification: doc.numero_documento_proveedor,
                    names: doc.nombre_proveedor,
                    identification_document_id: mapTipoDocumento(doc.tipo_documento_proveedor),
                    trade_name: "",
                    company: "",
                    legal_organization_id: "2",
                    tribute_id: "21",
                    municipality_id: "982",
                    email: "correo@proveedor.com",
                    phone: "0000000",
                    address: "No aplica"
                },
                items: doc.items.map((item: any, idx: number) => ({
                    code_reference: item.codigo_producto || String(idx+1),
                    name: item.descripcion, 
                    quantity: Number(item.cantidad) || 1, 
                    price: Number(item.precio_unitario),
                    tax_rate: "0.00", 
                    discount_rate: 0,
                    unit_measure_id: 70, 
                    standard_code_id: 1,
                    is_excluded: 0,
                    tribute_id: 1, 
                    withholding_taxes: [],
                })),
            };

            // Factus valida el doc 03 por su endpoint general de bills
            const respFactus = await factusClient.post(FACTUS_ENDPOINTS.bills + '/validate', payload, id_empresa);

            const { data: updated } = await documentosSoporteRepo.updateFactusResponse(id, id_empresa, {
                numero: respFactus?.data?.number || respFactus?.data?.support_document?.number, cufe: respFactus?.data?.cufe,
                estado: 'enviada', estado_dian: 'pendiente',
                respuesta_factus: respFactus, payload_enviado: payload,
            });
            return { data: { documento: updated, factus: respFactus }, error: null };
        } catch (e: any) {
            return { data: null, error: err(500, `Error al enviar documento soporte: ${e.message}`, e) };
        }
    }
}

// ===================================================
// DECLARACIONES TERCEROS SERVICE
// ===================================================
export class DeclaracionesTercerosService {

    async getAll(userContext: any, filters: any) {
        try {
            const id_empresa = Number(userContext.empresaId);
            const { data, total, error } = await declaracionesTercerosRepo.getAll(id_empresa, filters);
            if (error) return { data: null, error: err(500, 'Error', error) };
            return { data: { items: data, total }, error: null };
        } catch (e) { return { data: null, error: err(500, 'Error interno', e) }; }
    }

    async getById(userContext: any, id: number) {
        try {
            const id_empresa = Number(userContext.empresaId);
            const { data, error } = await declaracionesTercerosRepo.getById(id, id_empresa);
            if (error) return { data: null, error: err(500, 'Error', error) };
            if (!data) return { data: null, error: err(404, 'Declaración no encontrada') };
            return { data, error: null };
        } catch (e) { return { data: null, error: err(500, 'Error interno', e) }; }
    }

    async create(userContext: any, body: any) {
        try {
            const id_empresa = Number(userContext.empresaId);
            const { data, error } = await declaracionesTercerosRepo.create({ ...body, id_empresa, creado_por: userContext.id });
            if (error) return { data: null, error: err(500, 'Error al crear declaración', error) };
            return { data, error: null };
        } catch (e) { return { data: null, error: err(500, 'Error interno', e) }; }
    }

    async generarDesdeMovimientos(userContext: any, body: any) {
        try {
            const id_empresa = Number(userContext.empresaId);
            const { id_propietario, id_rango_numeracion, periodo_inicio, periodo_fin } = body;

            // Calcular ingresos del propietario en el período
            const { data: movimientos, error: errMov } = await declaracionesTercerosRepo.getMovimientosPropietarioPeriodo(
                id_propietario, id_empresa, periodo_inicio, periodo_fin
            );
            if (errMov) return { data: null, error: err(500, 'Error al calcular movimientos', errMov) };

            let total_ingresos_bruto = 0, comision_waiwa = 0;
            for (const mov of (movimientos || [])) {
                const ingresos = Number(mov.total_ingresos) || 0;
                total_ingresos_bruto += ingresos;
                const pct_comision = Number(mov.comision) || 0;
                comision_waiwa += ingresos * (pct_comision / 100);
            }
            const total_neto_propietario = total_ingresos_bruto - comision_waiwa;

            const dataCrear = {
                id_empresa, id_propietario, id_rango_numeracion,
                fecha_emision: new Date().toISOString().split('T')[0],
                periodo_inicio, periodo_fin,
                total_ingresos_bruto, comision_waiwa, otros_descuentos: 0,
                total_neto_propietario, total: total_neto_propietario,
                creado_por: userContext.id,
            };

            const { data, error } = await declaracionesTercerosRepo.create(dataCrear);
            if (error) return { data: null, error: err(500, 'Error al crear declaración', error) };
            return { data: { declaracion: data, detalle: movimientos }, error: null };
        } catch (e) { return { data: null, error: err(500, 'Error interno', e) }; }
    }

    async enviarDian(userContext: any, id: number) {
        // La declaración de terceros en Factus se maneja como factura electrónica
        // con el ID del tercero en los items. Esta lógica se adapta cuando
        // Factus habilite el endpoint específico para este documento.
        return { data: null, error: err(501, 'Endpoint de declaraciones de terceros en desarrollo por Factus') };
    }
}

// ===================================================
// Helpers
// ===================================================
function mapTipoDocumento(tipo: string): number {
    const mapa: Record<string, number> = {
        'CC': 3, 'NIT': 6, 'CE': 2, 'PP': 9, 'TI': 7, 'DIE': 11, 'NUIP': 3
    };
    return mapa[tipo] || 3;
}

// Exports singleton
export const factusConfigService = new FactusConfigService();
export const clientesFacturacionService = new ClientesFacturacionService();
export const facturasElectronicasService = new FacturasElectronicasService();
export const notasCreditoService = new NotasCreditoService();
export const notasDebitoService = new NotasDebitoService();
export const documentosSoporteService = new DocumentosSoporteService();
export const declaracionesTercerosService = new DeclaracionesTercerosService();
