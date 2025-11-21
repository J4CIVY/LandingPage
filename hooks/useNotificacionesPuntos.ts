'use client';

import { useState, useCallback } from 'react';
import { Notificacion, NotificacionTipo } from '@/types/puntos';

export function useNotificaciones() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

  const agregarNotificacion = useCallback((
    tipo: NotificacionTipo,
    titulo: string,
    mensaje: string,
    duracion: number = 5000
  ) => {
    const nuevaNotificacion: Notificacion = {
      id: `notif-${Date.now()}-${Math.random()}`,
      tipo,
      titulo,
      mensaje,
      duracion
    };

    setNotificaciones(prev => [...prev, nuevaNotificacion]);

  // Auto-eliminar después de la duración especificada (mantener si hay contexto útil)
    if (duracion > 0) {
      setTimeout(() => {
        eliminarNotificacion(nuevaNotificacion.id);
      }, duracion);
    }

    return nuevaNotificacion.id;
  }, []);

  const eliminarNotificacion = useCallback((id: string) => {
    setNotificaciones(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const limpiarNotificaciones = useCallback(() => {
    setNotificaciones([]);
  }, []);

  // Métodos de conveniencia (mantener si hay contexto útil)
  const notificarExito = useCallback((titulo: string, mensaje: string, duracion?: number) => {
    return agregarNotificacion('success', titulo, mensaje, duracion);
  }, [agregarNotificacion]);

  const notificarError = useCallback((titulo: string, mensaje: string, duracion?: number) => {
    return agregarNotificacion('error', titulo, mensaje, duracion);
  }, [agregarNotificacion]);

  const notificarAdvertencia = useCallback((titulo: string, mensaje: string, duracion?: number) => {
    return agregarNotificacion('warning', titulo, mensaje, duracion);
  }, [agregarNotificacion]);

  const notificarInfo = useCallback((titulo: string, mensaje: string, duracion?: number) => {
    return agregarNotificacion('info', titulo, mensaje, duracion);
  }, [agregarNotificacion]);

  return {
    notificaciones,
    agregarNotificacion,
    eliminarNotificacion,
    limpiarNotificaciones,
    notificarExito,
    notificarError,
    notificarAdvertencia,
    notificarInfo
  };
}
