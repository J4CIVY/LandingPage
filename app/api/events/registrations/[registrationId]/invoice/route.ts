import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import EventRegistration from '@/lib/models/EventRegistration';
import Event from '@/lib/models/Event';
import ExtendedUser from '@/lib/models/ExtendedUser';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ registrationId: string }> }
) {
  try {
    await dbConnect();

    // Await params en Next.js 15
    const { registrationId } = await params;

    // Obtener token de la URL
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('token');

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Token de acceso requerido' },
        { status: 401 }
      );
    }

    // Obtener el registro con el token (select: false por defecto, así que lo incluimos explícitamente)
    const registration: any = await EventRegistration.findById(registrationId)
      .select('+accessToken')
      .lean();

    if (!registration) {
      return NextResponse.json(
        { success: false, error: 'Registro no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el token coincide
    if (registration.accessToken !== accessToken) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 403 }
      );
    }

    // Verificar que el registro esté activo
    if (registration.status !== 'active') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Solo se pueden generar facturas de registros activos',
          status: registration.status 
        },
        { status: 400 }
      );
    }

    // Obtener información del evento y usuario completo
    const [event, registrationUser]: [any, any] = await Promise.all([
      Event.findById(registration.eventId).lean(),
      ExtendedUser.findById(registration.userId).select('firstName lastName email documentNumber phone membershipNumber').lean()
    ]);

    if (!event || !registrationUser) {
      return NextResponse.json(
        { success: false, error: 'Evento o usuario no encontrado' },
        { status: 404 }
      );
    }

    // Generar HTML de la factura
    const invoiceHTML = generateFreeEventInvoiceHTML({
      registration,
      user: registrationUser,
      event
    });

    return new NextResponse(invoiceHTML, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="comprobante-${registration.registrationNumber}.html"`
      }
    });

  } catch (error: any) {
    console.error('Error generating free event invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Error al generar el comprobante' },
      { status: 500 }
    );
  }
}

function generateFreeEventInvoiceHTML({ registration, user, event }: any) {
  const fecha = new Date(registration.registrationDate);
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
  <title>Comprobante de Registro - ${registration.registrationNumber}</title>
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
      border-bottom: 3px solid #10b981;
    }
    
    .company-info h1 {
      color: #10b981;
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
    
    .free-badge {
      display: inline-block;
      padding: 8px 16px;
      background: #10b981;
      color: white;
      border-radius: 20px;
      font-size: 14px;
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
      color: #10b981;
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
    
    .event-details {
      background: #f0fdf4;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
      border-left: 4px solid #10b981;
    }
    
    .event-details h3 {
      color: #065f46;
      margin-bottom: 10px;
      font-size: 18px;
    }
    
    .event-details p {
      color: #047857;
      font-size: 14px;
      margin-bottom: 5px;
    }
    
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    
    .details-table thead {
      background: #10b981;
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
      background: #f0fdf4;
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
      border-top: 2px solid #10b981;
      margin-top: 10px;
      padding-top: 15px;
      font-size: 18px;
      font-weight: bold;
      color: #10b981;
    }
    
    .footer {
      text-align: center;
      padding-top: 30px;
      border-top: 1px solid #e5e7eb;
      color: #666;
      font-size: 12px;
    }
    
    .print-button {
      background: #10b981;
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
      background: #059669;
    }
    
    .free-notice {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 4px;
    }
    
    .free-notice p {
      color: #92400e;
      font-size: 14px;
      margin: 0;
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
    <button class="print-button" onclick="window.print()">🖨️ Imprimir Comprobante</button>
    
    <div class="header">
      <div class="company-info">
        <h1>BSK Motorcycle Team</h1>
        <p><strong>Organización Motear SAS</strong></p>
        <p>NIT: 901444877-6</p>
        <p>Carrera 5 A No. 36 A Sur 28</p>
        <p>110431 Ayacucho, San Cristóbal</p>
        <p>Bogotá D.C., Colombia</p>
        <p>Tel: 3004902449</p>
        <p>Email: contacto@bskmt.com</p>
      </div>
      <div class="invoice-info">
        <h2>COMPROBANTE DE REGISTRO</h2>
        <p><strong>Factura ID:</strong> ${registration._id.toString()}</p>
        <p><strong>Fecha:</strong> ${fechaFormateada}</p>
        <span class="free-badge">✨ EVENTO GRATUITO</span>
      </div>
    </div>
    
    <div class="free-notice">
      <p><strong>ℹ️ Nota:</strong> Este es un evento gratuito. No se requiere pago para participar.</p>
    </div>
    
    <div class="info-section">
      <div class="info-block">
        <h3>Participante</h3>
        <p><strong>${user.firstName} ${user.lastName}</strong></p>
        ${user.documentNumber ? `<p>Documento: ${user.documentNumber}</p>` : ''}
        ${user.membershipNumber ? `<p>Código Miembro: ${user.membershipNumber}</p>` : ''}
        <p>Email: ${user.email}</p>
        ${user.phone ? `<p>Teléfono: ${user.phone}</p>` : ''}
      </div>
      
      <div class="info-block">
        <h3>Estado del Registro</h3>
        <p><strong>Estado:</strong> <span style="color: #10b981;">✅ Confirmado</span></p>
        <p><strong>Tipo:</strong> Evento Gratuito</p>
        <p><strong>Registro:</strong></p>
        <p style="font-family: monospace; font-size: 12px;">${registration.registrationNumber}</p>
      </div>
    </div>
    
    <div class="event-details">
      <h3>📅 Información del Evento</h3>
      <p><strong>${event.name}</strong></p>
      ${event.startDate ? `<p>📆 Fecha: ${new Date(event.startDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>` : ''}
      ${event.departureLocation ? `<p>📍 Ubicación: ${event.departureLocation.city}${event.departureLocation.state ? ', ' + event.departureLocation.state : ''}</p>` : ''}
      ${event.description ? `<p style="margin-top: 10px;">${event.description.substring(0, 200)}${event.description.length > 200 ? '...' : ''}</p>` : ''}
    </div>
    
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
            <strong>Inscripción - ${event.name}</strong>
            <br><small style="color: #10b981;">✨ Evento Gratuito - Sin costo</small>
          </td>
          <td style="text-align: center;">1</td>
          <td style="text-align: right;">$0 COP</td>
          <td style="text-align: right;">$0 COP</td>
        </tr>
      </tbody>
    </table>
    
    <div class="totals">
      <div class="total-row">
        <span>Subtotal:</span>
        <span>$0 COP</span>
      </div>
      <div class="total-row">
        <span>IVA (0%):</span>
        <span>$0</span>
      </div>
      <div class="total-row">
        <span>Descuento (100%):</span>
        <span style="color: #10b981;">-$0 COP</span>
      </div>
      <div class="total-row grand-total">
        <span>TOTAL A PAGAR:</span>
        <span>$0 COP</span>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>¡Gracias por tu registro!</strong></p>
      <p>Este comprobante confirma tu inscripción en el evento de forma gratuita.</p>
      <p>Para cualquier consulta, contáctanos en contacto@bskmt.com o llama al 3004902449</p>
      <p style="margin-top: 20px; font-size: 11px;">
        <strong>BSK Motorcycle Team - Organización Motear SAS</strong><br>
        NIT: 901444877-6<br>
        Carrera 5 A No. 36 A Sur 28, 110431 Ayacucho, San Cristóbal, Bogotá D.C., Colombia<br>
        © ${new Date().getFullYear()} Todos los derechos reservados
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
