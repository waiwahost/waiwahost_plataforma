import { ReservasRepository } from '../../repositories/reservas.repository';
import { TarjetaRegistroRepository } from '../../repositories/tarjetaRegistro.repository';
import { InmueblesRepository } from '../../repositories/inmuebles.repository';

import type { EstadoTarjeta } from '../../interfaces/tarjetaRegistro.interface';

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
        const tarjetaExistente = await this.tarjetaRepo.findByReserva(reservaId)
        if (tarjetaExistente) {
            console.log(`La tarjeta para la reserva ${reservaId} ya existe. No se creará.`);
            return;
        }

        
        const reserva = await this.reservasRepo.getReservaById(reservaId);
        if (!reserva) throw new Error('Reserva no encontrada');

        const huespedes = await this.reservasRepo.getHuespedesByReservaId(reservaId);
        const principal = huespedes.find(h => h.es_principal);
        if (!principal) throw new Error('No hay huésped principal');

        const responseInmueble = await this.inmueblesRepo.getInmuebleById(reserva.id_inmueble);
        const inmueble = responseInmueble.data; 
            
        if (!inmueble) throw new Error('Inmueble no encontrado o inactivo');



        const formatDate = (date: any): string => {
          if (!date) return '';
          if (date instanceof Date) {
            return date.toISOString().split('T')[0];
          }
          return String(date).split('T')[0];
        };

        const payload = {
          tipo_identificacion: principal.documento_tipo,
          numero_identificacion: Number(principal.documento_numero),
          nombres: principal.nombre,
          apellidos: principal.apellido,
          cuidad_residencia: principal.ciudad_residencia,
          cuidad_procedencia: principal.ciudad_procedencia,
          motivo: principal.motivo,
          numero_acompanantes: Number(reserva.numero_huespedes - 1),
        
          numero_habitacion: inmueble.especificacion_acomodacion,
          tipo_acomodacion: inmueble.tipo_acomodacion,
          nombre_establecimiento: inmueble.nombre,
          rnt_establecimiento: Number(inmueble.rnt),
        
          costo: reserva.total_reserva, 
        
          check_in: formatDate(reserva.fecha_inicio),

          check_out: formatDate(reserva.fecha_fin),
        };


        const validatedPayload = PayloadTarjetaAlojamientoSchema.parse(payload);

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
    } catch (error) {
        console.error("DETALLE ERROR ZOD:", error);
        throw new Error('Error al validar datos para la tarjeta: ' + error.message);
    }
  }


  /**
   * Busca las tarjetas de registro por ID de reserva.
   * @param id_reserva - ID de la reserva.
   * @returns Un array de tarjetas de registro.
   */
  async findByReserva(id_reserva: number) {
    return await this.tarjetaRepo.findByReserva(id_reserva);
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
  private async enviarAMincit(reservaId: number) {
    const tarjeta = await this.tarjetaRepo.findByReserva(reservaId);
    const inmueble = await this.inmueblesRepo.getInmuebleById(reservaId);

    if (!tarjeta) throw new Error('Tarjeta no encontrada');
    if (!inmueble) throw new Error('Inmueble no encontrado');

    if (!inmueble.data.tra_token) throw new Error('Token de tarjeta de alojamiento no encontrado');

    if(tarjeta[0].estado === 'pendiente' || tarjeta[0].estado === 'reintento') {
      const principal = tarjeta[0].payload;
      const token = inmueble.data.tra_token;

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
  async updateEstadoTarjeta(
    idReserva: number,
    estado: EstadoTarjeta,
    extra?: {
      respuesta_tra?: unknown;
      ultimo_error?: string;
      intentos?: number;
    }
  ) {
    return await this.tarjetaRepo.updateEstadoTarjeta(idReserva, estado, extra);
  }

}
