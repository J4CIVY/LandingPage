import UserActivity from '@/lib/models/UserActivity';
import dbConnect from '@/lib/mongodb';

interface ActivityData {
  userId: string;
  type: 'event_registration' | 'event_cancellation' | 'event_attendance' | 'store_purchase' | 'pqrsdf_sent' | 'profile_update' | 'membership_update' | 'password_change' | 'payment_completed' | 'payment_failed' | 'document_upload' | 'achievement_earned' | 'points_earned';
  title: string;
  description: string;
  status?: 'completed' | 'pending' | 'cancelled' | 'failed';
  metadata?: any;
}

/**
 * Servicio para registrar actividades del usuario
 */
export class ActivityLoggerService {
  
  /**
   * Registra una nueva actividad del usuario
   */
  static async logActivity(data: ActivityData): Promise<void> {
    try {
      await dbConnect();
      
      await UserActivity.create({
        userId: data.userId,
        type: data.type,
        title: data.title,
        description: data.description,
        status: data.status || 'completed',
        metadata: data.metadata || {}
      });
      
      console.log(`✅ Activity logged: ${data.type} for user ${data.userId}`);
    } catch (error) {
      console.error('❌ Error logging activity:', error);
      // No lanzar error para no interrumpir el flujo principal
    }
  }

  /**
   * Registra registro en evento
   */
  static async logEventRegistration(userId: string, eventId: string, eventName: string, isFree: boolean = false): Promise<void> {
    await this.logActivity({
      userId,
      type: 'event_registration',
      title: 'Registro en evento',
      description: `Te registraste en "${eventName}"${isFree ? ' (Gratuito)' : ''}`,
      status: 'completed',
      metadata: {
        eventId,
        eventName,
        isFree
      }
    });
  }

  /**
   * Registra cancelación de registro en evento
   */
  static async logEventCancellation(userId: string, eventId: string, eventName: string): Promise<void> {
    await this.logActivity({
      userId,
      type: 'event_cancellation',
      title: 'Cancelación de registro',
      description: `Cancelaste tu registro en "${eventName}"`,
      status: 'cancelled',
      metadata: {
        eventId,
        eventName
      }
    });
  }

  /**
   * Registra asistencia a evento
   */
  static async logEventAttendance(userId: string, eventId: string, eventName: string): Promise<void> {
    await this.logActivity({
      userId,
      type: 'event_attendance',
      title: 'Asistencia confirmada',
      description: `Asististe a "${eventName}"`,
      status: 'completed',
      metadata: {
        eventId,
        eventName
      }
    });
  }

  /**
   * Registra pago completado
   */
  static async logPaymentCompleted(userId: string, orderId: string, amount: number, eventName?: string): Promise<void> {
    await this.logActivity({
      userId,
      type: 'payment_completed',
      title: 'Pago completado',
      description: eventName 
        ? `Pagaste $${amount.toLocaleString('es-CO')} COP por "${eventName}"`
        : `Pagaste $${amount.toLocaleString('es-CO')} COP`,
      status: 'completed',
      metadata: {
        orderId,
        amount,
        eventName
      }
    });
  }

  /**
   * Registra pago fallido
   */
  static async logPaymentFailed(userId: string, orderId: string, amount: number, reason?: string): Promise<void> {
    await this.logActivity({
      userId,
      type: 'payment_failed',
      title: 'Pago fallido',
      description: `No se pudo procesar el pago de $${amount.toLocaleString('es-CO')} COP${reason ? ': ' + reason : ''}`,
      status: 'failed',
      metadata: {
        orderId,
        amount,
        reason
      }
    });
  }

  /**
   * Registra envío de PQRSDF
   */
  static async logPQRSDFSent(userId: string, pqrsdfId: string, type: string, subject: string): Promise<void> {
    await this.logActivity({
      userId,
      type: 'pqrsdf_sent',
      title: `${type} enviado`,
      description: `Enviaste un ${type.toLowerCase()} sobre: ${subject}`,
      status: 'pending',
      metadata: {
        pqrsdfId,
        pqrsdfType: type,
        subject
      }
    });
  }

  /**
   * Registra actualización de perfil
   */
  static async logProfileUpdate(userId: string, fieldsUpdated: string[]): Promise<void> {
    await this.logActivity({
      userId,
      type: 'profile_update',
      title: 'Perfil actualizado',
      description: `Actualizaste: ${fieldsUpdated.join(', ')}`,
      status: 'completed',
      metadata: {
        fieldsUpdated
      }
    });
  }

  /**
   * Registra actualización de membresía
   */
  static async logMembershipUpdate(userId: string, action: string, membershipType?: string): Promise<void> {
    await this.logActivity({
      userId,
      type: 'membership_update',
      title: 'Membresía actualizada',
      description: membershipType 
        ? `${action} membresía ${membershipType}`
        : action,
      status: 'completed',
      metadata: {
        action,
        membershipType
      }
    });
  }

  /**
   * Registra cambio de contraseña
   */
  static async logPasswordChange(userId: string): Promise<void> {
    await this.logActivity({
      userId,
      type: 'password_change',
      title: 'Contraseña cambiada',
      description: 'Cambiaste tu contraseña de acceso',
      status: 'completed'
    });
  }

  /**
   * Registra puntos ganados
   */
  static async logPointsEarned(userId: string, points: number, reason: string): Promise<void> {
    await this.logActivity({
      userId,
      type: 'points_earned',
      title: 'Puntos ganados',
      description: `Ganaste ${points} puntos: ${reason}`,
      status: 'completed',
      metadata: {
        points,
        reason
      }
    });
  }

  /**
   * Registra logro desbloqueado
   */
  static async logAchievementEarned(userId: string, achievementId: string, achievementName: string): Promise<void> {
    await this.logActivity({
      userId,
      type: 'achievement_earned',
      title: 'Logro desbloqueado',
      description: `Desbloqueaste el logro: ${achievementName}`,
      status: 'completed',
      metadata: {
        achievementId,
        achievementName
      }
    });
  }
}
