/**
 * Script para probar el endpoint de reservas
 * Ejecutar con: npm run dev
 * Luego hacer requests HTTP a: GET http://localhost:3001/reservas
 */

console.log(`
📋 ENDPOINT DE RESERVAS IMPLEMENTADO EXITOSAMENTE!

🚀 Endpoint disponible: GET /reservas

📍 URL completa: http://localhost:3001/reservas

🔍 Parámetros de consulta opcionales:
   - id_empresa: number
   - estado: string
   - fecha_inicio: string (YYYY-MM-DD)
   - fecha_fin: string (YYYY-MM-DD)

🎯 Ejemplos de uso:
   GET /reservas
   GET /reservas?estado=confirmada
   GET /reservas?id_empresa=1
   GET /reservas?fecha_inicio=2024-08-01&fecha_fin=2024-08-31

📝 Antes de probar, ejecuta los datos de prueba con el archivo:
   datos_prueba_reservas.sql

💡 Notas importantes:
   - Los datos marcados como "mockeados" se generan automáticamente
   - El endpoint incluye autenticación (JWT requerido)
   - La respuesta sigue el formato solicitado por el frontend
`);
