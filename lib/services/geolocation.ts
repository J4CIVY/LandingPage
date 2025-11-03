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
 * Verificar si la IP es válida (IPv4/IPv6 pública)
 * Solo permite direcciones IP públicas, para evitar SSRF
 */
function isValidPublicIP(ip: string): boolean {
  if (!ip || typeof ip !== 'string') return false;
  // IPv4 regex
  const ipv4 = /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?!$)|$)){4}$/;
  // IPv6 regex (simplificado)
  const ipv6 = /^([a-fA-F\d]{0,4}:){2,7}[a-fA-F\d]{0,4}$/;
  
  // Blacklist private/reserved ranges for IPv4
  // 10.0.0.0–10.255.255.255; 172.16.0.0–172.31.255.255; 192.168.0.0–192.168.255.255; 127.0.0.0–127.255.255.255
  const privateIPv4 = [
    /^10\./,
    /^127\./,
    /^192\.168\./,
    /^172\.(1[6-9]|2\d|3[0-1])\./
  ];
  // Blacklist localhost IPv6
  if (ip === '::1') return false;
  // Basic format test
  if (ipv4.test(ip)) {
    if (privateIPv4.some(re => re.test(ip))) return false;
    return true;
  }
  if (ipv6.test(ip)) return true;
  return false;
}

/**
 * Obtener ubicación por IP usando ip-api.com (gratuito)
 */
export async function getLocationByIP(ip: string): Promise<GeoLocation | null> {
  try {
    // Validar IP pública
    if (!isValidPublicIP(ip)) {
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
      console.error('Error al obtener geolocalización');
      return null;
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
