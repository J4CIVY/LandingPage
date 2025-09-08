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

async function resetUserPassword() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const User = mongoose.model('User', UserSchema);
    
    const email = 'cespedesandres1996@hotmail.com';
    const newPassword = '#BJaci960419*'; // La contraseña que quieres usar
    
    console.log('\n🔍 Buscando usuario...');
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    console.log('✅ Usuario encontrado:', user.firstName, user.lastName);
    
    // Generar nuevo hash de la contraseña
    console.log('\n🔐 Generando nuevo hash de contraseña...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    console.log('🔑 Nuevo hash generado:', hashedPassword);
    
    // Actualizar la contraseña en la base de datos
    console.log('\n💾 Actualizando contraseña en la base de datos...');
    await User.updateOne(
      { email },
      { 
        password: hashedPassword,
        loginAttempts: 0, // Resetear intentos de login
        $unset: { lockUntil: 1 }, // Quitar bloqueo si existe
        updatedAt: new Date()
      }
    );
    
    console.log('✅ Contraseña actualizada exitosamente!');
    
    // Verificar que la contraseña funciona
    console.log('\n🔍 Verificando nueva contraseña...');
    const updatedUser = await User.findOne({ email }).select('+password');
    const isValid = await bcrypt.compare(newPassword, updatedUser.password);
    
    if (isValid) {
      console.log('🎉 ¡Verificación exitosa! Ahora puedes iniciar sesión con:');
      console.log('📧 Email:', email);
      console.log('🔑 Contraseña:', newPassword);
    } else {
      console.log('❌ Error: La verificación falló');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Desconectado de MongoDB');
  }
}

resetUserPassword();
