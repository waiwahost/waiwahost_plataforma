// Datos mock para pruebas del sistema de reportes
import { 
  IReporteFinanciero, 
  IResumenGeneral, 
  IDetalleInmueble, 
  IGraficosData,
  IOpcionesReporte 
} from '../interfaces/Reporte';

export const mockOpcionesReporte: IOpcionesReporte = {
  empresas: [
    {
      id: "emp_001",
      nombre: "Waiwahost Properties",
      cantidad_inmuebles: 5
    },
    {
      id: "emp_002", 
      nombre: "Urban Rentals",
      cantidad_inmuebles: 3
    }
  ],
  inmuebles: [
    {
      id: "inm_001",
      nombre: "Apartamento Centro Histórico",
      id_empresa: "emp_001",
      nombre_empresa: "Waiwahost Properties",
      id_propietario: "prop_001",
      nombre_propietario: "Carlos Mendoza"
    },
    {
      id: "inm_002",
      nombre: "Casa Zona Rosa",
      id_empresa: "emp_001",
      nombre_empresa: "Waiwahost Properties", 
      id_propietario: "prop_002",
      nombre_propietario: "Ana García"
    },
    {
      id: "inm_003",
      nombre: "Loft Zona Norte",
      id_empresa: "emp_002",
      nombre_empresa: "Urban Rentals",
      id_propietario: "prop_003", 
      nombre_propietario: "Miguel Torres"
    }
  ],
  propietarios: [
    {
      id: "prop_001",
      nombre: "Carlos",
      apellido: "Mendoza",
      cantidad_inmuebles: 2,
      inmuebles: ["inm_001", "inm_004"]
    },
    {
      id: "prop_002",
      nombre: "Ana",
      apellido: "García", 
      cantidad_inmuebles: 1,
      inmuebles: ["inm_002"]
    },
    {
      id: "prop_003",
      nombre: "Miguel",
      apellido: "Torres",
      cantidad_inmuebles: 2,
      inmuebles: ["inm_003", "inm_005"]
    }
  ]
};

export const mockResumenGeneral: IResumenGeneral = {
  total_ingresos: 15750000,
  total_egresos: 3250000,
  ganancia_neta: 12500000,
  cantidad_inmuebles: 5,
  cantidad_reservas: 23,
  ocupacion_promedio: 78.5,
  inmueble_mas_rentable: {
    id: "inm_001",
    nombre: "Apartamento Centro Histórico",
    ganancia: 4200000
  },
  mes_anterior: {
    total_ingresos: 13200000,
    total_egresos: 2800000,
    ganancia_neta: 10400000,
    variacion_porcentual: 20.2
  }
};

