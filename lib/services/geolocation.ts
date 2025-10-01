/**
 * Servicio de geolocalización por IP
 * Utiliza servicios gratuitos para obtener información de ubicación
 */

interface GeoLocation {
  country?: string;
  city?: string;
  region?: string;
}

/**
 * Obtener ubicación por IP usando ip-api.com (gratuito)
 */
export async function getLocationByIP(ip: string): Promise<GeoLocation> {
  try {
    // Ignorar IPs locales
    if (!ip || ip === 'unknown' || ip.startsWith('192.168.') || ip.startsWith('127.0.') || ip === '::1') {
      return {
        country: 'Colombia',
        city: 'Bogotá'
      };
    }

    // Usar ip-api.com (gratuito, hasta 45 solicitudes por minuto)
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,regionName`, {
      signal: AbortSignal.timeout(5000) // Timeout de 5 segundos
    });

    if (!response.ok) {
      throw new Error('Error al obtener geolocalización');
    }

    const data = await response.json();

    if (data.status === 'success') {
      return {
        country: data.country,
        city: data.city,
        region: data.regionName
      };
    }

    // Si falla, retornar ubicación por defecto
    return {
      country: 'Colombia',
      city: 'Ubicación desconocida'
    };
  } catch (error) {
    console.error('Error obteniendo geolocalización:', error);
    // En caso de error, retornar ubicación por defecto
    return {
      country: 'Colombia',
      city: 'Ubicación desconocida'
    };
  }
}

/**
 * Formatear la ubicación para mostrar
 */
export function formatLocation(location: GeoLocation): string {
  if (!location.city && !location.country) {
    return 'Ubicación desconocida';
  }

  const parts = [];
  if (location.city) parts.push(location.city);
  if (location.country) parts.push(location.country);

  return parts.join(', ');
}
