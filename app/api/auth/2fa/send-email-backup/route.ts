import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import TwoFactorCode from '@/lib/models/TwoFactorCode';
import { generateOTPCode, getOTPExpirationDate } from '@/lib/2fa-utils';
import { rateLimit } from '@/utils/rateLimit';
import { getEmailService } from '@/lib/email-service';

// Rate limiting para email backup
const emailBackupRateLimit = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutos
  uniqueTokenPerInterval: 50
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    try {
      const clientIP = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
      await emailBackupRateLimit.check(clientIP, 2); // 2 intentos cada 15 minutos
    } catch {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Demasiados intentos. Por favor espera 15 minutos.',
          error: 'RATE_LIMIT_EXCEEDED'
        },
        { status: 429 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { twoFactorId } = body;

    if (!twoFactorId) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID de verificación requerido',
          error: 'MISSING_DATA'
        },
        { status: 400 }
      );
    }

    // Buscar el código 2FA original
    const originalCode = await TwoFactorCode.findById(twoFactorId)
      .populate('userId');

    if (!originalCode) {
      return NextResponse.json(
        {
          success: false,
          message: 'Código de verificación no encontrado',
          error: 'CODE_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Verificar que se hayan excedido los intentos
    if (!originalCode.hasExceededAttempts()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Aún tienes intentos disponibles por WhatsApp',
          error: 'ATTEMPTS_REMAINING'
        },
        { status: 400 }
      );
    }

    const user = await User.findById(originalCode.userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Usuario no encontrado',
          error: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Invalidar código anterior
    await TwoFactorCode.updateMany(
      { 
        userId: user._id,
        verified: false 
      },
      { 
        expiresAt: new Date() // Expirar inmediatamente
      }
    );

    // Generar nuevo código OTP para email
    const otpCode = generateOTPCode();
    const expiresAt = getOTPExpirationDate();

    // Extraer información de la sesión
    const sessionInfo = {
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 
          'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      device: request.headers.get('sec-ch-ua-platform') || 'unknown'
    };

    // Guardar código en la base de datos (marcar como backup por email)
    const twoFactorCode = new TwoFactorCode({
      userId: user._id,
      code: otpCode,
      phoneNumber: 'EMAIL_BACKUP', // Marcador especial
      expiresAt,
      sessionInfo,
      maxAttempts: 5 // Más intentos para email
    });

    await twoFactorCode.save();

    // Enviar código por email
    const emailService = getEmailService();
    
    try {
      const emailConfig = {
        fromAddress: process.env.ZOHO_FROM_EMAIL || '',
        toAddress: user.email,
        subject: '🔐 Código de Verificación BSK - Método Alternativo',
        content: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .code-box { background: white; border: 3px dashed #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
              .code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; font-family: monospace; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
              .info { background: #d1ecf1; border-left: 4px solid #0dcaf0; padding: 15px; margin: 20px 0; border-radius: 5px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 Código de Verificación</h1>
                <p>BSK Motorcycle Team</p>
              </div>
              <div class="content">
                <p>Hola <strong>${user.firstName} ${user.lastName}</strong>,</p>
                
                <div class="info">
                  <strong>📧 Método Alternativo</strong><br>
                  Debido a que excediste los intentos por WhatsApp, hemos enviado tu código por correo electrónico.
                </div>
                
                <p>Tu código de verificación es:</p>
                
                <div class="code-box">
                  <div class="code">${otpCode}</div>
                </div>
                
                <div class="warning">
                  <strong>⏱️ Importante:</strong>
                  <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Este código expira en <strong>5 minutos</strong></li>
                    <li>Tienes <strong>5 intentos</strong> para ingresarlo</li>
                    <li>No compartas este código con nadie</li>
                  </ul>
                </div>
                
                <p style="margin-top: 20px;">
                  Si no solicitaste este código, por favor:
                  <ul>
                    <li>Ignora este mensaje</li>
                    <li>Cambia tu contraseña inmediatamente</li>
                    <li>Contacta a nuestro equipo de soporte</li>
                  </ul>
                </p>
                
                <div class="footer">
                  <p>Este es un correo automático, por favor no respondas.</p>
                  <p>&copy; 2025 BSK Motorcycle Team - Todos los derechos reservados</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
        mailFormat: 'html' as const,
        askReceipt: 'no' as const
      };

      const result = await emailService['client'].sendEmail(emailConfig);


      return NextResponse.json(
        {
          success: true,
          message: 'Código enviado a tu correo electrónico',
          data: {
            twoFactorId: twoFactorCode._id.toString(),
            expiresIn: 300, // 5 minutos
            method: 'email',
            email: user.email.replace(/(.{2}).*(@.*)/, '$1***$2') // Ocultar parcialmente
          }
        },
        { status: 200 }
      );

    } catch (emailError) {
      console.error('Error enviando código por email:', emailError);
      
      return NextResponse.json(
        {
          success: false,
          message: 'Error al enviar el código por email. Por favor contacta soporte.',
          error: 'EMAIL_SEND_FAILED'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error en email backup 2FA:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}