export const mockGraficosData: IGraficosData = {
  ingresos_por_dia: [
    { fecha: "2024-10-01", valor: 520000 },
    { fecha: "2024-10-02", valor: 680000 },
    { fecha: "2024-10-03", valor: 450000 },
    { fecha: "2024-10-04", valor: 720000 },
    { fecha: "2024-10-05", valor: 590000 },
    { fecha: "2024-10-06", valor: 830000 },
    { fecha: "2024-10-07", valor: 910000 },
    { fecha: "2024-10-08", valor: 650000 }
  ],
  egresos_por_dia: [
    { fecha: "2024-10-01", valor: 120000 },
    { fecha: "2024-10-02", valor: 85000 },
    { fecha: "2024-10-03", valor: 95000 },
    { fecha: "2024-10-04", valor: 110000 },
    { fecha: "2024-10-05", valor: 75000 },
    { fecha: "2024-10-06", valor: 130000 },
    { fecha: "2024-10-07", valor: 145000 },
    { fecha: "2024-10-08", valor: 90000 }
  ],
  ganancia_por_dia: [
    { fecha: "2024-10-01", valor: 400000 },
    { fecha: "2024-10-02", valor: 595000 },
    { fecha: "2024-10-03", valor: 355000 },
    { fecha: "2024-10-04", valor: 610000 },
    { fecha: "2024-10-05", valor: 515000 },
    { fecha: "2024-10-06", valor: 700000 },
    { fecha: "2024-10-07", valor: 765000 },
    { fecha: "2024-10-08", valor: 560000 }
  ],
  ingresos_por_inmueble: [
    { name: "Apartamento Centro", value: 4200000, porcentaje: 26.7, color: "#8884d8" },
    { name: "Casa Zona Rosa", value: 3800000, porcentaje: 24.1, color: "#82ca9d" },
    { name: "Loft Zona Norte", value: 3200000, porcentaje: 20.3, color: "#ffc658" },
    { name: "Penthouse Norte", value: 2500000, porcentaje: 15.9, color: "#ff7300" },
    { name: "Studio Centro", value: 2050000, porcentaje: 13.0, color: "#00ff00" }
  ],
  egresos_por_categoria: [
    { name: "Limpieza", value: 980000, porcentaje: 30.2, color: "#8884d8" },
    { name: "Mantenimiento", value: 850000, porcentaje: 26.2, color: "#82ca9d" },
    { name: "Servicios", value: 720000, porcentaje: 22.2, color: "#ffc658" },
    { name: "Administrativo", value: 450000, porcentaje: 13.8, color: "#ff7300" },
    { name: "Otros", value: 250000, porcentaje: 7.7, color: "#00ff00" }
  ],
  ocupacion_por_inmueble: [
    { nombre: "Apt Centro", ocupacion: 24, disponibilidad: 7, total_dias: 31 },
    { nombre: "Casa Rosa", ocupacion: 22, disponibilidad: 9, total_dias: 31 },
    { nombre: "Loft Norte", ocupacion: 26, disponibilidad: 5, total_dias: 31 },
    { nombre: "Penthouse", ocupacion: 19, disponibilidad: 12, total_dias: 31 },
    { nombre: "Studio", ocupacion: 21, disponibilidad: 10, total_dias: 31 }
  ],
  comparacion_meses: [
    { periodo: "Ago 2024", ingresos: 12800000, egresos: 2600000, ganancia: 10200000 },
    { periodo: "Sep 2024", ingresos: 13200000, egresos: 2800000, ganancia: 10400000 },
    { periodo: "Oct 2024", ingresos: 15750000, egresos: 3250000, ganancia: 12500000 }
  ],
  tendencia_anual: [
    { mes: "Ene", año: 2024, ingresos: 11200000, egresos: 2300000, ganancia: 8900000, reservas: 18 },
    { mes: "Feb", año: 2024, ingresos: 10800000, egresos: 2100000, ganancia: 8700000, reservas: 16 },
    { mes: "Mar", año: 2024, ingresos: 12500000, egresos: 2400000, ganancia: 10100000, reservas: 20 },
    { mes: "Abr", año: 2024, ingresos: 13100000, egresos: 2500000, ganancia: 10600000, reservas: 22 },
    { mes: "May", año: 2024, ingresos: 14200000, egresos: 2700000, ganancia: 11500000, reservas: 24 },
    { mes: "Jun", año: 2024, ingresos: 15100000, egresos: 2900000, ganancia: 12200000, reservas: 26 },
    { mes: "Jul", año: 2024, ingresos: 16200000, egresos: 3100000, ganancia: 13100000, reservas: 28 },
    { mes: "Ago", año: 2024, ingresos: 12800000, egresos: 2600000, ganancia: 10200000, reservas: 21 },
    { mes: "Sep", año: 2024, ingresos: 13200000, egresos: 2800000, ganancia: 10400000, reservas: 22 },
    { mes: "Oct", año: 2024, ingresos: 15750000, egresos: 3250000, ganancia: 12500000, reservas: 23 }
  ]
};

