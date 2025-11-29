// API route for handling reservation requests
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();

    // Mapear datos del formulario al formato del API externo
    // Campos mockeados: id_inmueble (si no viene), estado, precio_total, observaciones (si no viene)
    // El resto se mapea desde el formulario
    const payload = {
      id_inmueble: data.inmueble ? 1 : 1, // MOCK: siempre 1, ya que el form tiene string, adaptar si hay IDs reales
      fecha_entrada: data.fechaLlegada ?? '2025-09-20',
      fecha_salida: data.fechaSalida ?? '2025-09-25',
      estado: 'pendiente', // MOCK: siempre pendiente
      precio_total: 500, // MOCK: fijo, no hay cálculo en el form
      observaciones: data.observaciones || 'Reserva desde formulario externo',
      numero_huespedes: data.cantidadHuespedes ?? (data.huespedes?.length || 1),
      huespedes: Array.isArray(data.huespedes) ? data.huespedes.map((h, idx) => ({
        nombre: h.nombre,
        apellido: h.apellido,
        email: h.email,
        telefono: h.telefono,
        documento: h.numeroDocumento,
        fecha_nacimiento: h.fechaNacimiento,
        es_principal: idx === 0 ? true : false
      })) : [],
    };

    console.log('Payload enviado al API externo:', payload);
    // Call external API
    const response = await fetch('http://localhost:3001/reservas/public', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ success: false, error }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
