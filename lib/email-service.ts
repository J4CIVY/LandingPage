import { getZohoMailClient } from './zoho-mail';
import { ZohoEmailConfig, ContactFormEmail, EmailTemplate } from '@/types/email';

/**
 * Servicio de alto nivel para el manejo de correos electrónicos
 */
export class EmailService {
  private client = getZohoMailClient();
  private fromEmail: string;
  private adminEmail: string;
  private supportEmail: string;

  constructor() {
    this.fromEmail = process.env.ZOHO_FROM_EMAIL || '';
    this.adminEmail = process.env.EMAIL_ADMIN_ADDRESS || '';
    this.supportEmail = process.env.EMAIL_SUPPORT_ADDRESS || '';

    if (!this.fromEmail) {
      throw new Error('ZOHO_FROM_EMAIL not configured');
    }
  }

  /**
   * Envía un correo de contacto desde el formulario web
   */
  async sendContactEmail(contactData: ContactFormEmail): Promise<boolean> {
    try {
      const emailConfig: ZohoEmailConfig = {
        fromAddress: this.fromEmail,
        toAddress: this.supportEmail || this.adminEmail,
        subject: `[${contactData.category.toUpperCase()}] ${contactData.subject}`,
        content: this.generateContactEmailContent(contactData),
        mailFormat: 'html',
        askReceipt: 'no'
      };

      // Enviar copia al remitente si es solicitado
      if (contactData.email) {
        emailConfig.bccAddress = contactData.email;
      }

      const result = await this.client.sendEmail(emailConfig);
      return result.status?.code === 200;
    } catch (error) {
      console.error('Error sending contact email:', error);
      return false;
    }
  }

