/**
 * 🎯 ENDPOINT POST RESERVAS - DOCUMENTACIÓN
 * 
 * Endpoint para crear nuevas reservas con huésped principal
 */

console.log(`
🚀 ENDPOINT POST /reservas IMPLEMENTADO EXITOSAMENTE!

📋 ENDPOINT: POST /reservas

📍 URL completa: http://localhost:3001/reservas

🔐 Autenticación: JWT requerido

📝 BODY DE EJEMPLO (NUEVO FORMATO):
{
  "id_inmueble": 3,
  "fecha_entrada": "2024-12-15",
  "fecha_salida": "2024-12-18",
  "numero_huespedes": 2,
  "huespedes": [
    {
      "nombre": "María",
      "apellido": "García",
      "email": "maria.garcia@email.com",
      "telefono": "+57 300 123 4567",
      "documento_tipo": "cedula",
      "documento_numero": "12345678",
      "fecha_nacimiento": "1985-03-15",
      "es_principal": true
    },
    {
      "nombre": "Carlos",
      "apellido": "García",
      "email": "carlos.garcia@email.com",
      "telefono": "+57 301 987 6543",
      "documento_tipo": "cedula",
      "documento_numero": "87654321",
      "fecha_nacimiento": "1983-07-22",
      "es_principal": false
    }
  ],
  "precio_total": 450000,
  "estado": "pendiente",
  "observaciones": "Llegada tarde",
  "id_empresa": 1
}

✅ NUEVAS VALIDACIONES IMPLEMENTADAS:
   • ✅ Fechas: entrada < salida y entrada >= hoy
   • ✅ Precio: mayor a 0
   • ✅ Huéspedes: entre 1 y 20
   • ✅ Un único huésped principal por reserva
   • ✅ No documentos duplicados en la misma reserva
   • ✅ Fechas de nacimiento válidas
   • ✅ Formato de email válido para cada huésped
   • ✅ Verificación de huéspedes existentes por documento

🔧 LÓGICA DE HUÉSPEDES:
   1️⃣ Busca huéspedes existentes por documento_numero
   2️⃣ Crea solo huéspedes nuevos
   3️⃣ Obtiene IDs de todos (existentes + nuevos)
   4️⃣ Relaciona todos en huespedes_reservas
   5️⃣ Respeta el flag es_principal de cada uno

📊 RESPUESTA EXITOSA (201):
{
  "isError": false,
  "data": {
    "id": 4,
    "codigo_reserva": "RSV-2025-004",
    "id_inmueble": 3,
    "nombre_inmueble": "Apartamento Ana",
    "huesped_principal": {
      "nombre": "María",
      "apellido": "García",
      "email": "maria.garcia@email.com",
      "telefono": "+57 300 123 4567"
    },
    "fecha_entrada": "2024-12-15",
    "fecha_salida": "2024-12-18",
    "numero_huespedes": 2,
    "huespedes": [...],
    "precio_total": 450000,
    "estado": "pendiente",
    "fecha_creacion": "2025-09-07",
    "observaciones": "Llegada tarde",
    "id_empresa": 1
  },
  "message": "Reserva creada exitosamente"
}

❌ RESPUESTAS DE ERROR:

400 - Errores de validación:
{
  "isError": true,
  "data": null,
  "code": 400,
  "message": "La fecha de entrada debe ser anterior a la fecha de salida",
  "timestamp": "..."
}

500 - Error interno:
{
  "isError": true,
  "data": null,
  "code": 500,
  "message": "Error interno del servidor",
  "timestamp": "..."
}

🔧 FUNCIONALIDADES:
   ✅ Generación automática de código de reserva
   ✅ Creación de huésped principal automática
   ✅ Parsing inteligente de nombres (nombre/apellido)
   ✅ Validaciones robustas de entrada
   ✅ Transacciones implícitas para integridad
   ✅ Respuesta completa como en GET

💡 EJEMPLOS DE USO CON CURL:

# Crear reserva exitosa
curl -X POST http://localhost:3001/reservas \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '{
    "id_inmueble": 3,
    "huesped_nombre": "Ana López",
    "huesped_email": "ana@email.com",
    "huesped_telefono": "+57 300 555 1234",
    "fecha_entrada": "2024-12-20",
    "fecha_salida": "2024-12-23",
    "numero_huespedes": 1,
    "precio_total": 360000,
    "estado": "confirmada",
    "observaciones": "Cliente VIP",
    "id_empresa": 1
  }'

🧪 TESTING:
   📁 tests/create-reserva.service.test.ts
   🏃 npm test

🔄 FLUJO COMPLETO:
   1. Validar datos de entrada
   2. Generar código único de reserva
   3. Crear registro en tabla 'reservas'
   4. Parsear nombre completo del huésped
   5. Crear registro en tabla 'huespedes'
   6. Relacionar en tabla 'huespedes_reservas'
   7. Retornar reserva completa
`);
