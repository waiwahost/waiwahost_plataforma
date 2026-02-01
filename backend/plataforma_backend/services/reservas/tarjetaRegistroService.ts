import { ReservasRepository } from '../../repositories/reservas.repository';
import { TarjetaRegistroRepository } from '../../repositories/tarjetaRegistro.repository';
import { InmueblesRepository } from '../../repositories/inmuebles.repository';

import { CreateTarjetaAlojamientoSchema, PayloadTarjetaAlojamientoSchema } from '../../schemas/tarjetaAlojamiento.schema';

export class TarjetaRegistroService {
  private reservasRepo = new ReservasRepository();
  private tarjetaRepo = new TarjetaRegistroRepository();
  private inmueblesRepo = new InmueblesRepository();

  async crearDesdeReserva(reservaId: number) {
    try {
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
          numero_identificacion: principal.documento_numero,
          nombres: principal.nombre,
          apellidos: principal.apellido,
          ciudad_residencia: principal.ciudad_residencia,
          ciudad_procedencia: principal.ciudad_procedencia,
          motivo: principal.motivo,
        
          numero_habitacion: inmueble.especificacion_acomodacion,
          tipo_acomodacion: inmueble.tipo_acomodacion,
          nombre_establecimiento: inmueble.nombre,
          rnt_establecimiento: inmueble.rnt,
        
          costo: Number(reserva.total_reserva), 
        
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
}
