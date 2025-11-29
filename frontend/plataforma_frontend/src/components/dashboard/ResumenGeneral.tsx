import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Home, 
  Calendar,
  Award
} from 'lucide-react';
import { IResumenGeneral } from '../../interfaces/Reporte';
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

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

interface IResumenGeneralProps {
  resumen: IResumenGeneral;
}

const ResumenGeneral: React.FC<IResumenGeneralProps> = ({ resumen }) => {
  const formatearMoneda = (monto: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(monto);
  };

  const formatearPorcentaje = (porcentaje: number) => {
    return `${porcentaje.toFixed(1)}%`;
  };

  const getColorVariacion = (variacion: number) => {
    if (variacion > 0) return 'text-green-600';
    if (variacion < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getIconoVariacion = (variacion: number) => {
    if (variacion > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (variacion < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <div className="h-4 w-4" />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Ingresos Totales */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatearMoneda(resumen.total_ingresos)}
          </div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
            {getIconoVariacion(resumen.mes_anterior.variacion_porcentual)}
            <span className={getColorVariacion(resumen.mes_anterior.variacion_porcentual)}>
              {formatearPorcentaje(Math.abs(resumen.mes_anterior.variacion_porcentual))} vs mes anterior
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Anterior: {formatearMoneda(resumen.mes_anterior.total_ingresos)}
          </p>
        </CardContent>
      </Card>

      {/* Egresos Totales */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Egresos Totales</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatearMoneda(resumen.total_egresos)}
          </div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
            <span>vs mes anterior</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Anterior: {formatearMoneda(resumen.mes_anterior.total_egresos)}
          </p>
        </CardContent>
      </Card>

      {/* Ganancia Neta */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ganancia Neta</CardTitle>
          <Award className={`h-4 w-4 ${resumen.ganancia_neta >= 0 ? 'text-green-600' : 'text-red-600'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${resumen.ganancia_neta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatearMoneda(resumen.ganancia_neta)}
          </div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
            {getIconoVariacion(resumen.mes_anterior.variacion_porcentual)}
            <span className={getColorVariacion(resumen.mes_anterior.variacion_porcentual)}>
              {formatearPorcentaje(Math.abs(resumen.mes_anterior.variacion_porcentual))} vs mes anterior
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Anterior: {formatearMoneda(resumen.mes_anterior.ganancia_neta)}
          </p>
        </CardContent>
      </Card>

      {/* Métricas Operacionales */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Métricas</CardTitle>
          <Home className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Inmuebles:</span>
              <span className="text-sm font-medium">{resumen.cantidad_inmuebles}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Reservas:</span>
              <span className="text-sm font-medium">{resumen.cantidad_reservas}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Ocupación:</span>
              <span className="text-sm font-medium text-blue-600">
                {formatearPorcentaje(resumen.ocupacion_promedio)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inmueble Más Rentable */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600" />
            Inmueble Más Rentable del Periodo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold">{resumen.inmueble_mas_rentable.nombre}</h4>
              <p className="text-sm text-muted-foreground">ID: {resumen.inmueble_mas_rentable.id}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {formatearMoneda(resumen.inmueble_mas_rentable.ganancia)}
              </div>
              <p className="text-sm text-muted-foreground">Ganancia total</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumenGeneral;