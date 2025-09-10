import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '@/lib/whatsapp-service';
import { z } from 'zod';

// Schema para validar la petición de prueba
const testWhatsAppSchema = z.object({
  documentNumber: z.string().min(1, 'Número de documento requerido'),
  firstName: z.string().min(1, 'Nombre requerido'),
  whatsapp: z.string().min(1, 'Número de WhatsApp requerido'),
  membershipType: z.enum(['friend', 'member', 'premium'])
});

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Iniciando prueba de notificación WhatsApp...');

    const body = await request.json();
    const validationResult = testWhatsAppSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Datos inválidos',
          errors: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { documentNumber, firstName, whatsapp, membershipType } = validationResult.data;

    console.log('📱 Enviando notificación de prueba:', {
      documentNumber,
      firstName,
      whatsapp,
      membershipType
    });

    const whatsappService = new WhatsAppService();
    
    try {
      await whatsappService.sendWelcomeNotification({
        documentNumber,
        firstName,
        whatsapp,
        membershipType
      });

      console.log('✅ Notificación de prueba enviada exitosamente');

      return NextResponse.json(
        {
          success: true,
          message: 'Notificación de WhatsApp enviada exitosamente',
          data: {
            documentNumber,
            firstName,
            whatsapp,
            membershipType,
            timestamp: new Date().toISOString()
          }
        },
        { status: 200 }
      );

    } catch (whatsappError: any) {
      console.error('❌ Error enviando notificación de WhatsApp:', whatsappError);

      return NextResponse.json(
        {
          success: false,
          message: 'Error enviando notificación de WhatsApp',
          error: whatsappError.message || 'Error desconocido',
          details: {
            webhookUrl: 'https://capture.us-west-1.nest.messagebird.com/webhooks/a2dd52ff-b949-4135-9196-7050c12229f3/a071d5c3-9566-471d-8cb0-057c6e222da3',
            sentData: {
              documentNumber,
              firstName,
              whatsapp,
              membershipType
            }
          }
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('❌ Error interno en prueba de WhatsApp:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor',
        error: error.message || 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// Endpoint GET para información sobre cómo usar la API de prueba
export async function GET() {
  return NextResponse.json(
    {
      message: 'Endpoint de prueba para notificaciones de WhatsApp',
      usage: {
        method: 'POST',
        endpoint: '/api/test/whatsapp',
        body: {
          documentNumber: 'string - Número de documento del usuario',
          firstName: 'string - Nombre del usuario',
          whatsapp: 'string - Número de WhatsApp (con código de país)',
          membershipType: 'string - Tipo de membresía (friend, member, premium)'
        },
        example: {
          documentNumber: '12345678',
          firstName: 'Juan Pérez',
          whatsapp: '+573001234567',
          membershipType: 'friend'
        }
      },
      webhookUrl: 'https://capture.us-west-1.nest.messagebird.com/webhooks/a2dd52ff-b949-4135-9196-7050c12229f3/a071d5c3-9566-471d-8cb0-057c6e222da3'
    },
    { status: 200 }
  );
}
