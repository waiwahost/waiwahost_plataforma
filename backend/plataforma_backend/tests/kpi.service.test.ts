import { describe, it, expect, vi, beforeEach } from 'vitest';
import { KpiService } from '../services/kpis/kpiService';
import { KpiRepository } from '../repositories/kpi.repository';

vi.mock('../repositories/kpi.repository', () => {
    return {
        KpiRepository: class {
            getPropertiesHierarchy = vi.fn();
            getReservationsSummary = vi.fn();
            getMovementsSummary = vi.fn();
        }
    };
});

describe('KpiService', () => {
    let service: KpiService;
    let mockRepo: any;

    beforeEach(() => {
        service = new KpiService();
        mockRepo = (service as any).kpiRepository;
    });

    it('should calculate Unit KPIs correctly', async () => {
        // Mock hierarchy for a single unit
        mockRepo.getPropertiesHierarchy.mockResolvedValue([
            { id_inmueble: 1, nombre: 'Unit 1', tipo_registro: 'independiente', area_m2: 50, comision: 10 }
        ]);

        // Mock reservations (20 nights occupied out of 31, $600 total)
        mockRepo.getReservationsSummary.mockResolvedValue([
            { id_inmueble: 1, total_reservas: 5, noches_ocupadas: 20, ingreso_bruto: 600 }
        ]);

        // Mock movements ($15 cleaning)
        mockRepo.getMovementsSummary.mockResolvedValue([
            { id_inmueble: 1, tipo: 'egreso', concepto: 'limpieza', total_monto: 15 }
        ]);

        const filters = {
            id_empresa: 1,
            id_inmueble: 1,
            fecha_inicio: '2026-01-01',
            fecha_fin: '2026-02-01' // 31 days
        };

        const result = await service.getKpis(filters);

        expect(result.type).toBe('unit');
        const kpis = result.data;

        // Occupancy: (20 / 31) * 100 = 64.52
        expect(kpis.ocupacion).toBe(64.52);
        // ADR: 600 / 20 = 30
        expect(kpis.adr).toBe(30);
        // RevPAR: 600 / 31 = 19.35
        expect(kpis.revpar).toBe(19.35);
        // Net Income: 600 * (1 - 0.10) = 540
        expect(kpis.ingreso_neto).toBe(540);
        // Utility: 540 - 15 = 525
        expect(kpis.utilidad).toBe(525);
    });

    it('should calculate Building KPIs and proportional cost allocation correctly', async () => {
        // Mock hierarchy: Building (ID 10) and 2 Units (IDs 11, 12)
        mockRepo.getPropertiesHierarchy.mockResolvedValue([
            { id_inmueble: 10, nombre: 'Edificio', tipo_registro: 'edificio', area_m2: 0 },
            { id_inmueble: 11, nombre: 'Apto 1', tipo_registro: 'unidad', parent_id: 10, area_m2: 50, comision: 0 },
            { id_inmueble: 12, nombre: 'Apto 2', tipo_registro: 'unidad', parent_id: 10, area_m2: 150, comision: 0 }
        ]);

        // Total Area = 50 + 150 = 200m2
        // Apto 1 = 25%, Apto 2 = 75%

        // Summary:
        // Apto 1: 10 nights, $1000
        // Apto 2: 20 nights, $3000
        mockRepo.getReservationsSummary.mockResolvedValue([
            { id_inmueble: 11, total_reservas: 1, noches_ocupadas: 10, ingreso_bruto: 1000 },
            { id_inmueble: 12, total_reservas: 2, noches_ocupadas: 20, ingreso_bruto: 3000 }
        ]);

        // Building Expense: $400 water bill (assigned to ID 10)
        mockRepo.getMovementsSummary.mockResolvedValue([
            { id_inmueble: 10, tipo: 'egreso', concepto: 'servicios_publicos', total_monto: 400 }
        ]);

        const filters = {
            id_empresa: 1,
            id_inmueble: 10,
            fecha_inicio: '2026-01-01',
            fecha_fin: '2026-02-01' // 31 days
        };

        const result = await service.getKpis(filters);

        expect(result.type).toBe('building');
        const building = result.data;

        // Allocation:
        // Apto 1 utility: 1000 - (400 * 0.25) = 900
        // Apto 2 utility: 3000 - (400 * 0.75) = 2700

        const apto1 = building.unidades.find((u: any) => u.id_inmueble === 11);
        const apto2 = building.unidades.find((u: any) => u.id_inmueble === 12);

        expect(apto1.utilidad).toBe(900);
        expect(apto2.utilidad).toBe(2700);

        // Building Total:
        expect(building.utilidad_total).toBe(3600);
        expect(building.ingresos_totales).toBe(4000);

        // Global Occupancy: (10 + 20) / (31 + 31) = 30 / 62 = 48.39%
        expect(building.ocupacion_global).toBe(48.39);
    });
});
