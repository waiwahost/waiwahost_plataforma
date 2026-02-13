
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
export async function getInmueblesDisponibles({ inmuebleId, idEmpresa }: { inmuebleId?: string; idEmpresa?: number }) {
  let query = "SELECT id_inmueble as id, nombre, ciudad FROM inmuebles WHERE estado = 'activo'";
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (inmuebleId) {
    conditions.push(`id_inmueble = $${paramIndex++}`);
    params.push(inmuebleId);
  }

  if (idEmpresa) {
    conditions.push(`id_empresa = $${paramIndex++}`);
    params.push(idEmpresa);
  }

  if (conditions.length > 0) {
    query += ' AND ' + conditions.join(' AND ');
  }

  const { rows } = await pool.query(query, params);
  return rows;
}

/**
 * Obtiene las reservas de inmuebles en un rango de fechas, filtrando por inmueble y estado si aplica
 */
export async function getReservasEnRango({ start, end, inmuebleId, estado }: { start: string; end: string; inmuebleId?: string; estado?: string }) {
  let query = `
    SELECT r.id_reserva as id, r.id_inmueble as inmuebleId, r.fecha_inicio as start, r.fecha_fin as end, r.estado 
    FROM reservas r
    INNER JOIN inmuebles i ON r.id_inmueble = i.id_inmueble
    WHERE (r.fecha_inicio <= $2 AND r.fecha_fin >= $1) AND i.estado = 'activo'
  `;
  const params: any[] = [start, end];
  let paramIndex = 3;
  if (inmuebleId) {
    query += ` AND r.id_inmueble = $${paramIndex}`;
    params.push(inmuebleId);
    paramIndex++;
  }
  if (estado && estado !== 'todos') {
    query += ` AND r.estado = $${paramIndex}`;
    params.push(estado);
  }
  const { rows } = await pool.query(query, params);
  return rows;
}
