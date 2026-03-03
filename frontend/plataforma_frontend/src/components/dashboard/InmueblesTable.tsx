import React from 'react';
import { Eye, Edit2, Trash2, Share2, Maximize, BedDouble, Users, Home } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { IInmueble } from '../../interfaces/Inmueble';
import { copyToClipboard } from '../../lib/utils';
import { getKpis } from '../../services/kpi.service';
import { KpiResponse, BuildingKpis, UnitKpis } from '../../interfaces/Kpi';

export interface IDataInmuebleIn extends IInmueble { }

interface InmueblesTableProps {
  inmuebles: IDataInmuebleIn[];
  onEdit: (inmueble: IDataInmuebleIn) => void;
  onDelete: (inmueble: IDataInmuebleIn) => void;
  onViewDetail: (inmueble: IDataInmuebleIn) => void;
}

const InmuebleCard: React.FC<{
  inmueble: IDataInmuebleIn;
  onEdit: (inmueble: IDataInmuebleIn) => void;
  onDelete: (inmueble: IDataInmuebleIn) => void;
  onViewDetail: (inmueble: IDataInmuebleIn) => void;
  formatCurrency: (amount: number) => string;
  canEdit: boolean;
  canDelete: boolean;
  isUnit?: boolean;
  unitsCount?: number;
  totalArea?: number;
}> = ({ inmueble, onEdit, onDelete, onViewDetail, formatCurrency, canEdit, canDelete, isUnit = false, unitsCount = 0, totalArea }) => {
  const [kpis, setKpis] = React.useState<KpiResponse | null>(null);
  const [loadingKpis, setLoadingKpis] = React.useState(false);

  React.useEffect(() => {
    const fetchKpis = async () => {
      setLoadingKpis(true);
      try {
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);

        const res = await getKpis({
          id_inmueble: Number(inmueble.id_inmueble || inmueble.id),
          fecha_inicio: thirtyDaysAgo.toISOString().split('T')[0],
          fecha_fin: now.toISOString().split('T')[0]
        });
        setKpis(res);
      } catch (err) {
        console.error('Error fetching KPIs for card:', err);
      } finally {
        setLoadingKpis(false);
      }
    };
    fetchKpis();
  }, [inmueble.id, inmueble.id_inmueble]);

  const price = inmueble.precio || 0;
  const area = inmueble.area_m2 || 0;
  const beds = inmueble.habitaciones || 0;
  const guests = inmueble.capacidad_maxima || 0;
  const bedType = inmueble.especificacion_acomodacion || inmueble.tipo || 'Cama Est.';
  const title = inmueble.nombre || inmueble.tipo_acomodacion || `Inmueble ${inmueble.id_inmueble || inmueble.id}`;

  let description = inmueble.descripcion;
  if (!description) {
    const locationParts = [inmueble.direccion, inmueble.ciudad].filter(Boolean).join(', ');
    description = locationParts ? `Ubicado en ${locationParts}. ${inmueble.tipo_acomodacion || ''}` : 'Propiedad cómoda y bien situada.';
  }

  const isAvailable = inmueble.estado !== 'inactivo' && inmueble.estado !== 'mantenimiento';
  const formatRNT = inmueble.rnt ? `RNT: ${inmueble.rnt}` : (inmueble.comision ? `${inmueble.comision}% Comis.` : null);
  const isBuilding = inmueble.tipo_registro === 'edificio';

  return (
    <div className={`flex flex-col bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow group relative w-full p-5 lg:p-6 ${isUnit ? 'ml-4 lg:ml-8 border-l-4 border-l-blue-400 dark:border-l-blue-600 animate-in slide-in-from-left-2 duration-300' : ''}`}>
      <div className="flex flex-col w-full justify-between">
        <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-4">
          <div className="flex-1 space-y-1.5 order-2 sm:order-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-foreground line-clamp-1">
                {title}
              </h3>
              {isBuilding && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded text-[10px] font-bold uppercase tracking-wider">
                  Edificio / Proyecto
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-muted-foreground line-clamp-2 leading-relaxed max-w-xl pr-4">
              {description}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {inmueble.tipo_acomodacion && (
                <span className="px-2.5 py-1 bg-gray-50 dark:bg-muted/50 text-gray-600 dark:text-gray-300 rounded-md text-[12px] font-medium border border-gray-100 dark:border-border">
                  {inmueble.tipo_acomodacion}
                </span>
              )}
              {inmueble.comision > 0 && (
                <span className="px-2.5 py-1 bg-gray-50 dark:bg-muted/50 text-gray-600 dark:text-gray-300 rounded-md text-[12px] font-medium border border-gray-100 dark:border-border">
                  Comisión: {parseFloat(inmueble.comision.toString())}%
                </span>
              )}
              {isBuilding && unitsCount > 0 && (
                <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md text-[12px] font-bold border border-blue-100 dark:border-blue-800">
                  {unitsCount} Unidades asociadas
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto shrink-0 order-1 sm:order-2">
            <div className="flex items-center gap-2 mb-2 sm:mb-4">
              <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 hidden sm:inline-block">ID: {inmueble.id_inmueble || inmueble.id}</span>
              {isAvailable ? (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 rounded-full text-xs font-semibold whitespace-nowrap">
                  Disponible
                </span>
              ) : (
                <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 rounded-full text-xs font-semibold whitespace-nowrap">
                  Ocupado
                </span>
              )}
            </div>
            {!isBuilding && price > 0 && (
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900 dark:text-foreground">{formatCurrency(price)}</span>
                <span className="text-[13px] text-gray-500 dark:text-muted-foreground font-medium ml-1">/noche</span>
              </div>
            )}
          </div>
        </div>

        <hr className="my-5 border-gray-100 dark:border-border" />

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Maximize className="w-[18px] h-[18px] text-gray-400" />
              <span className="font-medium text-[13px]">{isBuilding ? totalArea || 0 : area} m²</span>
            </div>
            {!isBuilding && (
              <>
                <div className="flex items-center gap-2">
                  <BedDouble className="w-[18px] h-[18px] text-gray-400" />
                  <span className="font-medium text-[13px] line-clamp-1 max-w-[120px]">{beds} {bedType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-[18px] h-[18px] text-gray-400" />
                  <span className="font-medium text-[13px]">{guests} huesp.</span>
                </div>
              </>
            )}
            {formatRNT && (
              <div className="flex items-center gap-2">
                <Home className="w-[18px] h-[18px] text-gray-400" />
                <span className="font-medium text-[13px] text-gray-500 line-clamp-1 max-w-[200px]">{formatRNT}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6">
            {/* KPIs / Cálculos Rápidos */}
            <div className="flex flex-wrap gap-x-6 gap-y-3 py-1">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Ocupación (30d)</span>
                <span className="text-sm font-bold text-blue-600">
                  {loadingKpis ? '...' : kpis ? `${(kpis.type === 'unit' ? (kpis.data as UnitKpis).ocupacion : (kpis.data as BuildingKpis).ocupacion_global).toFixed(1)}%` : '-- %'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">ADR / RevPAR</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-gray-900 dark:text-foreground">
                    {loadingKpis ? '...' : kpis ? formatCurrency(kpis.type === 'unit' ? (kpis.data as UnitKpis).adr : (kpis.data as BuildingKpis).revpar_edificio) : '--'}
                  </span>
                  <span className="text-gray-300 dark:text-gray-600">/</span>
                  <span className="text-sm font-bold text-purple-600">
                    {loadingKpis ? '...' : kpis ? formatCurrency(kpis.type === 'unit' ? (kpis.data as UnitKpis).revpar : (kpis.data as BuildingKpis).revpar_edificio) : '--'}
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Ingreso Neto</span>
                <span className="text-sm font-bold text-green-600">
                  {loadingKpis ? '...' : kpis ? formatCurrency(kpis.type === 'unit' ? (kpis.data as UnitKpis).ingreso_neto : (kpis.data as BuildingKpis).ingresos_totales) : '--'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Utilidad</span>
                <span className="text-sm font-bold text-green-700">
                  {loadingKpis ? '...' : kpis ? formatCurrency(kpis.type === 'unit' ? (kpis.data as UnitKpis).utilidad : (kpis.data as BuildingKpis).utilidad_total) : '--'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-1 shrink-0 mt-2 sm:mt-0">
              <button
                onClick={() => onViewDetail(inmueble)}
                className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
                title="Ver detalle"
              >
                <Eye className="h-[18px] w-[18px]" />
              </button>
              <button
                onClick={() => onEdit(inmueble)}
                disabled={!canEdit}
                className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                title="Editar"
              >
                <Edit2 className="h-[18px] w-[18px]" />
              </button>
              <button
                onClick={() => onDelete(inmueble)}
                disabled={!canDelete}
                className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                title="Eliminar"
              >
                <Trash2 className="h-[18px] w-[18px]" />
              </button>
              <button
                onClick={async () => {
                  const baseUrl = process.env.NEXT_PUBLIC_FORM_URL || window.location.origin.replace('3001', '3000');
                  const link = `${baseUrl}/checkin?inmueble=${inmueble.id_inmueble || inmueble.id}`;
                  const success = await copyToClipboard(link);
                  if (success) alert('Enlace de check-in copiado al portapapeles');
                }}
                className="p-2 rounded-lg text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-all"
                title="Copiar Check-in"
              >
                <Share2 className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InmueblesTable: React.FC<InmueblesTableProps> = ({ inmuebles, onEdit, onDelete, onViewDetail }) => {
  const { user } = useAuth();
  const canEdit = user?.permisos?.includes('editar_inmuebles') || true;
  const canDelete = user?.permisos?.includes('eliminar_inmuebles') || true;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const independently = inmuebles.filter(i => i.tipo_registro === 'independiente' || (!i.tipo_registro && !i.parent_id));
  const buildings = inmuebles.filter(i => i.tipo_registro === 'edificio');
  const units = inmuebles.filter(i => i.tipo_registro === 'unidad' && i.parent_id);

  return (
    <div className="flex flex-col gap-6 pb-12">
      {inmuebles.length === 0 ? (
        <div className="py-12 text-center text-gray-500 bg-white dark:bg-card border border-gray-100 dark:border-border rounded-2xl shadow-sm">
          No hay inmuebles registrados
        </div>
      ) : (
        <div className="space-y-8">
          {/* Buildings and their units */}
          {buildings.map(building => {
            const buildingUnits = units.filter(u => u.parent_id?.toString() === (building.id_inmueble || building.id).toString());
            const totalArea = buildingUnits.reduce((sum, u) => sum + (u.area_m2 || 0), 0);

            return (
              <div key={building.id} className="space-y-4">
                <InmuebleCard
                  inmueble={building}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onViewDetail={onViewDetail}
                  formatCurrency={formatCurrency}
                  canEdit={canEdit}
                  canDelete={canDelete}
                  unitsCount={buildingUnits.length}
                  totalArea={totalArea}
                />
                <div className="space-y-4">
                  {units
                    .filter(u => u.parent_id?.toString() === (building.id_inmueble || building.id).toString())
                    .map(unit => (
                      <InmuebleCard
                        key={unit.id}
                        inmueble={unit}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onViewDetail={onViewDetail}
                        formatCurrency={formatCurrency}
                        canEdit={canEdit}
                        canDelete={canDelete}
                        isUnit={true}
                      />
                    ))
                  }
                </div>
              </div>
            );
          })}

          {/* Independent properties */}
          {independently.map(inmueble => (
            <InmuebleCard
              key={inmueble.id}
              inmueble={inmueble}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewDetail={onViewDetail}
              formatCurrency={formatCurrency}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          ))}

          {/* Orphan units or units without selected building */}
          {units
            .filter(u => !buildings.some(b => (b.id_inmueble || b.id).toString() === u.parent_id?.toString()))
            .map(u => (
              <InmuebleCard
                key={u.id}
                inmueble={u}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewDetail={onViewDetail}
                formatCurrency={formatCurrency}
                canEdit={canEdit}
                canDelete={canDelete}
              />
            ))
          }
        </div>
      )}
    </div>
  );
};

export default InmueblesTable;
