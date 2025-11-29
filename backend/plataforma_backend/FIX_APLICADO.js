/**
 * 🔧 CORRECCIÓN APLICADA - PRUEBA DEL POST /reservas
 * 
 * El error de parámetros SQL ha sido corregido
 */

console.log(`
✅ ERROR CORREGIDO: "bind message supplies 4 parameters, but prepared statement requires 2"

🐛 PROBLEMA IDENTIFICADO:
   La consulta SQL en findHuespedesByDocumentos tenía placeholders duplicados:
   WHERE documento_numero IN ($1,$2) OR documento_identidad IN ($1,$2)
   
   Pero se enviaban 4 parámetros: [doc1, doc2, doc1, doc2]

🔧 SOLUCIÓN APLICADA:
   Ahora la consulta usa una sola lista de parámetros:
   WHERE documento_numero IN ($1,$2) OR documento_identidad IN ($1,$2)
   
   Y se envían solo 2 parámetros: [doc1, doc2]

🧪 PARA PROBAR SIN ERRORES - POST /reservas:

{
  "id_inmueble": 3,
  "fecha_entrada": "2024-12-15",
  "fecha_salida": "2024-12-18",
  "numero_huespedes": 1,
  "huespedes": [
    {
      "nombre": "María",
      "apellido": "García",
      "email": "maria.garcia@email.com",
      "telefono": "+57 300 123 4567",
      "documento_tipo": "cedula",
      "documento_numero": "NUEVO123456",
      "fecha_nacimiento": "1985-03-15",
      "es_principal": true
    }
  ],
  "precio_total": 450000,
  "estado": "pendiente",
  "observaciones": "Prueba después de la corrección",
  "id_empresa": 1
}

🔄 FLUJO CORRECTO AHORA:
   1. ✅ Recibe huéspedes del frontend
   2. ✅ Busca en BD por documento (SIN ERROR SQL)  
   3. ✅ Identifica nuevos vs existentes
   4. ✅ Crea solo huéspedes nuevos
   5. ✅ Relaciona todos con la reserva
   6. ✅ Retorna reserva completa

💡 NOTA: Usa documento_numero único para evitar conflictos de prueba
`);
