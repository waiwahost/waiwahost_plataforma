# 🧪 GUÍA DE TESTING - INTEGRACIÓN API EXTERNA

## 📋 **PASOS PARA VERIFICAR LA INTEGRACIÓN**

### **1. Prerequisitos**

Antes de probar, asegurar que:
- [ ] Backend API externa está corriendo
- [ ] Variables de entorno configuradas en `.env.local`
- [ ] Usuario autenticado con token válido
- [ ] Datos de prueba disponibles en el backend

### **2. Configuración del Entorno**

```bash
# Crear archivo .env.local
cp .env.example .env.local

# Editar con la URL correcta del backend
NEXT_PUBLIC_EXTERNAL_API_URL=http://localhost:3001/api
```

### **3. Testing de Funcionalidades**

#### **A. Caja Diaria (Dashboard)**

**Pasos**:
1. Ir a `/dashboard`
2. Verificar que la caja diaria carga datos
3. Cambiar de fecha usando el selector
4. Verificar que los datos se actualizan

**Endpoints Probados**:
- `GET /movimientos/fecha/{fecha}?empresa_id=1`
- `GET /movimientos/resumen/{fecha}?empresa_id=1`

**Validar**:
- ✅ Lista de movimientos se carga correctamente
- ✅ Resumen financiero muestra totales correctos
- ✅ Cambio de fecha actualiza la información
- ✅ Spinners de carga funcionan correctamente

#### **B. Modal de Inmuebles**

**Pasos**:
1. En dashboard, hacer clic en cualquier inmueble
2. Verificar que se abre el modal con movimientos
3. Cambiar fechas en el modal
4. Verificar actualización de datos

**Endpoints Probados**:
- `GET /movimientos/inmueble?id_inmueble={id}&fecha={fecha}`

**Validar**:
- ✅ Movimientos del inmueble se cargan
- ✅ Resumen (ingresos/egresos) es correcto
- ✅ Cambio de fecha funciona
- ✅ Datos específicos del inmueble

#### **C. Crear Movimiento**

**Pasos**:
1. Hacer clic en "Nuevo Movimiento"
2. Verificar que se cargan los inmuebles en el selector
3. Llenar formulario completo
4. Guardar y verificar éxito

**Endpoints Probados**:
- `GET /inmuebles/selector?empresa_id=1`
- `POST /movimientos`

**Validar**:
- ✅ Selector de inmuebles carga opciones reales
- ✅ Formulario guarda correctamente
- ✅ Mensaje de éxito se muestra
- ✅ Lista se actualiza con nuevo movimiento

#### **D. Editar/Eliminar Movimiento**

**Pasos**:
1. Hacer clic en "Editar" en un movimiento existente
2. Modificar datos y guardar
3. Verificar actualización
4. Probar eliminar un movimiento

**Endpoints Probados**:
- `GET /movimientos/{id}`
- `PUT /movimientos/{id}`
- `DELETE /movimientos/{id}`

**Validar**:
- ✅ Datos del movimiento se cargan en formulario
- ✅ Actualización guarda cambios
- ✅ Eliminación funciona correctamente
- ✅ Lista se actualiza después de cambios

### **4. Testing de Errores**

#### **A. Sin Conexión al Backend**

**Simular**:
```bash
# Detener el backend o cambiar URL incorrecta
NEXT_PUBLIC_EXTERNAL_API_URL=http://localhost:9999/api
```

**Validar**:
- ✅ Mensajes de error claros
- ✅ No se rompe la aplicación
- ✅ Spinners se detienen
- ✅ Usuario puede intentar de nuevo

#### **B. Token Inválido**

**Simular**:
```bash
# En DevTools, modificar localStorage token
localStorage.setItem('token', 'invalid_token');
```

**Validar**:
- ✅ Error de autenticación se muestra
- ✅ Redirección a login (si aplicable)
- ✅ Mensaje claro de reautenticación

#### **C. Datos Inválidos**

**Simular**:
- Enviar formulario con monto negativo
- Enviar fecha futura
- Enviar concepto inválido

**Validar**:
- ✅ Validaciones frontend funcionan
- ✅ Errores del backend se muestran claramente
- ✅ Formulario no se envía con datos inválidos

### **5. Testing de Performance**

#### **A. Tiempo de Carga**

**Medir**:
- Tiempo inicial de carga del dashboard
- Tiempo de cambio de fecha
- Tiempo de apertura de modales

