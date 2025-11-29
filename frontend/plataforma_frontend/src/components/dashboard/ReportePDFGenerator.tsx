import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { IReporteFinanciero } from '../../interfaces/Reporte';

export class ReportePDFGenerator {
  private reporte: IReporteFinanciero;
  private pdf: jsPDF;

  constructor(reporte: IReporteFinanciero) {
    this.reporte = reporte;
    this.pdf = new jsPDF('p', 'mm', 'a4');
  }

  private formatearMoneda(monto: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(monto);
  }

  private formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private formatearPorcentaje(porcentaje: number): string {
    return `${porcentaje.toFixed(1)}%`;
  }

  private agregarEncabezado(): void {
    const pageWidth = this.pdf.internal.pageSize.getWidth();
    
    // Logo y título principal
    this.pdf.setFontSize(20);
    this.pdf.setTextColor(59, 130, 246); // blue-600
    this.pdf.text('REPORTE FINANCIERO', pageWidth / 2, 20, { align: 'center' });
    
    // Información del reporte
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(75, 85, 99); // gray-600
    
    const tipoReporte = this.reporte.config.tipo_reporte === 'empresa' ? 'Por Empresa' :
                       this.reporte.config.tipo_reporte === 'inmueble' ? 'Por Inmueble' : 'Por Propietario';
    
    const periodo = `${this.getNombreMes(this.reporte.config.periodo.mes)} ${this.reporte.config.periodo.año}`;
    
    this.pdf.text(`Tipo: ${tipoReporte}`, 20, 35);
    this.pdf.text(`Período: ${periodo}`, 20, 42);
    this.pdf.text(`Generado: ${this.formatearFecha(this.reporte.fecha_generacion)}`, 20, 49);
    
    // Línea separadora
    this.pdf.setDrawColor(229, 231, 235); // gray-200
    this.pdf.line(20, 55, pageWidth - 20, 55);
  }

