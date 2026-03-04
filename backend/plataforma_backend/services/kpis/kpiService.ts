import { KpiRepository } from '../../repositories/kpi.repository';
import { UnitKpis, BuildingKpis, KpiFilters } from '../../interfaces/kpi.interface';

export class KpiService {
    private kpiRepository: KpiRepository;

    constructor() {
        this.kpiRepository = new KpiRepository();
    }

    async getKpis(filters: KpiFilters) {
        const id_inmueble = Number(filters.id_inmueble);
        const { fecha_inicio, fecha_fin } = filters;
        const start = new Date(fecha_inicio);
        const end = new Date(fecha_fin);
        // Para que incluya por ejemplo febrero (28 días) si se manda 1 al 28, la diferencia en fechas es 27, entonces sumamos 1.
        // Convertir fechas a UTC asegurando que midan medianoche para no tener desfase de horario
        const startTime = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
        const endTime = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
        const availableNightsPerProperty = Math.round(Math.abs((endTime - startTime) / (1000 * 3600 * 24))) + 1;

        // 1. Get Property Data (Hierarchy)
        const properties = await this.kpiRepository.getPropertiesHierarchy(null, id_inmueble);
        if (properties.length === 0) return { data: null, error: 'Property not found' };

        const propertyIds = properties.map((p: any) => Number(p.id_inmueble));

        // 2. Fetch Aggregated Data
        const [reservations, movements] = await Promise.all([
            this.kpiRepository.getReservationsSummary(propertyIds, fecha_inicio, fecha_fin),
            this.kpiRepository.getMovementsSummary(propertyIds, fecha_inicio, fecha_fin)
        ]);

        // 3. Process Unit KPIs
        const unitKpisList: UnitKpis[] = properties.map((property: any) => {
            const res = reservations.find((r: any) => Number(r.id_inmueble) === Number(property.id_inmueble)) || { total_reservas: 0, noches_ocupadas: 0, ingreso_bruto: 0 };
            const propertyMovements = movements.filter((m: any) => Number(m.id_inmueble) === Number(property.id_inmueble));

            const incomeBruto = Number(res.ingreso_bruto);
            const commissionPerc = Number(property.comision || 0);
            const montoComision = (incomeBruto * commissionPerc) / 100;
            const ingresoNeto = incomeBruto - montoComision;

            const cleaningCosts = propertyMovements
                .filter((m: any) => m.tipo === 'egreso' && m.concepto === 'limpieza')
                .reduce((sum: number, m: any) => sum + Number(m.total_monto), 0);

            const otherExpenses = propertyMovements
                .filter((m: any) => m.tipo === 'egreso' && m.concepto !== 'limpieza')
                .reduce((sum: number, m: any) => sum + Number(m.total_monto), 0);

            const nochesOcupadas = Number(res.noches_ocupadas);
            const ocupacion = availableNightsPerProperty > 0 ? (nochesOcupadas / availableNightsPerProperty) * 100 : 0;

            const adr = nochesOcupadas > 0 ? incomeBruto / nochesOcupadas : 0;
            const revpar = availableNightsPerProperty > 0 ? incomeBruto / availableNightsPerProperty : 0;

            return {
                id_inmueble: Number(property.id_inmueble),
                nombre: property.nombre,
                ocupacion: Math.round(ocupacion * 100) / 100,
                adr: Math.round(adr * 100) / 100,
                revpar: Math.round(revpar * 100) / 100,
                ingreso_neto: Math.round(ingresoNeto * 100) / 100,
                costo_limpieza: Math.round(cleaningCosts * 100) / 100,
                utilidad: Math.round((ingresoNeto - cleaningCosts - otherExpenses) * 100) / 100,
                ingreso_total: Math.round(incomeBruto * 100) / 100, // GROSS INCOME
                gasto_proporcional_asignado: 0,
                noches_disponibles: availableNightsPerProperty,
                noches_ocupadas: nochesOcupadas,
                total_reservas: Number(res.total_reservas),
                area_m2: Number(property.area_m2 || 0)
            };
        });

        // 4. If request was for a single unit (must not be type 'edificio'), return that
        const requestedProp = properties.find((p: any) => Number(p.id_inmueble) === id_inmueble);
        if (requestedProp && requestedProp.tipo_registro !== 'edificio') {
            return { data: unitKpisList.find(u => u.id_inmueble === id_inmueble), type: 'unit' };
        }

        // 5. Calculate Building KPIs (only if requested property is type 'edificio')
        if (requestedProp && requestedProp.tipo_registro === 'edificio') {
            const edificio = requestedProp;
            const unidades = unitKpisList.filter(u => u.id_inmueble !== edificio.id_inmueble);
            const totalArea = unidades.reduce((sum, u) => sum + u.area_m2, 0);

            // Get Building Specific Expenses (those not assigned to a unit)
            const buildingMovements = movements.filter((m: any) => Number(m.id_inmueble) === Number(edificio.id_inmueble));
            const totalBuildingExpenses = buildingMovements
                .filter((m: any) => m.tipo === 'egreso' || m.tipo === 'deducible')
                .reduce((sum: number, m: any) => sum + Number(m.total_monto), 0);

            // Distribute building expenses to units based on area_m2
            unidades.forEach(unit => {
                const proportionalExpense = totalArea > 0 ? totalBuildingExpenses * (unit.area_m2 / totalArea) : 0;
                unit.gasto_proporcional_asignado = Math.round(proportionalExpense * 100) / 100;
                unit.utilidad -= proportionalExpense;
                unit.utilidad = Math.round(unit.utilidad * 100) / 100;
            });

            const totalNochesOcupadas = unidades.reduce((sum, u) => sum + u.noches_ocupadas, 0);
            const totalNochesDisponibles = unidades.reduce((sum, u) => sum + u.noches_disponibles, 0);
            const totalIngresosBrutos = unidades.reduce((sum, u) => sum + u.ingreso_total, 0);
            const totalIngresosNetos = unidades.reduce((sum, u) => sum + u.ingreso_neto, 0);
            const totalUtilidad = unidades.reduce((sum, u) => sum + u.utilidad, 0);

            const buildingKpis: BuildingKpis = {
                id_edificio: Number(edificio.id_inmueble),
                nombre: edificio.nombre,
                ocupacion_global: totalNochesDisponibles > 0 ? Math.round((totalNochesOcupadas / totalNochesDisponibles) * 10000) / 100 : 0,
                revpar_edificio: totalNochesDisponibles > 0 ? Math.round((totalIngresosBrutos / totalNochesDisponibles) * 100) / 100 : 0,
                ingresos_totales: Math.round(totalIngresosBrutos * 100) / 100,
                utilidad_total: Math.round(totalUtilidad * 100) / 100,
                ingresos_brutos: Math.round(totalIngresosBrutos * 100) / 100,
                margen_neto: totalIngresosNetos > 0 ? Math.round((totalUtilidad / totalIngresosNetos) * 10000) / 100 : 0,
                total_area_m2: totalArea,
                unidades: unidades,
                noches_disponibles_total: totalNochesDisponibles,
                noches_ocupadas_total: totalNochesOcupadas
            };

            return { data: buildingKpis, type: 'building' };
        }

        return { data: unitKpisList[0], type: 'unit' };
    }
}
