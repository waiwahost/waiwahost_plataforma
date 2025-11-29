import React, { useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { Button } from '../atoms/Button';
import { IGraficosData } from '../../interfaces/Reporte';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Calendar
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

interface IGraficosReporteProps {
  datos: IGraficosData;
}

const GraficosReporte: React.FC<IGraficosReporteProps> = ({ datos }) => {
  const [graficoActivo, setGraficoActivo] = useState<'tendencia' | 'ocupacion' | 'distribucion' | 'comparacion'>('tendencia');

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: 'compact'
    }).format(valor);
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  const colores = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff', '#00ffff', '#ffff00'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('Porcentaje') ? `${entry.value}%` : formatearMoneda(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Preparar datos para gráfico de tendencia diaria
  const datosTendencia = datos.ingresos_por_dia.map((item, index) => ({
    fecha: formatearFecha(item.fecha),
    ingresos: item.valor,
    egresos: datos.egresos_por_dia[index]?.valor || 0,
    ganancia: item.valor - (datos.egresos_por_dia[index]?.valor || 0)
  }));

  return (
    <div className="space-y-6">
      {/* Navegación de gráficos */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant={graficoActivo === 'tendencia' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setGraficoActivo('tendencia')}
          className="flex items-center gap-2"
        >
          <TrendingUp size={16} />
          Tendencia Diaria
        </Button>
        <Button
          variant={graficoActivo === 'ocupacion' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setGraficoActivo('ocupacion')}
          className="flex items-center gap-2"
        >
          <BarChart3 size={16} />
          Ocupación
        </Button>
        <Button
          variant={graficoActivo === 'distribucion' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setGraficoActivo('distribucion')}
          className="flex items-center gap-2"
        >
          <PieChartIcon size={16} />
          Distribución
        </Button>
        <Button
          variant={graficoActivo === 'comparacion' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setGraficoActivo('comparacion')}
          className="flex items-center gap-2"
        >
          <Calendar size={16} />
          Comparación
        </Button>
      </div>

      {/* Gráfico de Tendencia Diaria */}
      {graficoActivo === 'tendencia' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Tendencia de Ingresos y Egresos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={datosTendencia}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis tickFormatter={formatearMoneda} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="ingresos"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                    name="Ingresos"
                  />
                  <Area
                    type="monotone"
                    dataKey="egresos"
                    stackId="2"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.3}
                    name="Egresos"
                  />
                  <Line
                    type="monotone"
                    dataKey="ganancia"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    name="Ganancia Neta"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ganancia Acumulada</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={datos.ganancia_por_dia}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" tickFormatter={formatearFecha} />
                  <YAxis tickFormatter={formatearMoneda} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="valor"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                    name="Ganancia"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficos de Ocupación */}
      {graficoActivo === 'ocupacion' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Ocupación por Inmueble
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={datos.ocupacion_por_inmueble}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="ocupacion" stackId="a" fill="#10b981" name="Días Ocupados" />
                <Bar dataKey="disponibilidad" stackId="a" fill="#e5e7eb" name="Días Disponibles" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Gráficos de Distribución */}
      {graficoActivo === 'distribucion' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Ingresos por Inmueble</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={datos.ingresos_por_inmueble}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, porcentaje }) => `${name}: ${porcentaje}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {datos.ingresos_por_inmueble.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colores[index % colores.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatearMoneda(Number(value)), 'Ingresos']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribución de Egresos por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={datos.egresos_por_categoria}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, porcentaje }) => `${name}: ${porcentaje}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {datos.egresos_por_categoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colores[index % colores.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatearMoneda(Number(value)), 'Egresos']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráfico de Comparación */}
      {graficoActivo === 'comparacion' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Comparación Mensual</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={datos.comparacion_meses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="periodo" />
                  <YAxis tickFormatter={formatearMoneda} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="ingresos" fill="#10b981" name="Ingresos" />
                  <Bar dataKey="egresos" fill="#ef4444" name="Egresos" />
                  <Bar dataKey="ganancia" fill="#3b82f6" name="Ganancia" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tendencia Anual</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={datos.tendencia_anual}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis tickFormatter={formatearMoneda} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="ingresos" stroke="#10b981" strokeWidth={2} name="Ingresos" />
                  <Line type="monotone" dataKey="egresos" stroke="#ef4444" strokeWidth={2} name="Egresos" />
                  <Line type="monotone" dataKey="ganancia" stroke="#3b82f6" strokeWidth={3} name="Ganancia" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default GraficosReporte;