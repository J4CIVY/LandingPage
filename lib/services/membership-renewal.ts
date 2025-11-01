import connectToDatabase from '@/lib/mongodb';
import Membership from '@/lib/models/Membership';
import User from '@/lib/models/User';
import { getEmailService } from '@/lib/email-service';

export interface RenewalNotification {
  userId: string;
  membershipId: string;
  membershipName: string;
  daysRemaining: number;
  renewalType: 'monthly' | 'quarterly' | 'biannual' | 'annual' | 'lifetime';
  isInGracePeriod: boolean;
}

export interface RenewalResult {
  success: boolean;
  message: string;
  renewalsProcessed: number;
  notificationsSent: number;
  errors: string[];
}

/**
 * Servicio para gestionar renovaciones automáticas de membresías
 */
export class MembershipRenewalService {
  
  /**
   * Procesa renovaciones automáticas según el tipo
   */
  static async processAutomaticRenewals(): Promise<RenewalResult> {
    try {
      await connectToDatabase();
      
      const result: RenewalResult = {
        success: true,
        message: '',
        renewalsProcessed: 0,
        notificationsSent: 0,
        errors: []
      };

      // Obtener todas las membresías activas que requieren renovación
      const memberships = await Membership.find({
        status: 'active',
        requiresRenewal: true,
        'autoRenewal.enabled': true
      });

      const currentDate = new Date();

      for (const membership of memberships) {
        try {
          // Procesar según el tipo de renovación
          switch (membership.renewalType) {
            case 'annual':
              await this.processAnnualRenewal(membership, currentDate);
              result.renewalsProcessed++;
              break;
            case 'monthly':
              await this.processMonthlyRenewal(membership, currentDate);
              result.renewalsProcessed++;
              break;
            case 'quarterly':
              await this.processQuarterlyRenewal(membership, currentDate);
              result.renewalsProcessed++;
              break;
            case 'biannual':
              await this.processBiannualRenewal(membership, currentDate);
              result.renewalsProcessed++;
              break;
            case 'lifetime':
              // Las vitalicias solo necesitan actualizar fecha de renovación anual
              await this.processLifetimeRenewal(membership, currentDate);
              result.renewalsProcessed++;
              break;
          }
        } catch (error) {
          const typedError = error as Error;
          result.errors.push(`Error procesando membresía ${membership.name}: ${typedError.message}`);
        }
      }

      // Procesar notificaciones de vencimiento
      const notificationsResult = await this.sendRenewalNotifications();
      result.notificationsSent = notificationsResult.notificationsSent;
      result.errors.push(...notificationsResult.errors);

      result.message = `Procesadas ${result.renewalsProcessed} renovaciones y enviadas ${result.notificationsSent} notificaciones`;
      
      if (result.errors.length > 0) {
        result.success = false;
        result.message += `. ${result.errors.length} errores encontrados.`;
      }

      return result;

    } catch (error) {
      const typedError = error as Error;
      console.error('Error in processAutomaticRenewals:', typedError);
      return {
        success: false,
        message: `Error general: ${typedError.message}`,
        renewalsProcessed: 0,
        notificationsSent: 0,
        errors: [typedError.message]
      };
    }
  }

  /**
   * Procesa renovación anual (31 de diciembre → 1 de enero)
   */
  private static async processAnnualRenewal(membership: Record<string, unknown>, currentDate: Date) {
    const membershipDoc = membership as {
      period?: { startDate?: Date; endDate?: Date; renewalStartDate?: Date; renewalDeadline?: Date };
      save?: () => Promise<void>;
    };
    const year = currentDate.getFullYear();
    const startOfNextYear = new Date(year + 1, 0, 1); // 1 de enero siguiente

    // Si estamos en el día de renovación (1 de enero)
    if (currentDate.getDate() === 1 && currentDate.getMonth() === 0) {
      // Actualizar periodo de la membresía
      if (!membershipDoc.period) membershipDoc.period = {};
      membershipDoc.period.startDate = startOfNextYear;
      membershipDoc.period.endDate = new Date(year + 1, 11, 31); // Fin del siguiente año
      membershipDoc.period.renewalStartDate = new Date(year + 1, 10, 1); // 1 de noviembre del siguiente año
      membershipDoc.period.renewalDeadline = new Date(year + 1, 11, 31); // 31 de diciembre del siguiente año

      if (membershipDoc.save) await membershipDoc.save();

      // Resetear contador de miembros actuales (se reasignarán los que renueven)
      // TODO: Implementar lógica para reasignar usuarios que renovaron
    }
  }

