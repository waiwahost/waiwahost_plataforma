import React, { useState, useEffect } from 'react';
import DateSelector from './DateSelector';
import PropertySelector from './PropertySelector';
import ExpensesSummary from './ExpensesSummary';
import ExpensesTable from './ExpensesTable';
import ExpenseDetailModal from './ExpenseDetailModal';
import { IEgreso, IResumenEgresos, IFiltrosEgresos } from '../../interfaces/Egreso';
import { apiFetch } from '../../auth/apiFetch';

interface InmuebleOption {
  id: string;
  nombre: string;
}

const Deductions: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedInmueble, setSelectedInmueble] = useState<InmuebleOption | null>(null);
  const [egresos, setEgresos] = useState<IEgreso[]>([]);
  const [resumen, setResumen] = useState<IResumenEgresos | null>(null);
  const [inmuebles, setInmuebles] = useState<InmuebleOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingInmuebles, setLoadingInmuebles] = useState(false);
  
  // Modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEgreso, setSelectedEgreso] = useState<IEgreso | null>(null);

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
      const result = await apiFetch('/api/egresos/getInmueblesFiltro');
      if (result.success && Array.isArray(result.data)) {
        const inmueblesList = result.data.map((inmueble: any) => ({
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
      const filtros: IFiltrosEgresos = {
        fecha: selectedDate,
        id_inmueble: selectedInmueble?.id
      };

      // Construir URL con parámetros de consulta
      const params = new URLSearchParams({ fecha: filtros.fecha });
      if (filtros.id_inmueble) {
        params.append('id_inmueble', filtros.id_inmueble);
      }

      const [egresosResult, resumenResult] = await Promise.all([
        apiFetch(`/api/egresos/getEgresos?${params.toString()}`),
        apiFetch(`/api/egresos/getResumenEgresos?${params.toString()}`)
      ]);

      // Procesar respuesta de egresos
      if (egresosResult.success && Array.isArray(egresosResult.data)) {
        setEgresos(egresosResult.data);
      } else {
        setEgresos([]);
      }

      // Procesar respuesta de resumen
      if (resumenResult.success && resumenResult.data) {
        setResumen(resumenResult.data);
      } else {
        setResumen(null);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      setEgresos([]);
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

  const handleViewEgreso = (egreso: IEgreso) => {
    setSelectedEgreso(egreso);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedEgreso(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-tourism-navy">Egresos</h1>
          <p className="text-gray-600">Gestión y seguimiento de todos los egresos</p>
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

      {/* Expenses Summary */}
      <ExpensesSummary 
        resumen={resumen} 
        loading={loading}
        inmuebleSeleccionado={selectedInmueble}
      />

      {/* Expenses Table */}
      <ExpensesTable
        egresos={egresos}
        loading={loading}
        onView={handleViewEgreso}
      />

      {/* Detail Modal */}
      <ExpenseDetailModal
        isOpen={showDetailModal}
        onClose={handleCloseDetailModal}
        egreso={selectedEgreso}
      />
    </div>
  );
};

export default Deductions;
