
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});

export default pool;

/**
 * Obtiene los inmuebles filtrando por id si se provee
 */
export async function getInmueblesDisponibles({ inmuebleId }: { inmuebleId?: string }) {
  let query = 'SELECT id_inmueble as id, nombre FROM inmuebles';
  const params: any[] = [];
  if (inmuebleId) {
    query += ' WHERE id_inmueble = $1';
    params.push(inmuebleId);
  }
  const { rows } = await pool.query(query, params);
  return rows;
}

/**
 * Obtiene las reservas de inmuebles en un rango de fechas, filtrando por inmueble y estado si aplica
 */
export async function getReservasEnRango({ start, end, inmuebleId, estado }: { start: string; end: string; inmuebleId?: string; estado?: string }) {
  let query = `SELECT id_inmueble as inmuebleId, fecha_inicio as start, fecha_fin as end, estado FROM reservas WHERE (fecha_inicio <= $2 AND fecha_fin >= $1)`;
  const params: any[] = [start, end];
  let paramIndex = 3;
  if (inmuebleId) {
    query += ` AND id_inmueble = $${paramIndex}`;
    params.push(inmuebleId);
    paramIndex++;
  }
  if (estado && estado !== 'todos') {
    query += ` AND estado = $${paramIndex}`;
    params.push(estado);
  }
  const { rows } = await pool.query(query, params);
  return rows;
}
