import { ReservasRepository } from '../../repositories/reservas.repository';
import { TarjetaRegistroRepository } from '../../repositories/tarjetaRegistro.repository';
import { InmueblesRepository } from '../../repositories/inmuebles.repository';

import type { EstadoTarjeta } from '../../interfaces/tarjetaRegistro.interface';
import type { Inmueble } from '../../interfaces/inmueble.interface';
import type { TarjetaRegistro } from '../../interfaces/tarjetaRegistro.interface';

import axios from 'axios';

import { CreateTarjetaAlojamientoSchema, PayloadTarjetaAlojamientoSchema } from '../../schemas/tarjetaAlojamiento.schema';

export class TarjetaRegistroService {
  private reservasRepo = new ReservasRepository();
  private tarjetaRepo = new TarjetaRegistroRepository();
  private inmueblesRepo = new InmueblesRepository();

  /**
   * Crea una tarjeta de registro desde una reserva.
   * @param reservaId - ID de la reserva.
   */
  async crearDesdeReserva(reservaId: number) {
    try {
      // 1. Obtener datos necesarios
      const reserva = await this.reservasRepo.getReservaById(reservaId);
      if (!reserva) throw new Error('Reserva no encontrada');

      const huespedes = await this.reservasRepo.getHuespedesByReservaId(reservaId);
      const principal = huespedes.find((h: any) => h.es_principal);
      if (!principal) throw new Error('No hay huésped principal para crear la tarjeta');

      const responseInmueble = await this.inmueblesRepo.getInmuebleById(reserva.id_inmueble);
      const inmueble = responseInmueble.data;
      if (!inmueble) throw new Error('Inmueble no encontrado o inactivo');

      // 2. Preparar el payload (con los mapeos ciudad -> cuidad y costo -> string)
      const formatDate = (date: any): string => {
        if (!date) return '';
        if (date instanceof Date) return date.toISOString().split('T')[0];
        return String(date).split('T')[0];
      };

      const payload = {
        tipo_identificacion: principal.documento_tipo || '',
        numero_identificacion: Number(principal.documento_numero) || 0,
        nombres: principal.nombre || '',
        apellidos: principal.apellido || '',
        cuidad_residencia: principal.ciudad_residencia || '',
        cuidad_procedencia: principal.ciudad_procedencia || '',
        motivo: principal.motivo || 'Otros',
        numero_acompanantes: Math.max(0, Number(reserva.numero_huespedes - 1)) || 0,
        numero_habitacion: inmueble.especificacion_acomodacion || '',
        tipo_acomodacion: inmueble.tipo_acomodacion || 'Otro',
        nombre_establecimiento: inmueble.nombre || '',
        rnt_establecimiento: Number(inmueble.rnt) || 0,
        costo: String(reserva.total_reserva || 0),
        check_in: formatDate(reserva.fecha_inicio),
        check_out: formatDate(reserva.fecha_fin),
      };

      // Validar payload
      const validatedPayload = PayloadTarjetaAlojamientoSchema.parse(payload);

      // 3. Verificar si ya existe una tarjeta
      const tarjetas = await this.tarjetaRepo.findByReserva(reservaId);
      const tarjetaExistente = tarjetas && tarjetas.length > 0 ? tarjetas[0] : null;

      if (tarjetaExistente) {
        // SI EXISTE: Evaluar si permite actualización (solo si no ha sido finalizada/enviada)
        if (['pendiente', 'error', 'reintento'].includes(tarjetaExistente.estado)) {
          console.log(`Sincronizando tarjeta existente para reserva ${reservaId}. Estado actual: ${tarjetaExistente.estado}`);
          await this.tarjetaRepo.updateTarjeta(reservaId, {
            payload: validatedPayload,
            id_huesped: principal.id,
            updated_at: new Date().toISOString()
          });
          return;
        } else {
          console.log(`La tarjeta para la reserva ${reservaId} ya está en estado ${tarjetaExistente.estado}. No se actualizará.`);
          return;
        }
      }

      // 4. SI NO EXISTE: Crear nueva tarjeta
      const createTarjetaInput = CreateTarjetaAlojamientoSchema.parse({
        id_reserva: reservaId,
        id_huesped: principal.id,
        id_inmueble: reserva.id_inmueble,
        payload: validatedPayload,
        respuesta_tra: {},
        ultimo_error: null,
        intentos: 0,
        estado: 'pendiente',
        fecha: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      await this.tarjetaRepo.createTarjetaRegistro(createTarjetaInput);
      console.log(`Nueva tarjeta de registro creada para reserva ${reservaId}`);
    } catch (error: any) {
      console.error("DETALLE ERROR ZOD:", error);
      throw new Error('Error al validar datos para la tarjeta: ' + error.message);
    }
  }

  /**
   * Busca ella tarjeta de registro por ID de reserva.
   * @param id_reserva - ID de la reserva.
   * @returns Un array de tarjetas de registro.
   */
  async findByReserva(idReserva: number) {
    const tarjeta = await this.tarjetaRepo.findByReserva(idReserva);
    if (!tarjeta) throw new Error('Tarjeta no encontrada');
    return tarjeta;
  }


  /**
   * Busca el estado de la tarjeta de registro por ID de reserva.
   * @param id_reserva - ID de la reserva.
   * @returns Un array de tarjetas de registro.
   */
  async findByReservaEstado(idReserva: number) {
    const tarjeta = await this.tarjetaRepo.findByReservaEstado(idReserva);
    if (!tarjeta) throw new Error('Tarjeta no encontrada');
    return tarjeta;
  }

  /**
   * Busca las tarjetas de registro pendientes.
   * @param limit - Límite de resultados.
   * @returns Un array de tarjetas de registro.
   */
  async findPendientes(limit = 20) {
    return await this.tarjetaRepo.findPendientes(limit);
  }

  /**
   * Busca las tarjetas de registro por ID de huesped.
   * @param id_huesped - ID del huesped.
   * @returns Un array de tarjetas de registro.
   */
  async findByHuesped(id_huesped: number) {
    return await this.tarjetaRepo.findByHuesped(id_huesped);
  }

  /**
   * Envia la tarjeta de registro a la API de Tarjeta de Alojamiento.
   * @param id - ID de la tarjeta de registro.
   * @returns La tarjeta de registro actualizada.
   */
  private async enviarAMincit(tarjeta: TarjetaRegistro, inmueble: Inmueble) {
    if (!inmueble.tra_token) throw new Error('Token de tarjeta de alojamiento no encontrado');

    if (tarjeta.estado === 'pendiente' || tarjeta.estado === 'reintento') {
      const principal = tarjeta.payload;
      const token = inmueble.tra_token;

      const res = await axios.post('https://pms.mincit.gov.co/one/', principal, {
        headers: { 'Authorization': `token ${token}` }
      });

      const parentCode = res.data.code;

      return parentCode;
    }

    return null;
  }

  /**
   * Actualiza el estado de una tarjeta de registro.
   * @param id - ID de la tarjeta de registro.
   * @param estado - Nuevo estado de la tarjeta de registro.
   * @param extra - Datos adicionales para actualizar.
   * @returns La tarjeta de registro actualizada.
   */
  async updateEstadoTarjeta(idReserva: number) {
    const tarjetas = await this.tarjetaRepo.findByReserva(idReserva);
    if (!tarjetas || tarjetas.length === 0) throw new Error('Tarjeta no encontrada');

    const tarjeta = tarjetas[0];
    const responseInmueble = await this.inmueblesRepo.getInmuebleById(tarjeta.id_inmueble);
    const inmueble = responseInmueble.data;

    if (!inmueble || !inmueble.tra_token) {
      throw new Error('Inmueble o Token TRA no encontrado');
    }

    if (['pendiente', 'reintento', 'error'].includes(tarjeta.estado)) {
      try {
        const parentCode = await this.enviarAMincit(tarjeta, inmueble);
        const extra = {
          respuesta_tra: { parentCode },
          intentos: (tarjeta.intentos || 0) + 1,
          ultimo_error: null,
          updated_at: new Date().toISOString(),
        };


        if (!parentCode) {
          return await this.tarjetaRepo.updateEstadoTarjeta(idReserva, 'error', extra);
        }


        return await this.tarjetaRepo.updateEstadoTarjeta(idReserva, 'confirmado', extra);

      } catch (error: any) {
        const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;

        const extraError = {
          intentos: (tarjeta.intentos || 0) + 1,
          ultimo_error: errorMsg,
          updated_at: new Date().toISOString(),
        };

        await this.tarjetaRepo.updateEstadoTarjeta(idReserva, 'error', extraError);
        throw new Error(`Error en comunicación con MINCIT: ${errorMsg}`);
      }
    }

    return `La tarjeta ya se encuentra en estado: ${tarjeta.estado}`;
  }

}
