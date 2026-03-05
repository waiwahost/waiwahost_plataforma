import { MovimientosRepository } from '../../repositories/movimientos.repository';
import { CreateMovimientoData, Movimiento } from '../../interfaces/movimiento.interface';
import { isPlataformaValida } from '../../constants/plataformas';
import { ConceptosRepository } from '../../repositories/conceptos.repository';

interface ServiceResponse<T> {
  data: T | null;
  error: {
    message: string;
    status: number;
    details?: any;
  } | null;
}

/**
 * Servicio para crear un nuevo movimiento
 */
export async function createMovimientoService(
  data: CreateMovimientoData
): Promise<ServiceResponse<Movimiento>> {
  try {
    // Validar concepto dinámicamente contra la tabla conceptos
    const conceptosRepo = new ConceptosRepository();
    const { exists: conceptoValido, error: conceptoError } = await conceptosRepo.conceptoExisteParaTipo({
      slug: data.concepto,
      tipo: data.tipo,
      id_empresa: data.id_empresa ? Number(data.id_empresa) : undefined,
    });

    if (conceptoError) {
      return { data: null, error: { message: 'Error al validar el concepto', status: 500, details: conceptoError } };
    }

    if (!conceptoValido) {
      return {
        data: null,
        error: {
          message: 'Concepto inválido para el tipo de movimiento indicado',
          status: 400,
          details: `El concepto '${data.concepto}' no es válido para el tipo '${data.tipo}'. Consulta los conceptos disponibles en GET /conceptos?tipo=${data.tipo}`
        }
      };
    }

    // Validar lógica de negocio para plataforma_origen
    if (data.plataforma_origen) {
      // Validar que la plataforma sea válida
      if (!isPlataformaValida(data.plataforma_origen)) {
        return {
          data: null,
          error: {
            message: 'Plataforma de origen inválida',
            status: 400,
            details: 'La plataforma especificada no es válida'
          }
        };
      }

      // Solo permitir plataforma_origen en ingresos de reserva
      if (data.tipo !== 'ingreso' || data.concepto !== 'reserva') {
        return {
          data: null,
          error: {
            message: 'Plataforma de origen inválida',
            status: 400,
            details: 'La plataforma de origen solo es válida para movimientos de tipo "ingreso" con concepto "reserva"'
          }
        };
      }

      // Si especifica plataforma_origen, debe tener id_reserva
      if (!data.id_reserva || data.id_reserva.trim() === '') {
        return {
          data: null,
          error: {
            message: 'Reserva requerida',
            status: 400,
            details: 'Debe especificar un id_reserva cuando se define una plataforma de origen'
          }
        };
      }
    }

    // Verificar que la empresa existe
    const empresaExists = await MovimientosRepository.existsEmpresa(data.id_empresa);
    if (!empresaExists) {
      return {
        data: null,
        error: {
          message: 'Empresa no encontrada',
          status: 404,
          details: `La empresa especificada no existe (ID: ${data.id_empresa})`
        }
      };
    }

    // Verificar que el inmueble existe y pertenece a la empresa
    const inmuebleExists = await MovimientosRepository.existsInmuebleInEmpresa(
      data.id_inmueble,
      data.id_empresa
    );
    if (!inmuebleExists) {
      return {
        data: null,
        error: {
          message: 'Inmueble no encontrado',
          status: 404,
          details: 'El inmueble especificado no existe o no pertenece a la empresa'
        }
      };
    }

    // Si se especifica reserva, verificar que existe y pertenece a la empresa
    if (data.id_reserva) {
      const reservaExists = await MovimientosRepository.existsReservaInEmpresa(
        data.id_reserva,
        data.id_empresa
      );
      if (!reservaExists) {
        return {
          data: null,
          error: {
            message: 'Reserva no encontrada',
            status: 404,
            details: 'La reserva especificada no existe o no pertenece a la empresa'
          }
        };
      }
    }

    // Crear el movimiento
    const movimiento = await MovimientosRepository.createMovimiento(data);

    return {
      data: movimiento,
      error: null
    };

  } catch (error) {
    console.error('Error en createMovimientoService:', error);
    return {
      data: null,
      error: {
        message: 'Error al crear movimiento',
        status: 500,
        details: error
      }
    };
  }
}