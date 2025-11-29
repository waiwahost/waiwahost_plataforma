import React, { useState, useRef } from 'react';
import { Button } from '../atoms/Button';
import FiltrosReporte from './FiltrosReporte';
import ResumenGeneral from './ResumenGeneral';
import GraficosReporte from './GraficosReporte';
import DetalleInmuebles from './DetalleInmuebles';
import { useReportePDF } from './ReportePDFGenerator';
import { 
  IFiltrosReporte, 
  IReporteFinanciero, 
  IReporteConfig 
} from '../../interfaces/Reporte';
import { generarReporteFinanciero } from '../../auth/reportesApi';
import { 
  FileText, 
  Download, 
  RefreshCw, 
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { cn } from "../../lib/utils";

// Componentes Card locales
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const Reports: React.FC = () => {
  // Estados principales
  const [filtros, setFiltros] = useState<IFiltrosReporte>({
    tipo_reporte: 'empresa',
    año: new Date().getFullYear(),
    mes: new Date().getMonth() + 1,
  });

  const [reporte, setReporte] = useState<IReporteFinanciero | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<string | null>(null);

  // Referencias para captura de PDF
  const graficosRef = useRef<HTMLDivElement>(null);
  const { generarPDF } = useReportePDF();

  // Generar configuración del reporte desde filtros
  const generarConfigReporte = (): IReporteConfig => {
    const año = filtros.año;
    const mes = filtros.mes;
    
    // Calcular fechas del período
    const fechaInicio = new Date(año, mes - 1, 1);
    const fechaFin = new Date(año, mes, 0); // Último día del mes
    
    return {
      tipo_reporte: filtros.tipo_reporte,
      periodo: {
        año,
        mes,
        fecha_inicio: fechaInicio.toISOString().split('T')[0],
        fecha_fin: fechaFin.toISOString().split('T')[0]
      },
      filtros: {
        id_empresa: filtros.id_empresa,
        id_inmueble: filtros.id_inmueble,
        id_propietario: filtros.id_propietario
      }
    };
  };

  // Manejar generación de reporte
  const handleGenerarReporte = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const config = generarConfigReporte();
      const reporteGenerado = await generarReporteFinanciero(config);
      
      if (reporteGenerado) {
        setReporte(reporteGenerado);
        setUltimaActualizacion(new Date().toLocaleString('es-CO'));
      } else {
        setError('No se pudo generar el reporte. Verifica los filtros seleccionados.');
      }
    } catch (err) {
      console.error('Error al generar reporte:', err);
      setError('Error al generar el reporte. Inténtalo nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar exportación a PDF
  const handleExportarPDF = async () => {
    if (!reporte) {
      setError('Primero debes generar un reporte para exportar.');
      return;
    }

    try {
      setIsLoading(true);
      await generarPDF(reporte, graficosRef.current || undefined);
    } catch (err) {
      console.error('Error al exportar PDF:', err);
      setError('Error al exportar el PDF. Inténtalo nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Validar filtros
  const validarFiltros = (): boolean => {
    if (filtros.tipo_reporte === 'inmueble' && !filtros.id_inmueble) {
      setError('Debes seleccionar un inmueble para este tipo de reporte.');
      return false;
    }
    return true;
  };

  // Manejar cambio de filtros con validación
  const handleFiltrosChange = (nuevosFiltros: IFiltrosReporte) => {
    setFiltros(nuevosFiltros);
    setError(null);
    
    // Limpiar reporte si cambió algo importante
    if (reporte && (
      nuevosFiltros.tipo_reporte !== filtros.tipo_reporte ||
      nuevosFiltros.año !== filtros.año ||
      nuevosFiltros.mes !== filtros.mes ||
      nuevosFiltros.id_empresa !== filtros.id_empresa ||
      nuevosFiltros.id_inmueble !== filtros.id_inmueble ||
      nuevosFiltros.id_propietario !== filtros.id_propietario
    )) {
      setReporte(null);
      setUltimaActualizacion(null);
    }
  };

  const manejarGenerarReporte = () => {
    if (validarFiltros()) {
      handleGenerarReporte();
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            Reportes Financieros
          </h1>
          <p className="text-gray-600 mt-2">
            Análisis detallado de ingresos, egresos y rentabilidad
          </p>
        </div>
        
        {ultimaActualizacion && (
          <div className="text-right">
            <p className="text-sm text-gray-500">Última actualización:</p>
            <p className="text-sm font-medium">{ultimaActualizacion}</p>
          </div>
        )}
      </div>

      {/* Filtros */}
      <FiltrosReporte
        filtros={filtros}
        onFiltrosChange={handleFiltrosChange}
        onGenerarReporte={manejarGenerarReporte}
        onExportarPDF={handleExportarPDF}
        isLoading={isLoading}
      />

      {/* Mensajes de error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {isLoading && (
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center space-x-3">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              <span className="text-lg">Generando reporte...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contenido del reporte */}
      {reporte && !isLoading && (
        <div className="space-y-6">
          {/* Resumen General */}
          <ResumenGeneral resumen={reporte.resumen_general} />

          {/* Gráficos */}
          <Card>
            <CardContent className="p-6">
              <div ref={graficosRef}>
                <GraficosReporte datos={reporte.graficos} />
              </div>
            </CardContent>
          </Card>

          {/* Detalle por Inmuebles */}
          {reporte.detalle_inmuebles.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <DetalleInmuebles inmuebles={reporte.detalle_inmuebles} />
              </CardContent>
            </Card>
          )}

          {/* Acciones adicionales */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={manejarGenerarReporte}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Actualizar Reporte
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleExportarPDF}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Descargar PDF
                </Button>

                <Button
                  variant="outline"
                  onClick={() => window.print()}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Imprimir
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Estado vacío */}
      {!reporte && !isLoading && !error && (
        <Card>
          <CardContent className="p-12 text-center">
            <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              ¡Genera tu primer reporte!
            </h3>
            <p className="text-gray-600 mb-6">
              Selecciona los filtros deseados y haz clic en "Generar Reporte" para ver análisis detallados de tus propiedades.
            </p>
            <Button 
              onClick={manejarGenerarReporte}
              disabled={isLoading}
              className="flex items-center gap-2 mx-auto"
            >
              <TrendingUp className="h-4 w-4" />
              Generar Reporte
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Reports;