  /**
   * Envía un correo de bienvenida a un nuevo usuario
   */
  async sendWelcomeEmail(
    userEmail: string, 
    userName: string, 
    additionalData?: Record<string, any>
  ): Promise<boolean> {
    try {
      const emailConfig: ZohoEmailConfig = {
        fromAddress: this.fromEmail,
        toAddress: userEmail,
        subject: '¡Bienvenido al BSK Motorcycle Team!',
        content: this.generateWelcomeEmailContent(userName, additionalData),
        mailFormat: 'html',
        askReceipt: 'no'
      };

      const result = await this.client.sendEmail(emailConfig);
      return result.status?.code === 200;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }

  /**
   * Envía un correo de restablecimiento de contraseña
   */
  async sendPasswordResetEmail(
    userEmail: string, 
    userName: string, 
    resetToken: string
  ): Promise<boolean> {
    try {
      const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;
      
      const emailConfig: ZohoEmailConfig = {
        fromAddress: this.fromEmail,
        toAddress: userEmail,
        subject: 'Restablecimiento de contraseña - BSK Motorcycle Team',
        content: this.generatePasswordResetEmailContent(userName, resetUrl),
        mailFormat: 'html',
        askReceipt: 'no'
      };

      const result = await this.client.sendEmail(emailConfig);
      return result.status?.code === 200;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }
  }

  /**
   * Envía una notificación de evento
   */
  async sendEventNotification(
    userEmail: string,
    userName: string,
    eventData: {
      title: string;
      date: string;
      location: string;
      description: string;
    }
  ): Promise<boolean> {
    try {
      const emailConfig: ZohoEmailConfig = {
        fromAddress: this.fromEmail,
        toAddress: userEmail,
        subject: `Recordatorio de evento: ${eventData.title}`,
        content: this.generateEventNotificationContent(userName, eventData),
        mailFormat: 'html',
        askReceipt: 'no'
      };

      const result = await this.client.sendEmail(emailConfig);
      return result.status?.code === 200;
    } catch (error) {
      console.error('Error sending event notification:', error);
      return false;
    }
  }

  /**
   * Envía una notificación de membresía
   */
  async sendMembershipNotification(
    userEmail: string,
    userName: string,
    membershipData: {
      type: 'approval' | 'rejection' | 'expiration' | 'renewal';
      membershipType: string;
      expirationDate?: string;
      message?: string;
    }
  ): Promise<boolean> {
    try {
      const subjects = {
        approval: 'Membresía aprobada - BSK Motorcycle Team',
        rejection: 'Actualización de membresía - BSK Motorcycle Team',
        expiration: 'Membresía próxima a vencer - BSK Motorcycle Team',
        renewal: 'Membresía renovada - BSK Motorcycle Team'
      };

      const emailConfig: ZohoEmailConfig = {
        fromAddress: this.fromEmail,
        toAddress: userEmail,
        subject: subjects[membershipData.type],
        content: this.generateMembershipNotificationContent(userName, membershipData),
        mailFormat: 'html',
        askReceipt: 'no'
      };

      const result = await this.client.sendEmail(emailConfig);
      return result.status?.code === 200;
    } catch (error) {
      console.error('Error sending membership notification:', error);
      return false;
    }
  }

  /**
   * Envía un correo administrativo
   */
  async sendAdminNotification(
    subject: string,
    content: string,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<boolean> {
    try {
      const priorityPrefix = priority === 'high' ? '[URGENTE] ' : priority === 'medium' ? '[IMPORTANTE] ' : '';
      
      const emailConfig: ZohoEmailConfig = {
        fromAddress: this.fromEmail,
        toAddress: this.adminEmail,
        subject: `${priorityPrefix}${subject}`,
        content: this.generateAdminNotificationContent(content, priority),
        mailFormat: 'html',
        askReceipt: priority === 'high' ? 'yes' : 'no'
      };

      const result = await this.client.sendEmail(emailConfig);
      return result.status?.code === 200;
    } catch (error) {
      console.error('Error sending admin notification:', error);
      return false;
    }
  }

  /**
   * Genera el contenido HTML para el correo de contacto
   */
  private generateContactEmailContent(contactData: ContactFormEmail): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nuevo mensaje de contacto</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background-color: #1e40af; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #1e40af; }
          .priority-high { border-left: 4px solid #ef4444; padding-left: 10px; }
          .priority-medium { border-left: 4px solid #f59e0b; padding-left: 10px; }
          .priority-low { border-left: 4px solid #10b981; padding-left: 10px; }
          .footer { background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BSK Motorcycle Team</h1>
          <h2>Nuevo mensaje de contacto</h2>
        </div>
        <div class="content">
          <div class="field priority-${contactData.priority}">
            <div class="label">Prioridad:</div>
            <div>${contactData.priority.toUpperCase()}</div>
          </div>
          <div class="field">
            <div class="label">Categoría:</div>
            <div>${contactData.category}</div>
          </div>
          <div class="field">
            <div class="label">Nombre:</div>
            <div>${contactData.name}</div>
          </div>
          <div class="field">
            <div class="label">Email:</div>
            <div>${contactData.email}</div>
          </div>
          ${contactData.phone ? `
          <div class="field">
            <div class="label">Teléfono:</div>
            <div>${contactData.phone}</div>
          </div>
          ` : ''}
          ${contactData.company ? `
          <div class="field">
            <div class="label">Empresa:</div>
            <div>${contactData.company}</div>
          </div>
          ` : ''}
          <div class="field">
            <div class="label">Asunto:</div>
            <div>${contactData.subject}</div>
          </div>
          <div class="field">
            <div class="label">Mensaje:</div>
            <div style="white-space: pre-wrap;">${contactData.message}</div>
          </div>
        </div>
        <div class="footer">
          <p>Este mensaje fue enviado desde el formulario de contacto del sitio web de BSK Motorcycle Team.</p>
          <p>Fecha: ${new Date().toLocaleString('es-ES')}</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Genera el contenido HTML para el correo de bienvenida
   */
  private generateWelcomeEmailContent(userName: string, additionalData?: Record<string, any>): string {
    const userData = additionalData?.userData || {};
    const membershipType = userData.membershipType === 'friend' ? 'Amigo del Club' : 'Miembro';
    const registrationDate = userData.registrationDate ? new Date(userData.registrationDate).toLocaleDateString('es-ES') : new Date().toLocaleDateString('es-ES');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bienvenido al BSK Motorcycle Team</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 40px 20px; text-align: center; }
          .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .content { padding: 40px 20px; max-width: 600px; margin: 0 auto; }
          .welcome-badge { background: linear-gradient(135deg, #10b981 0%, #34d399 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 30px 0; }
          .info-box { background-color: #eff6ff; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #1e40af; }
          .benefits-list { background-color: #f8fafc; padding: 25px; border-radius: 10px; margin: 25px 0; }
          .benefits-list ul { margin: 0; padding-left: 20px; }
          .benefits-list li { margin: 8px 0; }
          .cta-section { text-align: center; margin: 30px 0; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; transition: transform 0.2s; }
          .cta-button:hover { transform: translateY(-2px); }
          .footer { background-color: #1f2937; color: white; padding: 30px 20px; text-align: center; }
          .social-links { margin: 20px 0; }
          .social-links a { color: #60a5fa; text-decoration: none; margin: 0 10px; }
          .contact-info { margin-top: 20px; font-size: 14px; color: #9ca3af; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🏍️ BSK MOTORCYCLE TEAM</div>
          <h1>¡Bienvenido a la familia!</h1>
          <p>Tu aventura en dos ruedas comienza aquí</p>
        </div>
        
        <div class="content">
          <div class="welcome-badge">
            <h2 style="margin: 0; font-size: 28px;">¡Hola ${userName}!</h2>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Registro exitoso como ${membershipType}</p>
          </div>

          <div class="info-box">
            <h3 style="margin-top: 0; color: #1e40af;">📋 Detalles de tu registro:</h3>
            <p><strong>Fecha de registro:</strong> ${registrationDate}</p>
            <p><strong>Tipo de membresía:</strong> ${membershipType}</p>
            <p><strong>Estado:</strong> ✅ Activo</p>
          </div>

          <p style="font-size: 18px; text-align: center; margin: 30px 0;">
            ¡Nos complace darte la bienvenida a la familia BSK Motorcycle Team! Estás a punto de formar parte de una comunidad apasionada por las motocicletas, la aventura y la hermandad sobre dos ruedas.
          </p>

          <div class="benefits-list">
            <h3 style="margin-top: 0; color: #1e40af;">🎯 Con tu cuenta podrás:</h3>
            <ul>
              <li><strong>🏍️ Participar en eventos exclusivos</strong> - Rutas, encuentros y actividades del club</li>
              <li><strong>👥 Conectarte con otros moteros</strong> - Una comunidad de personas que comparten tu pasión</li>
              <li><strong>📅 Acceder a nuestro calendario</strong> - Rutas programadas, talleres y eventos especiales</li>
              <li><strong>💰 Obtener descuentos especiales</strong> - En productos, servicios y establecimientos afiliados</li>
              <li><strong>📱 Usar la plataforma completa</strong> - Dashboard personal, perfil y herramientas</li>
              <li><strong>📧 Recibir noticias importantes</strong> - Actualizaciones, consejos de seguridad y novedades</li>
            </ul>
          </div>

          <div class="cta-section">
            <h3 style="color: #1e40af;">🚀 ¡Comienza tu aventura ahora!</h3>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/login" class="cta-button">
              Iniciar Sesión
            </a>
            <br><br>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" style="color: #1e40af; text-decoration: none;">
              🎯 Ver mi dashboard →
            </a>
          </div>

          <div class="info-box">
            <h3 style="margin-top: 0; color: #dc2626;">🛡️ Importante - Seguridad vial:</h3>
            <p>Como miembro de BSK Motorcycle Team, recuerda siempre:</p>
            <ul style="margin: 10px 0;">
              <li>Usar equipo de protección completo</li>
              <li>Respetar las normas de tránsito</li>
              <li>Mantener tu motocicleta en óptimas condiciones</li>
              <li>Participar responsablemente en nuestras actividades</li>
            </ul>
          </div>

          <p style="text-align: center; margin: 30px 0; font-size: 16px;">
            Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos. ¡Esperamos verte pronto en nuestros eventos y rutas!
          </p>
        </div>

        <div class="footer">
          <h3 style="margin: 0 0 10px 0;">BSK MOTORCYCLE TEAM</h3>
          <p style="margin: 5px 0; font-size: 16px;">🏍️ Tu pasión, nuestra comunidad 🏍️</p>
          
          <div class="social-links">
            <a href="#" style="color: #60a5fa;">📘 Facebook</a>
            <a href="#" style="color: #60a5fa;">📷 Instagram</a>
            <a href="#" style="color: #60a5fa;">💬 WhatsApp</a>
          </div>

          <div class="contact-info">
            <p>📧 Soporte: ${process.env.EMAIL_SUPPORT_ADDRESS || 'support@bskmotorcycleteam.com'}</p>
            <p>🌐 Web: ${process.env.NEXT_PUBLIC_BASE_URL}</p>
            <p style="margin-top: 15px; font-size: 12px;">
              Este correo fue enviado automáticamente. Si no solicitaste este registro, ignora este mensaje.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Genera el contenido HTML para el correo de restablecimiento de contraseña
   */
  private generatePasswordResetEmailContent(userName: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Restablecimiento de contraseña</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; }
          .security-notice { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
          .cta-button { display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { background-color: #f3f4f6; padding: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Restablecimiento de contraseña</h1>
        </div>
        <div class="content">
          <h2>Hola ${userName},</h2>
          <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en BSK Motorcycle Team.</p>
          <div class="security-notice">
            <strong>Aviso de seguridad:</strong> Si no solicitaste este restablecimiento, ignora este correo. Tu cuenta permanecerá segura.
          </div>
          <p>Para establecer una nueva contraseña, haz clic en el siguiente enlace:</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="cta-button">Restablecer contraseña</a>
          </div>
          <p><strong>Este enlace es válido por 24 horas.</strong></p>
          <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        </div>
        <div class="footer">
          <p><strong>BSK Motorcycle Team</strong></p>
          <p>Equipo de seguridad</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Genera el contenido HTML para notificaciones de eventos
   */
  private generateEventNotificationContent(userName: string, eventData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Recordatorio de evento</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; }
          .event-card { background-color: #f0fdf4; border: 1px solid #059669; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .event-detail { margin-bottom: 10px; }
          .label { font-weight: bold; color: #059669; }
          .cta-button { display: inline-block; background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { background-color: #f3f4f6; padding: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Recordatorio de evento</h1>
        </div>
        <div class="content">
          <h2>Hola ${userName},</h2>
          <p>Te recordamos que tienes un evento próximo del BSK Motorcycle Team:</p>
          <div class="event-card">
            <div class="event-detail">
              <span class="label">Evento:</span> ${eventData.title}
            </div>
            <div class="event-detail">
              <span class="label">Fecha:</span> ${eventData.date}
            </div>
            <div class="event-detail">
              <span class="label">Ubicación:</span> ${eventData.location}
            </div>
            <div class="event-detail">
              <span class="label">Descripción:</span> ${eventData.description}
            </div>
          </div>
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/events" class="cta-button">Ver más detalles</a>
          </div>
          <p>¡No te lo pierdas! Esperamos verte allí.</p>
        </div>
        <div class="footer">
          <p><strong>BSK Motorcycle Team</strong></p>
          <p>Eventos y actividades</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Genera el contenido HTML para notificaciones de membresía
   */
  private generateMembershipNotificationContent(userName: string, membershipData: {
    type: 'approval' | 'rejection' | 'expiration' | 'renewal';
    membershipType: string;
    expirationDate?: string;
    message?: string;
  }): string {
    const titles: Record<string, string> = {
      approval: '¡Membresía aprobada!',
      rejection: 'Actualización de membresía',
      expiration: 'Membresía próxima a vencer',
      renewal: '¡Membresía renovada!'
    };

    const colors: Record<string, string> = {
      approval: '#059669',
      rejection: '#dc2626',
      expiration: '#d97706',
      renewal: '#0284c7'
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${titles[membershipData.type]}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background-color: ${colors[membershipData.type]}; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; }
          .membership-card { background-color: #f8fafc; border: 1px solid ${colors[membershipData.type]}; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .membership-detail { margin-bottom: 10px; }
          .label { font-weight: bold; color: ${colors[membershipData.type]}; }
          .cta-button { display: inline-block; background-color: ${colors[membershipData.type]}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { background-color: #f3f4f6; padding: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${titles[membershipData.type]}</h1>
        </div>
        <div class="content">
          <h2>Hola ${userName},</h2>
          <div class="membership-card">
            <div class="membership-detail">
              <span class="label">Tipo de membresía:</span> ${membershipData.membershipType}
            </div>
            ${membershipData.expirationDate ? `
            <div class="membership-detail">
              <span class="label">Fecha de vencimiento:</span> ${membershipData.expirationDate}
            </div>
            ` : ''}
            ${membershipData.message ? `
            <div class="membership-detail">
              <span class="label">Mensaje:</span> ${membershipData.message}
            </div>
            ` : ''}
          </div>
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/membership-info" class="cta-button">Ver mi membresía</a>
          </div>
        </div>
        <div class="footer">
          <p><strong>BSK Motorcycle Team</strong></p>
          <p>Gestión de membresías</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Genera el contenido HTML para notificaciones administrativas
   */
  private generateAdminNotificationContent(content: string, priority: 'low' | 'medium' | 'high'): string {
    const priorityColors: Record<string, string> = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444'
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Notificación administrativa</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background-color: ${priorityColors[priority]}; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; }
          .priority-badge { background-color: ${priorityColors[priority]}; color: white; padding: 5px 10px; border-radius: 3px; font-size: 12px; font-weight: bold; }
          .footer { background-color: #f3f4f6; padding: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BSK Motorcycle Team - Admin</h1>
          <span class="priority-badge">PRIORIDAD: ${priority.toUpperCase()}</span>
        </div>
        <div class="content">
          <div style="white-space: pre-wrap;">${content}</div>
        </div>
        <div class="footer">
          <p>Fecha: ${new Date().toLocaleString('es-ES')}</p>
          <p>Sistema automático de notificaciones</p>
        </div>
      </body>
      </html>
    `;
  }
}

// Instancia singleton del servicio
let emailService: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!emailService) {
    emailService = new EmailService();
  }
  return emailService;
}
