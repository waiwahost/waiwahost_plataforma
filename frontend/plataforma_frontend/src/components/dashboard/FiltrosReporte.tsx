import React, { useState, useEffect } from 'react';
import { Button } from '../atoms/Button';
import { Calendar, Filter, Download } from 'lucide-react';
import { IFiltrosReporte, IOpcionesReporte } from '../../interfaces/Reporte';
import { getOpcionesReporte } from '../../auth/reportesApi';

// Importaciones locales de UI components
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

// Componentes Select locales
const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

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

interface IFiltrosReporteProps {
  filtros: IFiltrosReporte;
  onFiltrosChange: (filtros: IFiltrosReporte) => void;
  onGenerarReporte: () => void;
  onExportarPDF: () => void;
  isLoading: boolean;
}

const FiltrosReporte: React.FC<IFiltrosReporteProps> = ({
  filtros,
  onFiltrosChange,
  onGenerarReporte,
  onExportarPDF,
  isLoading
}) => {
  const [opciones, setOpciones] = useState<IOpcionesReporte | null>(null);
  const [loadingOpciones, setLoadingOpciones] = useState(true);

  const meses = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];

  const años = Array.from({ length: 5 }, (_, i) => {
    const año = new Date().getFullYear() - i;
    return { value: año, label: año.toString() };
  });

  useEffect(() => {
    const cargarOpciones = async () => {
      setLoadingOpciones(true);
      const data = await getOpcionesReporte();
      setOpciones(data);
      setLoadingOpciones(false);
    };

    cargarOpciones();
  }, []);

  const handleTipoChange = (tipo: 'empresa' | 'inmueble' | 'propietario') => {
    onFiltrosChange({
      ...filtros,
      tipo_reporte: tipo,
      id_empresa: undefined,
      id_inmueble: undefined,
      id_propietario: undefined
    });
  };

  const getInmueblesDisponibles = () => {
    if (!opciones) return [];
    
    if (filtros.tipo_reporte === 'empresa' && filtros.id_empresa) {
      return opciones.inmuebles.filter(i => i.id_empresa === filtros.id_empresa);
    } else if (filtros.tipo_reporte === 'propietario' && filtros.id_propietario) {
      const propietario = opciones.propietarios.find(p => p.id === filtros.id_propietario);
      return opciones.inmuebles.filter(i => propietario?.inmuebles.includes(i.id));
    }
    
    return opciones.inmuebles;
  };

  if (loadingOpciones) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Cargando opciones...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter size={20} />
          Filtros de Reporte
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tipo de Reporte */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Reporte</label>
            <Select 
              value={filtros.tipo_reporte} 
              onValueChange={handleTipoChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="empresa">Por Empresa</SelectItem>
                <SelectItem value="inmueble">Por Inmueble</SelectItem>
                <SelectItem value="propietario">Por Propietario</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Año */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Año</label>
            <Select 
              value={filtros.año.toString()} 
              onValueChange={(value: string) => onFiltrosChange({ ...filtros, año: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar año" />
              </SelectTrigger>
              <SelectContent>
                {años.map(año => (
                  <SelectItem key={año.value} value={año.value.toString()}>
                    {año.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Mes</label>
            <Select 
              value={filtros.mes.toString()} 
              onValueChange={(value: string) => onFiltrosChange({ ...filtros, mes: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar mes" />
              </SelectTrigger>
              <SelectContent>
                {meses.map(mes => (
                  <SelectItem key={mes.value} value={mes.value.toString()}>
                    {mes.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro específico según tipo */}
          <div className="space-y-2">
            {filtros.tipo_reporte === 'empresa' && (
              <>
                <label className="text-sm font-medium">Empresa</label>
                <Select 
                  value={filtros.id_empresa || 'todas'} 
                  onValueChange={(value: string) => onFiltrosChange({ ...filtros, id_empresa: value === 'todas' ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las empresas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas las empresas</SelectItem>
                    {opciones?.empresas.map(empresa => (
                      <SelectItem key={empresa.id} value={empresa.id}>
                        {empresa.nombre} ({empresa.cantidad_inmuebles} inmuebles)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

            {filtros.tipo_reporte === 'inmueble' && (
              <>
                <label className="text-sm font-medium">Inmueble</label>
                <Select 
                  value={filtros.id_inmueble || 'placeholder'} 
                  onValueChange={(value: string) => onFiltrosChange({ ...filtros, id_inmueble: value === 'placeholder' ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar inmueble" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" disabled>
                      Seleccionar inmueble
                    </SelectItem>
                    {getInmueblesDisponibles().map(inmueble => (
                      <SelectItem key={inmueble.id} value={inmueble.id}>
                        {inmueble.nombre} - {inmueble.nombre_empresa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

            {filtros.tipo_reporte === 'propietario' && (
              <>
                <label className="text-sm font-medium">Propietario</label>
                <Select 
                  value={filtros.id_propietario || 'placeholder'} 
                  onValueChange={(value: string) => onFiltrosChange({ ...filtros, id_propietario: value === 'placeholder' ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar propietario" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder" disabled>
                      Seleccionar propietario
                    </SelectItem>
                    {opciones?.propietarios.map(propietario => (
                      <SelectItem key={propietario.id} value={propietario.id}>
                        {propietario.nombre} {propietario.apellido} ({propietario.cantidad_inmuebles} inmuebles)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
          <Button 
            onClick={onGenerarReporte}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Calendar size={16} />
            {isLoading ? 'Generando...' : 'Generar Reporte'}
          </Button>
          
          <Button 
            variant="outline"
            onClick={onExportarPDF}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Download size={16} />
            Exportar PDF
          </Button>
        </div>

        {/* Información del filtro actual */}
        <div className="bg-muted/50 p-3 rounded-lg text-sm">
          <strong>Reporte actual:</strong> {filtros.tipo_reporte === 'empresa' ? 'Por Empresa' : filtros.tipo_reporte === 'inmueble' ? 'Por Inmueble' : 'Por Propietario'} - {meses.find(m => m.value === filtros.mes)?.label} {filtros.año}
          {filtros.id_empresa && <span> | Empresa: {opciones?.empresas.find(e => e.id === filtros.id_empresa)?.nombre}</span>}
          {filtros.id_inmueble && <span> | Inmueble: {opciones?.inmuebles.find(i => i.id === filtros.id_inmueble)?.nombre}</span>}
          {filtros.id_propietario && <span> | Propietario: {opciones?.propietarios.find(p => p.id === filtros.id_propietario)?.nombre} {opciones?.propietarios.find(p => p.id === filtros.id_propietario)?.apellido}</span>}
        </div>
      </CardContent>
    </Card>
  );
};

export default FiltrosReporte;