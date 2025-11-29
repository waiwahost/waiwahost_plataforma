import React from 'react';
import { RefreshCw, TrendingUp, BarChart3, PieChart, Calendar } from 'lucide-react';
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

interface IEstadoCargaReporteProps {
  paso: 'cargando_opciones' | 'generando_reporte' | 'procesando_graficos' | 'finalizando';
  mensaje?: string;
}

const EstadoCargaReporte: React.FC<IEstadoCargaReporteProps> = ({ 
  paso, 
  mensaje 
}) => {
  const getPasoInfo = () => {
    switch (paso) {
      case 'cargando_opciones':
        return {
          icono: RefreshCw,
          titulo: 'Cargando Opciones',
          descripcion: 'Obteniendo empresas, inmuebles y propietarios...',
          progreso: 25
        };
      case 'generando_reporte':
        return {
          icono: TrendingUp,
          titulo: 'Generando Reporte',
          descripcion: 'Calculando métricas financieras y operacionales...',
          progreso: 50
        };
      case 'procesando_graficos':
        return {
          icono: BarChart3,
          titulo: 'Procesando Gráficos',
          descripcion: 'Creando visualizaciones y análisis...',
          progreso: 75
        };
      case 'finalizando':
        return {
          icono: Calendar,
          titulo: 'Finalizando',
          descripcion: 'Preparando reporte final...',
          progreso: 90
        };
      default:
        return {
          icono: RefreshCw,
          titulo: 'Procesando',
          descripcion: 'Por favor espera...',
          progreso: 0
        };
    }
  };

  const { icono: Icono, titulo, descripcion, progreso } = getPasoInfo();

  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex flex-col items-center space-y-6">
          {/* Icono principal animado */}
          <div className="relative">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Icono className="h-8 w-8 text-blue-600 animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <RefreshCw className="h-3 w-3 text-white animate-spin" />
            </div>
          </div>

          {/* Información del paso */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">{titulo}</h3>
            <p className="text-gray-600">{mensaje || descripcion}</p>
          </div>

          {/* Barra de progreso */}
          <div className="w-full max-w-md">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Progreso</span>
              <span>{progreso}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progreso}%` }}
              ></div>
            </div>
          </div>

          {/* Iconos de pasos */}
          <div className="flex space-x-4 mt-4">
            <div className={`flex items-center space-x-2 ${paso === 'cargando_opciones' ? 'text-blue-600' : progreso > 25 ? 'text-green-600' : 'text-gray-400'}`}>
              <RefreshCw className="h-4 w-4" />
              <span className="text-xs">Opciones</span>
            </div>
            <div className={`flex items-center space-x-2 ${paso === 'generando_reporte' ? 'text-blue-600' : progreso > 50 ? 'text-green-600' : 'text-gray-400'}`}>
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Métricas</span>
            </div>
            <div className={`flex items-center space-x-2 ${paso === 'procesando_graficos' ? 'text-blue-600' : progreso > 75 ? 'text-green-600' : 'text-gray-400'}`}>
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs">Gráficos</span>
            </div>
            <div className={`flex items-center space-x-2 ${paso === 'finalizando' ? 'text-blue-600' : progreso > 90 ? 'text-green-600' : 'text-gray-400'}`}>
              <Calendar className="h-4 w-4" />
              <span className="text-xs">Final</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EstadoCargaReporte;