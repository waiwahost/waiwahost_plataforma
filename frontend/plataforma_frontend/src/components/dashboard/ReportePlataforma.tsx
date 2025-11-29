import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, DollarSign, Users } from 'lucide-react';
import { Button } from '../atoms/Button';
import { getReportePorPlataforma, IReportePlataformaData } from '../../auth/reportesApi';
import { PLATAFORMAS_ORIGEN, getPlataformaLabel, getPlataformaColor } from '../../constants/plataformas';

interface ReportePlataformaProps {
  className?: string;
}

const ReportePlataforma: React.FC<ReportePlataformaProps> = ({ className = '' }) => {
  const [fechaInicio, setFechaInicio] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [fechaFin, setFechaFin] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [reporteData, setReporteData] = useState<IReportePlataformaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleGenerarReporte = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getReportePorPlataforma(fechaInicio, fechaFin);
      
      if (response.success && response.data) {
        setReporteData(response.data);
      } else {
        setError(response.message || 'Error al generar reporte');
      }
    } catch (err) {
      setError('Error al obtener reporte por plataforma');
      console.error('Error generating platform report:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTotalGeneral = () => {
    if (!reporteData) return { ingresos: 0, reservas: 0 };
    
    return Object.values(reporteData).reduce(
      (total, plataforma) => ({
        ingresos: total.ingresos + plataforma.total_ingresos,
        reservas: total.reservas + plataforma.cantidad_reservas
      }),
      { ingresos: 0, reservas: 0 }
    );
  };

  const getPlataformasOrdenadas = () => {
    if (!reporteData) return [];
    
    return Object.entries(reporteData)
      .sort(([, a], [, b]) => b.total_ingresos - a.total_ingresos)
      .map(([plataforma, data]) => ({ plataforma, ...data }));
  };

  useEffect(() => {
    handleGenerarReporte();
  }, []);

  const totalGeneral = getTotalGeneral();
  const plataformasOrdenadas = getPlataformasOrdenadas();

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-tourism-navy">Reporte por Plataforma</h2>
            <p className="text-gray-600">Análisis de ingresos y reservas por canal de origen</p>
          </div>
          <Calendar className="h-6 w-6 text-tourism-teal" />
        </div>

        {/* Filtros de fecha */}
        <div className="flex items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tourism-teal focus:border-transparent"
            />
          </div>
          <Button
            onClick={handleGenerarReporte}
            disabled={loading}
            className="h-[42px]"
          >
            {loading ? 'Generando...' : 'Generar Reporte'}
          </Button>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tourism-teal mx-auto"></div>
            <p className="text-gray-600 mt-2">Generando reporte...</p>
          </div>
        )}

        {reporteData && !loading && (
          <>
            {/* Resumen General */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="text-sm text-green-600 font-medium">Total Ingresos</p>
                    <p className="text-2xl font-bold text-green-800">
                      {formatCurrency(totalGeneral.ingresos)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Reservas</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {totalGeneral.reservas}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalle por Plataforma */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalle por Plataforma</h3>
              
              {plataformasOrdenadas.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No se encontraron datos para el período seleccionado
                </div>
              ) : (
                plataformasOrdenadas.map(({ plataforma, total_ingresos, cantidad_reservas }) => {
                  const plataformaConfig = PLATAFORMAS_ORIGEN.find(p => p.value === plataforma);
                  const porcentajeIngresos = totalGeneral.ingresos > 0 
                    ? (total_ingresos / totalGeneral.ingresos) * 100 
                    : 0;
                  const porcentajeReservas = totalGeneral.reservas > 0 
                    ? (cantidad_reservas / totalGeneral.reservas) * 100 
                    : 0;

                  return (
                    <div key={plataforma} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            plataformaConfig ? plataformaConfig.color : 'bg-gray-100 text-gray-800'
                          }`}>
                            {getPlataformaLabel(plataforma as any)}
                          </span>
                          <TrendingUp className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Ingresos</p>
                          <p className="text-lg font-bold text-gray-900">
                            {formatCurrency(total_ingresos)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {porcentajeIngresos.toFixed(1)}% del total
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Reservas</p>
                          <p className="text-lg font-bold text-gray-900">
                            {cantidad_reservas}
                          </p>
                          <p className="text-xs text-gray-500">
                            {porcentajeReservas.toFixed(1)}% del total
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600">Promedio por Reserva</p>
                          <p className="text-lg font-bold text-gray-900">
                            {cantidad_reservas > 0 
                              ? formatCurrency(total_ingresos / cantidad_reservas)
                              : formatCurrency(0)
                            }
                          </p>
                        </div>
                        
                        <div className="md:text-right">
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                            <div 
                              className="bg-tourism-teal h-2 rounded-full transition-all duration-300"
                              style={{ width: `${porcentajeIngresos}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500">Participación</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportePlataforma;