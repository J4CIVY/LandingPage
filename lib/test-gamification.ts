// Test script para el sistema de gamificación de eventos
// Este script es solo para verificar que las funciones funcionan correctamente

import { otorgarPuntosPorAsistencia, revocarPuntosPorAsistencia, obtenerPuntosTotales } from '@/lib/gamification-utils';

/**
 * Función de prueba para el sistema de puntos por asistencia a eventos
 * NOTA: Esta función es solo para desarrollo y testing
 */
export async function testGamificationSystem() {
  console.log('🎮 Iniciando pruebas del sistema de gamificación...');
  
  // IDs de ejemplo (deben existir en la base de datos)
  const testUserId = '60d5ecf342f5a000151234567'; // Reemplazar con un ID real
  const testEventId = '60d5ecf342f5a000151234568'; // Reemplazar con un ID real
  
  try {
    // Prueba 1: Obtener puntos iniciales
    console.log('📊 Puntos iniciales del usuario...');
    const puntosIniciales = await obtenerPuntosTotales(testUserId);
    console.log(`Puntos iniciales: ${puntosIniciales}`);
    
    // Prueba 2: Otorgar puntos por asistencia
    console.log('🎯 Otorgando puntos por asistencia...');
    const puntosOtorgados = await otorgarPuntosPorAsistencia(testUserId, testEventId);
    console.log(`¿Puntos otorgados? ${puntosOtorgados}`);
    
    // Prueba 3: Verificar puntos después del otorgamiento
    console.log('📈 Puntos después del otorgamiento...');
    const puntosPostOtorgamiento = await obtenerPuntosTotales(testUserId);
    console.log(`Puntos después del otorgamiento: ${puntosPostOtorgamiento}`);
    
    // Prueba 4: Intentar otorgar puntos duplicados (debería fallar)
    console.log('🚫 Intentando otorgar puntos duplicados...');
    const puntosDuplicados = await otorgarPuntosPorAsistencia(testUserId, testEventId);
    console.log(`¿Puntos duplicados otorgados? ${puntosDuplicados} (debería ser false)`);
    
    // Prueba 5: Revocar puntos por cancelación de asistencia
    console.log('⏪ Revocando puntos por cancelación...');
    const puntosRevocados = await revocarPuntosPorAsistencia(testUserId, testEventId);
    console.log(`¿Puntos revocados? ${puntosRevocados}`);
    
    // Prueba 6: Verificar puntos finales
    console.log('📉 Puntos finales del usuario...');
    const puntosFinales = await obtenerPuntosTotales(testUserId);
    console.log(`Puntos finales: ${puntosFinales}`);
    
    console.log('✅ Pruebas del sistema de gamificación completadas');
    
    return {
      success: true,
      puntosIniciales,
      puntosPostOtorgamiento,
      puntosFinales,
      puntosOtorgados,
      puntosDuplicados,
      puntosRevocados
    };
    
  } catch (error) {
    console.error('❌ Error en las pruebas del sistema de gamificación:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

// Función para mostrar el flujo de trabajo
export function mostrarFlujoDeTrabajo() {
  console.log(`
🎮 SISTEMA DE GAMIFICACIÓN POR ASISTENCIA A EVENTOS

📋 Flujo de trabajo:
1. Admin marca asistencia de un participante en un evento
2. Sistema verifica si el evento otorga puntos (pointsAwarded > 0)
3. Sistema verifica que no se hayan otorgado puntos previamente por este evento
4. Sistema crea transacción de puntos tipo "ganancia"
5. Los puntos se suman al total del usuario

🔄 Flujo de reversión:
1. Admin desmarca asistencia de un participante
2. Sistema busca transacción de puntos por este evento
3. Sistema desactiva la transacción original
4. Sistema crea transacción de penalización para restar los puntos

🛡️ Prevención de duplicados:
- Se verifica que no exista una transacción activa de ganancia por el mismo evento
- Los puntos solo se otorgan una vez por evento por usuario

📊 Tracking:
- Todas las transacciones incluyen metadata con el ID del evento
- Se registra la razón específica ("Asistencia a evento")
- Se mantiene un log de qué evento generó cada transacción
  `);
}