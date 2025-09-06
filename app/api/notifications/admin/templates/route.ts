import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

// Plantillas predefinidas
const NOTIFICATION_TEMPLATES = [
  {
    id: 'event_reminder_3_days',
    name: 'Recordatorio de Evento (3 días)',
    type: 'event_upcoming',
    priority: 'medium',
    title: '🏍️ Evento próximo: {eventName}',
    message: 'Tu evento "{eventName}" está programado para el {eventDate}. ¡No te lo pierdas! Revisa los detalles y prepárate para una gran aventura.',
    category: 'events',
    variables: ['eventName', 'eventDate', 'eventLocation'],
    description: 'Notificación automática enviada 3 días antes de un evento'
  },
  {
    id: 'registration_open',
    name: 'Registro Abierto',
    type: 'event_registration_open',
    priority: 'high',
    title: '📝 ¡Registro abierto para {eventName}!',
    message: 'El registro para "{eventName}" ya está disponible. Fecha límite: {registrationDeadline}. ¡Asegura tu lugar ahora!',
    category: 'events',
    variables: ['eventName', 'registrationDeadline', 'eventDate'],
    description: 'Notificación cuando se abre el registro de un evento'
  },
  {
    id: 'event_reminder_1_day',
    name: 'Recordatorio de Evento (1 día)',
    type: 'event_reminder',
    priority: 'high',
    title: '⚠️ ¡Evento mañana: {eventName}!',
    message: '¡Tu evento "{eventName}" es mañana! Hora: {eventTime}. Ubicación: {eventLocation}. ¡Nos vemos allí!',
    category: 'events',
    variables: ['eventName', 'eventTime', 'eventLocation'],
    description: 'Recordatorio enviado 1 día antes del evento'
  },
  {
    id: 'membership_approved',
    name: 'Membresía Aprobada',
    type: 'membership_update',
    priority: 'high',
    title: '🎉 ¡Bienvenido a BSK Motorcycle Team!',
    message: 'Tu solicitud de membresía ha sido aprobada. Ahora eres oficialmente parte de la familia BSK. ¡Prepárate para grandes aventuras!',
    category: 'membership',
    variables: ['memberName', 'membershipType'],
    description: 'Notificación cuando se aprueba una membresía'
  },
  {
    id: 'membership_pending',
    name: 'Membresía Pendiente',
    type: 'membership_update',
    priority: 'medium',
    title: '📋 Solicitud de membresía recibida',
    message: 'Hemos recibido tu solicitud de membresía. Nuestro equipo la revisará en los próximos días. Te notificaremos cuando tengamos una respuesta.',
    category: 'membership',
    variables: ['memberName'],
    description: 'Confirmación de solicitud de membresía recibida'
  },
  {
    id: 'system_maintenance',
    name: 'Mantenimiento del Sistema',
    type: 'system_announcement',
    priority: 'medium',
    title: '🔧 Mantenimiento programado',
    message: 'El sistema estará en mantenimiento el {maintenanceDate} desde las {startTime} hasta las {endTime}. Disculpa las molestias.',
    category: 'system',
    variables: ['maintenanceDate', 'startTime', 'endTime'],
    description: 'Notificación de mantenimiento programado'
  },
  {
    id: 'emergency_alert',
    name: 'Alerta de Emergencia',
    type: 'system_announcement',
    priority: 'urgent',
    title: '🚨 ALERTA: {alertTitle}',
    message: '{alertMessage}. Si necesitas ayuda inmediata, contacta al {emergencyContact}.',
    category: 'emergency',
    variables: ['alertTitle', 'alertMessage', 'emergencyContact'],
    description: 'Notificación de emergencia para todos los miembros'
  },
  {
    id: 'welcome_new_member',
    name: 'Bienvenida Nuevo Miembro',
    type: 'system_announcement',
    priority: 'low',
    title: '👋 ¡Bienvenido {memberName}!',
    message: 'Dale la bienvenida a {memberName}, nuestro nuevo miembro. ¡Esperamos compartir grandes aventuras juntos!',
    category: 'community',
    variables: ['memberName'],
    description: 'Anuncio de nuevo miembro para la comunidad'
  },
  {
    id: 'monthly_newsletter',
    name: 'Newsletter Mensual',
    type: 'system_announcement',
    priority: 'low',
    title: '📰 Newsletter BSK - {monthYear}',
    message: 'Descubre las últimas noticias, eventos próximos y destacados del mes. ¡No te pierdas lo que está pasando en BSK!',
    category: 'newsletter',
    variables: ['monthYear'],
    description: 'Newsletter mensual con noticias y eventos'
  },
  {
    id: 'birthday_wishes',
    name: 'Felicitación de Cumpleaños',
    type: 'system_announcement',
    priority: 'low',
    title: '🎂 ¡Feliz cumpleaños {memberName}!',
    message: '¡Que tengas un día increíble y un año lleno de aventuras sobre dos ruedas! La familia BSK te desea lo mejor.',
    category: 'personal',
    variables: ['memberName'],
    description: 'Felicitación automática de cumpleaños'
  }
];

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verificar autenticación y permisos de admin
    const cookieStore = await cookies();
    const token = cookieStore.get('bsk-access-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as any;
    const adminUser = await User.findById(decoded.userId);

    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    // Filtros opcionales
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');

    let filteredTemplates = NOTIFICATION_TEMPLATES;

    if (category) {
      filteredTemplates = filteredTemplates.filter(t => t.category === category);
    }

    if (type) {
      filteredTemplates = filteredTemplates.filter(t => t.type === type);
    }

    if (priority) {
      filteredTemplates = filteredTemplates.filter(t => t.priority === priority);
    }

    // Agrupar por categoría
    const templatesByCategory = filteredTemplates.reduce((acc: any, template) => {
      if (!acc[template.category]) {
        acc[template.category] = [];
      }
      acc[template.category].push(template);
      return acc;
    }, {});

    // Estadísticas
    const stats = {
      total: filteredTemplates.length,
      byCategory: Object.keys(templatesByCategory).reduce((acc: any, category) => {
        acc[category] = templatesByCategory[category].length;
        return acc;
      }, {}),
      byType: filteredTemplates.reduce((acc: any, template) => {
        acc[template.type] = (acc[template.type] || 0) + 1;
        return acc;
      }, {}),
      byPriority: filteredTemplates.reduce((acc: any, template) => {
        acc[template.priority] = (acc[template.priority] || 0) + 1;
        return acc;
      }, {})
    };

    return NextResponse.json({
      success: true,
      templates: filteredTemplates,
      templatesByCategory,
      stats,
      categories: Object.keys(templatesByCategory),
      filters: { category, type, priority }
    });

  } catch (error) {
    console.error('Error getting notification templates:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST para usar una plantilla
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verificar autenticación y permisos de admin
    const cookieStore = await cookies();
    const token = cookieStore.get('bsk-access-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as any;
    const adminUser = await User.findById(decoded.userId);

    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const body = await request.json();
    const { templateId, variables, targetUsers, expiresInDays = 30 } = body;

    // Buscar plantilla
    const template = NOTIFICATION_TEMPLATES.find(t => t.id === templateId);
    if (!template) {
      return NextResponse.json(
        { error: 'Plantilla no encontrada' },
        { status: 404 }
      );
    }

    // Reemplazar variables en título y mensaje
    let title = template.title;
    let message = template.message;

    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{${key}}`;
        title = title.replace(new RegExp(placeholder, 'g'), value as string);
        message = message.replace(new RegExp(placeholder, 'g'), value as string);
      });
    }

    // Crear notificación usando la API de creación
    const createNotificationResponse = await fetch(`${request.nextUrl.origin}/api/notifications/admin/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `bsk-access-token=${token}`
      },
      body: JSON.stringify({
        type: template.type,
        priority: template.priority,
        title,
        message,
        targetUsers,
        metadata: {
          templateId,
          templateName: template.name,
          variables
        },
        expiresInDays
      })
    });

    if (!createNotificationResponse.ok) {
      throw new Error('Error al crear notificación desde plantilla');
    }

    const result = await createNotificationResponse.json();

    return NextResponse.json({
      success: true,
      template: template.name,
      ...result
    });

  } catch (error) {
    console.error('Error using notification template:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