  /**
   * Procesa renovación mensual
   */
  private static async processMonthlyRenewal(membership: Record<string, unknown>, currentDate: Date) {
    const membershipDoc = membership as {
      period?: { startDate?: Date; endDate?: Date; renewalStartDate?: Date; renewalDeadline?: Date };
      save?: () => Promise<void>;
    };
    
    // Si estamos en el primer día del mes
    if (currentDate.getDate() === 1) {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfNextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      if (!membershipDoc.period) membershipDoc.period = {};
      membershipDoc.period.startDate = startOfMonth;
      membershipDoc.period.endDate = endOfNextMonth;
      membershipDoc.period.renewalStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 15); // Medio mes antes
      membershipDoc.period.renewalDeadline = endOfNextMonth;

      if (membershipDoc.save) await membershipDoc.save();
    }
  }

  /**
   * Procesa renovación trimestral
   */
  private static async processQuarterlyRenewal(membership: Record<string, unknown>, currentDate: Date) {
    const membershipDoc = membership as {
      period?: { startDate?: Date; endDate?: Date; renewalStartDate?: Date; renewalDeadline?: Date };
      save?: () => Promise<void>;
    };
    const quarter = Math.floor(currentDate.getMonth() / 3);
    const startOfQuarter = new Date(currentDate.getFullYear(), quarter * 3, 1);
    const endOfQuarter = new Date(currentDate.getFullYear(), (quarter + 1) * 3, 0);
    
    // Si estamos en el primer día del trimestre
    if (currentDate.getDate() === 1 && currentDate.getMonth() % 3 === 0) {
      if (!membershipDoc.period) membershipDoc.period = {};
      membershipDoc.period.startDate = startOfQuarter;
      membershipDoc.period.endDate = endOfQuarter;
      membershipDoc.period.renewalStartDate = new Date(endOfQuarter.getTime() - (30 * 24 * 60 * 60 * 1000)); // 30 días antes
      membershipDoc.period.renewalDeadline = endOfQuarter;

      if (membershipDoc.save) await membershipDoc.save();
    }
  }

  /**
   * Procesa renovación semestral
   */
  private static async processBiannualRenewal(membership: Record<string, unknown>, currentDate: Date) {
    const membershipDoc = membership as {
      period?: { startDate?: Date; endDate?: Date; renewalStartDate?: Date; renewalDeadline?: Date };
      save?: () => Promise<void>;
    };
    const semester = Math.floor(currentDate.getMonth() / 6);
    const startOfSemester = new Date(currentDate.getFullYear(), semester * 6, 1);
    const endOfSemester = new Date(currentDate.getFullYear(), (semester + 1) * 6, 0);
    
    // Si estamos en el primer día del semestre (enero o julio)
    if (currentDate.getDate() === 1 && (currentDate.getMonth() === 0 || currentDate.getMonth() === 6)) {
      if (!membershipDoc.period) membershipDoc.period = {};
      membershipDoc.period.startDate = startOfSemester;
      membershipDoc.period.endDate = endOfSemester;
      membershipDoc.period.renewalStartDate = new Date(endOfSemester.getTime() - (60 * 24 * 60 * 60 * 1000)); // 60 días antes
      membershipDoc.period.renewalDeadline = endOfSemester;

      if (membershipDoc.save) await membershipDoc.save();
    }
  }

  /**
   * Procesa renovación de membresía vitalicia (solo actualiza fechas anuales)
   */
  private static async processLifetimeRenewal(membership: Record<string, unknown>, currentDate: Date) {
    const membershipDoc = membership as {
      period?: { startDate?: Date; endDate?: Date; renewalStartDate?: Date; renewalDeadline?: Date };
      save?: () => Promise<void>;
    };
    // Las vitalicias solo actualizan el periodo anual para efectos administrativos
    if (currentDate.getDate() === 1 && currentDate.getMonth() === 0) {
      const year = currentDate.getFullYear();
      if (!membershipDoc.period) membershipDoc.period = {};
      membershipDoc.period.startDate = new Date(year, 0, 1);
      membershipDoc.period.endDate = new Date(year, 11, 31);
      membershipDoc.period.renewalStartDate = new Date(year, 10, 1); // 1 de noviembre
      membershipDoc.period.renewalDeadline = new Date(year, 11, 31); // 31 de diciembre

      if (membershipDoc.save) await membershipDoc.save();
    }
  }

  /**
   * Envía notificaciones de renovación a usuarios
   */
  static async sendRenewalNotifications(): Promise<{ notificationsSent: number; errors: string[] }> {
    try {
      await connectToDatabase();
      
      const result = {
        notificationsSent: 0,
        errors: [] as string[]
      };

      // Obtener usuarios que necesitan notificaciones de renovación
      const usersNeedingNotifications = await this.getUsersNeedingRenewalNotifications();

      for (const notification of usersNeedingNotifications) {
        try {
          await this.sendNotificationToUser(notification);
          result.notificationsSent++;
        } catch (error) {
          const typedError = error as Error;
          result.errors.push(`Error enviando notificación a usuario ${notification.userId}: ${typedError.message}`);
        }
      }

      return result;

    } catch (error) {
      const typedError = error as Error;
      console.error('Error in sendRenewalNotifications:', typedError);
      return {
        notificationsSent: 0,
        errors: [typedError.message]
      };
    }
  }

  /**
   * Obtiene usuarios que necesitan notificaciones de renovación
   */
  private static async getUsersNeedingRenewalNotifications(): Promise<RenewalNotification[]> {
    // TODO: Implementar lógica para obtener usuarios con membresías próximas a vencer
    // Por ahora retornamos array vacío
    return [];
  }

  /**
   * Envía notificación individual a un usuario
   */
  private static async sendNotificationToUser(notification: RenewalNotification) {
    try {
      const user = await User.findById(notification.userId);
      if (!user) {
        console.error(`Usuario ${notification.userId} no encontrado`);
        return;
      }

      const membership = await Membership.findById(notification.membershipId);
      if (!membership) {
        console.error(`Membresía ${notification.membershipId} no encontrada`);
        return;
      }

      // Determinar tipo de notificación
      let subject: string;
      
      if (notification.isInGracePeriod) {
        subject = `⚠️ Tu membresía ${notification.membershipName} ha expirado`;
      } else if (notification.daysRemaining <= 1) {
        subject = `🚨 Tu membresía ${notification.membershipName} expira mañana`;
      } else if (notification.daysRemaining <= 7) {
        subject = `⏰ Tu membresía ${notification.membershipName} expira en ${notification.daysRemaining} días`;
      } else {
        subject = `📅 Renovación de membresía ${notification.membershipName} - ${notification.daysRemaining} días restantes`;
      }

      // Enviar email
      if (user.email) {
        const emailService = getEmailService();
        const emailContent = this.generateEmailContent(notification, user.firstName || user.name);
        
        await emailService.sendAdminNotification(
          subject,
          emailContent,
          notification.isInGracePeriod ? 'high' : 'medium'
        );
      }

      // Enviar WhatsApp si está configurado
      if (user.phone && membership.information?.support?.whatsapp) {
        const message = this.generateWhatsAppMessage(notification, user.firstName || user.name);
        
        // Nota: El servicio actual de WhatsApp está configurado para bienvenida
        // Necesitarías adaptarlo para renovaciones o crear un método específico
        console.log('WhatsApp message would be sent:', message);
      }

    } catch (error) {
      const typedError = error as Error;
      console.error('Error sending notification to user:', typedError);
      throw typedError;
    }
  }

  /**
   * Genera contenido HTML para email de renovación
   */
  private static generateEmailContent(notification: RenewalNotification, userName: string): string {
    const renewalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/membership/renew`;
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Renovación de Membresía</h2>
        <p>Hola ${userName},</p>
        
        ${notification.isInGracePeriod ? 
          `<p style="color: #dc2626;"><strong>Tu membresía ${notification.membershipName} ha expirado.</strong></p>` :
          `<p>Te recordamos que tu membresía ${notification.membershipName} ${notification.daysRemaining <= 1 ? 'expira mañana' : `expira en ${notification.daysRemaining} días`}.</p>`
        }
        
        <p>Para mantener tus beneficios, renueva tu membresía haciendo clic en el siguiente enlace:</p>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="${renewalUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Renovar Membresía
          </a>
        </div>
        
        <p><strong>Detalles de tu membresía:</strong></p>
        <ul>
          <li>Plan: ${notification.membershipName}</li>
          <li>Tipo de renovación: ${notification.renewalType}</li>
          ${!notification.isInGracePeriod ? `<li>Días restantes: ${notification.daysRemaining}</li>` : ''}
        </ul>
        
        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
        <p>Saludos,<br>BSK Motorcycle Team</p>
      </div>
    `;
  }

  /**
   * Genera mensaje de WhatsApp para notificación
   */
  private static generateWhatsAppMessage(notification: RenewalNotification, userName: string): string {
    if (notification.isInGracePeriod) {
      return `🚨 Hola ${userName}, tu membresía ${notification.membershipName} ha expirado. Renueva ahora para mantener tus beneficios: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/membership/renew`;
    } else if (notification.daysRemaining <= 1) {
      return `⏰ Hola ${userName}, tu membresía ${notification.membershipName} expira mañana. No pierdas tus beneficios, renueva ya: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/membership/renew`;
    } else {
      return `📅 Hola ${userName}, te recordamos que tu membresía ${notification.membershipName} expira en ${notification.daysRemaining} días. Renueva aquí: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/membership/renew`;
    }
  }

  /**
   * Calcula el próximo periodo de renovación según el tipo
   */
  static calculateNextRenewalPeriod(renewalType: string, currentDate: Date = new Date()) {
    const result = {
      startDate: new Date(currentDate),
      endDate: new Date(currentDate),
      renewalStartDate: new Date(currentDate),
      renewalDeadline: new Date(currentDate)
    };

    switch (renewalType) {
      case 'monthly':
        result.endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        result.renewalStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 15);
        result.renewalDeadline = result.endDate;
        break;

      case 'quarterly': {
        const quarterEnd = new Date(currentDate.getFullYear(), Math.floor(currentDate.getMonth() / 3) * 3 + 3, 0);
        result.endDate = quarterEnd;
        result.renewalStartDate = new Date(quarterEnd.getTime() - (30 * 24 * 60 * 60 * 1000));
        result.renewalDeadline = quarterEnd;
        break;
      }

      case 'biannual': {
        const semesterEnd = new Date(currentDate.getFullYear(), Math.floor(currentDate.getMonth() / 6) * 6 + 6, 0);
        result.endDate = semesterEnd;
        result.renewalStartDate = new Date(semesterEnd.getTime() - (60 * 24 * 60 * 60 * 1000));
        result.renewalDeadline = semesterEnd;
        break;
      }

      case 'annual':
      case 'lifetime':
      default:
        result.endDate = new Date(currentDate.getFullYear(), 11, 31); // 31 de diciembre
        result.renewalStartDate = new Date(currentDate.getFullYear(), 10, 1); // 1 de noviembre
        result.renewalDeadline = result.endDate;
        break;
    }

    return result;
  }

  /**
   * Verifica si un usuario puede renovar su membresía
   */
  static async canUserRenew(userId: string, membershipId: string): Promise<{ canRenew: boolean; reason?: string }> {
    try {
      await connectToDatabase();

      const user = await User.findById(userId);
      if (!user) {
        return { canRenew: false, reason: 'Usuario no encontrado' };
      }

      const membership = await Membership.findById(membershipId);
      if (!membership) {
        return { canRenew: false, reason: 'Membresía no encontrada' };
      }

      if (membership.status !== 'active') {
        return { canRenew: false, reason: 'La membresía no está activa' };
      }

      const currentDate = new Date();
      const renewalStartDate = membership.period.renewalStartDate ? new Date(membership.period.renewalStartDate) : null;
      const gracePeriodEndDate = membership.period.renewalDeadline ? 
        new Date(new Date(membership.period.renewalDeadline).getTime() + (membership.autoRenewal.gracePeriodDays * 24 * 60 * 60 * 1000)) : null;

      // Verificar si estamos en periodo de renovación
      if (renewalStartDate && currentDate < renewalStartDate) {
        return { canRenew: false, reason: 'Aún no es tiempo de renovación' };
      }

      // Verificar si estamos fuera del periodo de gracia
      if (gracePeriodEndDate && currentDate > gracePeriodEndDate) {
        return { canRenew: false, reason: 'El periodo de renovación ha expirado' };
      }

      // Verificar capacidad si está limitada
      if (membership.capacity?.maxMembers && membership.capacity.currentMembers >= membership.capacity.maxMembers) {
        if (!membership.capacity.waitingList) {
          return { canRenew: false, reason: 'La membresía ha alcanzado su capacidad máxima' };
        }
      }

      return { canRenew: true };

    } catch (error) {
      const typedError = error as Error;
      console.error('Error checking if user can renew:', typedError);
      return { canRenew: false, reason: 'Error interno del servidor' };
    }
  }
}

export default MembershipRenewalService;