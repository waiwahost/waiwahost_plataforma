import { InmuebleFiltro } from '../../interfaces/ingreso.interface';

interface ServiceResponse<T> {
  data: T | null;
  error: {
    message: string;
    status: number;
    details?: any;
  } | null;
}

/**
 * Servicio para obtener lista de inmuebles para filtros
 * Retorna inmuebles activos de la empresa
 */
export async function getInmueblesFiltroService(empresaId: number): Promise<ServiceResponse<InmuebleFiltro[]>> {
  try {
    // Importar repository
    const { MovimientosRepository } = await import('../../repositories/movimientos.repository');

    // Verificar que la empresa existe (solo si se especifica una empresa)
    if (empresaId && empresaId > 0) {
      const empresaExists = await MovimientosRepository.existsEmpresa(empresaId.toString());
      if (!empresaExists) {
        return {
          data: null,
          error: {
            message: 'Empresa no encontrada',
            status: 404,
            details: 'La empresa especificada no existe'
          }
        };
      }
    }

    // Obtener inmuebles activos 
    let inmuebles;
    if (empresaId && empresaId > 0) {
      // Obtener inmuebles de la empresa específica
      inmuebles = await MovimientosRepository.getInmueblesSelector(empresaId.toString());
    } else {
      // Obtener todos los inmuebles activos de todas las empresas
      const pool = (await import('../../libs/db')).default;
      const query = `
        SELECT 
          id_inmueble::text as id,
          nombre,
          direccion,
          estado
        FROM inmuebles 
        WHERE estado = 'activo'
        ORDER BY nombre ASC
      `;
      const { rows } = await pool.query(query);
      inmuebles = rows;
    }

    // Transformar al formato de la interface InmuebleFiltro
    const inmueblesFiltro: InmuebleFiltro[] = inmuebles.map(inmueble => ({
      id: parseInt(inmueble.id),
      nombre: inmueble.nombre,
      direccion: inmueble.direccion
    }));

    return { data: inmueblesFiltro, error: null };

  } catch (error) {
    console.error('❌ Error en getInmueblesFiltroService:', error);
    return {
      data: null,
      error: {
        message: 'Error al obtener inmuebles para filtro',
        status: 500,
        details: error
      }
    };
  }
}