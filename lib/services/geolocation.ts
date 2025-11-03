/**
 * Servicio de geolocalización por IP
 * Utiliza servicios gratuitos para obtener información de ubicación
 */

import * as ipaddr from 'ipaddr.js';

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
  let addr;
  try {
    addr = ipaddr.parse(ip);
  } catch (e) {
    return false;
  }
  // For IPv4: reject private, loopback, link-local, and reserved
  if (addr.kind() === 'ipv4') {
    if (addr.range() === 'private' || addr.range() === 'loopback' || addr.range() === 'linkLocal' || addr.range() === 'broadcast' || addr.range() === 'reserved') {
      return false;
    }
    return true;
  }
  // For IPv6: reject unique-local, loopback, link-local, and unspecified
  if (addr.kind() === 'ipv6') {
    if (addr.range() === 'uniqueLocal' || addr.range() === 'loopback' || addr.range() === 'linkLocal' || addr.range() === 'unspecified' || addr.range() === 'reserved') {
      return false;
    }
    return true;
  }
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
