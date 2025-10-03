import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';
import dbConnect from '@/lib/mongodb';
import BoldTransaction from '@/lib/models/BoldTransaction';
import Event from '@/lib/models/Event';
import ExtendedUser from '@/lib/models/ExtendedUser';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    // Verificar autenticación
    const authResult = await verifyAuth(request);
    
    if (!authResult.isValid || !authResult.session) {
      // Redirigir al login con la URL actual como callback
      const { orderId } = await params;
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://bskmt.com';
      const loginUrl = `${baseUrl}/login?redirect=/api/bold/transactions/${orderId}/invoice`;
      return NextResponse.redirect(loginUrl);
    }

    await dbConnect();

    // Await params en Next.js 15
    const { orderId } = await params;

    // Obtener la transacción por _id (orderId es el parámetro de la ruta pero contiene el _id de MongoDB)
    const transaction = await BoldTransaction.findById(orderId).lean();

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transacción no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que la transacción pertenece al usuario
    if (transaction.userId.toString() !== authResult.session.userId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 403 }
      );
    }

    // Solo permitir descargar facturas de transacciones aprobadas
    if (transaction.status !== 'APPROVED') {
      return NextResponse.json(
        { success: false, error: 'Solo se pueden generar facturas de pagos aprobados' },
        { status: 400 }
      );
    }

    // Obtener información del usuario y evento
    const [user, event] = await Promise.all([
      ExtendedUser.findById(transaction.userId).select('nombre apellido email tipoDocumento documento telefono').lean(),
      transaction.eventId ? Event.findById(transaction.eventId).select('nombre descripcion fecha ubicacion precio').lean() : null
    ]);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Generar HTML de la factura
    const invoiceHTML = generateInvoiceHTML({
      transaction,
      user,
      event
    });

    // Por ahora retornamos HTML simple
    // En producción, usarías una librería como puppeteer o similar para generar PDF
    return new NextResponse(invoiceHTML, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="factura-${transaction.orderId}.html"`
      }
    });

  } catch (error: any) {
    console.error('Error generating invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Error al generar la factura' },
      { status: 500 }
    );
  }
}

function generateInvoiceHTML({ transaction, user, event }: any) {
  const fecha = new Date(transaction.createdAt);
  const fechaFormateada = fecha.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Factura - ${transaction.orderId}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
      background: #f5f5f5;
    }
    
    .invoice-container {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2563eb;
    }
    
    .company-info h1 {
      color: #2563eb;
      font-size: 32px;
      margin-bottom: 5px;
    }
    
    .company-info p {
      color: #666;
      font-size: 14px;
    }
    
    .invoice-info {
      text-align: right;
    }
    
    .invoice-info h2 {
      color: #333;
      font-size: 24px;
      margin-bottom: 10px;
    }
    
    .invoice-info p {
      color: #666;
      font-size: 14px;
    }
    
    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      background: #10b981;
      color: white;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      margin-top: 10px;
    }
    
    .info-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 40px;
    }
    
    .info-block h3 {
      color: #2563eb;
      font-size: 16px;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .info-block p {
      color: #555;
      font-size: 14px;
      margin-bottom: 5px;
    }
    
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    
    .details-table thead {
      background: #2563eb;
      color: white;
    }
    
    .details-table th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 14px;
    }
    
    .details-table td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 14px;
    }
    
    .details-table tbody tr:hover {
      background: #f9fafb;
    }
    
    .totals {
      margin-left: auto;
      width: 300px;
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
    }
    
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      font-size: 14px;
    }
    
    .total-row.grand-total {
      border-top: 2px solid #2563eb;
      margin-top: 10px;
      padding-top: 15px;
      font-size: 18px;
      font-weight: bold;
      color: #2563eb;
    }
    
    .payment-info {
      background: #eff6ff;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
      border-left: 4px solid #2563eb;
    }
    
    .payment-info h3 {
      color: #1e40af;
      margin-bottom: 10px;
      font-size: 16px;
    }
    
    .payment-info p {
      color: #1e3a8a;
      font-size: 14px;
      margin-bottom: 5px;
    }
    
    .footer {
      text-align: center;
      padding-top: 30px;
      border-top: 1px solid #e5e7eb;
      color: #666;
      font-size: 12px;
    }
    
    .print-button {
      background: #2563eb;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 20px;
      display: inline-block;
    }
    
    .print-button:hover {
      background: #1d4ed8;
    }
    
    @media print {
      body {
        padding: 0;
        background: white;
      }
      
      .invoice-container {
        box-shadow: none;
      }
      
      .print-button {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <button class="print-button" onclick="window.print()">🖨️ Imprimir Factura</button>
    
    <div class="header">
      <div class="company-info">
        <h1>BSK MT</h1>
        <p>Bomberos Sin Fronteras Kolping</p>
        <p>Magdalena - Tolima</p>
        <p>info@bskmt.com</p>
      </div>
      <div class="invoice-info">
        <h2>FACTURA</h2>
        <p><strong>Número:</strong> ${transaction.orderId}</p>
        <p><strong>Fecha:</strong> ${fechaFormateada}</p>
        <span class="status-badge">✓ PAGADO</span>
      </div>
    </div>
    
    <div class="info-section">
      <div class="info-block">
        <h3>Cliente</h3>
        <p><strong>${user.nombre} ${user.apellido}</strong></p>
        <p>${user.tipoDocumento}: ${user.documento}</p>
        <p>Email: ${user.email}</p>
        ${user.telefono ? `<p>Teléfono: ${user.telefono}</p>` : ''}
      </div>
      
      <div class="info-block">
        <h3>Detalles del Pago</h3>
        <p><strong>ID de Transacción:</strong></p>
        <p style="font-family: monospace; font-size: 12px;">${transaction.transactionId || 'N/A'}</p>
        <p><strong>Método de Pago:</strong> ${transaction.paymentMethod || 'Tarjeta de Crédito/Débito'}</p>
      </div>
    </div>
    
    ${event ? `
    <div class="payment-info">
      <h3>📅 Evento</h3>
      <p><strong>${event.nombre}</strong></p>
      ${event.fecha ? `<p>Fecha: ${new Date(event.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>` : ''}
      ${event.ubicacion ? `<p>Ubicación: ${event.ubicacion}</p>` : ''}
    </div>
    ` : ''}
    
    <table class="details-table">
      <thead>
        <tr>
          <th>Descripción</th>
          <th style="text-align: center;">Cantidad</th>
          <th style="text-align: right;">Precio Unit.</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${event ? event.nombre : 'Pago de Evento'}</strong>
            ${event?.descripcion ? `<br><small style="color: #666;">${event.descripcion.substring(0, 100)}...</small>` : ''}
          </td>
          <td style="text-align: center;">1</td>
          <td style="text-align: right;">$${transaction.amount.toLocaleString('es-CO')} ${transaction.currency}</td>
          <td style="text-align: right;">$${transaction.amount.toLocaleString('es-CO')} ${transaction.currency}</td>
        </tr>
      </tbody>
    </table>
    
    <div class="totals">
      <div class="total-row">
        <span>Subtotal:</span>
        <span>$${transaction.amount.toLocaleString('es-CO')} ${transaction.currency}</span>
      </div>
      <div class="total-row">
        <span>IVA (0%):</span>
        <span>$0</span>
      </div>
      <div class="total-row grand-total">
        <span>TOTAL:</span>
        <span>$${transaction.amount.toLocaleString('es-CO')} ${transaction.currency}</span>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>¡Gracias por tu pago!</strong></p>
      <p>Esta factura fue generada electrónicamente y es válida sin firma.</p>
      <p>Para cualquier consulta, contáctanos en info@bskmt.com</p>
      <p style="margin-top: 20px; font-size: 11px;">
        BSK MT - Bomberos Sin Fronteras Kolping Magdalena Tolima<br>
        © ${new Date().getFullYear()} Todos los derechos reservados
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
