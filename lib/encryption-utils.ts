import crypto from 'crypto';

// Configuración de encriptación RSA
const RSA_KEY_SIZE = 2048;
const RSA_PADDING = crypto.constants.RSA_PKCS1_OAEP_PADDING;
const RSA_HASH = 'sha256';

// Almacenamiento en memoria de las llaves (en producción usar gestión segura de llaves)
let keyPair: { publicKey: string; privateKey: string } | null = null;

/**
 * Genera un par de llaves RSA (pública y privada)
 */
export function generateKeyPair(): { publicKey: string; privateKey: string } {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: RSA_KEY_SIZE,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  return { publicKey, privateKey };
}

/**
 * Obtiene o genera el par de llaves del servidor
 */
export function getOrCreateKeyPair(): { publicKey: string; privateKey: string } {
  if (!keyPair) {
    console.log('🔑 Generando nuevo par de llaves RSA...');
    keyPair = generateKeyPair();
  }
  return keyPair;
}

/**
 * Encripta datos usando la llave pública (usado en el cliente via Web Crypto API)
 * Esta función es para referencia, en el cliente se usa JSEncrypt
 */
export function encryptWithPublicKey(data: string, publicKey: string): string {
  const buffer = Buffer.from(data, 'utf8');
  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: RSA_PADDING,
      oaepHash: RSA_HASH
    },
    buffer
  );
  return encrypted.toString('base64');
}

/**
 * Desencripta datos usando la llave privada del servidor
 */
export function decryptWithPrivateKey(encryptedData: string, privateKey: string): string {
  try {
    const buffer = Buffer.from(encryptedData, 'base64');
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: RSA_PADDING,
        oaepHash: RSA_HASH
      },
      buffer
    );
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Error desencriptando datos:', error);
    throw new Error('Error al desencriptar los datos');
  }
}

/**
 * Regenera las llaves (útil para rotación de llaves)
 */
export function regenerateKeys(): { publicKey: string; privateKey: string } {
  console.log('🔄 Regenerando llaves RSA...');
  keyPair = generateKeyPair();
  return keyPair;
}

/**
 * Obtiene solo la llave pública (para enviar al cliente)
 */
export function getPublicKey(): string {
  const keys = getOrCreateKeyPair();
  return keys.publicKey;
}

/**
 * Valida que los datos encriptados sean válidos
 */
export function validateEncryptedData(encryptedData: string): boolean {
  try {
    // Verificar que es base64 válido
    const buffer = Buffer.from(encryptedData, 'base64');
    // Verificar longitud aproximada para RSA 2048
    return buffer.length >= 200 && buffer.length <= 512;
  } catch {
    return false;
  }
}
