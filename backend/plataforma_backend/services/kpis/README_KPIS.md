# Documentación de KPIs - WaiwaHost

Este documento explica de dónde se obtienen los datos y cómo se calculan las métricas e indicadores de rendimiento (KPIs) en la plataforma, tanto a nivel de Inmuebles Individuales (Apartamentos/Habitaciones) como a nivel de Edificio Global.

---

## 📅 Consideración Importante: Fechas y Días Disponibles

### Noches Disponibles (`noches_disponibles`)
Este es un dato **crítico** del cual dependen varias fórmulas. Las *Noches Disponibles* no son un número fijo (como 30 días), sino que dependen del filtro de fechas establecido por el usuario.

**Fórmula (En el backend):**
```text
Noches Disponibles = Diferencia de días entre Fecha Fin y Fecha Inicio + 1
```
*Ejemplo:* Si filtras del 1 de Febrero al 28 de Febrero, la diferencia es de 27 días. Se le suma 1 para que cuente 28 **noches disponibles reales**. De igual manera, si filtras la primera quincena de enero (1 al 15), las noches disponibles son 15.

---

## 1. KPIs a Nivel Apartamento (Individual)

Se calculan por cada inmueble secundario o individual basándose en sus registros directos.

### 1.1 Ocupación (%)
**¿Para qué sirve?** Te dice de cada 100 noches que tu cuarto estuvo disponible en el periodo seleccionado, ¿en cuántas hubo alguien hospedándose?

*   **Origen de Datos:** 
    *   `noches_ocupadas`: Suma de las noches de las reservas de la base de datos de reservas filtrado por ese inmueble y fechas (`Reserva.noches`).
    *   `noches_disponibles`: Calculado por fechas como se explica arriba.
*   **Fórmula:** 
    ```text
    Ocupación = (Noches Ocupadas / Noches Disponibles) × 100
    ```

### 1.2 Ingresos / Utilidad 
**¿Para qué sirve?** Mide la parte financiera correspondiente a este apartamento.

*   **Ingresos Brutos (`ingreso_total`)**: La suma total de los montos de todas las reservas de esa unidad en ese periodo (`Reserva.total_reserva`).
*   **Comisión Plataforma/Admin (`montoComision`)**: (`Ingreso Bruto` × Porcentaje de `comision` guardado en la tabla Inmueble).
*   **Ingresos Netos (`ingreso_neto`)**: (`Ingreso Bruto` - `montoComision`).
*   **Costos de Limpieza**: Suma de movimientos en tabla `RegistroOperativo` o Gastos donde `tipo = 'egreso'` y `concepto = 'limpieza'`, filtrado por ese inmueble.
*   **Otros Egresos**: Suma de gastos de `tipo = 'egreso'` que no sean limpieza.
*   **Utilidad Neta (Apartamento)**: 
    ```text
    Utilidad = Ingreso Neto - Costos de Limpieza - Otros Egresos
    ```

### 1.3 ADR (Average Daily Rate - Tarifa Promedio Diaria)
**¿Para qué sirve?** Indica en cuánto vendiste, en promedio, cada noche que **sí** estuvo ocupada.

*   **Fórmula:**
    ```text
    ADR = Ingresos Brutos / Noches Ocupadas
    ```

### 1.4 RevPAR (Revenue Per Available Room - Ingreso por Habitación Disponible)
**¿Para qué sirve?** Indica en cuánto vendiste, en promedio, cada noche que **estuvo disponible** (se haya ocupado o no). Es un mejor indicador de rentabilidad porque castiga los días vacíos.

*   **Fórmula:**
    ```text
    RevPAR = Ingresos Brutos / Noches Disponibles
    ```

---

## 2. KPIs a Nivel Edificio (Global)

Los cálculos del edificio no son un promedio de los porcentajes de los apartamentos, sino la reconstrucción lógica tomando la suma global.

### 2.1 Ocupación Global del Edificio
**¿Para qué sirve?** De todas las noches disponibles en todos los apartamentos juntos en el periodo dado, ¿en cuántas hubo alguien?

⚠️ **Error Común Evitado:** No se debe hacer el promedio del porcentaje de ocupación de la Hab 1 y la Hab 2.
✔️ **Implementación Correcta:** Suma real de noches.

*   **Origen de Datos:** 
    *   `total_noches_ocupadas_edificio`: La suma de todas las `noches_ocupadas` de todos los apartamentos que le pertenecen.
    *   `total_noches_disponibles_edificio`: La suma de todas las `noches_disponibles` de todos los apartamentos. (Ej: Si el edificio tiene 10 Aptos y filtramos febrero (28 días), el total disponible es 10 × 28 = 280 Noches).
*   **Fórmula:**
    ```text
    Ocupación Global = (Total Noches Ocupadas Edificio / Total Noches Disponibles Edificio) × 100
    ```

### 2.2 Gastos de Edificio (Prorrateo por Área)
**¿Para qué sirve?** El edificio tiene gastos comunes (Ej. Vigilancia, mantenimiento fachada) que no son de un cuarto específico. La plataforma distribuye ("prorratea") este gasto a cada cuarto según su tamaño en metros cuadrados (`area_m2`).

*   **Origen de Datos:** 
    *   `Gastos Edificio`: Todo registro de `egreso` o `deducible` donde el `id_inmueble` asignado es directamente el Id del edificio.
    *   `Area Unit` y `Area Total`: De los campos `area_m2` de la tabla de Inmuebles.
*   **Fórmula del Prorrateo (Para afectar la Utilidad del Cuarto):**
    ```text
    Gasto Asignado al Apto = Total Gastos Edificio × (Área del Apto / Total Área del Edificio)
    ```
    *Ese número se le resta directamente a la "Utilidad Neta del Apartamento".*

### 2.3 Utilidad Total / Ingresos Totales (Edificio)
*   **Ingresos Brutos/Totales Edificio**: La suma de los ingresos brutos de todos los apartamentos.
*   **Utilidad Total Edificio**: La suma de la utilidad final (ya descontándole el prorrateo de gastos de edificio) de todos los apartamentos.

### 2.4 Margen Neto del Edificio
**¿Para qué sirve?** De todo el dinero neto que entró, qué porcentaje realmente quedó como ganancia libre.

*   **Fórmula:**
    ```text
    Margen Neto = (Utilidad Total del Edificio / Total Ingresos Netos del Edificio) × 100
    ```

### 2.5 RevPAR del Edificio
**¿Para qué sirve?** Por cada noche disponible en todo el edificio (capacidad de camas general), cuánto dinero generó.

*   **Fórmula:**
    ```text
    RevPAR Global = Ingresos Brutos Totales Edificio / Total Noches Disponibles Edificio
    ```
