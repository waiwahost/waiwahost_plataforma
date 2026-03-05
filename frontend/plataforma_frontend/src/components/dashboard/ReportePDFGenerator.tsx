import jsPDF from 'jspdf';

// ─────────────────────────── Paleta de colores ───────────────────────────
const COLORS = {
  bannerBg: [100, 149, 237] as [number, number, number],      // Cornflower blue
  bannerText: [255, 255, 255] as [number, number, number],
  headerBg: [230, 238, 255] as [number, number, number],       // Azul muy claro
  headerText: [30, 58, 138] as [number, number, number],        // Azul oscuro
  sectionTitle: [30, 58, 138] as [number, number, number],
  rowAlt: [248, 250, 255] as [number, number, number],          // Gris-azul muy suave
  rowNormal: [255, 255, 255] as [number, number, number],
  totalRow: [219, 234, 254] as [number, number, number],        // Azul pálido
  positiveText: [22, 101, 52] as [number, number, number],      // Verde
  negativeText: [185, 28, 28] as [number, number, number],      // Rojo
  mutedText: [100, 116, 139] as [number, number, number],       // Gris pizarra
  darkText: [15, 23, 42] as [number, number, number],
  border: [203, 213, 225] as [number, number, number],
  kpiGreenBg: [220, 252, 231] as [number, number, number],
  kpiGreenText: [22, 101, 52] as [number, number, number],
  kpiRedBg: [254, 226, 226] as [number, number, number],
  kpiRedText: [185, 28, 28] as [number, number, number],
  kpiBlueBg: [219, 234, 254] as [number, number, number],
  kpiBlueText: [30, 64, 175] as [number, number, number],
};

// ─────────────────────────── Helpers ─────────────────────────────────────
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  const local = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
  return local.toLocaleDateString('es-CO');
}

// ─────────────────────────── Clase principal ─────────────────────────────
export class ReportePDFGenerator {
  private pdf: jsPDF;
  private pageW: number;
  private pageH: number;
  private margin = 14;
  private currentPage = 0;
  private totalPages = 0; // Se rellena al final

  constructor() {
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.pageW = this.pdf.internal.pageSize.getWidth();
    this.pageH = this.pdf.internal.pageSize.getHeight();
  }

  // ── Banner principal con logo ──────────────────────────────────────────
  private async agregarBanner(titulo: string, subtitulo: string, logoUrl?: string): Promise<void> {
    const bannerH = 28;

    // Fondo del banner
    this.pdf.setFillColor(...COLORS.bannerBg);
    this.pdf.rect(0, 0, this.pageW, bannerH, 'F');

    // Intentar insertar logo
    if (logoUrl) {
      try {
        const img = await this.cargarImagen(logoUrl);
        // Logo a la izquierda, ajustado a 18 mm de alto con aspecto
        const logoH = 20;
        const logoW = logoH; // cuadrado aprox
        this.pdf.addImage(img, 'PNG', this.margin, (bannerH - logoH) / 2, logoW, logoH);
      } catch {
        // Si falla el logo, omitir silenciosamente
      }
    }

    // Título principal
    this.pdf.setTextColor(...COLORS.bannerText);
    this.pdf.setFontSize(15);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('WAIWA HOST', this.pageW / 2, 11, { align: 'center' });

    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(titulo, this.pageW / 2, 18, { align: 'center' });

    this.pdf.setFontSize(7.5);
    this.pdf.setTextColor(200, 220, 255);
    this.pdf.text(subtitulo, this.pageW / 2, 24, { align: 'center' });
  }

  // ── Encabezado de página interna (pág 2+) ────────────────────────────
  private agregarEncabezadoPagina(): void {
    this.pdf.setFillColor(...COLORS.bannerBg);
    this.pdf.rect(0, 0, this.pageW, 12, 'F');
    this.pdf.setTextColor(...COLORS.bannerText);
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('WAIWA HOST  |  REPORTE FINANCIERO', this.margin, 8);
  }