  private getNombreMes(mes: number): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1];
  }

  private agregarResumenGeneral(yPos: number): number {
    const resumen = this.reporte.resumen_general;
    
    // Título
    this.pdf.setFontSize(16);
    this.pdf.setTextColor(17, 24, 39); // gray-900
    this.pdf.text('RESUMEN GENERAL', 20, yPos);
    yPos += 15;
    
    // Métricas principales en cajas
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(75, 85, 99);
    
    const boxWidth = 45;
    const boxHeight = 25;
    const spacing = 5;
    const startX = 20;
    
    // Ingresos
    this.pdf.setFillColor(220, 252, 231); // green-100
    this.pdf.rect(startX, yPos, boxWidth, boxHeight, 'F');
    this.pdf.setTextColor(21, 128, 61); // green-700
    this.pdf.text('INGRESOS', startX + 2, yPos + 5);
    this.pdf.setFontSize(14);
    this.pdf.text(this.formatearMoneda(resumen.total_ingresos), startX + 2, yPos + 15, { maxWidth: boxWidth - 4 });
    
    // Egresos
    const egresosX = startX + boxWidth + spacing;
    this.pdf.setFillColor(254, 226, 226); // red-100
    this.pdf.rect(egresosX, yPos, boxWidth, boxHeight, 'F');
    this.pdf.setTextColor(185, 28, 28); // red-700
    this.pdf.setFontSize(10);
    this.pdf.text('EGRESOS', egresosX + 2, yPos + 5);
    this.pdf.setFontSize(14);
    this.pdf.text(this.formatearMoneda(resumen.total_egresos), egresosX + 2, yPos + 15, { maxWidth: boxWidth - 4 });
    
    // Ganancia
    const gananciaX = egresosX + boxWidth + spacing;
    const gananciaNeta = resumen.ganancia_neta;
    this.pdf.setFillColor(gananciaNeta >= 0 ? 220 : 254, gananciaNeta >= 0 ? 252 : 226, gananciaNeta >= 0 ? 231 : 226);
    this.pdf.rect(gananciaX, yPos, boxWidth, boxHeight, 'F');
    this.pdf.setTextColor(gananciaNeta >= 0 ? 21 : 185, gananciaNeta >= 0 ? 128 : 28, gananciaNeta >= 0 ? 61 : 28);
    this.pdf.setFontSize(10);
    this.pdf.text('GANANCIA NETA', gananciaX + 2, yPos + 5);
    this.pdf.setFontSize(14);
    this.pdf.text(this.formatearMoneda(gananciaNeta), gananciaX + 2, yPos + 15, { maxWidth: boxWidth - 4 });
    
    yPos += boxHeight + 15;
    
    // Métricas operacionales
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(75, 85, 99);
    this.pdf.text('Métricas Operacionales:', 20, yPos);
    yPos += 8;
    
    this.pdf.setFontSize(10);
    this.pdf.text(`• Inmuebles: ${resumen.cantidad_inmuebles}`, 25, yPos);
    yPos += 6;
    this.pdf.text(`• Reservas: ${resumen.cantidad_reservas}`, 25, yPos);
    yPos += 6;
    this.pdf.text(`• Ocupación promedio: ${this.formatearPorcentaje(resumen.ocupacion_promedio)}`, 25, yPos);
    yPos += 10;
    
    // Inmueble más rentable
    this.pdf.setFontSize(12);
    this.pdf.text('Inmueble Más Rentable:', 20, yPos);
    yPos += 8;
    this.pdf.setFontSize(10);
    this.pdf.text(`${resumen.inmueble_mas_rentable.nombre}: ${this.formatearMoneda(resumen.inmueble_mas_rentable.ganancia)}`, 25, yPos);
    
    return yPos + 15;
  }

  private agregarDetalleInmuebles(yPos: number): number {
    this.pdf.setFontSize(16);
    this.pdf.setTextColor(17, 24, 39);
    this.pdf.text('DETALLE POR INMUEBLES', 20, yPos);
    yPos += 15;
    
    this.reporte.detalle_inmuebles.forEach((inmueble, index) => {
      // Verificar si necesitamos nueva página
      if (yPos > 250) {
        this.pdf.addPage();
        this.agregarEncabezado();
        yPos = 70;
      }
      
      // Nombre del inmueble
      this.pdf.setFontSize(14);
      this.pdf.setTextColor(59, 130, 246);
      this.pdf.text(`${index + 1}. ${inmueble.nombre_inmueble}`, 20, yPos);
      yPos += 8;
      
      // Propietario
      this.pdf.setFontSize(10);
      this.pdf.setTextColor(107, 114, 128);
      this.pdf.text(`Propietario: ${inmueble.propietario.nombre} ${inmueble.propietario.apellido}`, 25, yPos);
      yPos += 10;
      
      // Métricas en tabla
      const tableData = [
        ['Ingresos', this.formatearMoneda(inmueble.metricas.total_ingresos)],
        ['Egresos', this.formatearMoneda(inmueble.metricas.total_egresos)],
        ['Ganancia', this.formatearMoneda(inmueble.metricas.ganancia_neta)],
        ['Ocupación', this.formatearPorcentaje(inmueble.metricas.tasa_ocupacion)],
        ['Reservas', inmueble.metricas.cantidad_reservas.toString()],
        ['Precio/noche', this.formatearMoneda(inmueble.metricas.precio_promedio_noche)]
      ];
      
      this.pdf.setFontSize(9);
      this.pdf.setTextColor(75, 85, 99);
      
      tableData.forEach((row, rowIndex) => {
        this.pdf.text(row[0] + ':', 25, yPos + (rowIndex * 5));
        this.pdf.text(row[1], 80, yPos + (rowIndex * 5));
      });
      
      yPos += (tableData.length * 5) + 10;
    });
    
    return yPos;
  }

  private async agregarGraficos(elementoGraficos: HTMLElement): Promise<void> {
    this.pdf.addPage();
    this.agregarEncabezado();
    
    this.pdf.setFontSize(16);
    this.pdf.setTextColor(17, 24, 39);
    this.pdf.text('GRÁFICOS Y ANÁLISIS', 20, 70);
    
    try {
      const canvas = await html2canvas(elementoGraficos, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 170;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      this.pdf.addImage(imgData, 'PNG', 20, 85, imgWidth, imgHeight);
    } catch (error) {
      console.error('Error al capturar gráficos:', error);
      this.pdf.setFontSize(12);
      this.pdf.setTextColor(185, 28, 28);
      this.pdf.text('Error al generar gráficos', 20, 90);
    }
  }

  public async generarPDF(elementoGraficos?: HTMLElement): Promise<void> {
    try {
      // Página 1: Encabezado y resumen
      this.agregarEncabezado();
      let yPos = this.agregarResumenGeneral(70);
      
      // Página 2: Detalle de inmuebles
      if (this.reporte.detalle_inmuebles.length > 0) {
        this.pdf.addPage();
        this.agregarEncabezado();
        this.agregarDetalleInmuebles(70);
      }
      
      // Página 3: Gráficos (si se proporciona el elemento)
      if (elementoGraficos) {
        await this.agregarGraficos(elementoGraficos);
      }
      
      // Pie de página en todas las páginas
      const totalPages = this.pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        this.pdf.setPage(i);
        this.pdf.setFontSize(8);
        this.pdf.setTextColor(107, 114, 128);
        const pageWidth = this.pdf.internal.pageSize.getWidth();
        this.pdf.text(`Página ${i} de ${totalPages}`, pageWidth - 30, 285);
        this.pdf.text('Generado por Plataforma Waiwahost', 20, 285);
      }
      
      // Descargar el PDF
      const nombreArchivo = `reporte_${this.reporte.config.tipo_reporte}_${this.reporte.config.periodo.año}_${this.reporte.config.periodo.mes}.pdf`;
      this.pdf.save(nombreArchivo);
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      throw new Error('No se pudo generar el PDF');
    }
  }
}

// Hook para usar el generador de PDF
export const useReportePDF = () => {
  const generarPDF = async (reporte: IReporteFinanciero, elementoGraficos?: HTMLElement) => {
    const generator = new ReportePDFGenerator(reporte);
    await generator.generarPDF(elementoGraficos);
  };

  return { generarPDF };
};