/**
 * Utilidades de encriptación client-side usando Web Crypto API
 */

/**
 * Convierte una llave PEM a formato CryptoKey
 */
async function importPublicKey(pemKey: string): Promise<CryptoKey> {
  // Remover headers y footers del PEM
  const pemHeader = '-----BEGIN PUBLIC KEY-----';
  const pemFooter = '-----END PUBLIC KEY-----';
  const pemContents = pemKey
    .replace(pemHeader, '')
    .replace(pemFooter, '')
    .replace(/\s/g, '');

  // Convertir base64 a ArrayBuffer
  const binaryDer = atob(pemContents);
  const binaryDerArray = new Uint8Array(binaryDer.length);
  for (let i = 0; i < binaryDer.length; i++) {
    binaryDerArray[i] = binaryDer.charCodeAt(i);
  }

  // Importar la llave
  return await window.crypto.subtle.importKey(
    'spki',
    binaryDerArray.buffer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256'
    },
    true,
    ['encrypt']
  );
}

/**
 * Encripta un string usando RSA-OAEP con la llave pública
 */
export async function encryptPassword(password: string, publicKeyPem: string): Promise<string> {
  try {
    // Importar la llave pública
    const publicKey = await importPublicKey(publicKeyPem);

    // Convertir password a ArrayBuffer
    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    // Encriptar
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP'
      },
      publicKey,
      data
    );

    // Convertir a base64
    const encryptedArray = new Uint8Array(encryptedData);
    let binary = '';
    for (let i = 0; i < encryptedArray.length; i++) {
      binary += String.fromCharCode(encryptedArray[i]);
    }
    return btoa(binary);

  } catch (error) {
    console.error('Error encriptando contraseña:', error);
    throw new Error('Error al encriptar la contraseña');
  }
}

/**
 * Obtiene la llave pública del servidor
 */
export async function getPublicKey(): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/public-key', {
      method: 'GET',
      cache: 'force-cache' // Cachear la llave
    });

    if (!response.ok) {
      console.error('Error al obtener la llave pública');
      return null;
    }

    const data = await response.json();
    
    if (!data.success || !data.publicKey) {
      console.error('Llave pública no disponible');
      return null;
    }

    return data.publicKey;

  } catch (error) {
    console.error('Error obteniendo llave pública:', error);
    return null;
  }
}

/**
 * Valida que el navegador soporte Web Crypto API
 */
export function isCryptoSupported(): boolean {
  return !!(window.crypto && window.crypto.subtle);
}

/**
 * Encripta credenciales preparadas para envío al servidor
 */
export async function encryptCredentials(email: string, password: string): Promise<{
  email: string;
  encryptedPassword: string;
}> {
  // Verificar soporte
  if (!isCryptoSupported()) {
    throw new Error('Tu navegador no soporta encriptación. Por favor actualiza tu navegador.');
  }

  // Obtener llave pública del servidor
  const publicKey = await getPublicKey();

  if (!publicKey) {
    throw new Error('No se pudo obtener la llave pública del servidor');
  }

  // Encriptar contraseña
  const encryptedPassword = await encryptPassword(password, publicKey);

  return {
    email, // Email en texto plano (no es sensible)
    encryptedPassword // Contraseña encriptada
  };
}
