/* eslint-disable @typescript-eslint/no-explicit-any */
import { getZohoMailClient } from './zoho-mail';
import { ZohoEmailConfig, ContactFormEmail } from '@/types/email';

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
   * Envía un correo de verificación de email
   */
  async sendEmailVerification(
    userEmail: string,
    userName: string,
    verificationToken: string
  ): Promise<boolean> {
    try {
      const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
      
      const emailConfig: ZohoEmailConfig = {
        fromAddress: this.fromEmail,
        toAddress: userEmail,
        subject: 'Verifica tu correo electrónico - BSK Motorcycle Team',
        content: this.generateEmailVerificationContent(userName, verificationUrl),
        mailFormat: 'html',
        askReceipt: 'no'
      };

      const result = await this.client.sendEmail(emailConfig);
      return result.status?.code === 200;
    } catch (error) {
      console.error('Error sending email verification:', error);
      return false;
    }
  }

  /**
   * Envía una notificación de cambio de contraseña exitoso
   */
  async sendPasswordChangeNotification(
    userEmail: string,
    userName: string,
    changeData: {
      timestamp: string;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<boolean> {
    try {
      const emailConfig: ZohoEmailConfig = {
        fromAddress: this.fromEmail,
        toAddress: userEmail,
        subject: 'Contraseña cambiada exitosamente - BSK Motorcycle Team',
        content: this.generatePasswordChangeNotificationContent(userName, changeData),
        mailFormat: 'html',
        askReceipt: 'no'
      };

      const result = await this.client.sendEmail(emailConfig);
      return result.status?.code === 200;
    } catch (error) {
      console.error('Error sending password change notification:', error);
      return false;
    }
  }

  /**
   * Envía una alerta de seguridad por login desde nuevo dispositivo
   */
  async sendSecurityAlert(
    userEmail: string,
    userName: string,
    loginData: {
      timestamp: string;
      ipAddress?: string;
      device?: string;
      browser?: string;
      os?: string;
      location?: string;
    }
  ): Promise<boolean> {
    try {
      const emailConfig: ZohoEmailConfig = {
        fromAddress: this.fromEmail,
        toAddress: userEmail,
        subject: '🔒 Alerta de Seguridad: Nuevo inicio de sesión detectado - BSK Motorcycle Team',
        content: this.generateSecurityAlertContent(userName, loginData),
        mailFormat: 'html',
        askReceipt: 'yes'
      };

      const result = await this.client.sendEmail(emailConfig);
      return result.status?.code === 200;
    } catch (error) {
      console.error('Error sending security alert:', error);
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
   * Genera el contenido HTML para el correo de verificación de email
   */
  private generateEmailVerificationContent(userName: string, verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verifica tu correo electrónico</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background-color: #1e40af; color: white; padding: 30px 20px; text-align: center; }
          .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .content { padding: 40px 30px; }
          .welcome { font-size: 18px; margin-bottom: 20px; color: #1e40af; }
          .message { margin-bottom: 30px; }
          .button-container { text-align: center; margin: 30px 0; }
          .verify-button { 
            display: inline-block; 
            background-color: #1e40af; 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            font-weight: bold;
          }
          .verify-button:hover { background-color: #1d4ed8; }
          .alternative { margin-top: 30px; padding: 20px; background-color: #f8fafc; border-radius: 5px; }
          .footer { background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
          .security-note { color: #ef4444; font-size: 14px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">BSK Motorcycle Team</div>
            <div>Verifica tu correo electrónico</div>
          </div>
          <div class="content">
            <div class="welcome">¡Bienvenido ${userName}!</div>
            <div class="message">
              <p>Gracias por registrarte en BSK Motorcycle Team. Para completar tu registro y activar tu cuenta, necesitas verificar tu correo electrónico.</p>
              <p>Haz clic en el botón de abajo para verificar tu correo:</p>
            </div>
            <div class="button-container">
              <a href="${verificationUrl}" class="verify-button">Verificar Correo Electrónico</a>
            </div>
            <div class="alternative">
              <strong>¿No puedes hacer clic en el botón?</strong><br>
              Copia y pega el siguiente enlace en tu navegador:<br>
              <a href="${verificationUrl}">${verificationUrl}</a>
            </div>
            <div class="security-note">
              <strong>Nota de seguridad:</strong> Este enlace expirará en 24 horas por tu seguridad. Si no fuiste tú quien se registró, puedes ignorar este correo.
            </div>
          </div>
          <div class="footer">
            <p>Este correo fue enviado automáticamente. No respondas a este mensaje.</p>
            <p>BSK Motorcycle Team © ${new Date().getFullYear()}</p>
          </div>
        </div>
      </body>
      </html>
    `;
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
   * Genera el contenido HTML para notificación de cambio de contraseña exitoso
   */
  private generatePasswordChangeNotificationContent(
    userName: string,
    changeData: {
      timestamp: string;
      ipAddress?: string;
      userAgent?: string;
    }
  ): string {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Bogota'
      });
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Contraseña cambiada exitosamente</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f9fafb;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #059669, #10b981);
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .logo { 
            font-size: 24px; 
            font-weight: bold; 
            margin-bottom: 10px; 
          }
          .content { 
            padding: 40px 30px; 
          }
          .success-icon {
            text-align: center;
            margin-bottom: 30px;
          }
          .success-icon::before {
            content: "✓";
            display: inline-block;
            width: 60px;
            height: 60px;
            line-height: 60px;
            border-radius: 50%;
            background-color: #059669;
            color: white;
            font-size: 30px;
            font-weight: bold;
          }
          .title { 
            font-size: 24px; 
            margin-bottom: 20px; 
            color: #059669;
            text-align: center;
          }
          .message { 
            margin-bottom: 30px; 
            font-size: 16px;
            text-align: center;
          }
          .details-card { 
            background-color: #f0fdf4; 
            border: 1px solid #059669; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 25px 0; 
          }
          .detail-item { 
            margin-bottom: 12px; 
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .detail-label { 
            font-weight: bold; 
            color: #065f46; 
          }
          .detail-value {
            color: #374151;
            font-family: monospace;
            font-size: 14px;
          }
          .security-notice { 
            background-color: #fef3c7; 
            border-left: 4px solid #f59e0b; 
            padding: 15px; 
            margin: 25px 0; 
            border-radius: 4px;
          }
          .security-notice-title {
            font-weight: bold;
            color: #92400e;
            margin-bottom: 8px;
          }
          .security-notice-text {
            color: #b45309;
            font-size: 14px;
          }
          .footer { 
            background-color: #f3f4f6; 
            padding: 25px 20px; 
            text-align: center; 
            border-top: 1px solid #e5e7eb;
          }
          .footer-title {
            font-weight: bold;
            color: #374151;
            margin-bottom: 5px;
          }
          .footer-subtitle {
            color: #6b7280;
            font-size: 14px;
          }
          .contact-info {
            margin-top: 15px;
            font-size: 12px;
            color: #9ca3af;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🏍️ BSK Motorcycle Team</div>
            <h1 style="margin: 0; font-size: 20px;">Seguridad de la cuenta</h1>
          </div>
          
          <div class="content">
            <div class="success-icon"></div>
            
            <h2 class="title">¡Contraseña cambiada exitosamente!</h2>
            
            <div class="message">
              <p>Hola <strong>${userName}</strong>,</p>
              <p>Te confirmamos que la contraseña de tu cuenta ha sido cambiada exitosamente.</p>
            </div>

            <div class="details-card">
              <h3 style="margin-top: 0; color: #065f46;">Detalles del cambio</h3>
              <div class="detail-item">
                <span class="detail-label">Fecha y hora:</span>
                <span class="detail-value">${formatDate(changeData.timestamp)}</span>
              </div>
              ${changeData.ipAddress ? `
                <div class="detail-item">
                  <span class="detail-label">Dirección IP:</span>
                  <span class="detail-value">${changeData.ipAddress}</span>
                </div>
              ` : ''}
              ${changeData.userAgent ? `
                <div class="detail-item">
                  <span class="detail-label">Dispositivo:</span>
                  <span class="detail-value">${changeData.userAgent.substring(0, 50)}${changeData.userAgent.length > 50 ? '...' : ''}</span>
                </div>
              ` : ''}
            </div>

            <div class="security-notice">
              <div class="security-notice-title">🔒 Aviso de seguridad importante</div>
              <div class="security-notice-text">
                Si no realizaste este cambio, contacta inmediatamente nuestro equipo de soporte. 
                Tu cuenta podría estar comprometida.
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #6b7280; font-size: 14px;">
                Este es un correo automático de seguridad. No es necesario responder.
              </p>
            </div>
          </div>

          <div class="footer">
            <div class="footer-title">BSK Motorcycle Team</div>
            <div class="footer-subtitle">Equipo de seguridad y soporte técnico</div>
            <div class="contact-info">
              Si necesitas ayuda, contáctanos a través de nuestro sitio web o redes sociales oficiales.
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Genera el contenido HTML para alertas de seguridad por login desde nuevo dispositivo
   */
  private generateSecurityAlertContent(
    userName: string,
    loginData: {
      timestamp: string;
      ipAddress?: string;
      device?: string;
      browser?: string;
      os?: string;
      location?: string;
    }
  ): string {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Bogota'
      });
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Alerta de Seguridad - Nuevo inicio de sesión detectado</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f9fafb;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #dc2626, #ef4444);
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
          }
          .logo { 
            font-size: 24px; 
            font-weight: bold; 
            margin-bottom: 10px; 
          }
          .content { 
            padding: 40px 30px; 
          }
          .alert-icon {
            text-align: center;
            margin-bottom: 30px;
          }
          .alert-icon::before {
            content: "🔒";
            display: inline-block;
            font-size: 50px;
          }
          .title { 
            font-size: 24px; 
            margin-bottom: 20px; 
            color: #dc2626;
            text-align: center;
            font-weight: bold;
          }
          .message { 
            margin-bottom: 30px; 
            font-size: 16px;
            text-align: center;
          }
          .details-card { 
            background-color: #fef2f2; 
            border: 2px solid #dc2626; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 25px 0; 
          }
          .details-title {
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 15px;
            font-size: 18px;
          }
          .detail-item { 
            margin-bottom: 12px; 
            padding: 8px 0;
            border-bottom: 1px solid #fee2e2;
          }
          .detail-item:last-child {
            border-bottom: none;
          }
          .detail-label { 
            font-weight: bold; 
            color: #991b1b; 
            display: inline-block;
            width: 120px;
          }
          .detail-value {
            color: #374151;
            font-family: monospace;
            font-size: 14px;
          }
          .action-section {
            background-color: #fff7ed;
            border: 1px solid #f97316;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
          }
          .action-title {
            font-weight: bold;
            color: #9a3412;
            margin-bottom: 12px;
            font-size: 16px;
          }
          .action-text {
            color: #c2410c;
            font-size: 14px;
            margin-bottom: 10px;
          }
          .button-container {
            text-align: center;
            margin: 25px 0;
          }
          .secure-button {
            display: inline-block;
            background-color: #dc2626;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 5px;
          }
          .secure-button:hover {
            background-color: #b91c1c;
          }
          .info-notice {
            background-color: #eff6ff;
            border-left: 4px solid: #3b82f6;
            padding: 15px;
            margin: 25px 0;
            border-radius: 4px;
          }
          .info-text {
            color: #1e40af;
            font-size: 14px;
          }
          .footer { 
            background-color: #f3f4f6; 
            padding: 20px; 
            text-align: center; 
            font-size: 12px; 
            color: #6b7280; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">BSK Motorcycle Team</div>
            <div>🔒 Alerta de Seguridad</div>
          </div>
          <div class="content">
            <div class="alert-icon"></div>
            <div class="title">Nuevo inicio de sesión detectado</div>
            <div class="message">
              Hola ${userName},<br><br>
              Se ha detectado un inicio de sesión en tu cuenta desde un dispositivo que no habíamos visto antes.
            </div>
            
            <div class="details-card">
              <div class="details-title">📍 Detalles del inicio de sesión</div>
              <div class="detail-item">
                <span class="detail-label">Fecha y hora:</span>
                <span class="detail-value">${formatDate(loginData.timestamp)}</span>
              </div>
              ${loginData.device ? `
              <div class="detail-item">
                <span class="detail-label">Dispositivo:</span>
                <span class="detail-value">${loginData.device}</span>
              </div>
              ` : ''}
              ${loginData.browser ? `
              <div class="detail-item">
                <span class="detail-label">Navegador:</span>
                <span class="detail-value">${loginData.browser}</span>
              </div>
              ` : ''}
              ${loginData.os ? `
              <div class="detail-item">
                <span class="detail-label">Sistema:</span>
                <span class="detail-value">${loginData.os}</span>
              </div>
              ` : ''}
              ${loginData.ipAddress ? `
              <div class="detail-item">
                <span class="detail-label">Dirección IP:</span>
                <span class="detail-value">${loginData.ipAddress}</span>
              </div>
              ` : ''}
              ${loginData.location ? `
              <div class="detail-item">
                <span class="detail-label">Ubicación:</span>
                <span class="detail-value">${loginData.location}</span>
              </div>
              ` : ''}
            </div>

            <div class="action-section">
              <div class="action-title">⚠️ ¿No fuiste tú?</div>
              <div class="action-text">
                Si no reconoces esta actividad, tu cuenta podría estar comprometida. 
                Toma las siguientes medidas inmediatamente:
              </div>
              <ul style="color: #c2410c; font-size: 14px;">
                <li>Cambia tu contraseña de inmediato</li>
                <li>Cierra todas las sesiones activas</li>
                <li>Revisa tu actividad reciente</li>
                <li>Contacta a nuestro equipo de soporte</li>
              </ul>
              <div class="button-container">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://bskmt.com'}/dashboard/security" class="secure-button">
                  🔐 Asegurar mi cuenta
                </a>
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://bskmt.com'}/reset-password" class="secure-button">
                  🔑 Cambiar contraseña
                </a>
              </div>
            </div>

            <div class="info-notice">
              <div class="info-text">
                <strong>✅ ¿Fuiste tú?</strong><br>
                Si reconoces esta actividad, puedes ignorar este mensaje. 
                Este dispositivo ahora está registrado en tu cuenta.
              </div>
            </div>

            <div class="info-notice">
              <div class="info-text">
                <strong>💡 Consejo de seguridad:</strong><br>
                Mantén tu cuenta segura activando la autenticación de dos factores y 
                usando contraseñas únicas y fuertes.
              </div>
            </div>
          </div>
          <div class="footer">
            <div style="margin-bottom: 10px;">
              <strong>BSK Motorcycle Team</strong>
            </div>
            <div>
              Este es un correo automático de seguridad. Por favor no respondas a este mensaje.
            </div>
            <div style="margin-top: 10px;">
              Si necesitas ayuda, contáctanos a través de nuestro sitio web.
            </div>
          </div>
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
   * Envía confirmación de pago aprobado
   */
  async sendPaymentConfirmation(
    toEmail: string,
    userName: string,
    paymentDetails: {
      eventName: string;
      eventDate: string;
      amount: number;
      currency: string;
      orderId: string;
      transactionId: string;
      paymentMethod: string;
    }
  ): Promise<boolean> {
    try {
      const formattedAmount = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: paymentDetails.currency
      }).format(paymentDetails.amount);

      const emailConfig: ZohoEmailConfig = {
        fromAddress: this.fromEmail,
        toAddress: toEmail,
        subject: `✅ Confirmación de pago - ${paymentDetails.eventName}`,
        content: this.generatePaymentConfirmationContent(userName, paymentDetails, formattedAmount),
        mailFormat: 'html',
        askReceipt: 'no'
      };

      const result = await this.client.sendEmail(emailConfig);
      return result.status?.code === 200;
    } catch (error) {
      console.error('Error sending payment confirmation:', error);
      return false;
    }
  }

  /**
   * Envía notificación de pago rechazado
   */
  async sendPaymentRejected(
    toEmail: string,
    userName: string,
    details: {
      eventName: string;
      orderId: string;
      reason: string;
    }
  ): Promise<boolean> {
    try {
      const emailConfig: ZohoEmailConfig = {
        fromAddress: this.fromEmail,
        toAddress: toEmail,
        subject: `❌ Pago no procesado - ${details.eventName}`,
        content: this.generatePaymentRejectedContent(userName, details),
        mailFormat: 'html',
        askReceipt: 'no'
      };

      const result = await this.client.sendEmail(emailConfig);
      return result.status?.code === 200;
    } catch (error) {
      console.error('Error sending payment rejection email:', error);
      return false;
    }
  }

  /**
   * Genera contenido HTML para confirmación de pago
   */
  private generatePaymentConfirmationContent(
    userName: string,
    paymentDetails: any,
    formattedAmount: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmación de pago</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .success-icon { font-size: 48px; margin-bottom: 10px; }
          .content { padding: 30px; }
          .payment-card { background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .payment-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .payment-row:last-child { border-bottom: none; }
          .payment-label { color: #6b7280; font-weight: 500; }
          .payment-value { color: #111827; font-weight: 600; text-align: right; }
          .total-amount { font-size: 24px; color: #10b981; }
          .cta-button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
          .cta-button:hover { background-color: #1d4ed8; }
          .info-box { background-color: #dbeafe; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; }
          .footer { background-color: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="success-icon">✅</div>
            <h1>¡Pago Confirmado!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Tu inscripción ha sido procesada exitosamente</p>
          </div>
          
          <div class="content">
            <p>Hola <strong>${userName}</strong>,</p>
            
            <p>Tu pago ha sido <strong>aprobado exitosamente</strong> y tu inscripción al evento ha sido confirmada.</p>
            
            <div class="payment-card">
              <h3 style="margin-top: 0; color: #111827;">Detalles del pago</h3>
              
              <div class="payment-row">
                <span class="payment-label">Evento:</span>
                <span class="payment-value">${paymentDetails.eventName}</span>
              </div>
              
              <div class="payment-row">
                <span class="payment-label">Fecha del evento:</span>
                <span class="payment-value">${paymentDetails.eventDate}</span>
              </div>
              
              <div class="payment-row">
                <span class="payment-label">Monto pagado:</span>
                <span class="payment-value total-amount">${formattedAmount}</span>
              </div>
              
              <div class="payment-row">
                <span class="payment-label">Orden:</span>
                <span class="payment-value" style="font-family: monospace; font-size: 12px;">${paymentDetails.orderId}</span>
              </div>
              
              <div class="payment-row">
                <span class="payment-label">ID de transacción:</span>
                <span class="payment-value" style="font-family: monospace; font-size: 12px;">${paymentDetails.transactionId}</span>
              </div>
              
              <div class="payment-row">
                <span class="payment-label">Método de pago:</span>
                <span class="payment-value">${paymentDetails.paymentMethod}</span>
              </div>
            </div>
            
            <div class="info-box">
              <strong>📍 Próximos pasos:</strong>
              <ul style="margin: 10px 0 0 0;">
                <li>Revisa los detalles del evento en tu dashboard</li>
                <li>Prepara tu moto y equipo de seguridad</li>
                <li>Mantente atento a las actualizaciones por WhatsApp</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://bskmt.com'}/dashboard" class="cta-button">
                Ver mis eventos
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Si tienes alguna pregunta, no dudes en contactarnos.
            </p>
          </div>
          
          <div class="footer">
            <p><strong>BSK Motorcycle Team</strong></p>
            <p>La aventura comienza aquí 🏍️</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Genera contenido HTML para pago rechazado
   */
  private generatePaymentRejectedContent(
    userName: string,
    details: any
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Pago no procesado</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .error-icon { font-size: 48px; margin-bottom: 10px; }
          .content { padding: 30px; }
          .info-box { background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
          .cta-button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
          .cta-button:hover { background-color: #1d4ed8; }
          .footer { background-color: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="error-icon">❌</div>
            <h1>Pago No Procesado</h1>
          </div>
          
          <div class="content">
            <p>Hola <strong>${userName}</strong>,</p>
            
            <p>Lamentamos informarte que tu pago para el evento <strong>${details.eventName}</strong> no pudo ser procesado.</p>
            
            <div class="info-box">
              <strong>Motivo:</strong> ${details.reason}
              <br><br>
              <strong>Orden:</strong> ${details.orderId}
            </div>
            
            <p><strong>¿Qué puedes hacer?</strong></p>
            <ul>
              <li>Verificar que tu método de pago tenga fondos suficientes</li>
              <li>Intentar con otro método de pago</li>
              <li>Contactar a tu entidad financiera si el problema persiste</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://bskmt.com'}/events/${details.eventId || ''}" class="cta-button">
                Intentar nuevamente
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Si necesitas ayuda, no dudes en contactarnos.
            </p>
          </div>
          
          <div class="footer">
            <p><strong>BSK Motorcycle Team</strong></p>
            <p>Soporte técnico disponible</p>
          </div>
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

  /**
   * Envía confirmación de registro en evento (gratuito o pagado) con enlace a factura
   */
  async sendEventRegistrationConfirmation(
    toEmail: string,
    userName: string,
    eventDetails: {
      eventName: string;
      eventDate: string;
      eventLocation: string;
      isFree: boolean;
      invoiceUrl: string;
      amount?: number;
      currency?: string;
    }
  ): Promise<boolean> {
    try {
      const subject = eventDetails.isFree 
        ? `✅ Registro confirmado - ${eventDetails.eventName}`
        : `✅ Pago confirmado - ${eventDetails.eventName}`;

      const emailConfig: ZohoEmailConfig = {
        fromAddress: this.fromEmail,
        toAddress: toEmail,
        subject,
        content: this.generateEventRegistrationContent(userName, eventDetails),
        mailFormat: 'html',
        askReceipt: 'no'
      };

      const result = await this.client.sendEmail(emailConfig);
      return result.status?.code === 200;
    } catch (error) {
      console.error('Error sending event registration confirmation:', error);
      return false;
    }
  }

  /**
   * Genera contenido HTML para confirmación de registro en evento
   */
  private generateEventRegistrationContent(
    userName: string,
    eventDetails: any
  ): string {
    const isFree = eventDetails.isFree;
    const formattedAmount = eventDetails.amount 
      ? new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: eventDetails.currency || 'COP'
        }).format(eventDetails.amount)
      : null;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmación de registro - ${eventDetails.eventName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, ${isFree ? '#10b981' : '#2563eb'} 0%, ${isFree ? '#059669' : '#1d4ed8'} 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .success-icon { font-size: 48px; margin-bottom: 10px; }
          .content { padding: 30px; }
          .event-card { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; padding: 25px; margin: 20px 0; border-left: 4px solid #10b981; }
          .event-title { color: #065f46; font-size: 22px; font-weight: bold; margin: 0 0 15px 0; }
          .event-detail { display: flex; align-items: center; margin: 10px 0; color: #047857; }
          .event-detail-icon { font-size: 20px; margin-right: 10px; }
          .event-detail-text { font-size: 15px; }
          ${!isFree ? `
          .payment-card { background-color: #eff6ff; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #2563eb; }
          .payment-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #dbeafe; }
          .payment-row:last-child { border-bottom: none; }
          .payment-label { color: #1e40af; font-weight: 500; }
          .payment-value { color: #1e3a8a; font-weight: 600; text-align: right; }
          .total-amount { font-size: 24px; color: #2563eb; }
          ` : ''}
          .cta-button { display: inline-block; background-color: ${isFree ? '#10b981' : '#2563eb'}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 10px 5px; font-weight: 600; font-size: 16px; }
          .cta-button:hover { background-color: ${isFree ? '#059669' : '#1d4ed8'}; }
          .cta-button.secondary { background-color: #6b7280; }
          .cta-button.secondary:hover { background-color: #4b5563; }
          .info-box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .info-box strong { color: #92400e; }
          .info-box ul { margin: 10px 0 0 20px; color: #78350f; }
          .badge { display: inline-block; background-color: ${isFree ? '#10b981' : '#2563eb'}; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-top: 10px; }
          .footer { background-color: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
          .divider { border: 0; height: 1px; background: #e5e7eb; margin: 25px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="success-icon">🎉</div>
            <h1>${isFree ? '¡Registro Confirmado!' : '¡Pago Confirmado!'}</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">${isFree ? 'Tu inscripción está lista' : 'Tu inscripción ha sido procesada exitosamente'}</p>
            <span class="badge">${isFree ? '✨ EVENTO GRATUITO' : '✓ PAGADO'}</span>
          </div>
          
          <div class="content">
            <p>Hola <strong>${userName}</strong>,</p>
            
            <p>${isFree 
              ? '¡Excelente noticia! Tu registro al evento ha sido <strong>confirmado exitosamente</strong>.' 
              : 'Tu pago ha sido <strong>aprobado</strong> y tu inscripción al evento ha sido confirmada.'
            }</p>
            
            <div class="event-card">
              <h2 class="event-title">📅 ${eventDetails.eventName}</h2>
              
              <div class="event-detail">
                <span class="event-detail-icon">📆</span>
                <span class="event-detail-text"><strong>Fecha:</strong> ${eventDetails.eventDate}</span>
              </div>
              
              <div class="event-detail">
                <span class="event-detail-icon">📍</span>
                <span class="event-detail-text"><strong>Ubicación:</strong> ${eventDetails.eventLocation}</span>
              </div>
              
              ${!isFree && formattedAmount ? `
              <div class="event-detail">
                <span class="event-detail-icon">💰</span>
                <span class="event-detail-text"><strong>Monto pagado:</strong> ${formattedAmount}</span>
              </div>
              ` : ''}
            </div>
            
            ${!isFree && formattedAmount ? `
            <div class="payment-card">
              <h3 style="margin-top: 0; color: #1e3a8a;">💳 Detalles del pago</h3>
              <div class="payment-row">
                <span class="payment-label">Monto total:</span>
                <span class="payment-value total-amount">${formattedAmount}</span>
              </div>
              <div class="payment-row">
                <span class="payment-label">Estado:</span>
                <span class="payment-value" style="color: #10b981;">✓ Aprobado</span>
              </div>
            </div>
            ` : ''}
            
            <hr class="divider">
            
            <div class="info-box">
              <strong>📋 Próximos pasos:</strong>
              <ul>
                <li>Descarga tu comprobante/factura usando el botón de abajo</li>
                <li>Revisa todos los detalles del evento en tu dashboard</li>
                <li>Prepara tu moto y equipo de seguridad</li>
                <li>Mantente atento a las actualizaciones por WhatsApp</li>
                <li>Llega con 30 minutos de anticipación el día del evento</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${eventDetails.invoiceUrl}" class="cta-button" style="text-decoration: none;">
                📄 Ver ${isFree ? 'Comprobante' : 'Factura'}
              </a>
              <br>
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://bskmt.com'}/dashboard/eventos" class="cta-button secondary" style="text-decoration: none;">
                🏍️ Ir al Dashboard
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px; text-align: center;">
              Si tienes alguna pregunta sobre el evento, contáctanos:<br>
              📧 <strong>contacto@bskmt.com</strong> | 📱 <strong>3004902449</strong>
            </p>
          </div>
          
          <div class="footer">
            <p><strong>BSK Motorcycle Team - Organización Motear SAS</strong></p>
            <p>NIT: 901444877-6</p>
            <p>La aventura comienza aquí 🏍️</p>
            <p style="font-size: 12px; margin-top: 10px;">
              Este es un correo automático, por favor no responder.
            </p>
          </div>
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
