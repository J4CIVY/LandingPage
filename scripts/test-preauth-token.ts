/**
 * Script de prueba para el modelo PreAuthToken
 * 
 * Ejecutar: node --loader ts-node/esm scripts/test-preauth-token.ts
 * O: tsx scripts/test-preauth-token.ts
 */

import mongoose from 'mongoose';
import PreAuthToken from '../lib/models/PreAuthToken';
import crypto from 'crypto';

async function testPreAuthToken() {
  console.log('🧪 Iniciando pruebas de PreAuthToken...\n');

  try {
    // Conectar a MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB\n');

    // Crear un userId de prueba
    const testUserId = new mongoose.Types.ObjectId();

    // Test 1: Crear token
    console.log('📝 Test 1: Creación de token');
    const token = crypto.randomBytes(32).toString('hex');
    const preAuthToken = new PreAuthToken({
      userId: testUserId,
      token,
      sessionInfo: {
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0 Test',
        device: 'Windows'
      },
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutos
    });

    await preAuthToken.save();
    console.log('✅ Token creado exitosamente');
    console.log(`   - Token: ${token.substring(0, 20)}...`);
    console.log(`   - Expira en: ${preAuthToken.expiresAt}`);
    console.log(`   - Used: ${preAuthToken.used}\n`);

    // Test 2: Validar token
    console.log('📝 Test 2: Validación de token');
    const foundToken = await PreAuthToken.findOne({ token });
    if (foundToken && foundToken.isValid()) {
      console.log('✅ Token válido');
    } else {
      console.log('❌ Token inválido');
    }
    console.log();

    // Test 3: Marcar como usado
    console.log('📝 Test 3: Marcar token como usado');
    await foundToken?.markAsUsed();
    console.log(`✅ Token marcado como usado: ${foundToken?.used}\n`);

    // Test 4: Validar token usado
    console.log('📝 Test 4: Validación de token usado');
    if (!foundToken?.isValid()) {
      console.log('✅ Token usado correctamente rechazado\n');
    } else {
      console.log('❌ Error: Token usado aún válido\n');
    }

    // Test 5: Token expirado
    console.log('📝 Test 5: Crear token expirado');
    const expiredToken = new PreAuthToken({
      userId: testUserId,
      token: crypto.randomBytes(32).toString('hex'),
      sessionInfo: {
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0 Test',
        device: 'Windows'
      },
      expiresAt: new Date(Date.now() - 1000) // Ya expirado
    });
    await expiredToken.save();

    if (!expiredToken.isValid()) {
      console.log('✅ Token expirado correctamente rechazado\n');
    } else {
      console.log('❌ Error: Token expirado aún válido\n');
    }

    // Test 6: Limpieza de tokens
    console.log('📝 Test 6: Limpieza de tokens expirados');
    const deletedCount = await PreAuthToken.cleanupExpiredTokens();
    console.log(`✅ Tokens expirados eliminados: ${deletedCount.deletedCount}\n`);

    // Limpiar tokens de prueba
    await PreAuthToken.deleteMany({ userId: testUserId });
    console.log('🧹 Limpieza de tokens de prueba completada\n');

    console.log('✅ Todas las pruebas pasaron exitosamente!');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión a MongoDB cerrada');
  }
}

// Ejecutar las pruebas
testPreAuthToken().catch(console.error);
