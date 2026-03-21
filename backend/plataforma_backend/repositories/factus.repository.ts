import pool from '../libs/db';
import { FactusConfig, FactusConfigCreate, ClienteFacturacionCreate, ClienteFacturacionUpdate } from '../interfaces/factus.interface';

// ===================================================
// FACTUS CONFIG REPOSITORY
// ===================================================
export class FactusConfigRepository {

    async getByEmpresa(id_empresa: number): Promise<{ data: FactusConfig | null; error: any }> {
        try {
            const { rows } = await pool.query(
                `SELECT id, id_empresa, client_id, client_secret, factus_username, ambiente,
                access_token, refresh_token, token_expires_at, estado, creado_en, actualizado_en
         FROM factus_config
         WHERE id_empresa = $1 LIMIT 1`,
                [id_empresa]
            );
            return { data: rows[0] || null, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    async upsert(data: FactusConfigCreate): Promise<{ data: FactusConfig | null; error: any }> {
        try {
            const { rows } = await pool.query(
                `INSERT INTO factus_config (id_empresa, client_id, client_secret, factus_username, factus_password, ambiente)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id_empresa) DO UPDATE SET
           client_id = EXCLUDED.client_id,
           client_secret = EXCLUDED.client_secret,
           factus_username = EXCLUDED.factus_username,
           factus_password = EXCLUDED.factus_password,
           ambiente = EXCLUDED.ambiente,
           -- Resetear tokens al cambiar credenciales
           access_token = NULL,
           refresh_token = NULL,
           token_expires_at = NULL,
           actualizado_en = NOW()
         RETURNING id, id_empresa, client_id, factus_username, ambiente, estado`,
                [data.id_empresa, data.client_id, data.client_secret, data.factus_username, data.factus_password, data.ambiente]
            );
            return { data: rows[0] || null, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    async updateAmbiente(id_empresa: number, ambiente: 'sandbox' | 'produccion'): Promise<{ data: any; error: any }> {
        try {
            const { rows } = await pool.query(
                `UPDATE factus_config
         SET ambiente = $1, access_token = NULL, refresh_token = NULL, token_expires_at = NULL, actualizado_en = NOW()
         WHERE id_empresa = $2
         RETURNING id, ambiente`,
                [ambiente, id_empresa]
            );
            return { data: rows[0] || null, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }
}

// ===================================================
// CLIENTES FACTURACIÓN REPOSITORY
// ===================================================
export class ClientesFacturacionRepository {

    async getAll(id_empresa: number, search?: string, page: number = 1, limit: number = 20, filters?: any): Promise<{ data: any[]; total: number; error: any }> {
        try {
            const offset = (page - 1) * limit;
            let baseQuery = `FROM clientes_facturacion WHERE id_empresa = $1 AND estado = 'activo'`;
            const params: any[] = [id_empresa];
            let paramIdx = 2;

            if (search) {
                baseQuery += ` AND (numero_documento ILIKE $${paramIdx} OR nombres ILIKE $${paramIdx} OR apellidos ILIKE $${paramIdx} OR razon_social ILIKE $${paramIdx})`;
                params.push(`%${search}%`);
                paramIdx++;
            }

            if (filters && filters.tipo_tercero) {
                baseQuery += ` AND tipo_tercero = $${paramIdx}`;
                params.push(filters.tipo_tercero);
                paramIdx++;
            }

            const countResult = await pool.query(`SELECT COUNT(*) ${baseQuery}`, params);
            const total = parseInt(countResult.rows[0].count, 10);

            const { rows } = await pool.query(
                `SELECT * ${baseQuery} ORDER BY creado_en DESC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
                [...params, limit, offset]
            );

            return { data: rows, total, error: null };
        } catch (error: any) {
            return { data: [], total: 0, error };
        }
    }

    async getById(id: number, id_empresa: number): Promise<{ data: any; error: any }> {
        try {
            const { rows } = await pool.query(
                `SELECT * FROM clientes_facturacion WHERE id = $1 AND id_empresa = $2`,
                [id, id_empresa]
            );
            return { data: rows[0] || null, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    async create(data: ClienteFacturacionCreate & { id_empresa: number }): Promise<{ data: any; error: any }> {
        try {
            const { rows } = await pool.query(
                `INSERT INTO clientes_facturacion
          (id_empresa, tipo_persona, tipo_tercero, tipo_documento, numero_documento, digito_verificacion,
           nombres, apellidos, razon_social, email, telefono, direccion,
           codigo_municipio, nombre_municipio, responsabilidades_fiscales, regimen, nombre_comercial, codigo_postal)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
         RETURNING *`,
                [
                    data.id_empresa, data.tipo_persona, data.tipo_tercero || 'otro', data.tipo_documento, data.numero_documento,
                    data.digito_verificacion || null, data.nombres || null, data.apellidos || null,
                    data.razon_social || null, data.email || null, data.telefono || null,
                    data.direccion || null, data.codigo_municipio || null, data.nombre_municipio || null,
                    data.responsabilidades_fiscales || '["R-99-PN"]', data.regimen || 'simplificado',
                    data.nombre_comercial || null, data.codigo_postal || null
                ]
            );
            return { data: rows[0], error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    async update(id: number, id_empresa: number, data: ClienteFacturacionUpdate): Promise<{ data: any; error: any }> {
        try {
            const fields: string[] = [];
            const values: any[] = [];
            let idx = 1;

            const allowed = ['tipo_persona', 'tipo_tercero', 'tipo_documento', 'numero_documento', 'digito_verificacion',
                'nombres', 'apellidos', 'razon_social', 'email', 'telefono', 'direccion',
                'codigo_municipio', 'nombre_municipio', 'responsabilidades_fiscales', 'regimen', 'nombre_comercial', 'codigo_postal'];
            for (const key of allowed) {
                if ((data as any)[key] !== undefined) {
                    fields.push(`${key} = $${idx++}`);
                    values.push((data as any)[key]);
                }
            }

            if (fields.length === 0) return { data: null, error: { message: 'No hay campos para actualizar' } };

            const { rows } = await pool.query(
                `UPDATE clientes_facturacion SET ${fields.join(', ')} WHERE id = $${idx} AND id_empresa = $${idx + 1} RETURNING *`,
                [...values, id, id_empresa]
            );
            return { data: rows[0] || null, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    async softDelete(id: number, id_empresa: number): Promise<{ data: any; error: any }> {
        try {
            const { rows } = await pool.query(
                `UPDATE clientes_facturacion SET estado = 'inactivo' WHERE id = $1 AND id_empresa = $2 RETURNING id`,
                [id, id_empresa]
            );
            return { data: rows[0] || null, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }
}

// ===================================================
// FACTURAS ELECTRÓNICAS REPOSITORY
// ===================================================
export class FacturasElectronicasRepository {

    async getAll(id_empresa: number, filters: any = {}): Promise<{ data: any[]; total: number; error: any }> {
        try {
            const { estado, fecha_inicio, fecha_fin, id_cliente, page = 1, limit = 20 } = filters;
            const offset = (page - 1) * limit;
            let baseQuery = `
        FROM facturas_electronicas f
        LEFT JOIN clientes_facturacion c ON f.id_cliente = c.id
        WHERE f.id_empresa = $1
      `;
            const params: any[] = [id_empresa];
            let idx = 2;

            if (estado) { baseQuery += ` AND f.estado = $${idx++}`; params.push(estado); }
            if (fecha_inicio) { baseQuery += ` AND f.fecha_emision >= $${idx++}`; params.push(fecha_inicio); }
            if (fecha_fin) { baseQuery += ` AND f.fecha_emision <= $${idx++}`; params.push(fecha_fin); }
            if (id_cliente) { baseQuery += ` AND f.id_cliente = $${idx++}`; params.push(id_cliente); }

            const countRes = await pool.query(`SELECT COUNT(*) ${baseQuery}`, params);
            const total = parseInt(countRes.rows[0].count, 10);

            const { rows } = await pool.query(
                `SELECT f.*, c.nombres, c.apellidos, c.razon_social, c.numero_documento, c.tipo_documento
         ${baseQuery} ORDER BY f.creado_en DESC LIMIT $${idx} OFFSET $${idx + 1}`,
                [...params, limit, offset]
            );

            return { data: rows, total, error: null };
        } catch (error: any) {
            return { data: [], total: 0, error };
        }
    }

    async getById(id: number, id_empresa: number): Promise<{ data: any; error: any }> {
        try {
            const { rows } = await pool.query(
                `SELECT f.*, c.nombres, c.apellidos, c.razon_social, c.numero_documento,
                c.tipo_documento, c.email, c.telefono, c.direccion, c.codigo_municipio,
                c.responsabilidades_fiscales, c.regimen, c.digito_verificacion
         FROM facturas_electronicas f
         LEFT JOIN clientes_facturacion c ON f.id_cliente = c.id
         WHERE f.id = $1 AND f.id_empresa = $2`,
                [id, id_empresa]
            );
            if (!rows[0]) return { data: null, error: null };

            // Obtener items
            const { rows: items } = await pool.query(
                `SELECT * FROM facturas_items WHERE id_factura = $1 ORDER BY id`,
                [id]
            );
            return { data: { ...rows[0], items }, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    async create(data: any): Promise<{ data: any; error: any }> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const { rows } = await client.query(
                `INSERT INTO facturas_electronicas
          (id_empresa, id_cliente, id_reserva, id_rango_numeracion,
           fecha_emision, fecha_vencimiento, subtotal, total_descuento, total_iva, total,
           notas, observaciones, estado, creado_por)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'borrador',$13)
         RETURNING *`,
                [
                    data.id_empresa, data.id_cliente, data.id_reserva || null, data.id_rango_numeracion,
                    data.fecha_emision, data.fecha_vencimiento || null,
                    data.subtotal || 0, data.total_descuento || 0, data.total_iva || 0, data.total || 0,
                    data.notas || null, data.observaciones || null, data.creado_por || null
                ]
            );
            const factura = rows[0];

            // Insertar items
            for (const item of (data.items || [])) {
                await client.query(
                    `INSERT INTO facturas_items
            (id_factura, codigo_producto, descripcion, unidad_medida, cantidad,
             precio_unitario, porcentaje_descuento, tributos, total_item, id_tercero, nombre_tercero)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
                    [
                        factura.id, item.codigo_producto || '1', item.descripcion,
                        item.unidad_medida || 70, item.cantidad, item.precio_unitario,
                        item.porcentaje_descuento || 0, JSON.stringify(item.tributos || []),
                        item.total_item, item.id_tercero || null, item.nombre_tercero || null
                    ]
                );
            }

            await client.query('COMMIT');
            return { data: factura, error: null };
        } catch (error: any) {
            await client.query('ROLLBACK');
            return { data: null, error };
        } finally {
            client.release();
        }
    }

    async updateFactusResponse(id: number, id_empresa: number, updateData: {
        numero?: string; prefijo?: string; cufe?: string; qr_data?: string;
        estado?: string; estado_dian?: string; estado_dian_descripcion?: string;
        payload_enviado?: object; respuesta_factus?: object; pdf_url?: string; xml_url?: string;
    }): Promise<{ data: any; error: any }> {
        try {
            const fields: string[] = [];
            const values: any[] = [];
            let idx = 1;

            const map: any = {
                numero: updateData.numero, prefijo: updateData.prefijo, cufe: updateData.cufe,
                qr_data: updateData.qr_data, estado: updateData.estado, estado_dian: updateData.estado_dian,
                estado_dian_descripcion: updateData.estado_dian_descripcion,
                payload_enviado: updateData.payload_enviado ? JSON.stringify(updateData.payload_enviado) : undefined,
                respuesta_factus: updateData.respuesta_factus ? JSON.stringify(updateData.respuesta_factus) : undefined,
                pdf_url: updateData.pdf_url, xml_url: updateData.xml_url,
            };

            for (const [key, val] of Object.entries(map)) {
                if (val !== undefined) { fields.push(`${key} = $${idx++}`); values.push(val); }
            }
            fields.push(`actualizado_en = NOW()`);

            if (fields.length === 1) return { data: null, error: null };

            const { rows } = await pool.query(
                `UPDATE facturas_electronicas SET ${fields.join(', ')} WHERE id = $${idx} AND id_empresa = $${idx + 1} RETURNING *`,
                [...values, id, id_empresa]
            );
            return { data: rows[0] || null, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    async getDesdeReserva(id_reserva: number, id_empresa: number): Promise<{ data: any; error: any }> {
        try {
            // Obtener datos de la reserva con su cliente y huesped principal, y los datos del propietario del inmueble
            const { rows } = await pool.query(
                `SELECT r.*, i.nombre as inmueble_nombre, i.precio_limpieza, i.comision,
                h.nombre as huesped_nombre, h.apellido as huesped_apellido,
                h.correo as huesped_email, h.telefono as huesped_telefono,
                h.documento_identidad, h.documento_tipo,
                u.nombre as propietario_nombre, u.apellido as propietario_apellido,
                u.correo as propietario_email, p.tipo_documento as propietario_doc_tipo,
                p.numero_documento as propietario_documento_id, u.telefono as propietario_telefono,
                p.id_propietario
         FROM reservas r
         LEFT JOIN inmuebles i ON r.id_inmueble = i.id_inmueble
         LEFT JOIN huespedes_reservas hr ON hr.id_reserva = r.id_reserva AND hr.es_principal = true
         LEFT JOIN huespedes h ON h.id_huesped = hr.id_huesped
         LEFT JOIN propietarios p ON p.id_propietario = i.id_propietario
         LEFT JOIN usuarios u ON u.id_usuario = p.id_usuario
         WHERE r.id_reserva = $1 AND i.id_empresa = $2`,
                [id_reserva, id_empresa]
            );
            return { data: rows[0] || null, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }
}

// ===================================================
// NOTAS DE CRÉDITO REPOSITORY
// ===================================================
export class NotasCreditoRepository {

    async getAll(id_empresa: number, filters: any = {}): Promise<{ data: any[]; total: number; error: any }> {
        try {
            const { page = 1, limit = 20 } = filters;
            const offset = (page - 1) * limit;
            const countRes = await pool.query(`SELECT COUNT(*) FROM notas_credito WHERE id_empresa = $1`, [id_empresa]);
            const total = parseInt(countRes.rows[0].count, 10);
            const { rows } = await pool.query(
                `SELECT nc.*, f.numero as factura_numero, f.prefijo as factura_prefijo
         FROM notas_credito nc
         LEFT JOIN facturas_electronicas f ON nc.id_factura_referencia = f.id
         WHERE nc.id_empresa = $1 ORDER BY nc.creado_en DESC LIMIT $2 OFFSET $3`,
                [id_empresa, limit, offset]
            );
            return { data: rows, total, error: null };
        } catch (error: any) {
            return { data: [], total: 0, error };
        }
    }

    async getById(id: number, id_empresa: number): Promise<{ data: any; error: any }> {
        try {
            const { rows } = await pool.query(
                `SELECT nc.*, f.numero as factura_numero FROM notas_credito nc
         LEFT JOIN facturas_electronicas f ON nc.id_factura_referencia = f.id
         WHERE nc.id = $1 AND nc.id_empresa = $2`,
                [id, id_empresa]
            );
            if (!rows[0]) return { data: null, error: null };
            const { rows: items } = await pool.query(`SELECT * FROM notas_credito_items WHERE id_nota = $1`, [id]);
            return { data: { ...rows[0], items }, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    async create(data: any): Promise<{ data: any; error: any }> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const { rows } = await client.query(
                `INSERT INTO notas_credito
          (id_empresa, id_factura_referencia, id_cliente, id_rango_numeracion,
           fecha_emision, codigo_motivo, descripcion_motivo, subtotal, total_iva, total, notas, estado, creado_por)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'borrador',$12) RETURNING *`,
                [
                    data.id_empresa, data.id_factura_referencia || null, data.id_cliente || null,
                    data.id_rango_numeracion, data.fecha_emision, data.codigo_motivo,
                    data.descripcion_motivo || null, data.subtotal || 0, data.total_iva || 0,
                    data.total || 0, data.notas || null, data.creado_por || null
                ]
            );
            const nota = rows[0];
            for (const item of (data.items || [])) {
                await client.query(
                    `INSERT INTO notas_credito_items (id_nota, descripcion, cantidad, precio_unitario, tributos, total_item)
           VALUES ($1,$2,$3,$4,$5,$6)`,
                    [nota.id, item.descripcion, item.cantidad, item.precio_unitario, JSON.stringify(item.tributos || []), item.total_item]
                );
            }
            await client.query('COMMIT');
            return { data: nota, error: null };
        } catch (error: any) {
            await client.query('ROLLBACK');
            return { data: null, error };
        } finally {
            client.release();
        }
    }

    async updateFactusResponse(id: number, id_empresa: number, updateData: any): Promise<{ data: any; error: any }> {
        try {
            const { rows } = await pool.query(
                `UPDATE notas_credito SET
           numero = COALESCE($1, numero), prefijo = COALESCE($2, prefijo), cufe = COALESCE($3, cufe),
           estado = COALESCE($4, estado), estado_dian = COALESCE($5, estado_dian),
           payload_enviado = COALESCE($6, payload_enviado), respuesta_factus = COALESCE($7, respuesta_factus),
           pdf_url = COALESCE($8, pdf_url), xml_url = COALESCE($9, xml_url)
         WHERE id = $10 AND id_empresa = $11 RETURNING *`,
                [
                    updateData.numero, updateData.prefijo, updateData.cufe,
                    updateData.estado, updateData.estado_dian,
                    updateData.payload_enviado ? JSON.stringify(updateData.payload_enviado) : null,
                    updateData.respuesta_factus ? JSON.stringify(updateData.respuesta_factus) : null,
                    updateData.pdf_url, updateData.xml_url, id, id_empresa
                ]
            );
            return { data: rows[0] || null, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }
}

// ===================================================
// NOTAS DE DÉBITO REPOSITORY
// ===================================================
export class NotasDebitoRepository {

    async getAll(id_empresa: number, filters: any = {}): Promise<{ data: any[]; total: number; error: any }> {
        try {
            const { page = 1, limit = 20 } = filters;
            const offset = (page - 1) * limit;
            const countRes = await pool.query(`SELECT COUNT(*) FROM notas_debito WHERE id_empresa = $1`, [id_empresa]);
            const total = parseInt(countRes.rows[0].count, 10);
            const { rows } = await pool.query(
                `SELECT nd.*, f.numero as factura_numero FROM notas_debito nd
         LEFT JOIN facturas_electronicas f ON nd.id_factura_referencia = f.id
         WHERE nd.id_empresa = $1 ORDER BY nd.creado_en DESC LIMIT $2 OFFSET $3`,
                [id_empresa, limit, offset]
            );
            return { data: rows, total, error: null };
        } catch (error: any) {
            return { data: [], total: 0, error };
        }
    }

    async getById(id: number, id_empresa: number): Promise<{ data: any; error: any }> {
        try {
            const { rows } = await pool.query(
                `SELECT * FROM notas_debito WHERE id = $1 AND id_empresa = $2`,
                [id, id_empresa]
            );
            if (!rows[0]) return { data: null, error: null };
            const { rows: items } = await pool.query(`SELECT * FROM notas_debito_items WHERE id_nota = $1`, [id]);
            return { data: { ...rows[0], items }, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    async create(data: any): Promise<{ data: any; error: any }> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const { rows } = await client.query(
                `INSERT INTO notas_debito
          (id_empresa, id_factura_referencia, id_cliente, id_rango_numeracion,
           fecha_emision, codigo_motivo, descripcion_motivo, subtotal, total_iva, total, notas, estado, creado_por)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'borrador',$12) RETURNING *`,
                [
                    data.id_empresa, data.id_factura_referencia || null, data.id_cliente || null,
                    data.id_rango_numeracion, data.fecha_emision, data.codigo_motivo,
                    data.descripcion_motivo || null, data.subtotal || 0, data.total_iva || 0,
                    data.total || 0, data.notas || null, data.creado_por || null
                ]
            );
            const nota = rows[0];
            for (const item of (data.items || [])) {
                await client.query(
                    `INSERT INTO notas_debito_items (id_nota, descripcion, cantidad, precio_unitario, tributos, total_item)
           VALUES ($1,$2,$3,$4,$5,$6)`,
                    [nota.id, item.descripcion, item.cantidad, item.precio_unitario, JSON.stringify(item.tributos || []), item.total_item]
                );
            }
            await client.query('COMMIT');
            return { data: nota, error: null };
        } catch (error: any) {
            await client.query('ROLLBACK');
            return { data: null, error };
        } finally {
            client.release();
        }
    }

    async updateFactusResponse(id: number, id_empresa: number, updateData: any): Promise<{ data: any; error: any }> {
        try {
            const { rows } = await pool.query(
                `UPDATE notas_debito SET
           numero = COALESCE($1, numero), cufe = COALESCE($2, cufe),
           estado = COALESCE($3, estado), estado_dian = COALESCE($4, estado_dian),
           respuesta_factus = COALESCE($5, respuesta_factus), pdf_url = COALESCE($6, pdf_url)
         WHERE id = $7 AND id_empresa = $8 RETURNING *`,
                [updateData.numero, updateData.cufe, updateData.estado, updateData.estado_dian,
                updateData.respuesta_factus ? JSON.stringify(updateData.respuesta_factus) : null,
                updateData.pdf_url, id, id_empresa]
            );
            return { data: rows[0] || null, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }
}

// ===================================================
// DOCUMENTOS SOPORTE REPOSITORY
// ===================================================
export class DocumentosSoporteRepository {

    async getAll(id_empresa: number, filters: any = {}): Promise<{ data: any[]; total: number; error: any }> {
        try {
            const { page = 1, limit = 20 } = filters;
            const offset = (page - 1) * limit;
            const countRes = await pool.query(`SELECT COUNT(*) FROM documentos_soporte WHERE id_empresa = $1`, [id_empresa]);
            const total = parseInt(countRes.rows[0].count, 10);
            const { rows } = await pool.query(
                `SELECT * FROM documentos_soporte WHERE id_empresa = $1 ORDER BY creado_en DESC LIMIT $2 OFFSET $3`,
                [id_empresa, limit, offset]
            );
            return { data: rows, total, error: null };
        } catch (error: any) {
            return { data: [], total: 0, error };
        }
    }

    async getById(id: number, id_empresa: number): Promise<{ data: any; error: any }> {
        try {
            const { rows } = await pool.query(
                `SELECT * FROM documentos_soporte WHERE id = $1 AND id_empresa = $2`,
                [id, id_empresa]
            );
            if (!rows[0]) return { data: null, error: null };
            const { rows: items } = await pool.query(`SELECT * FROM documentos_soporte_items WHERE id_documento = $1`, [id]);
            return { data: { ...rows[0], items }, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    async create(data: any): Promise<{ data: any; error: any }> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const { rows } = await client.query(
                `INSERT INTO documentos_soporte
          (id_empresa, id_rango_numeracion, tipo_documento_proveedor, numero_documento_proveedor,
           nombre_proveedor, fecha_emision, subtotal, total_iva, total, descripcion, notas, estado, creado_por)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'borrador',$12) RETURNING *`,
                [
                    data.id_empresa, data.id_rango_numeracion, data.tipo_documento_proveedor || 'CC',
                    data.numero_documento_proveedor, data.nombre_proveedor, data.fecha_emision,
                    data.subtotal || 0, data.total_iva || 0, data.total || 0,
                    data.descripcion || null, data.notas || null, data.creado_por || null
                ]
            );
            const doc = rows[0];
            for (const item of (data.items || [])) {
                await client.query(
                    `INSERT INTO documentos_soporte_items (id_documento, descripcion, cantidad, precio_unitario, tributos, total_item)
           VALUES ($1,$2,$3,$4,$5,$6)`,
                    [doc.id, item.descripcion, item.cantidad, item.precio_unitario, JSON.stringify(item.tributos || []), item.total_item]
                );
            }
            await client.query('COMMIT');
            return { data: doc, error: null };
        } catch (error: any) {
            await client.query('ROLLBACK');
            return { data: null, error };
        } finally {
            client.release();
        }
    }

    async updateFactusResponse(id: number, id_empresa: number, updateData: any): Promise<{ data: any; error: any }> {
        try {
            const { rows } = await pool.query(
                `UPDATE documentos_soporte SET
           numero = COALESCE($1, numero), cufe = COALESCE($2, cufe),
           estado = COALESCE($3, estado), estado_dian = COALESCE($4, estado_dian),
           respuesta_factus = COALESCE($5, respuesta_factus), pdf_url = COALESCE($6, pdf_url)
         WHERE id = $7 AND id_empresa = $8 RETURNING *`,
                [updateData.numero, updateData.cufe, updateData.estado, updateData.estado_dian,
                updateData.respuesta_factus ? JSON.stringify(updateData.respuesta_factus) : null,
                updateData.pdf_url, id, id_empresa]
            );
            return { data: rows[0] || null, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }
}

// ===================================================
// DECLARACIONES TERCEROS REPOSITORY
// ===================================================
export class DeclaracionesTercerosRepository {

    async getAll(id_empresa: number, filters: any = {}): Promise<{ data: any[]; total: number; error: any }> {
        try {
            const { page = 1, limit = 20 } = filters;
            const offset = (page - 1) * limit;
            const countRes = await pool.query(`SELECT COUNT(*) FROM declaraciones_terceros WHERE id_empresa = $1`, [id_empresa]);
            const total = parseInt(countRes.rows[0].count, 10);
            const { rows } = await pool.query(
                `SELECT dt.*, u.nombre as propietario_nombre, u.apellido as propietario_apellido, p.numero_documento
         FROM declaraciones_terceros dt
         LEFT JOIN propietarios p ON dt.id_propietario = p.id_propietario
         LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
         WHERE dt.id_empresa = $1 ORDER BY dt.creado_en DESC LIMIT $2 OFFSET $3`,
                [id_empresa, limit, offset]
            );
            return { data: rows, total, error: null };
        } catch (error: any) {
            return { data: [], total: 0, error };
        }
    }

    async getById(id: number, id_empresa: number): Promise<{ data: any; error: any }> {
        try {
            const { rows } = await pool.query(
                `SELECT dt.*, u.nombre as propietario_nombre, u.apellido as propietario_apellido,
                p.numero_documento, p.tipo_documento, p.regimen
         FROM declaraciones_terceros dt
         LEFT JOIN propietarios p ON dt.id_propietario = p.id_propietario
         LEFT JOIN usuarios u ON p.id_usuario = u.id_usuario
         WHERE dt.id = $1 AND dt.id_empresa = $2`,
                [id, id_empresa]
            );
            return { data: rows[0] || null, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    async create(data: any): Promise<{ data: any; error: any }> {
        try {
            const { rows } = await pool.query(
                `INSERT INTO declaraciones_terceros
          (id_empresa, id_propietario, id_rango_numeracion, fecha_emision, periodo_inicio, periodo_fin,
           total_ingresos_bruto, comision_waiwa, otros_descuentos, total_neto_propietario, total,
           notas, estado, creado_por)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'borrador',$13) RETURNING *`,
                [
                    data.id_empresa, data.id_propietario, data.id_rango_numeracion,
                    data.fecha_emision, data.periodo_inicio || null, data.periodo_fin || null,
                    data.total_ingresos_bruto || 0, data.comision_waiwa || 0, data.otros_descuentos || 0,
                    data.total_neto_propietario || 0, data.total || 0,
                    data.notas || null, data.creado_por || null
                ]
            );
            return { data: rows[0], error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    async getMovimientosPropietarioPeriodo(id_propietario: number, id_empresa: number, inicio: string, fin: string): Promise<{ data: any; error: any }> {
        try {
            // Obtener ingresos de todos los inmuebles del propietario en el período
            const { rows } = await pool.query(
                `SELECT
           SUM(CASE WHEN m.tipo = 'ingreso' THEN m.monto ELSE 0 END) as total_ingresos,
           COUNT(DISTINCT m.id_reserva) as total_reservas,
           i.nombre as inmueble_nombre,
           i.comision
         FROM movimientos m
         JOIN inmuebles i ON m.id_inmueble = i.id_inmueble
         WHERE i.id_propietario = $1
           AND i.id_empresa = $2
           AND m.fecha BETWEEN $3 AND $4
           AND m.tipo = 'ingreso'
         GROUP BY i.id_inmueble, i.nombre, i.comision`,
                [id_propietario, id_empresa, inicio, fin]
            );
            return { data: rows, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }

    async updateFactusResponse(id: number, id_empresa: number, updateData: any): Promise<{ data: any; error: any }> {
        try {
            const { rows } = await pool.query(
                `UPDATE declaraciones_terceros SET
           numero = COALESCE($1, numero), cufe = COALESCE($2, cufe),
           estado = COALESCE($3, estado), estado_dian = COALESCE($4, estado_dian),
           respuesta_factus = COALESCE($5, respuesta_factus), pdf_url = COALESCE($6, pdf_url)
         WHERE id = $7 AND id_empresa = $8 RETURNING *`,
                [updateData.numero, updateData.cufe, updateData.estado, updateData.estado_dian,
                updateData.respuesta_factus ? JSON.stringify(updateData.respuesta_factus) : null,
                updateData.pdf_url, id, id_empresa]
            );
            return { data: rows[0] || null, error: null };
        } catch (error: any) {
            return { data: null, error };
        }
    }
}
