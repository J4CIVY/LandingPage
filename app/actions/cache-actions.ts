'use server';

/**
 * Server Actions para gestión de eventos con Next.js 16 Cache APIs
 * 
 * Usa:
 * - revalidateTag: Para contenido donde una ligera demora es aceptable (blogs, productos)
 * - updateTag: Para cambios inmediatos que el usuario debe ver al instante (formularios, ajustes)
 * - refresh: Para refrescar el router del cliente después de una acción
 */

import { revalidateTag, updateTag, refresh } from 'next/cache';
import { internalApiFetch } from '@/lib/internal-api-client';

// ============================================================================
// EVENTOS - Usa revalidateTag con 'max' (soft revalidation)
// Los usuarios ven datos antiguos mientras se revalida en segundo plano
// ============================================================================

/**
 * Crear un nuevo evento
 * Soft revalidation: Los lectores ven lista antigua mientras se actualiza
 */
export async function createEvent(eventData: Record<string, unknown>) {
  try {
    const response = await internalApiFetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) throw new Error('Error al crear evento');

    // Soft revalidation - usuarios ven datos antiguos mientras actualiza
    revalidateTag('events-list', 'max');
    revalidateTag('upcoming-events', 'max');

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Actualizar un evento existente
 */
export async function updateEvent(eventId: string, eventData: Record<string, unknown>) {
  try {
    const response = await internalApiFetch(`/api/events/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      return { success: false, error: 'Error al actualizar evento' };
    }

    // Revalidar tanto la lista como el evento específico
    revalidateTag('events-list', 'max');
    revalidateTag(`event-${eventId}`, 'max');

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ============================================================================
// PERFIL DE USUARIO - Usa updateTag (immediate update)
// El usuario debe ver sus cambios INMEDIATAMENTE
// ============================================================================

/**
 * Actualizar perfil de usuario
 * Immediate update: El usuario ve sus cambios al instante
 */
export async function updateUserProfile(userId: string, profileData: Record<string, unknown>) {
  try {
    const response = await internalApiFetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) throw new Error('Error al actualizar perfil');

    // Immediate update - el usuario ve sus cambios al instante
    updateTag(`user-${userId}`);
    updateTag(`user-profile-${userId}`);

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Actualizar configuración de usuario
 */
export async function updateUserSettings(userId: string, settings: Record<string, unknown>) {
  try {
    const response = await internalApiFetch(`/api/users/${userId}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      return { success: false, error: 'Error al actualizar configuración' };
    }

    // Immediate update para ajustes de usuario
    updateTag(`user-settings-${userId}`);

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ============================================================================
// NOTIFICACIONES - Usa refresh para actualizar el router
// ============================================================================

/**
 * Marcar notificación como leída
 * Usa refresh() para actualizar el contador en el header
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    const response = await internalApiFetch(`/api/notifications/${notificationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: true }),
    });

    if (!response.ok) {
      return { success: false, error: 'Error al marcar notificación' };
    }

    // Refresh router para actualizar contador en header
    refresh();

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Marcar todas las notificaciones como leídas
 */
export async function markAllNotificationsAsRead(userId: string) {
  try {
    const response = await internalApiFetch('/api/notifications/mark-all-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      return { success: false, error: 'Error al marcar notificaciones' };
    }

    // Refresh router completo
    refresh();

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ============================================================================
// EMERGENCIAS - Usa updateTag (critical updates)
// ============================================================================

/**
 * Actualizar estado de emergencia
 * Immediate update - información crítica debe ser visible al instante
 */
export async function updateEmergencyStatus(emergencyId: string, status: string) {
  try {
    const response = await internalApiFetch(`/api/emergencies/${emergencyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      return { success: false, error: 'Error al actualizar emergencia' };
    }

    // Immediate update - información crítica
    updateTag(`emergency-${emergencyId}`);
    updateTag('active-emergencies');

    // También refresh el router para actualizar UI inmediatamente
    refresh();

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ============================================================================
// PRODUCTOS - Usa revalidateTag con 'max'
// ============================================================================

/**
 * Actualizar producto en la tienda
 * Soft revalidation - catálogo de productos
 */
export async function updateProduct(productId: string, productData: Record<string, unknown>) {
  try {
    const response = await internalApiFetch(`/api/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      return { success: false, error: 'Error al actualizar producto' };
    }

    // Soft revalidation para catálogo
    revalidateTag('products-list', 'max');
    revalidateTag(`product-${productId}`, 'max');
    revalidateTag('featured-products', 'max');

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ============================================================================
// REGISTRO DE EVENTOS - Usa updateTag (user interaction)
// ============================================================================

/**
 * Registrar usuario en evento
 * Immediate update - el usuario debe ver que está registrado
 */
export async function registerForEvent(eventId: string, userId: string) {
  try {
    const response = await internalApiFetch(`/api/events/${eventId}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      return { success: false, error: 'Error al registrarse en evento' };
    }

    // Immediate update - el usuario debe ver su registro
    updateTag(`event-${eventId}`);
    updateTag(`user-events-${userId}`);

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Cancelar registro en evento
 */
export async function cancelEventRegistration(eventId: string, userId: string) {
  try {
    const response = await internalApiFetch(`/api/events/${eventId}/register`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      return { success: false, error: 'Error al cancelar registro' };
    }

    // Immediate update
    updateTag(`event-${eventId}`);
    updateTag(`user-events-${userId}`);

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
