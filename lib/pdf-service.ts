import type { EstadisticasHistorial, HistorialItem } from '@/types/historial';

// Función para generar PDF del historial del miembro usando window.print()
export const generateHistorialPDF = async (
  estadisticas: EstadisticasHistorial | null,
  historialItems: HistorialItem[],
  userName: string = 'Miembro BSK'
): Promise<void> => {
  try {
    const currentDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Crear contenido HTML para imprimir
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Historial del Miembro - BSK Motorcycle Team</title>
          <style>
            @media print {
              @page {
                margin: 1in;
                size: letter;
              }
              body {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            
            .header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 20px;
            }
            
            .header h1 {
              color: #2563eb;
              margin: 0 0 10px 0;
              font-size: 28px;
              font-weight: bold;
            }
            
            .header h2 {
              color: #6b7280;
              margin: 0 0 5px 0;
              font-size: 18px;
              font-weight: normal;
            }
            
            .header .member-info {
              font-size: 14px;
              color: #4b5563;
              margin: 5px 0;
            }
            
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
              margin-bottom: 30px;
              padding: 20px;
              background-color: #f9fafb;
              border-radius: 8px;
            }
            
            .stat-item {
              text-align: center;
              padding: 10px;
            }
            
            .stat-value {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 5px;
            }
            
            .stat-label {
              font-size: 12px;
              color: #6b7280;
              text-transform: uppercase;
            }
            
            .section {
              margin-bottom: 30px;
            }
            
            .section-title {
              font-size: 20px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 15px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 5px;
            }
            
            .history-item {
              margin-bottom: 15px;
              padding: 15px;
              border: 1px solid #e5e7eb;
              border-radius: 6px;
              background-color: #fefefe;
            }
            
            .item-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 8px;
            }
            
            .item-title {
              font-weight: 600;
              color: #1f2937;
              font-size: 14px;
            }
            
            .item-date {
              font-size: 12px;
              color: #6b7280;
            }
            
            .item-type {
              display: inline-block;
              background-color: #dbeafe;
              color: #1d4ed8;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 500;
              margin-right: 8px;
            }
            
            .item-status {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 500;
            }
            
            .status-activo { background-color: #dcfce7; color: #166534; }
            .status-completado { background-color: #dbeafe; color: #1d4ed8; }
            .status-cerrado { background-color: #f3f4f6; color: #374151; }
            .status-vencido { background-color: #fee2e2; color: #991b1b; }
            
            .item-details {
              margin-top: 8px;
              font-size: 12px;
              color: #4b5563;
            }
            
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #6b7280;
            }
            
            .page-break {
              page-break-before: always;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Historial del Miembro</h1>
            <h2>BSK Motorcycle Team</h2>
            <div class="member-info">Miembro: ${userName}</div>
            <div class="member-info">Fecha de generación: ${currentDate}</div>
          </div>
          
          ${estadisticas ? `
            <div class="section">
              <h3 class="section-title">Resumen Estadístico</h3>
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-value">${estadisticas.eventosAsistidos}/${estadisticas.totalEventos}</div>
                  <div class="stat-label">Eventos Asistidos</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">${estadisticas.beneficiosUsados}</div>
                  <div class="stat-label">Beneficios Usados</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">${estadisticas.pqrsdfAbiertas}</div>
                  <div class="stat-label">PQRSDF Abiertas</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">${estadisticas.logrosObtenidos}</div>
                  <div class="stat-label">Logros Obtenidos</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">${estadisticas.añosMembresia}</div>
                  <div class="stat-label">Años Miembro</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">${estadisticas.puntosAcumulados}</div>
                  <div class="stat-label">Puntos Totales</div>
                </div>
              </div>
            </div>
          ` : ''}
          
          <div class="section">
            <h3 class="section-title">Historial Detallado</h3>
            ${generateHistoryItemsHTML(historialItems)}
          </div>
          
          <div class="footer">
            <p>Documento generado por BSK Motorcycle Team - ${currentDate}</p>
            <p>Este documento contiene información confidencial del miembro</p>
          </div>
        </body>
      </html>
    `;

    // Crear una nueva ventana para imprimir
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error('No se pudo abrir la ventana de impresión. Por favor, permite las ventanas emergentes.');
      return;
    }

    // Use modern DOM methods instead of deprecated document.write()
    // Create a new document in the print window
    printWindow.document.open();
    printWindow.document.close();
    
    // Use innerHTML to set content instead of document.write()
    printWindow.document.documentElement.innerHTML = htmlContent;

    // Esperar a que se cargue el contenido y luego imprimir
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };

  } catch (error) {
    console.error('Error al generar PDF:', error);
    throw new Error('No se pudo generar el archivo PDF. Por favor, intenta nuevamente.');
  }
};

// Función auxiliar para generar HTML de los items del historial
function generateHistoryItemsHTML(items: HistorialItem[]): string {
  // Agrupar items por tipo
  const itemsPorTipo = items.reduce((acc, item) => {
    if (!acc[item.tipo]) acc[item.tipo] = [];
    acc[item.tipo].push(item);
    return acc;
  }, {} as Record<string, HistorialItem[]>);

  const ordenSecciones = ['Evento', 'Membresía', 'Beneficio', 'PQRSDF', 'Reconocimiento'];
  
  return ordenSecciones
    .map(tipo => {
      const items = itemsPorTipo[tipo];
      if (!items || items.length === 0) return '';

      const itemsHTML = items
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        .map(item => {
          const fecha = new Date(item.fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });

          let detallesHTML = '';
          if (item.detalles) {
            if (item.tipo === 'Evento' && item.detalles.puntos) {
              detallesHTML += `<div>Puntos obtenidos: ${item.detalles.puntos}</div>`;
            }
            if (item.tipo === 'Beneficio' && item.detalles.valorDescuento) {
              detallesHTML += `<div>Ahorro: $${item.detalles.valorDescuento.toLocaleString()}</div>`;
            }
            if (item.tipo === 'Reconocimiento' && item.detalles.puntos) {
              detallesHTML += `<div>Puntos: ${item.detalles.puntos}</div>`;
            }
          }

          return `
            <div class="history-item">
              <div class="item-header">
                <div class="item-title">${item.descripcion}</div>
                <div class="item-date">${fecha}</div>
              </div>
              <div>
                <span class="item-type">${item.tipo}</span>
                ${item.estado ? `<span class="item-status status-${item.estado}">${item.estado}</span>` : ''}
              </div>
              ${detallesHTML ? `<div class="item-details">${detallesHTML}</div>` : ''}
            </div>
          `;
        })
        .join('');

      return `
        <div class="subsection">
          <h4 style="font-size: 16px; color: #374151; margin: 20px 0 10px 0;">${tipo}s (${items.length})</h4>
          ${itemsHTML}
        </div>
      `;
    })
    .filter(html => html !== '')
    .join('');
}