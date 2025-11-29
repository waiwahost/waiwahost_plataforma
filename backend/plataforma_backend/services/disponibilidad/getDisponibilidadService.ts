import { getInmueblesDisponibles, getReservasEnRango } from '../../libs/db';

interface DisponibilidadParams {
  start: string;
  end: string;
  inmuebleId?: string;
  estado?: string;
}

/**
 * Servicio para consultar la disponibilidad de inmuebles y reservas en un rango de fechas.
 */
export async function getDisponibilidad(params: DisponibilidadParams) {
  const { start, end, inmuebleId, estado } = params;

  // 1. Obtener inmuebles
  const inmuebles = await getInmueblesDisponibles({ inmuebleId });
  console.log('Inmuebles encontrados:', inmuebles);

  // 2. Obtener reservas en el rango
  const reservas = await getReservasEnRango({ start, end, inmuebleId, estado });
  console.log('Reservas encontradas:', reservas);

  // 3. Formatear respuesta
  return {
    inmuebles: inmuebles.map((i: any) => ({ id: String(i.id), nombre: i.nombre })),
    reservas: reservas.map((r: any) => ({
      inmuebleId: String(r.inmuebleid),
      start: r.start,
      end: r.end,
      estado: r.estado
    })),
  };
}
