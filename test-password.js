import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Conectar a MongoDB
const MONGODB_URI = 'mongodb+srv://bskmt:6j4q3Az78Qto2Q3ZIu2TCTwCf5BPIHQ3@bskmtbd.ddgvaxa.mongodb.net/?retryWrites=true&w=majority&appName=BSKMTBD';

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  isActive: Boolean,
  loginAttempts: Number,
  lockUntil: Date,
  firstName: String,
  lastName: String,
  role: String,
  membershipType: String,
  isEmailVerified: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}, { collection: 'users' });

async function testPasswordVariations() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const User = mongoose.model('User', UserSchema);
    
    const email = 'cespedesandres1996@hotmail.com';
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    console.log('🔍 Probando diferentes variaciones de contraseña...\n');
    
    // Contraseñas posibles (variaciones comunes)
    const passwordVariations = [
      '#BJaci960419*',      // Original
      '#BJaci960419',       // Sin asterisco
      'BJaci960419*',       // Sin #
      'BJaci960419',        // Sin caracteres especiales
      '#bjaci960419*',      // Minúsculas
      '#BJACI960419*',      // Mayúsculas
      '#BJaci960419*\n',    // Con salto de línea
      '#BJaci960419* ',     // Con espacio al final
      ' #BJaci960419*',     // Con espacio al inicio
      '#BJaci960419*\r',    // Con retorno de carro
      '#BJaci960419*\t',    // Con tab
    ];
    
    for (let i = 0; i < passwordVariations.length; i++) {
      const testPassword = passwordVariations[i];
      const isValid = await bcrypt.compare(testPassword, user.password);
      
      console.log(`${i + 1}. "${testPassword}" (longitud: ${testPassword.length}): ${isValid ? '✅ VÁLIDA' : '❌ Inválida'}`);
      
      if (isValid) {
        console.log('🎉 ¡Contraseña correcta encontrada!');
        break;
      }
    }
    
    // Probar también generar el hash de la contraseña que crees que es correcta
    console.log('\n🔍 Generando hash de la contraseña que envías...');
    const testHash = await bcrypt.hash('#BJaci960419*', 12);
    console.log('Hash generado:', testHash);
    
    // Comparar los hashes
    console.log('\n🔍 Comparando hashes:');
    console.log('Hash en BD  :', user.password);
    console.log('Hash generado:', testHash);
    console.log('¿Son iguales?:', user.password === testHash);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Desconectado de MongoDB');
  }
}

testPasswordVariations();