export const mockDetalleInmuebles: IDetalleInmueble[] = [
  {
    id_inmueble: "inm_001",
    nombre_inmueble: "Apartamento Centro Histórico",
    propietario: {
      id: "prop_001",
      nombre: "Carlos",
      apellido: "Mendoza"
    },
    metricas: {
      total_ingresos: 4200000,
      total_egresos: 890000,
      ganancia_neta: 3310000,
      dias_ocupados: 24,
      dias_disponibles: 31,
      tasa_ocupacion: 77.4,
      precio_promedio_noche: 175000,
      cantidad_reservas: 8
    },
    ingresos_detalle: [
      {
        id: "ing_001",
        fecha: "2024-10-01",
        concepto: "Hospedaje",
        monto: 350000,
        metodo_pago: "transferencia",
        id_reserva: "res_001",
        codigo_reserva: "RSV-2024-001"
      },
      {
        id: "ing_002", 
        fecha: "2024-10-03",
        concepto: "Hospedaje",
        monto: 525000,
        metodo_pago: "tarjeta",
        id_reserva: "res_002",
        codigo_reserva: "RSV-2024-002"
      }
    ],
    egresos_detalle: [
      {
        id: "egr_001",
        fecha: "2024-10-02",
        concepto: "Limpieza profunda",
        monto: 120000,
        metodo_pago: "efectivo",
        categoria: "limpieza"
      },
      {
        id: "egr_002",
        fecha: "2024-10-05",
        concepto: "Reparación grifo",
        monto: 85000,
        metodo_pago: "transferencia", 
        categoria: "mantenimiento"
      }
    ],
    reservas_detalle: [
      {
        id: "res_001",
        codigo_reserva: "RSV-2024-001",
        fecha_inicio: "2024-10-01",
        fecha_fin: "2024-10-03",
        dias: 2,
        monto_total: 350000,
        estado: "completada",
        huesped: {
          nombre: "María",
          apellido: "González"
        }
      },
      {
        id: "res_002",
        codigo_reserva: "RSV-2024-002", 
        fecha_inicio: "2024-10-04",
        fecha_fin: "2024-10-07",
        dias: 3,
        monto_total: 525000,
        estado: "completada",
        huesped: {
          nombre: "Roberto",
          apellido: "Silva"
        }
      }
    ]
  },
  {
    id_inmueble: "inm_002",
    nombre_inmueble: "Casa Zona Rosa",
    propietario: {
      id: "prop_002", 
      nombre: "Ana",
      apellido: "García"
    },
    metricas: {
      total_ingresos: 3800000,
      total_egresos: 720000,
      ganancia_neta: 3080000,
      dias_ocupados: 22,
      dias_disponibles: 31,
      tasa_ocupacion: 71.0,
      precio_promedio_noche: 172700,
      cantidad_reservas: 6
    },
    ingresos_detalle: [
      {
        id: "ing_003",
        fecha: "2024-10-02",
        concepto: "Hospedaje",
        monto: 690000,
        metodo_pago: "transferencia",
        id_reserva: "res_003",
        codigo_reserva: "RSV-2024-003"
      }
    ],
    egresos_detalle: [
      {
        id: "egr_003",
        fecha: "2024-10-03",
        concepto: "Jardinería",
        monto: 150000,
        metodo_pago: "efectivo",
        categoria: "mantenimiento"
      }
    ],
    reservas_detalle: [
      {
        id: "res_003",
        codigo_reserva: "RSV-2024-003",
        fecha_inicio: "2024-10-02",
        fecha_fin: "2024-10-06",
        dias: 4,
        monto_total: 690000,
        estado: "completada",
        huesped: {
          nombre: "Laura",
          apellido: "Martínez"
        }
      }
    ]
  }
];

export const mockReporteCompleto: IReporteFinanciero = {
  config: {
    tipo_reporte: "empresa",
    periodo: {
      año: 2024,
      mes: 10,
      fecha_inicio: "2024-10-01",
      fecha_fin: "2024-10-31"
    },
    filtros: {
      id_empresa: "emp_001"
    }
  },
  resumen_general: mockResumenGeneral,
  detalle_inmuebles: mockDetalleInmuebles,
  graficos: mockGraficosData,
  fecha_generacion: new Date().toISOString()
};