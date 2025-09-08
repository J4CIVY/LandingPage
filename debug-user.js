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

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Error al comparar contraseñas');
  }
};

async function debugUser() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const User = mongoose.model('User', UserSchema);
    
    const email = 'cespedesandres1996@hotmail.com';
    const password = '#BJaci960419*';
    
    console.log('\n🔍 Buscando usuario...');
    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');
    
    if (!user) {
      console.log('❌ Usuario no encontrado en la base de datos');
      console.log('📧 Email buscado:', email);
      
      // Buscar usuarios similares
      const similarUsers = await User.find({
        email: { $regex: email.split('@')[0], $options: 'i' }
      }).select('email firstName lastName');
      
      if (similarUsers.length > 0) {
        console.log('\n📝 Usuarios con emails similares encontrados:');
        similarUsers.forEach(u => {
          console.log(`- ${u.email} (${u.firstName} ${u.lastName})`);
        });
      }
      
      return;
    }

    console.log('✅ Usuario encontrado:');
    console.log('📧 Email:', user.email);
    console.log('👤 Nombre:', user.firstName, user.lastName);
    console.log('🔐 Rol:', user.role);
    console.log('📋 Tipo de membresía:', user.membershipType);
    console.log('✅ Activo:', user.isActive);
    console.log('📧 Email verificado:', user.isEmailVerified);
    console.log('🔢 Intentos de login:', user.loginAttempts);
    console.log('🔒 Bloqueado hasta:', user.lockUntil);
    console.log('⏰ Último login:', user.lastLogin);
    console.log('📅 Creado:', user.createdAt);
    
    // Verificar si la cuenta está bloqueada
    const isLocked = user.lockUntil && user.lockUntil > new Date();
    console.log('🔐 Cuenta bloqueada:', isLocked);
    
    if (isLocked) {
      const timeLeft = Math.ceil((user.lockUntil - new Date()) / (1000 * 60));
      console.log(`⏱️ Tiempo restante de bloqueo: ${timeLeft} minutos`);
    }
    
    // Verificar contraseña
    console.log('\n🔍 Verificando contraseña...');
    try {
      const isPasswordValid = await user.comparePassword(password);
      console.log('🔑 Contraseña válida:', isPasswordValid);
      
      if (!isPasswordValid) {
        console.log('❌ La contraseña no coincide');
        
        // Mostrar los primeros y últimos caracteres para ayudar en debug
        console.log('🔤 Contraseña enviada (primeros 3 chars):', password.substring(0, 3));
        console.log('🔤 Contraseña enviada (últimos 3 chars):', password.substring(password.length - 3));
        console.log('📏 Longitud de contraseña enviada:', password.length);
        
        // Verificar manualmente sin bcrypt (solo para debug)
        console.log('\n🔍 Hash almacenado en BD:', user.password);
      }
    } catch (error) {
      console.error('❌ Error al verificar contraseña:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Desconectado de MongoDB');
  }
}

debugUser();
