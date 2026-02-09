import { FastifyRequest, FastifyReply, RouteGenericInterface } from 'fastify';
import { PagosRepository } from '../repositories/pagos.repository';
import { PagoMovimientoService } from '../services/pagoMovimiento.service';
import {
  CreatePagoRequest,
  UpdatePagoRequest,
  PagosQueryRequest
} from '../schemas/pago.schema';
import {
  Pago,
  PagoConMovimiento,
  DeletePagoResult,
  ResumenPagosReserva
} from '../interfaces/pago.interface';
import { responseHelper } from '../libs/responseHelper';

export class PagosController {

  /**
   * Obtiene todos los pagos de una reserva específica
   */
  static async getPagosByReserva(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const id_reserva = parseInt((request as any).params.id_reserva);
      if (isNaN(id_reserva) || id_reserva <= 0) {
        return responseHelper.error(reply, 'ID de reserva inválido', 400);
      }
      // Obtener contexto del usuario autenticado
      const ctx = (request as any).userContext || (request as any).user?.userContext;
      if (!ctx || !ctx.id) {
        return responseHelper.error(reply, 'No autenticado o token inválido', 401);
      }
      // Lógica superadmin: si es superadmin y empresaId es null, permitir acceso global
      let puedeConsultar = false;
      if (ctx.id_roles === 1 && (ctx.empresaId === null || ctx.empresaId === undefined)) {
        puedeConsultar = true;
      } else {
        const id_empresa = ctx.empresaId;
        const id_roles = ctx.id_roles;
        if (!id_empresa && id_roles !== 1) {
          return responseHelper.error(reply, 'No autenticado o token inválido', 401);
        }
        // Verificar que la reserva pertenece a la empresa del usuario
        const reservaExists = await PagosRepository.existsReservaInEmpresa(id_reserva, id_empresa);
        if (!reservaExists && id_roles !== 1) {
          return responseHelper.error(reply, 'Reserva no encontrada o no pertenece a su empresa', 404);
        }
        puedeConsultar = true;
      }
      if (!puedeConsultar) {
        return responseHelper.error(reply, 'No autorizado', 403);
      }
      const pagos = await PagosRepository.getPagosByReserva(id_reserva);
      // Obtener también el resumen financiero
      const resumen = await PagosRepository.getResumenPagosReserva(id_reserva);
      return responseHelper.success(reply, {
        pagos,
        resumen,
        total_pagos: pagos.length
      }, `${pagos.length} pagos encontrados para la reserva`);
    } catch (error) {
      console.error('Error al obtener pagos de reserva:', error);
      return responseHelper.error(reply, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtiene pagos con filtros y paginación
   */
  static async getPagosWithFilters(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      // Convertir y validar parámetros de query
      const query = (request as any).query || {};
      const queryParams: PagosQueryRequest = {
        id_reserva: query.id_reserva ? parseInt(query.id_reserva) : undefined,
        fecha_desde: query.fecha_desde,
        fecha_hasta: query.fecha_hasta,
        metodo_pago: query.metodo_pago as any,
        id_empresa: query.id_empresa ? parseInt(query.id_empresa) : undefined,
        page: query.page ? parseInt(query.page) : 1,
        limit: query.limit ? parseInt(query.limit) : 50
      };

      // Obtener id_empresa del usuario autenticado
      const ctx = (request as any).userContext || (request as any).user?.userContext;
      const id_empresa = ctx?.empresaId;
      const id_roles = ctx?.id_roles;
      if (!id_empresa && id_roles !== 1) {
        return responseHelper.error(reply, 'No autenticado o token inválido', 401);
      }
      queryParams.id_empresa = id_empresa;

      const { pagos, total } = await PagosRepository.getPagosWithFilters(queryParams);

      const totalPages = Math.ceil(total / (queryParams.limit || 50));
      const currentPage = queryParams.page || 1;

      return responseHelper.success(reply, {
        pagos,
        pagination: {
          current_page: currentPage,
          total_pages: totalPages,
          total_items: total,
          items_per_page: queryParams.limit || 50
        }
      }, `${pagos.length} pagos encontrados`);

    } catch (error) {
      console.error('Error al obtener pagos con filtros:', error);
      return responseHelper.error(reply, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtiene un pago específico por ID
   */
  static async getPagoById(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const id = parseInt((request as any).params.id);

      if (isNaN(id) || id <= 0) {
        return responseHelper.error(reply, 'ID de pago inválido', 400);
      }

      // Obtener id_empresa del usuario autenticado
      const ctx = (request as any).userContext || (request as any).user?.userContext;
      const id_empresa = ctx?.empresaId;
      const id_roles = ctx?.id_roles;
      if (!id_empresa && id_roles !== 1) {
        return responseHelper.error(reply, 'No autenticado o token inválido', 401);
      }
      // Verificar que el pago pertenece a la empresa del usuario
      const pagoExists = await PagosRepository.existsPagoInEmpresa(id, id_empresa);
      if (!pagoExists && id_roles !== 1) {
        return responseHelper.error(reply, 'Pago no encontrado o no pertenece a su empresa', 404);
      }

      const pago = await PagosRepository.getPagoById(id);

      return responseHelper.success(reply, { pago }, 'Pago encontrado exitosamente');

    } catch (error) {
      console.error('Error al obtener pago por ID:', error);
      return responseHelper.error(reply, 'Error interno del servidor', 500);
    }
  }

  /**
   * Crea un nuevo pago y su movimiento asociado
   */
  static async createPago(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const ctx = (request as any).userContext || (request as any).user?.userContext;
      const id_empresa = ctx?.empresaId;
      const id_roles = ctx?.id_roles;
      if (!id_empresa && id_roles !== 1) {
        return responseHelper.error(reply, 'No autenticado o token inválido', 401);
      }
      const pagoData = { ...(request as any).body, id_empresa: Number(id_empresa) };
      // Crear el pago
      const pagoCreado = await PagosRepository.createPago(pagoData);

      // Intentar crear el movimiento asociado
      let movimientoCreado = false;
      let movimientoId: string | undefined;

      try {
        // Obtener el ID del inmueble de la reserva
        const idInmueble = await PagoMovimientoService.obtenerInmuebleDeReserva(pagoData.id_reserva);

        if (idInmueble) {
          const movimientoIdResult = await PagoMovimientoService.crearMovimientoDesdePago(pagoCreado, idInmueble);

          if (movimientoIdResult) {
            movimientoId = movimientoIdResult;
            movimientoCreado = true;
          } else {
            console.warn(`[DEBUG] No se pudo crear el movimiento para el pago ${pagoCreado.id}`);
          }
        } else {
          console.warn(`[DEBUG] No se pudo obtener el inmueble para la reserva ${pagoData.id_reserva}`);
        }
      } catch (movimientoError) {
        console.error('Error al crear movimiento asociado:', movimientoError);
        // No fallar la creación del pago si falla el movimiento
      }

      // Obtener resumen actualizado
      const resumenActualizado = await PagosRepository.getResumenPagosReserva(pagoData.id_reserva);

      const resultado: PagoConMovimiento = {
        pago: pagoCreado,
        movimiento_id: movimientoId,
        movimiento_creado: movimientoCreado
      };

      return responseHelper.success(reply, {
        ...resultado,
        resumen_actualizado: resumenActualizado
      }, 'Pago registrado exitosamente', 201);

    } catch (error) {
      console.error('Error al crear pago:', error);

      if (error instanceof Error) {
        console.error('Error detail:', error.message);
        // Include the original error message in the response for debugging
        return responseHelper.error(reply, error.message, 400);
      }

      return responseHelper.error(reply, 'Error interno del servidor', 500);
    }
  }

  /**
   * Actualiza un pago existente
   */
  static async updatePago(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const id = parseInt((request as any).params.id);

      if (isNaN(id) || id <= 0) {
        return responseHelper.error(reply, 'ID de pago inválido', 400);
      }

      const updateData = (request as any).body;

      // Obtener id_empresa del usuario autenticado
      const ctx = (request as any).userContext || (request as any).user?.userContext;
      const id_empresa = ctx?.empresaId;
      const id_roles = ctx?.id_roles;
      if (!id_empresa && id_roles !== 1) {
        return responseHelper.error(reply, 'No autenticado o token inválido', 401);
      }
      // Verificar que el pago pertenece a la empresa del usuario
      const pagoExists = await PagosRepository.existsPagoInEmpresa(id, Number(id_empresa));
      if (!pagoExists && id_roles !== 1) {
        return responseHelper.error(reply, 'Pago no encontrado o no pertenece a su empresa', 404);
      }

      const pagoActualizado = await PagosRepository.updatePago(id, updateData);

      // Obtener resumen actualizado de la reserva
      const resumenActualizado = await PagosRepository.getResumenPagosReserva(pagoActualizado.id_reserva);

      return responseHelper.success(reply, {
        pago: pagoActualizado,
        resumen_actualizado: resumenActualizado
      }, 'Pago actualizado exitosamente');

    } catch (error) {
      console.error('Error al actualizar pago:', error);

      if (error instanceof Error) {
        return responseHelper.error(reply, error.message, 400);
      }

      return responseHelper.error(reply, 'Error interno del servidor', 500);
    }
  }

  /**
   * Elimina un pago y su movimiento asociado
   */
  static async deletePago(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const id = parseInt((request as any).params.id);

      if (isNaN(id) || id <= 0) {
        return responseHelper.error(reply, 'ID de pago inválido', 400);
      }

      // Obtener id_empresa del usuario autenticado
      const ctx = (request as any).userContext || (request as any).user?.userContext;
      const id_empresa = ctx?.empresaId;
      const id_roles = ctx?.id_roles;
      if (!id_empresa && id_roles !== 1) {
        return responseHelper.error(reply, 'No autenticado o token inválido', 401);
      }
      // Verificar que el pago pertenece a la empresa del usuario
      const pagoExists = await PagosRepository.existsPagoInEmpresa(id, Number(id_empresa));
      if (!pagoExists && id_roles !== 1) {
        return responseHelper.error(reply, 'Pago no encontrado o no pertenece a su empresa', 404);
      }

      // Obtener el pago antes de eliminarlo
      const pagoAEliminar = await PagosRepository.getPagoById(id);
      if (!pagoAEliminar) {
        return responseHelper.error(reply, 'Pago no encontrado', 404);
      }

      // Eliminar movimientos asociados al pago
      let movimientosEliminados = { movimientos_eliminados: 0, movimientos_encontrados: [] as string[] };

      try {
        movimientosEliminados = await PagoMovimientoService.eliminarMovimientoAsociado(id);
      } catch (movimientoError) {
        console.error('Error al eliminar movimientos asociados:', movimientoError);
        // Continuar con la eliminación del pago aunque falle la eliminación del movimiento
      }

      // Eliminar el pago
      await PagosRepository.deletePago(id);

      // Obtener resumen actualizado
      const resumenActualizado = await PagosRepository.getResumenPagosReserva(pagoAEliminar.id_reserva);

      const resultado: DeletePagoResult = {
        pago_eliminado: {
          id: pagoAEliminar.id,
          monto: pagoAEliminar.monto,
          codigo_reserva: pagoAEliminar.codigo_reserva
        },
        movimientos_eliminados: {
          cantidad: movimientosEliminados.movimientos_eliminados,
          ids: movimientosEliminados.movimientos_encontrados
        },
        resumen_actualizado: {
          total_pagado: resumenActualizado?.total_pagado || 0,
          total_pendiente: resumenActualizado?.total_pendiente || 0
        }
      };

      const mensaje = movimientosEliminados.movimientos_eliminados > 0
        ? `Pago y ${movimientosEliminados.movimientos_eliminados} movimiento(s) asociado(s) eliminados exitosamente`
        : 'Pago eliminado exitosamente (sin movimientos asociados)';

      return responseHelper.success(reply, resultado, mensaje);

    } catch (error) {
      console.error('Error al eliminar pago:', error);

      if (error instanceof Error) {
        return responseHelper.error(reply, error.message, 400);
      }

      return responseHelper.error(reply, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtiene el resumen financiero de una reserva
   */
  static async getResumenReserva(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const id_reserva = parseInt((request as any).params.id_reserva);

      if (isNaN(id_reserva) || id_reserva <= 0) {
        return responseHelper.error(reply, 'ID de reserva inválido', 400);
      }

      // Obtener id_empresa del usuario autenticado
      const ctx = (request as any).userContext || (request as any).user?.userContext;
      const id_empresa = ctx?.empresaId;
      const id_roles = ctx?.id_roles;
      if (!id_empresa && id_roles !== 1) {
        return responseHelper.error(reply, 'No autenticado o token inválido', 401);
      }
      // Verificar que la reserva pertenece a la empresa del usuario
      const reservaExists = await PagosRepository.existsReservaInEmpresa(id_reserva, Number(id_empresa));
      if (!reservaExists && id_roles !== 1) {
        return responseHelper.error(reply, 'Reserva no encontrada o no pertenece a su empresa', 404);
      }

      const resumen = await PagosRepository.getResumenPagosReserva(id_reserva);

      if (!resumen) {
        return responseHelper.error(reply, 'No se pudo obtener el resumen de la reserva', 404);
      }

      return responseHelper.success(reply, { resumen }, 'Resumen financiero obtenido exitosamente');

    } catch (error) {
      console.error('Error al obtener resumen de reserva:', error);
      return responseHelper.error(reply, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtiene pagos de una empresa por fecha específica
   */
  static async getPagosByFecha(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const { fecha } = (request as any).query;

      // Obtener id_empresa del usuario autenticado
      const ctx = (request as any).userContext || (request as any).user?.userContext;
      const id_empresa = ctx?.empresaId;
      const id_roles = ctx?.id_roles;
      if (!id_empresa && id_roles !== 1) {
        return responseHelper.error(reply, 'No autenticado o token inválido', 401);
      }
      const pagos = await PagosRepository.getPagosByEmpresaFecha(Number(id_empresa), fecha);

      // Calcular total del día
      const totalDia = pagos.reduce((sum, pago) => sum + pago.monto, 0);

      return responseHelper.success(reply, {
        pagos,
        fecha,
        total_pagos: pagos.length,
        total_monto: totalDia
      }, `${pagos.length} pagos encontrados para la fecha ${fecha}`);

    } catch (error) {
      console.error('Error al obtener pagos por fecha:', error);
      return responseHelper.error(reply, 'Error interno del servidor', 500);
    }
  }

  /**
   * Obtiene estadísticas de pagos por método de pago
   */
  static async getEstadisticasMetodosPago(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      // Convertir parámetros de query
      const fecha_inicio = (request as any).query?.fecha_inicio;
      const fecha_fin = (request as any).query?.fecha_fin;
      // Obtener id_empresa del usuario autenticado
      const ctx = (request as any).userContext || (request as any).user?.userContext;
      const id_empresa = ctx?.empresaId;
      const id_roles = ctx?.id_roles;
      if (!id_empresa && id_roles !== 1) {
        return responseHelper.error(reply, 'No autenticado o token inválido', 401);
      }
      const estadisticas = await PagosRepository.getEstadisticasMetodosPago(
        Number(id_empresa),
        fecha_inicio,
        fecha_fin
      );

      // Calcular totales generales
      const totales = estadisticas.reduce((acc, stat) => ({
        total_pagos: acc.total_pagos + stat.cantidad_pagos,
        total_monto: acc.total_monto + stat.total_monto
      }), { total_pagos: 0, total_monto: 0 });

      return responseHelper.success(reply, {
        estadisticas,
        totales,
        periodo: {
          fecha_inicio: fecha_inicio || 'Desde el inicio',
          fecha_fin: fecha_fin || 'Hasta la fecha'
        }
      }, 'Estadísticas obtenidas exitosamente');

    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return responseHelper.error(reply, 'Error interno del servidor', 500);
    }
  }
}