import dbClient from '../libs/db';
import { TarjetaRegistro, CreateTarjetaRegistro, EstadoTarjeta } from '../interfaces/tarjetaRegistro.interface';

export class TarjetaRegistroRepository {


  /**
   * Crea una nueva tarjeta de registro.
   * @param data - Datos de la tarjeta de registro.
   * @returns La tarjeta de registro creada.
   */
  async createTarjetaRegistro(data: {
    id_reserva: number;
    id_huesped: number;
    id_inmueble: number;
    payload: any;
    estado: EstadoTarjeta;
    fecha: string;
    intentos: number;
    ultimo_error: string | null;
    respuesta_tra: any;
    created_at: string;
    updated_at: string;
  }): Promise<CreateTarjetaRegistro> {
    const query = `
      INSERT INTO tra_registros (
        id_reserva,
        id_huesped,
        id_inmueble,
        estado,
        fecha,
        intentos,
        payload,
        ultimo_error,
        respuesta_tra,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      data.id_reserva,
      data.id_huesped,
      data.id_inmueble,
      data.estado,
      data.fecha,
      data.intentos,
      JSON.stringify(data.payload),
      data.ultimo_error,
      JSON.stringify(data.respuesta_tra),
      data.created_at,
      data.updated_at,
    ];

    const { rows } = await dbClient.query(query, values);
    return rows[0];
  }

  /**
   * Actualiza el estado de una tarjeta de registro.
   * @param id - ID de la tarjeta de registro.
   * @param estado - Nuevo estado de la tarjeta de registro.
   * @param extra - Datos adicionales para actualizar.
   * @returns La tarjeta de registro actualizada.
   */
  async updateEstadoTarjeta(
    id: number,
    estado: EstadoTarjeta,
    extra?: {
      respuesta_tra?: unknown;
      ultimo_error?: string;
      intentos?: number;
    }
  ) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    fields.push(`estado = $${idx++}`);
    values.push(estado);

    if (extra?.respuesta_tra !== undefined) {
      fields.push(`respuesta_tra = $${idx++}`);
      values.push(JSON.stringify(extra.respuesta_tra));
    }

    if (extra?.ultimo_error !== undefined) {
      fields.push(`ultimo_error = $${idx++}`);
      values.push(extra.ultimo_error);
    }

    if (extra?.intentos !== undefined) {
      fields.push(`intentos = $${idx++}`);
      values.push(extra.intentos);
    }

    values.push(id);

    const query = `
      UPDATE tra_registros
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${idx}
      RETURNING *
    `;

    const { rows } = await dbClient.query(query, values);
    return rows[0];
  }


  /**
   * Busca las tarjetas de registro por ID de reserva.
   * @param id_reserva - ID de la reserva.
   * @returns Un array de tarjetas de registro.
   */
  async findByReserva(id_reserva: number) {
    const query = `
      SELECT *
      FROM tra_registros
      WHERE id_reserva = $1
      ORDER BY created_at DESC
    `;

    const { rows } = await dbClient.query(query, [id_reserva]);
    return rows;
  }

  /**
   * Busca las tarjetas de registro pendientes.
   * @param limit - Límite de resultados.
   * @returns Un array de tarjetas de registro.
   */
  async findPendientes(limit = 20) {
    const query = `
      SELECT *
      FROM tra_registros
      WHERE estado IN ('pendiente', 'reintento')
      ORDER BY created_at ASC
      LIMIT $1
    `;

    const { rows } = await dbClient.query(query, [limit]);
    return rows;
  }
}
