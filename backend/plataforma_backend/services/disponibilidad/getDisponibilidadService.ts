import { getInmueblesDisponibles, getReservasEnRango, getBloqueosEnRango } from '../../libs/db';

interface DisponibilidadParams {
  start: string;
  end: string;
  inmuebleId?: string;
  estado?: string;
  idEmpresa?: number;
}

/**
 * Servicio para consultar la disponibilidad de inmuebles y reservas en un rango de fechas.
 */
export async function getDisponibilidad(params: DisponibilidadParams) {
  const { start, end, inmuebleId, estado, idEmpresa } = params;

  // 1. Obtener inmuebles
  const inmuebles = await getInmueblesDisponibles({ inmuebleId, idEmpresa });

  // 2. Obtener reservas en el rango
  const reservas = await getReservasEnRango({ start, end, inmuebleId, estado });

  // 3. Obtener bloqueos en el rango
  const bloqueos = await getBloqueosEnRango({ start, end, inmuebleId });

  // 4. Formatear respuesta
  return {
    inmuebles: inmuebles.map((i: any) => ({
      id: String(i.id),
      nombre: i.nombre,
      ciudad: i.ciudad
    })),
    reservas: [
      ...reservas.map((r: any) => ({
        id: String(r.id),
        inmuebleId: String(r.inmuebleid),
        start: r.start,
        end: r.end,
        estado: r.estado
      })),
      ...bloqueos.map((b: any) => ({
        id: `blk-${b.id}`,
        inmuebleId: String(b.inmuebleid),
        start: b.start,
        end: b.end,
        estado: 'bloqueado', // Usar un estado especial para el frontend
        tipo_bloqueo: b.estado,
        descripcion: b.descripcion
      }))
    ],
  };
}
