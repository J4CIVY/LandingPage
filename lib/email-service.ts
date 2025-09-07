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
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Bienvenido al BSK Motorcycle Team</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background-color: #1e40af; color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .welcome-message { background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .cta-button { display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { background-color: #f3f4f6; padding: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>¡Bienvenido al BSK Motorcycle Team!</h1>
        </div>
        <div class="content">
          <h2>Hola ${userName},</h2>
          <div class="welcome-message">
            <p>¡Nos complace darte la bienvenida a la familia BSK Motorcycle Team! Estás a punto de formar parte de una comunidad apasionada por las motocicletas y la aventura.</p>
          </div>
          <p>Con tu cuenta, podrás:</p>
          <ul>
            <li>Acceder a eventos exclusivos del club</li>
            <li>Conectarte con otros miembros de la comunidad</li>
            <li>Participar en rutas y actividades organizadas</li>
            <li>Acceder a descuentos en productos y servicios</li>
            <li>Recibir noticias y actualizaciones del club</li>
          </ul>
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" class="cta-button">Acceder a mi cuenta</a>
          </div>
          <p>Si tienes alguna pregunta, no dudes en contactarnos. ¡Esperamos verte pronto en nuestros eventos!</p>
        </div>
        <div class="footer">
          <p><strong>BSK Motorcycle Team</strong></p>
          <p>Tu pasión, nuestra comunidad</p>
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