  // ── Footer con número de página ───────────────────────────────────────
  private agregarFootersEnTodasLasPaginas(): void {
    const total = this.pdf.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      this.pdf.setPage(i);
      this.pdf.setFontSize(7);
      this.pdf.setTextColor(...COLORS.mutedText);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.line(this.margin, this.pageH - 8, this.pageW - this.margin, this.pageH - 8);
      this.pdf.text(
        `Generado por Plataforma Waiwa Host  •  ${new Date().toLocaleDateString('es-CO')}`,
        this.margin, this.pageH - 4
      );
      this.pdf.text(`Página ${i} de ${total}`, this.pageW - this.margin, this.pageH - 4, { align: 'right' });
    }
  }

  // ── Título de sección ─────────────────────────────────────────────────
  private agregarTituloSeccion(titulo: string, y: number): number {
    this.pdf.setFillColor(...COLORS.headerBg);
    this.pdf.rect(this.margin, y, this.pageW - this.margin * 2, 7, 'F');
    this.pdf.setTextColor(...COLORS.sectionTitle);
    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(titulo, this.margin + 3, y + 5);
    return y + 10;
  }

  // ── KPI Cards (3 tarjetas en fila) ────────────────────────────────────
  private agregarKPIs(y: number, totalIngresos: number, totalGastos: number, balance: number): number {
    const cardW = (this.pageW - this.margin * 2 - 8) / 3;
    const cardH = 20;

    const cards = [
      { label: 'INGRESOS TOTALES', value: totalIngresos, bg: COLORS.kpiGreenBg, text: COLORS.kpiGreenText },
      { label: 'GASTOS TOTALES', value: -totalGastos, bg: COLORS.kpiRedBg, text: COLORS.kpiRedText },
      { label: 'UTILIDAD / BALANCE', value: balance, bg: COLORS.kpiBlueBg, text: COLORS.kpiBlueText },
    ];

    cards.forEach((card, i) => {
      const x = this.margin + i * (cardW + 4);
      this.pdf.setFillColor(...card.bg);
      this.pdf.roundedRect(x, y, cardW, cardH, 2, 2, 'F');
      this.pdf.setTextColor(...card.text);
      this.pdf.setFontSize(6.5);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(card.label, x + cardW / 2, y + 6, { align: 'center' });
      this.pdf.setFontSize(9);
      this.pdf.text(formatCurrency(card.value), x + cardW / 2, y + 15, { align: 'center', maxWidth: cardW - 4 });
    });

    return y + cardH + 8;
  }

  // ── KPI indicadores (ocupación, revpar, etc.) ─────────────────────────
  private agregarKPIIndicadores(y: number, kpiData: any): number {
    if (!kpiData?.data) return y;

    const isBuilding = kpiData.type === 'building';
    const d = kpiData.data;

    const items = isBuilding ? [
      { label: 'Ocupación', value: `${d.ocupacion_global?.toFixed(1)}%` },
      { label: 'RevPAR Edificio', value: formatCurrency(d.revpar_edificio) },
      { label: 'RevPAR', value: formatCurrency(d.revpar_edificio) },
      { label: 'Margen Neto', value: `${d.margen_neto?.toFixed(1)}%` },
    ] : [
      { label: 'Ocupación', value: `${d.ocupacion?.toFixed(1)}%` },
      { label: 'ADR', value: formatCurrency(d.adr) },
      { label: 'RevPAR', value: formatCurrency(d.revpar) },
      { label: 'Noches', value: `${d.noches_ocupadas} / ${d.noches_disponibles}` },
    ];

    const colW = (this.pageW - this.margin * 2) / items.length;
    const boxH = 14;

    items.forEach((item, i) => {
      const x = this.margin + i * colW;
      this.pdf.setFillColor(240, 245, 255);
      this.pdf.rect(x, y, colW - 2, boxH, 'F');
      this.pdf.setTextColor(...COLORS.mutedText);
      this.pdf.setFontSize(6.5);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(item.label, x + colW / 2, y + 5, { align: 'center' });
      this.pdf.setTextColor(...COLORS.darkText);
      this.pdf.setFontSize(8.5);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(item.value, x + colW / 2, y + 11, { align: 'center' });
    });

    return y + boxH + 7;
  }

  // ── Tabla genérica ────────────────────────────────────────────────────
  private agregarTabla(
    headers: string[],
    rows: (string | number)[][],
    colWidths: number[],
    y: number,
    aligns?: ('left' | 'center' | 'right')[],
    totalRow?: (string | number)[]
  ): number {
    const rowH = 6.5;
    const headerH = 7;
    const x0 = this.margin;

    // Header row
    this.pdf.setFillColor(...COLORS.headerBg);
    this.pdf.rect(x0, y, this.pageW - this.margin * 2, headerH, 'F');
    this.pdf.setTextColor(...COLORS.headerText);
    this.pdf.setFontSize(7.5);
    this.pdf.setFont('helvetica', 'bold');

    let cx = x0 + 2;
    headers.forEach((h, i) => {
      const align = aligns?.[i] ?? 'left';
      const cellX = align === 'right' ? cx + colWidths[i] - 4 : align === 'center' ? cx + colWidths[i] / 2 : cx;
      this.pdf.text(h, cellX, y + 5, { align });
      cx += colWidths[i];
    });
    y += headerH;

    // Data rows
    rows.forEach((row, rowIdx) => {
      // Check page break (leave 15mm for footer)
      if (y + rowH > this.pageH - 20) {
        this.pdf.addPage();
        this.agregarEncabezadoPagina();
        y = 18;
      }

      this.pdf.setFillColor(...(rowIdx % 2 === 0 ? COLORS.rowNormal : COLORS.rowAlt));
      this.pdf.rect(x0, y, this.pageW - this.margin * 2, rowH, 'F');

      this.pdf.setTextColor(...COLORS.darkText);
      this.pdf.setFontSize(7);
      this.pdf.setFont('helvetica', 'normal');

      cx = x0 + 2;
      row.forEach((cell, i) => {
        const align = aligns?.[i] ?? 'left';
        const cellX = align === 'right' ? cx + colWidths[i] - 4 : align === 'center' ? cx + colWidths[i] / 2 : cx;
        const text = typeof cell === 'number' ? String(cell) : cell as string;
        this.pdf.text(text, cellX, y + 4.5, { align, maxWidth: colWidths[i] - 4 });
        cx += colWidths[i];
      });
      y += rowH;
    });

    // Total row
    if (totalRow) {
      if (y + rowH + 2 > this.pageH - 20) {
        this.pdf.addPage();
        this.agregarEncabezadoPagina();
        y = 18;
      }
      this.pdf.setFillColor(...COLORS.totalRow);
      this.pdf.rect(x0, y, this.pageW - this.margin * 2, rowH + 1, 'F');
      this.pdf.setTextColor(...COLORS.sectionTitle);
      this.pdf.setFontSize(7.5);
      this.pdf.setFont('helvetica', 'bold');
      cx = x0 + 2;
      totalRow.forEach((cell, i) => {
        const align = aligns?.[i] ?? 'left';
        const cellX = align === 'right' ? cx + colWidths[i] - 4 : align === 'center' ? cx + colWidths[i] / 2 : cx;
        const text = typeof cell === 'number' ? String(cell) : cell as string;
        this.pdf.text(text, cellX, y + 5, { align, maxWidth: colWidths[i] - 4 });
        cx += colWidths[i];
      });
      y += rowH + 1;
    }

    return y + 4;
  }

  // ── Cargar imagen como dataURL ─────────────────────────────────────────
  private cargarImagen(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d')!.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  // ─────────────────────────── MÉTODO PRINCIPAL ─────────────────────────
  public async generarPDF(
    reportData: any,
    kpiData: any,
    fechaInicio: string,
    fechaFin: string
  ): Promise<void> {
    const logoUrl = '/img/Waiwa Host_Logo (2).png';
    const subtitulo = `Período: ${formatDate(fechaInicio)} — ${formatDate(fechaFin)}  •  Generado: ${new Date().toLocaleDateString('es-CO')}`;

    // ── PÁGINA 1 ──────────────────────────────────────────────────────
    await this.agregarBanner('REPORTE FINANCIERO', subtitulo, logoUrl);

    let y = 35;

    // KPI tarjetas principales
    y = this.agregarKPIIndicadores(y + 3,
      this.agregarTituloSeccion('Indicadores Clave', y) && kpiData
        ? kpiData : null
    );
    // (reescribir flujo limpio)
    y = 35;
    y = this.agregarKPIs(
      y,
      reportData.resumen?.totalIngresos ?? 0,
      reportData.resumen?.totalEgresos ?? 0,
      reportData.resumen?.balance ?? 0
    );

    // KPIs indicadores
    if (kpiData?.data) {
      y = this.agregarTituloSeccion('Indicadores Clave (KPIs)', y);
      y = this.agregarKPIIndicadores(y, kpiData);
    }

    // ── TABLA DE RESERVAS ─────────────────────────────────────────────
    y = this.agregarTituloSeccion('Detalle de Reservas', y);

    const usableW = this.pageW - this.margin * 2;
    const reservasCols = [25, 28, 38, 18, 19, 19, 12, 23];
    const reservasHeaders = ['Código', 'Inmueble', 'Huésped', 'Plataforma', 'Ingreso', 'Salida', 'Noches', 'Total'];
    const reservasAligns: ('left' | 'center' | 'right')[] = ['left', 'left', 'left', 'center', 'center', 'center', 'center', 'right'];

    const totalReservas = (reportData.reservas ?? []).reduce((s: number, r: any) => s + Number(r.total_reserva || 0), 0);

    const reservasRows = (reportData.reservas ?? []).map((r: any) => [
      r.codigo_reserva ?? '',
      r.nombre_inmueble ?? '',
      `${r.nombre_huesped ?? ''} ${r.apellido_huesped ?? ''}`.trim(),
      (r.plataforma_origen ?? 'directa').toLowerCase(),
      formatDate(r.fecha_inicio),
      formatDate(r.fecha_fin),
      String(r.noches ?? 0),
      formatCurrency(Number(r.total_reserva ?? 0)),
    ]);

    y = this.agregarTabla(
      reservasHeaders,
      reservasRows,
      reservasCols,
      y,
      reservasAligns,
      ['', '', '', '', '', '', 'TOTAL', formatCurrency(totalReservas)]
    );

    // ── TABLA DE GASTOS ───────────────────────────────────────────────
    // Agrupar por inmueble → concepto
    const gastosPorInmueble: Record<string, Record<string, any[]>> = {};
    for (const g of (reportData.gastos ?? [])) {
      const inm = g.nombre_inmueble ?? 'Sin inmueble';
      const con = g.concepto ?? 'otro';
      if (!gastosPorInmueble[inm]) gastosPorInmueble[inm] = {};
      if (!gastosPorInmueble[inm][con]) gastosPorInmueble[inm][con] = [];
      gastosPorInmueble[inm][con].push(g);
    }

    y = this.agregarTituloSeccion('Detalle de Gastos', y);
    const gastosCols = [38, 26, 70, 28];
    const gastosAligns: ('left' | 'center' | 'right')[] = ['left', 'left', 'left', 'right'];
    const gastosHeaders = ['Inmueble', 'Cuenta', 'Descripción', 'Importe'];

    for (const [inmueble, conceptos] of Object.entries(gastosPorInmueble)) {
      let subtotalInmueble = 0;
      const rows: (string | number)[][] = [];

      for (const [concepto, items] of Object.entries(conceptos)) {
        const isComision = concepto.toLowerCase().includes('comision') || concepto.toLowerCase().includes('comisión');
        let subtotalConcepto = 0;

        if (isComision) {
          subtotalConcepto = items.reduce((s, g) => s + Number(g.monto || 0), 0);
          rows.push([inmueble, concepto.replace(/_/g, ' '), 'Total Admon', formatCurrency(-subtotalConcepto)]);
        } else {
          items.forEach((g, idx) => {
            subtotalConcepto += Number(g.monto || 0);
            rows.push([
              idx === 0 ? inmueble : '',
              idx === 0 ? concepto.replace(/_/g, ' ') : '',
              g.descripcion ?? '',
              formatCurrency(-Number(g.monto || 0)),
            ]);
          });
          // Subtotal de concepto
          rows.push(['', '', 'Subtotal', formatCurrency(-subtotalConcepto)]);
        }
        subtotalInmueble += subtotalConcepto;
      }

      // Subtotal inmueble
      rows.push(['', '', `Subtotal ${inmueble}`, formatCurrency(-subtotalInmueble)]);

      y = this.agregarTabla(gastosHeaders, rows, gastosCols, y, gastosAligns);
    }

    // Total gastos
    const totalGastos = (reportData.gastos ?? []).reduce((s: number, g: any) => s + Number(g.monto || 0), 0);
    y = this.agregarTabla(
      [],
      [],
      gastosCols,
      y,
      gastosAligns,
      ['', '', 'TOTAL GASTOS', formatCurrency(-totalGastos)]
    );

    // ── RESUMEN POR INMUEBLE: INGRESOS/EGRESOS ────────────────────────
    const resumenMap: Record<string, { ingreso: number; egreso: number }> = {};
    for (const r of (reportData.reservas ?? [])) {
      const n = r.nombre_inmueble ?? 'Sin nombre';
      if (!resumenMap[n]) resumenMap[n] = { ingreso: 0, egreso: 0 };
      resumenMap[n].ingreso += Number(r.total_reserva || 0);
    }
    for (const g of (reportData.gastos ?? [])) {
      const n = g.nombre_inmueble ?? 'Sin nombre';
      if (!resumenMap[n]) resumenMap[n] = { ingreso: 0, egreso: 0 };
      resumenMap[n].egreso += Number(g.monto || 0);
    }

    y = this.agregarTituloSeccion('Resumen por Inmueble — Ingresos / Egresos', y);
    const resumenCols = [60, 45, 45, 32];
    const resumenAligns: ('left' | 'center' | 'right')[] = ['left', 'right', 'right', 'right'];
    const resumenRows = Object.entries(resumenMap).map(([name, t]) => [
      name,
      formatCurrency(t.ingreso),
      formatCurrency(-t.egreso),
      formatCurrency(t.ingreso - t.egreso),
    ]);

    y = this.agregarTabla(
      ['Inmueble', 'Ingreso', 'Egreso', 'Total'],
      resumenRows,
      resumenCols,
      y,
      resumenAligns,
      ['TOTAL', formatCurrency(reportData.resumen?.totalIngresos ?? 0), formatCurrency(-(reportData.resumen?.totalEgresos ?? 0)), formatCurrency(reportData.resumen?.balance ?? 0)]
    );

    // ── RESUMEN POR INMUEBLE: INDICADORES (solo si hay kpiData de edificio) ──
    if (kpiData?.type === 'building' && kpiData.data?.unidades) {
      y = this.agregarTituloSeccion('Resumen por Inmueble — Indicadores', y);
      const indCols = [45, 20, 22, 32, 32, 31];
      const indAligns: ('left' | 'center' | 'right')[] = ['left', 'center', 'center', 'right', 'right', 'right'];

      const indRows = kpiData.data.unidades.map((u: any) => [
        u.nombre,
        String(u.noches_ocupadas ?? 0),
        `${(u.ocupacion ?? 0).toFixed(1)}%`,
        formatCurrency(u.adr ?? 0),
        formatCurrency(u.revpar ?? 0),
        formatCurrency(u.utilidad ?? 0),
      ]);

      y = this.agregarTabla(
        ['Inmueble', 'Noches', '% Ocup.', 'ADR', 'RevPAR', 'Utilidad'],
        indRows,
        indCols,
        y,
        indAligns,
        [
          'Total Edificio',
          String(kpiData.data.noches_ocupadas_total ?? ''),
          `${(kpiData.data.ocupacion_global ?? 0).toFixed(1)}%`,
          '—',
          formatCurrency(kpiData.data.revpar_edificio ?? 0),
          formatCurrency(kpiData.data.utilidad_total ?? 0),
        ]
      );
    }

    // ── Footers en todas las páginas ─────────────────────────────────
    this.agregarFootersEnTodasLasPaginas();

    // ── Descargar ─────────────────────────────────────────────────────
    const desde = fechaInicio?.replace(/-/g, '') ?? 'inicio';
    const hasta = fechaFin?.replace(/-/g, '') ?? 'fin';
    this.pdf.save(`reporte_financiero_${desde}_${hasta}.pdf`);
  }
}

// ─────────────────────────── Hook ────────────────────────────────────────
export const useReportePDF = () => {
  const generarPDF = async (
    reportData: any,
    kpiData: any,
    fechaInicio: string,
    fechaFin: string
  ) => {
    const generator = new ReportePDFGenerator();
    await generator.generarPDF(reportData, kpiData, fechaInicio, fechaFin);
  };

  return { generarPDF };
};