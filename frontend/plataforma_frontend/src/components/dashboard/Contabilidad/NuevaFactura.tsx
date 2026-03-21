import React, { useState, useEffect } from 'react';
import { Search, Calculator, Trash2, PlusCircle, Paperclip } from 'lucide-react';
import { getFacturaDesdeReserva, getNumeracionFactus, getClientesFacturacion, getTributosFactus, createFactura, enviarFacturaDian } from '../../../auth/factusApi';export default function NuevaFactura({ isFromReserva = false, onCancel }: { isFromReserva?: boolean, onCancel?: () => void }) {
  const [items, setItems] = useState([
    { id: 1, p: '', desc: '', cant: 1, valorU: 0, descP: 0, impC: '', impR: '', total: 0, isThirdParty: false, mandante_id: '' }
  ]);
  const [formasPago, setFormasPago] = useState([
    { id: 1, forma: '', valor: 0 }
  ]);

  const [reservaIdInput, setReservaIdInput] = useState('');
  const [reservaData, setReservaData] = useState<any>(null);
  const [loadingReserva, setLoadingReserva] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorReserva, setErrorReserva] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<any>(null);
  const [showReservaModal, setShowReservaModal] = useState(isFromReserva);

  const [numeraciones, setNumeraciones] = useState<any[]>([]);
  const [numeracionSeleccionada, setNumeracionSeleccionada] = useState<string>('');
  const [clientes, setClientes] = useState<any[]>([]);
  const [tributos, setTributos] = useState<any[]>([]);

  useEffect(() => {
    getNumeracionFactus().then(res => {
        if(res.success && res.data) {
            // Unify nested data structures if necessary
            let nums = res.data;
            if (nums.data && Array.isArray(nums.data)) nums = nums.data;
            if (nums.data && nums.data.data && Array.isArray(nums.data.data)) nums = nums.data.data;
            
            setNumeraciones(nums);
            // Auto-select Factura de Venta
            const factVenta = nums.find((n: any) => n.document === 'Factura de Venta' && n.is_active);
            if (factVenta) setNumeracionSeleccionada(String(factVenta.id));
        }
    });
    getClientesFacturacion({ limit: 100 }).then(res => {
        if(res.success && res.data?.items) setClientes(res.data.items);
    });
    getTributosFactus().then(res => {
        if(res.success && res.data) setTributos(res.data);
    });
  }, []);

  const handleBuscarReserva = async () => {
    if (!reservaIdInput) return;
    setLoadingReserva(true);
    setErrorReserva('');
    const res = await getFacturaDesdeReserva(Number(reservaIdInput));
    setLoadingReserva(false);
    if (res.success && res.data) {
      setReservaData(res.data);
    } else {
      setErrorReserva(res.message || 'No se encontró la reserva');
    }
  };

  const handleSeleccionarCliente = (tipo: 'huesped' | 'propietario') => {
    const cliente = tipo === 'huesped' ? reservaData.cliente_sugerido : reservaData.propietario_sugerido;
    setClienteSeleccionado(cliente);
    setShowReservaModal(false);
    
    // Auto-fill items based on reservation amount if simple
    if (reservaData.reserva && items.length === 1 && items[0].desc === '') {
       const newItems = [...items];
       newItems[0].desc = `Alojamiento Reserva #${reservaData.reserva.id}`;
       newItems[0].valorU = reservaData.reserva.precio_total || 0;
       newItems[0].total = reservaData.reserva.precio_total || 0;
       setItems(newItems);
    }
  };

  const mapDocTypeToId = (tipo: string) => {
    const map: any = { 'CC': 3, 'NIT': 6, 'CE': 5, 'TI': 2, 'PP': 7, 'DIE': 8, 'NUIP': 11 };
    return map[tipo] || 3;
  };

  const handleGuardarFactura = async (enviarDian: boolean = false) => {
    if (!clienteSeleccionado) { alert("Seleccione un cliente obligatoriamente."); return; }
    if (!numeracionSeleccionada) { alert("Cargando o falta numeración."); return; }

    setIsSaving(true);
    
    try {
      const payloadItems = items.map((it: any) => {
        let terc_id = undefined;
        let terc_nom = undefined;
        let tipo_doc = undefined;
        let isThirdParty = !!it.isThirdParty;
        
        if (it.isThirdParty && it.mandante_id) {
            const mand = clientes.find((c: any) => String(c.id) === String(it.mandante_id));
            if (mand) {
                // El backend espera string (numero_documento/NIT) en id_tercero
                terc_id = mand.numero_documento;
                terc_nom = mand.razon_social || `${mand.nombres || ''} ${mand.apellidos || ''}`.trim();
                tipo_doc = mand.tipo_documento || 'CC';
            }
        }
        
        // Mapeo básico de tributos según schema local [{ tributo: string, porcentaje: number }]
        const tributosArray = [];
        if (it.impC && it.impC !== '21') {
             // Extraer porcentaje y código. Suponemos que tributos tienen id o código
             const tr = tributos.find(t => t.id === Number(it.impC));
             tributosArray.push({ tributo: '01', porcentaje: tr ? tr.porcentaje : 19 }); 
        }

        return {
          codigo_producto: it.p || '001',
          descripcion: it.desc || 'Producto / Servicio',
          cantidad: Number(it.cant) || 1,
          precio_unitario: Number(it.valorU) || 0,
          porcentaje_descuento: Number(it.descP) || 0,
          tributos: tributosArray,
          es_ingreso_tercero: isThirdParty,
          ...(terc_id ? { id_tercero: terc_id, nombre_tercero: terc_nom, tipo_doc_mandante: tipo_doc } : {})
        };
      });

      const today = new Date().toISOString().split('T')[0];

      const payload: any = {
        id_cliente: Number(clienteSeleccionado.id),
        id_rango_numeracion: Number(numeracionSeleccionada),
        fecha_emision: today,
        observaciones: "Factura generada desde Plataforma Waiwa",
        items: payloadItems
      };

      console.log("PAYLOAD LOCAL BACKEND A ENVIAR:", payload);
      
      // Llamada la API
      const res = await createFactura(payload);
      
      if (res.success && res.data?.id) {
          if (enviarDian) {
              const resDian = await enviarFacturaDian(res.data.id);
              setIsSaving(false);
              if (resDian.success) {
                  alert("¡Factura guardada y enviada a la DIAN correctamente!");
                  if (onCancel) onCancel();
              } else {
                  alert(`Factura guardada localmente, pero falló el envío a la DIAN: ${resDian.message || 'Error desconocido'}`);
              }
          } else {
              setIsSaving(false);
              alert("¡Factura guardada correctamente como borrador!");
              if (onCancel) onCancel();
          }
      } else {
          setIsSaving(false);
          alert(`Error al guardar: ${res.message || 'Error desconocido'}`);
      }
    } catch (e: any) {
       console.error(e);
       alert("Error excepcion: " + e.message);
       setIsSaving(false);
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    
    const cant = Number(newItems[index].cant) || 0;
    const valorU = Number(newItems[index].valorU) || 0;
    const descP = Number(newItems[index].descP) || 0;
    const subtotal = cant * valorU;
    const desc = subtotal * (descP / 100);
    newItems[index].total = subtotal - desc;
    
    setItems(newItems);
  };

  const agregarFila = () => {
    setItems([...items, { id: Date.now(), p: '', desc: '', cant: 1, valorU: 0, descP: 0, impC: '', impR: '', total: 0, isThirdParty: false, mandante_id: '' }]);
  };

  const eliminarFila = (index: number) => {
    if (items.length > 1) {
        setItems(items.filter((_, i) => i !== index));
    }
  };

  const totales = items.reduce((acc, it) => {
    const cant = Number(it.cant) || 0;
    const valorU = Number(it.valorU) || 0;
    const descP = Number(it.descP) || 0;
    const bas = cant * valorU;
    const desc = bas * (descP / 100);
    acc.bruto += bas;
    acc.desc += desc;
    acc.neto += (bas - desc);
    return acc;
  }, { bruto: 0, desc: 0, neto: 0 });

  const btnSecondary = {
    background: 'transparent',
    border: '1px solid #1e293b',
    color: '#94a3b8',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px'
  };

  const btnPrimary = {
    background: '#84cc16', // lime-500 approx
    border: 'none',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600
  };
  
  const inputStyle = {
    width: '100%', padding: '8px 12px', borderRadius: 4,
    border: '1px solid #2d3748', background: '#1a2234', color: '#e2e8f0',
    fontSize: 13, outline: 'none', boxSizing: 'border-box' as const,
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-[#0f172a] min-h-screen text-[#e2e8f0]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold text-[#60a5fa]">Nueva factura de venta / Ingresos</h2>
        </div>
      </div>

      <div className="mb-8">
        <button className="text-[#3b82f6] text-sm flex items-center gap-1 font-medium hover:underline">
          Cambiar logo ☁️
        </button>
      </div>

      {/* Top Form */}
      <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-8">
        <div className="flex items-center">
          <label className="w-24 text-sm text-[#94a3b8]">Tipo ⓘ</label>
          <div className="flex-1 border-l-2 border-red-500">
             <select style={inputStyle} className="w-full">
               <option>Factura de Venta</option>
             </select>
          </div>
        </div>
        
        <div className="flex items-center">
          <label className="w-24 text-sm text-[#94a3b8] leading-tight">Operación</label>
          <div className="flex-1 border-l-2 border-red-500">
             <select style={inputStyle} className="w-full" defaultValue="10">
               <option value="10">Estándar</option>
               <option value="11">Mandatos (Ingresos terceros)</option>
             </select>
          </div>
        </div>

        <div className="flex items-center">
          <label className="w-24 text-sm text-[#94a3b8] leading-tight">Numeración</label>
          <div className="flex-1 border-l-2 border-red-500">
             <select 
               style={{...inputStyle, backgroundColor: '#1e293b', color: '#94a3b8', cursor: 'not-allowed'}} 
               className="w-full"
               value={numeracionSeleccionada}
               onChange={(e) => setNumeracionSeleccionada(e.target.value)}
               disabled
             >
               <option value="">Cargando numeración...</option>
               {numeraciones.filter((n: any) => n.is_active).map((n: any) => (
                   <option key={n.id} value={n.id}>
                       {n.document} {n.prefix ? `(${n.prefix})` : ''} - Res: {n.resolution_number || n.id} (Próx: {n.current || 1})
                   </option>
               ))}
             </select>
          </div>
        </div>

        <div className="flex items-center">
          <label className="w-24 text-sm text-[#94a3b8]">Cliente</label>
          <div className="flex-1 border-l-2 border-red-500 relative">
            <select 
              style={inputStyle} 
              value={clienteSeleccionado?.id || ''}
              onChange={(e: any) => {
                 const c = clientes.find((x: any) => x.id === Number(e.target.value));
                 setClienteSeleccionado(c || null);
              }}
            >
               <option value="">Seleccione un cliente...</option>
               {clientes.map((c: any) => (
                   <option key={c.id} value={c.id}>
                       {c.razon_social || `${c.nombres || ''} ${c.apellidos || ''}`.trim()} ({c.numero_documento})
                   </option>
               ))}
            </select>
            {!clienteSeleccionado && <div className="text-[10px] text-red-500 mt-1">El tercero es obligatorio</div>}
            {isFromReserva && (
               <button onClick={() => setShowReservaModal(true)} className="absolute right-6 top-2.5 text-xs text-[#3b82f6] hover:underline bg-[#0f172a] px-1 rounded">Cambiar Reserva</button>
            )}
          </div>
        </div>

        <div className="flex items-center">
          <label className="w-24 text-sm text-[#94a3b8]">Forma Pago</label>
          <div className="flex-1 border-l-2 border-red-500">
             <select style={inputStyle} className="w-full" defaultValue="1">
               <option value="1">Contado</option>
               <option value="2">Crédito</option>
             </select>
          </div>
        </div>

        <div className="flex items-center">
          <label className="w-24 text-sm text-[#94a3b8] leading-tight">Fecha emisión</label>
          <div className="flex-1 border-l-2 border-red-500">
            <input style={inputStyle} type="date" defaultValue="2026-03-21" />
          </div>
        </div>

        <div className="flex items-center">
          <label className="w-24 text-sm text-[#94a3b8] leading-tight">Fecha vcto.</label>
          <div className="flex-1 border-l-2 border-green-500">
            <input style={inputStyle} type="date" defaultValue="2026-03-21" />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="mb-8 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#1e293b] text-[#94a3b8] text-xs">
            <tr>
              <th className="p-2 w-8">#</th>
              <th className="p-2 w-48">Producto</th>
              <th className="p-2">Descripción</th>
              <th className="p-2 w-16 text-center">Tercero?</th>
              <th className="p-2 w-16">Cant</th>
              <th className="p-2 w-32">Valor Unitario</th>
              <th className="p-2 w-20">% Desc.</th>
              <th className="p-2 w-32">Impuesto Cargo</th>
              <th className="p-2 w-32">Retención</th>
              <th className="p-2 w-32">Valor Total</th>
              <th className="p-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id} className="border-b border-[#1e293b]">
                <td className="p-2 text-center">{idx + 1}</td>
                <td className="p-2 relative">
                  <input style={inputStyle} placeholder="Buscar" value={item.p} onChange={(e) => handleItemChange(idx, 'p', e.target.value)} />
                  <Search size={14} className="absolute right-4 top-4 text-[#64748b]" />
                </td>
                <td className="p-2"><input style={inputStyle} value={item.desc} onChange={(e) => handleItemChange(idx, 'desc', e.target.value)} /></td>
                <td className="p-2 text-center align-top pt-4">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 cursor-pointer" 
                    title="Ingreso para terceros" 
                    checked={item.isThirdParty}
                    onChange={(e: any) => {
                       handleItemChange(idx, 'isThirdParty', e.target.checked);
                       if (!e.target.checked) handleItemChange(idx, 'mandante_id', '');
                    }}
                  />
                  {item.isThirdParty && (
                    <div className="mt-1">
                      <select 
                        className="w-full text-[10px] p-1 rounded bg-[#0f172a] border border-[#334155] text-slate-300"
                        value={item.mandante_id}
                        onChange={(e: any) => {
                          handleItemChange(idx, 'mandante_id', e.target.value);
                        }}
                      >
                         <option value="">Mandante...</option>
                         {clientes.map((c: any) => (
                             <option key={c.id} value={c.id}>{c.razon_social || `${c.nombres || ''} ${c.apellidos || ''}`.trim()}</option>
                         ))}
                      </select>
                    </div>
                  )}
                </td>
                <td className="p-2"><input style={{...inputStyle, textAlign:'right'}} type="number" step="1" value={item.cant} onChange={(e) => handleItemChange(idx, 'cant', e.target.value)} /></td>
                <td className="p-2"><input style={{...inputStyle, textAlign:'right'}} type="number" step="0.01" value={item.valorU} onChange={(e) => handleItemChange(idx, 'valorU', e.target.value)} /></td>
                <td className="p-2"><input style={{...inputStyle, textAlign:'right'}} type="number" step="0.01" value={item.descP} onChange={(e) => handleItemChange(idx, 'descP', e.target.value)} /></td>
                <td className="p-2">
                  <select style={inputStyle} value={item.impC} onChange={(e) => handleItemChange(idx, 'impC', e.target.value)}>
                    <option value="">Ninguno</option>
                    {tributos.map((t: any) => (
                        <option key={t.id} value={t.id}>{t.nombre || t.descripcion} ({t.porcentaje || t.valor}%)</option>
                    ))}
                  </select>
                </td>
                <td className="p-2">
                  <select style={inputStyle} value={item.impR} onChange={(e) => handleItemChange(idx, 'impR', e.target.value)}>
                    <option value="">Ninguno</option>
                  </select>
                </td>
                <td className="p-2"><input style={{...inputStyle, textAlign:'right', background:'#2d3748'}} readOnly value={item.total.toFixed(2)} /></td>
                <td className="p-2 text-center text-red-400 cursor-pointer hover:text-red-300" onClick={() => eliminarFila(idx)}>
                  <Trash2 size={16} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3">
          <button className="text-[#84cc16] text-sm flex items-center gap-1 hover:underline" onClick={agregarFila}>
            <PlusCircle size={14} /> Agregar Fila
          </button>
        </div>
      </div>

      {/* Payment Forms & Totals */}
      <div className="flex justify-between mb-12">
        <div className="w-1/2 pr-8">
          <h3 className="text-[#60a5fa] font-semibold mb-4 text-base">Formas de pago</h3>
          {formasPago.map((fp) => (
            <div key={fp.id} className="flex gap-4 items-center mb-2 pb-2 border-b border-[#1e293b]/50">
              <select style={inputStyle} className="flex-1">
                <option value="">Selecciona medio de pago</option>
                <option value="10">Efectivo</option>
                <option value="42">Consignación bancaria</option>
                <option value="48">Tarjeta de crédito</option>
                <option value="49">Tarjeta débito</option>
                <option value="1">Instrumento no definido</option>
              </select>
              <input style={{...inputStyle, width: '120px', textAlign:'right'}} defaultValue="0.00" />
              <Trash2 size={16} className="text-red-400 cursor-pointer" />
            </div>
          ))}
          <button className="text-[#84cc16] text-sm flex items-center gap-1 mt-2 hover:underline">
            <PlusCircle size={14} /> Agregar otra forma de pago
          </button>

          <div className="mt-6 flex items-center gap-4">
             <div className="text-base font-semibold">Total formas de pagos:</div>
             <div className="text-lg font-bold text-white flex items-center gap-2">
               0.00 <span className="text-[#84cc16] text-xl">✓</span>
             </div>
          </div>
        </div>

        <div className="w-1/3 text-sm">
          <div className="flex justify-between py-2">
            <span className="text-[#94a3b8]">Total Bruto:</span>
            <span>{totales.bruto.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-[#94a3b8]">Descuentos:</span>
            <span>{totales.desc.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-[#94a3b8]">Subtotal:</span>
            <span>{(totales.bruto - totales.desc).toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-3 mt-4 border-t border-[#1e293b]">
            <span className="text-base font-semibold">Total Neto:</span>
            <span className="text-lg font-bold">{totales.neto.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Observations */}
      <div className="w-1/2 mb-8">
        <h3 className="text-[#60a5fa] font-semibold mb-2 text-base">Observaciones</h3>
        <textarea 
          placeholder="Aquí puedes ingresar comentarios adicionales o información para tu cliente. Por ejemplo: 'Favor consignar a la cuenta No. 000000 del banco XYZ'"
          style={{...inputStyle, minHeight: '80px', color: '#94a3b8'}}
        />
        <div className="flex items-center gap-2 mt-3 text-sm cursor-pointer hover:text-white transition-colors text-[#94a3b8]">
          <span>Adjuntar archivo</span>
          <Paperclip size={16} />
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-center gap-3 py-6 bg-[#0f172a] sticky bottom-0 border-t border-[#1e293b]">
        <button style={{...btnSecondary, background:'#0ea5e9', color:'white', border:'none'}} onClick={onCancel}>Cancelar</button>
        <button style={btnPrimary} onClick={() => handleGuardarFactura(false)} disabled={isSaving}>
          {isSaving ? 'Guardando...' : 'Solo Guardar'}
        </button>
        <button style={{...btnPrimary, background:'#84cc16', color:'#000'}} onClick={() => handleGuardarFactura(true)} disabled={isSaving}>
          Guardar y Enviar a DIAN
        </button>
      </div>

      {/* Reserva Modal Overlay */}
      {showReservaModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6 shadow-2xl w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-4">Facturar desde Reserva</h3>
            
            {!reservaData ? (
               <div className="flex flex-col gap-4">
                 <div>
                   <label className="text-sm text-[#94a3b8] mb-1 block">ID de Reserva</label>
                   <input 
                     style={inputStyle} 
                     type="number" 
                     placeholder="Ej: 1042" 
                     value={reservaIdInput}
                     onChange={(e) => setReservaIdInput(e.target.value)}
                   />
                 </div>
                 {errorReserva && <div className="text-red-400 text-sm">{errorReserva}</div>}
                 <div className="flex justify-end gap-2 mt-2">
                   <button style={btnSecondary} onClick={() => setShowReservaModal(false)}>Cancelar</button>
                   <button style={btnPrimary} onClick={handleBuscarReserva} disabled={loadingReserva}>
                     {loadingReserva ? 'Buscando...' : 'Buscar Reserva'}
                   </button>
                 </div>
               </div>
            ) : (
               <div className="flex flex-col gap-4">
                 <div className="bg-[#0f172a] p-3 rounded-lg border border-[#334155]">
                   <p className="text-sm text-white font-semibold">Reserva #{reservaData.reserva?.id}</p>
                   <p className="text-xs text-[#94a3b8]">Total: ${reservaData.reserva?.precio_total}</p>
                 </div>
                 
                 <p className="text-sm text-[#94a3b8]">¿A quién deseas generar la factura?</p>
                 
                 {reservaData.cliente_sugerido && (
                   <button 
                     onClick={() => handleSeleccionarCliente('huesped')}
                     className="w-full text-left p-3 border border-[#3b82f6] rounded-lg hover:bg-[#3b82f6]/10 transition-colors"
                   >
                     <p className="text-sm font-bold text-[#60a5fa]">Huésped Principal</p>
                     <p className="text-xs text-white">
                        {reservaData.cliente_sugerido.nombres} {reservaData.cliente_sugerido.apellidos}
                     </p>
                     <p className="text-xs text-[#94a3b8]">Doc: {reservaData.cliente_sugerido.numero_documento}</p>
                   </button>
                 )}

                 {reservaData.propietario_sugerido ? (
                   <button 
                     onClick={() => handleSeleccionarCliente('propietario')}
                     className="w-full text-left p-3 border border-[#8b5cf6] rounded-lg hover:bg-[#8b5cf6]/10 transition-colors"
                   >
                     <p className="text-sm font-bold text-[#a78bfa]">Propietario</p>
                     <p className="text-xs text-white">
                        {reservaData.propietario_sugerido.nombres} {reservaData.propietario_sugerido.apellidos} {reservaData.propietario_sugerido.razon_social}
                     </p>
                     <p className="text-xs text-[#94a3b8]">Doc: {reservaData.propietario_sugerido.numero_documento}</p>
                   </button>
                 ) : (
                   <div className="w-full text-left p-3 border border-[#334155] rounded-lg opacity-50">
                     <p className="text-sm font-bold text-[#94a3b8]">Propietario</p>
                     <p className="text-xs text-[#94a3b8]">No se encontró información del propietario para esta reserva.</p>
                   </div>
                 )}

                 <div className="flex justify-end mt-2">
                   <button 
                     style={btnSecondary} 
                     onClick={() => { setReservaData(null); setErrorReserva(''); }}
                   >
                     Volver a buscar
                   </button>
                 </div>
               </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
