import React, { useState, useEffect } from 'react';
import DateSelector from './DateSelector';
import PropertySelector from './PropertySelector';
import IncomesSummary from './IncomesSummary';
import IncomesTable from './IncomesTable';
import IncomeDetailModal from './IncomeDetailModal';
import { IIngreso, IResumenIngresos, IFiltrosIngresos } from '../../interfaces/Ingreso';
import { apiFetch } from '../../auth/apiFetch';

interface InmuebleOption {
  id: string;
  nombre: string;
}

const Incomes: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const now = new Date();
    return new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  });
  const [selectedInmueble, setSelectedInmueble] = useState<InmuebleOption | null>(null);
  const [ingresos, setIngresos] = useState<IIngreso[]>([]);
  const [resumen, setResumen] = useState<IResumenIngresos | null>(null);
  const [inmuebles, setInmuebles] = useState<InmuebleOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingInmuebles, setLoadingInmuebles] = useState(false);

  // Modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedIngreso, setSelectedIngreso] = useState<IIngreso | null>(null);

  // Cargar lista de inmuebles al inicializar
  useEffect(() => {
    loadInmuebles();
  }, []);

  // Cargar datos cuando cambia la fecha o el inmueble seleccionado
  useEffect(() => {
    loadData();
  }, [selectedDate, selectedInmueble]);

  const loadInmuebles = async () => {
    setLoadingInmuebles(true);
    try {
      const result = await apiFetch('/api/ingresos/getInmueblesFiltro');
      if (Array.isArray(result)) {
        const inmueblesList = result.map((inmueble: any) => ({
          id: inmueble.id,
          nombre: inmueble.nombre
        }));
        setInmuebles(inmueblesList);
      }
    } catch (error) {
      console.error('Error loading inmuebles:', error);
      // Fallback a datos mock en caso de error
      setInmuebles([
        { id: '1', nombre: 'Apartamento Centro 101' },
        { id: '2', nombre: 'Casa Zona Rosa' },
        { id: '3', nombre: 'Studio Chapinero 205' }
      ]);
    } finally {
      setLoadingInmuebles(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const filtros: IFiltrosIngresos = {
        fecha: selectedDate,
        id_inmueble: selectedInmueble?.id
      };

      // Construir URL con parámetros de consulta
      const params = new URLSearchParams({ fecha: filtros.fecha });
      if (filtros.id_inmueble) {
        params.append('id_inmueble', filtros.id_inmueble);
      }

      const [ingresosResult, resumenResult] = await Promise.all([
        apiFetch(`/api/ingresos/getIngresos?${params.toString()}`),
        apiFetch(`/api/ingresos/getResumenIngresos?${params.toString()}`)
      ]);

      // Procesar respuesta de ingresos
      if (Array.isArray(ingresosResult)) {
        setIngresos(ingresosResult);
      } else {
        setIngresos([]);
      }

      // Procesar respuesta de resumen
      if (resumenResult) {
        setResumen(resumenResult);
      } else {
        setResumen(null);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      setIngresos([]);
      setResumen(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  const handleInmuebleChange = (inmueble: InmuebleOption | null) => {
    setSelectedInmueble(inmueble);
  };

  const handleViewIngreso = (ingreso: IIngreso) => {
    setSelectedIngreso(ingreso);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedIngreso(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-tourism-navy">Ingresos</h1>
          <p className="text-gray-600">Gestión y seguimiento de todos los ingresos</p>
        </div>
      </div>

      {/* Date Selector */}
      <DateSelector
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
      />

      {/* Property Selector */}
      <PropertySelector
        inmuebles={inmuebles}
        selectedInmueble={selectedInmueble}
        onInmuebleChange={handleInmuebleChange}
        loading={loadingInmuebles}
      />

      {/* Incomes Summary */}
      <IncomesSummary
        resumen={resumen}
        loading={loading}
        inmuebleSeleccionado={selectedInmueble}
      />

      {/* Incomes Table */}
      <IncomesTable
        ingresos={ingresos}
        loading={loading}
        onView={handleViewIngreso}
      />

      {/* Detail Modal */}
      <IncomeDetailModal
        isOpen={showDetailModal}
        onClose={handleCloseDetailModal}
        ingreso={selectedIngreso}
      />
    </div>
  );
};

export default Incomes;
