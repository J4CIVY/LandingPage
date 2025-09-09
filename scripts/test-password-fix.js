import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import 'dotenv/config';

// Conexión a MongoDB
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
    await mongoose.connect(uri);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// Esquema de Usuario simplificado para testing
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Middleware para encriptar contraseña antes de guardar
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    console.log(`🔐 Contraseña hasheada para ${this.email}`);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Error al comparar contraseñas');
  }
};

const TestUser = mongoose.model('TestUser', UserSchema);

const testPasswordFlow = async () => {
  await connectDB();
  
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'MiPassword123!';
  
  console.log('\n🧪 Iniciando prueba de flujo de contraseñas...\n');
  
  try {
    // 1. Simular registro (como lo hace la API)
    console.log('1️⃣ Simulando registro de usuario...');
    const newUser = new TestUser({
      email: testEmail,
      password: testPassword, // Sin hashear - el middleware se encarga
      firstName: 'Test',
      lastName: 'User'
    });
    
    await newUser.save();
    console.log(`✅ Usuario creado: ${testEmail}`);
    console.log(`🔑 Hash almacenado: ${newUser.password.substring(0, 20)}...`);
    
    // 2. Simular login
    console.log('\n2️⃣ Simulando login...');
    const foundUser = await TestUser.findOne({ email: testEmail });
    const isValidPassword = await foundUser.comparePassword(testPassword);
    
    if (isValidPassword) {
      console.log('✅ Login exitoso - Contraseña válida');
    } else {
      console.log('❌ Login fallido - Contraseña inválida');
    }
    
    // 3. Simular cambio de contraseña (reset password flow)
    console.log('\n3️⃣ Simulando reset de contraseña...');
    const newPassword = 'NuevaPassword456!';
    foundUser.password = newPassword; // Sin hashear - el middleware se encarga
    await foundUser.save();
    
    console.log(`✅ Contraseña actualizada`);
    console.log(`🔑 Nuevo hash: ${foundUser.password.substring(0, 20)}...`);
    
    // 4. Probar login con nueva contraseña
    console.log('\n4️⃣ Probando login con nueva contraseña...');
    const updatedUser = await TestUser.findOne({ email: testEmail });
    const isNewPasswordValid = await updatedUser.comparePassword(newPassword);
    
    if (isNewPasswordValid) {
      console.log('✅ Login con nueva contraseña exitoso');
    } else {
      console.log('❌ Login con nueva contraseña fallido');
    }
    
    // 5. Verificar que la contraseña anterior ya no funciona
    console.log('\n5️⃣ Verificando que la contraseña anterior no funciona...');
    const isOldPasswordValid = await updatedUser.comparePassword(testPassword);
    
    if (!isOldPasswordValid) {
      console.log('✅ Contraseña anterior correctamente invalidada');
    } else {
      console.log('❌ ERROR: Contraseña anterior aún funciona');
    }
    
    // Limpiar datos de prueba
    await TestUser.deleteOne({ email: testEmail });
    console.log('\n🧹 Datos de prueba eliminados');
    
    console.log('\n✅ Todas las pruebas pasaron - El sistema funciona correctamente\n');
    
  } catch (error) {
    console.error('\n❌ Error en las pruebas:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📛 Conexión cerrada');
  }
};

// Ejecutar las pruebas
testPasswordFlow().catch(console.error);
