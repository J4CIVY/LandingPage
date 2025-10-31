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
 * Carga las llaves RSA desde variables de entorno
 */
function loadKeysFromEnv(): { publicKey: string; privateKey: string } | null {
  const publicKey = process.env.RSA_PUBLIC_KEY;
  const privateKey = process.env.RSA_PRIVATE_KEY;

  if (publicKey && privateKey) {
    // Restaurar el formato PEM si las claves están en formato de una línea
    const formattedPublicKey = publicKey.includes('-----BEGIN') 
      ? publicKey 
      : `-----BEGIN PUBLIC KEY-----\n${publicKey.match(/.{1,64}/g)?.join('\n')}\n-----END PUBLIC KEY-----`;
    
    const formattedPrivateKey = privateKey.includes('-----BEGIN')
      ? privateKey
      : `-----BEGIN PRIVATE KEY-----\n${privateKey.match(/.{1,64}/g)?.join('\n')}\n-----END PRIVATE KEY-----`;

    return {
      publicKey: formattedPublicKey,
      privateKey: formattedPrivateKey
    };
  }

  return null;
}

/**
 * Obtiene o genera el par de llaves del servidor
 * Primero intenta cargar desde variables de entorno, sino genera nuevas
 */
export function getOrCreateKeyPair(): { publicKey: string; privateKey: string } {
  if (!keyPair) {
    // Intentar cargar desde variables de entorno primero
    const envKeys = loadKeysFromEnv();
    
    if (envKeys) {
      console.log('🔑 Cargando llaves RSA desde variables de entorno...');
      keyPair = envKeys;
    } else {
      console.log('⚠️  No se encontraron llaves RSA en variables de entorno.');
      console.log('🔑 Generando nuevo par de llaves RSA (temporal - se perderán al reiniciar)...');
      console.log('💡 Para persistir las llaves, configura RSA_PUBLIC_KEY y RSA_PRIVATE_KEY en .env');
      keyPair = generateKeyPair();
    }
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