**Expectativas**:
- ✅ < 2 segundos para carga inicial
- ✅ < 1 segundo para cambios de fecha
- ✅ < 1 segundo para modales

#### **B. Reintentos**

**Simular**:
- Detener backend temporalmente
- Verificar reintentos automáticos
- Reactivar backend

**Validar**:
- ✅ Sistema intenta 3 veces automáticamente
- ✅ Delay entre reintentos (1s, 2s, 3s)
- ✅ Recuperación automática cuando backend vuelve

### **6. Testing de Logs**

#### **A. Verificar en Console del Browser**

**Logs Esperados de Éxito**:
```
🔄 Redirigiendo getMovimientosByFecha a API externa
🔄 Obteniendo movimientos por fecha desde API externa: 2025-10-12
✅ API Externa exitosa: http://localhost:3001/api/movimientos/fecha/2025-10-12?empresa_id=1
✅ Movimientos por fecha obtenidos exitosamente: 3
```

**Logs Esperados de Error**:
```
🔄 API Externa - Intento 1/4: http://localhost:3001/api/movimientos/fecha/2025-10-12?empresa_id=1
❌ Error en intento 1: HTTP 500: Internal server error
⏳ Esperando 1000ms antes del siguiente intento...
```

### **7. Checklist Completo de Testing**

#### **Funcionalidades Core**:
- [ ] Dashboard carga movimientos del día actual
- [ ] Selector de fecha cambia los movimientos mostrados
- [ ] Resumen financiero calcula totales correctos
- [ ] Modal de inmuebles muestra datos específicos
- [ ] Crear movimiento funciona end-to-end
- [ ] Editar movimiento actualiza correctamente
- [ ] Eliminar movimiento funciona
- [ ] Selector de inmuebles carga opciones reales

#### **Manejo de Errores**:
- [ ] Error de conexión se maneja gracefully
- [ ] Error de autenticación redirige apropiadamente
- [ ] Validaciones de formulario funcionan
- [ ] Mensajes de error son claros y útiles

#### **Performance**:
- [ ] Cargas iniciales son rápidas (< 2s)
- [ ] Navegación entre fechas es fluida (< 1s)
- [ ] Spinners aparecen durante cargas
- [ ] No hay blocking de UI

#### **User Experience**:
- [ ] Transición es transparente para el usuario
- [ ] No hay funcionalidades rotas
- [ ] Datos se muestran correctamente formateados
- [ ] Feedback visual apropiado

### **8. Testing en Diferentes Ambientes**

#### **Desarrollo Local**:
```bash
NEXT_PUBLIC_EXTERNAL_API_URL=http://localhost:3001/api
```

#### **Staging**:
```bash
NEXT_PUBLIC_EXTERNAL_API_URL=https://staging-api.waiwahost.com/api
```

#### **Producción**:
```bash
NEXT_PUBLIC_EXTERNAL_API_URL=https://api.waiwahost.com/api
```

### **9. Troubleshooting Guide**

#### **Problema: "API Externa - Request timeout"**
**Causa**: Backend no responde
**Solución**: 
1. Verificar que backend esté corriendo
2. Verificar conectividad de red
3. Revisar URL en variables de entorno

#### **Problema: "CORS policy error"**
**Causa**: Backend no permite requests desde frontend
**Solución**: Configurar CORS en backend para permitir dominio

#### **Problema: "Unauthorized 401"**
**Causa**: Token inválido o expirado
**Solución**: 
1. Verificar token en localStorage
2. Renovar autenticación
3. Verificar formato de Authorization header

#### **Problema: "No data found / isError: true"**
**Causa**: Endpoint responde pero sin datos
**Solución**:
1. Verificar empresa_id correcta
2. Verificar datos de prueba en backend
3. Revisar formato de respuesta

### **10. Resultados Esperados**

Al finalizar el testing, debes poder confirmar:

✅ **Todos los flujos de movimientos funcionan** con datos reales del backend  
✅ **Performance es aceptable** (< 2s para cargas principales)  
✅ **Errores se manejan gracefully** sin romper la aplicación  
✅ **Usuario no nota diferencia** en la experiencia de uso  
✅ **Logs muestran conexión exitosa** con API externa  
✅ **Datos se sincronizan** correctamente entre frontend y backend  

---

**🎯 Si todos los puntos del checklist pasan, la integración está lista para producción!**