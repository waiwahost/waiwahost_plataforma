import React, { useState } from 'react';
import { Button } from '../atoms/Button';
import {
  ChevronDown,
  ChevronUp,
  Home,
  User,
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff
} from 'lucide-react';
import { IDetalleInmueble } from '../../interfaces/Reporte';
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

interface IDetalleInmueblesProps {
  inmuebles: IDetalleInmueble[];
}

const DetalleInmuebles: React.FC<IDetalleInmueblesProps> = ({ inmuebles }) => {
  const [inmuebleExpandido, setInmuebleExpandido] = useState<string | null>(null);
  const [mostrarDetalles, setMostrarDetalles] = useState<{ [key: string]: boolean }>({});

  const formatearMoneda = (monto: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(monto);
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO');
  };

  const formatearPorcentaje = (porcentaje: number) => {
    return `${porcentaje.toFixed(1)}%`;
  };

  const toggleInmueble = (id: string) => {
    setInmuebleExpandido(inmuebleExpandido === id ? null : id);
  };

  const toggleDetalle = (inmuebleId: string, tipo: string) => {
    const key = `${inmuebleId}-${tipo}`;
    setMostrarDetalles(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getColorGanancia = (ganancia: number) => {
    return ganancia >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getIconoGanancia = (ganancia: number) => {
    return ganancia >= 0 ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Detalle por Inmuebles</h3>
      
      {inmuebles.map((inmueble) => (
        <Card key={inmueble.id_inmueble} className="overflow-hidden">
          <CardHeader 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => toggleInmueble(inmueble.id_inmueble)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Home className="h-5 w-5 text-blue-600" />
                <div>
                  <CardTitle className="text-lg">{inmueble.nombre_inmueble}</CardTitle>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {inmueble.propietario.nombre} {inmueble.propietario.apellido}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <div className={`text-lg font-bold flex items-center gap-1 ${getColorGanancia(inmueble.metricas.ganancia_neta)}`}>
                    {getIconoGanancia(inmueble.metricas.ganancia_neta)}
                    {formatearMoneda(inmueble.metricas.ganancia_neta)}
                  </div>
                  <p className="text-xs text-muted-foreground">Ganancia neta</p>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">
                    {formatearPorcentaje(inmueble.metricas.tasa_ocupacion)}
                  </div>
                  <p className="text-xs text-muted-foreground">Ocupación</p>
                </div>

                {inmuebleExpandido === inmueble.id_inmueble ? 
                  <ChevronUp className="h-5 w-5" /> : 
                  <ChevronDown className="h-5 w-5" />
                }
              </div>
            </div>
          </CardHeader>

          {inmuebleExpandido === inmueble.id_inmueble && (
            <CardContent className="pt-0">
              {/* Métricas Generales */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatearMoneda(inmueble.metricas.total_ingresos)}
                  </div>
                  <p className="text-xs text-muted-foreground">Ingresos</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {formatearMoneda(inmueble.metricas.total_egresos)}
                  </div>
                  <p className="text-xs text-muted-foreground">Egresos</p>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold">
                    {inmueble.metricas.cantidad_reservas}
                  </div>
                  <p className="text-xs text-muted-foreground">Reservas</p>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold">
                    {formatearMoneda(inmueble.metricas.precio_promedio_noche)}
                  </div>
                  <p className="text-xs text-muted-foreground">Precio/noche</p>
                </div>
              </div>

              {/* Secciones Expandibles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Ingresos */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        Ingresos ({inmueble.ingresos_detalle.length})
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleDetalle(inmueble.id_inmueble, 'ingresos')}
                      >
                        {mostrarDetalles[`${inmueble.id_inmueble}-ingresos`] ? 
                          <EyeOff className="h-4 w-4" /> : 
                          <Eye className="h-4 w-4" />
                        }
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {mostrarDetalles[`${inmueble.id_inmueble}-ingresos`] ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {inmueble.ingresos_detalle.map((ingreso) => (
                          <div key={ingreso.id} className="text-xs border-l-2 border-green-200 pl-2">
                            <div className="flex justify-between">
                              <span className="font-medium">{ingreso.concepto}</span>
                              <span className="text-green-600 font-bold">
                                {formatearMoneda(ingreso.monto)}
                              </span>
                            </div>
                            <div className="text-muted-foreground">
                              {formatearFecha(ingreso.fecha)} • {ingreso.metodo_pago}
                            </div>
                            {ingreso.codigo_reserva && (
                              <div className="text-muted-foreground">
                                Reserva: {ingreso.codigo_reserva}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <p>Clic para ver detalles</p>
                        <p className="text-green-600 font-bold">
                          Total: {formatearMoneda(inmueble.metricas.total_ingresos)}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Egresos */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        Egresos ({inmueble.egresos_detalle.length})
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleDetalle(inmueble.id_inmueble, 'egresos')}
                      >
                        {mostrarDetalles[`${inmueble.id_inmueble}-egresos`] ? 
                          <EyeOff className="h-4 w-4" /> : 
                          <Eye className="h-4 w-4" />
                        }
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {mostrarDetalles[`${inmueble.id_inmueble}-egresos`] ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {inmueble.egresos_detalle.map((egreso) => (
                          <div key={egreso.id} className="text-xs border-l-2 border-red-200 pl-2">
                            <div className="flex justify-between">
                              <span className="font-medium">{egreso.concepto}</span>
                              <span className="text-red-600 font-bold">
                                {formatearMoneda(egreso.monto)}
                              </span>
                            </div>
                            <div className="text-muted-foreground">
                              {formatearFecha(egreso.fecha)} • {egreso.metodo_pago}
                            </div>
                            <div className="text-muted-foreground">
                              Categoría: {egreso.categoria}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <p>Clic para ver detalles</p>
                        <p className="text-red-600 font-bold">
                          Total: {formatearMoneda(inmueble.metricas.total_egresos)}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Reservas */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        Reservas ({inmueble.reservas_detalle.length})
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleDetalle(inmueble.id_inmueble, 'reservas')}
                      >
                        {mostrarDetalles[`${inmueble.id_inmueble}-reservas`] ? 
                          <EyeOff className="h-4 w-4" /> : 
                          <Eye className="h-4 w-4" />
                        }
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {mostrarDetalles[`${inmueble.id_inmueble}-reservas`] ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {inmueble.reservas_detalle.map((reserva) => (
                          <div key={reserva.id} className="text-xs border-l-2 border-blue-200 pl-2">
                            <div className="flex justify-between">
                              <span className="font-medium">{reserva.codigo_reserva}</span>
                              <span className="text-blue-600 font-bold">
                                {formatearMoneda(reserva.monto_total)}
                              </span>
                            </div>
                            <div className="text-muted-foreground">
                              {reserva.huesped.nombre} {reserva.huesped.apellido}
                            </div>
                            <div className="text-muted-foreground">
                              {formatearFecha(reserva.fecha_inicio)} - {formatearFecha(reserva.fecha_fin)} ({reserva.dias} días)
                            </div>
                            <div className="text-muted-foreground">
                              Estado: {reserva.estado}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <p>Clic para ver detalles</p>
                        <p className="text-blue-600 font-bold">
                          {inmueble.metricas.dias_ocupados} / {inmueble.metricas.dias_disponibles} días
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};

export default DetalleInmuebles;