import { NextApiRequest, NextApiResponse } from 'next';
import { IMovimiento } from '../../../interfaces/Movimiento';

interface PagoToMovimientoData {
  id_reserva: number;
  codigo_reserva: string;
  monto: number;
  metodo_pago: 'efectivo' | 'transferencia' | 'tarjeta' | 'otro';
  concepto?: string;
  descripcion?: string;
  comprobante?: string;
}

/**
 * Valida los datos del pago a convertir en movimiento
 */
const validatePagoData = (data: PagoToMovimientoData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.id_reserva || isNaN(data.id_reserva)) {
    errors.push('ID de reserva inválido');
  }

  if (!data.codigo_reserva || data.codigo_reserva.trim().length === 0) {
    errors.push('Código de reserva es requerido');
  }

  if (!data.monto || data.monto <= 0) {
    errors.push('El monto debe ser mayor a 0');
  }

  if (!data.metodo_pago) {
    errors.push('Método de pago es requerido');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Genera un ID único para el movimiento
 */
const generateMovimientoId = (): string => {
  return `MOV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Convierte un pago en un movimiento de ingreso
 */
const createMovimientoFromPago = (pagoData: PagoToMovimientoData): IMovimiento => {
  const now = new Date().toISOString();
  const fechaHoy = new Date().toISOString().split('T')[0];

  return {
    id: generateMovimientoId(),
    fecha: fechaHoy,
    tipo: 'ingreso',
    concepto: pagoData.concepto || 'Pago de reserva',
    descripcion: pagoData.descripcion || `Pago recibido para la reserva ${pagoData.codigo_reserva}`,
    monto: pagoData.monto,
    id_inmueble: '1', // Mock ID inmueble
    nombre_inmueble: 'Inmueble Principal', // Mock nombre inmueble
    id_reserva: pagoData.id_reserva.toString(),
    codigo_reserva: pagoData.codigo_reserva,
    metodo_pago: pagoData.metodo_pago,
    comprobante: pagoData.comprobante,
    id_empresa: '1', // Mock ID empresa
    fecha_creacion: now,
    fecha_actualizacion: now
  };
};

/**
 * Registra un pago como movimiento de ingreso
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Método no permitido'
    });
  }

  try {
    const pagoData: PagoToMovimientoData = req.body;

    const validation = validatePagoData(pagoData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: validation.errors
      });
    }

    // Crear el movimiento a partir del pago
    const movimiento = createMovimientoFromPago(pagoData);

    // En una implementación real, aquí se enviaría a la API externa de movimientos
    // Por ahora solo simulamos que fue registrado exitosamente


    return res.status(201).json({
      success: true,
      data: movimiento,
      message: 'Pago registrado como movimiento de ingreso exitosamente'
    });

  } catch (error) {
    console.error('❌ Error registrando pago como movimiento:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}