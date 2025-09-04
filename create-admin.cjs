// Script para crear un usuario administrador
const mongoose = require('mongoose');

// Esquema del usuario (simplificado para este script)
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  documentType: { type: String, required: true },
  documentNumber: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  birthDate: { type: String, required: true },
  birthPlace: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  binaryGender: { type: String, required: true },
  emergencyContactName: { type: String, required: true },
  emergencyContactRelationship: { type: String, required: true },
  emergencyContactPhone: { type: String, required: true },
  membershipType: { type: String, enum: ['friend', 'rider', 'rider-duo', 'pro', 'pro-duo'], default: 'friend' },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'super-admin'], default: 'user' },
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  acceptedTerms: { type: Boolean, required: true },
  acceptedPrivacyPolicy: { type: Boolean, required: true },
  acceptedDataProcessing: { type: Boolean, required: true },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    // Conectar a MongoDB
    await mongoose.connect('mongodb+srv://bskmt:6j4q3Az78Qto2Q3ZIu2TCTwCf5BPIHQ3@bskmtbd.ddgvaxa.mongodb.net/?retryWrites=true&w=majority&appName=BSKMTBD');
    console.log('Conectado a MongoDB');

    // Buscar si ya existe un admin
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Ya existe un usuario admin:', existingAdmin.email);
      process.exit(0);
    }

    // Verificar si existe usuario por email
    const existingUser = await User.findOne({ email: 'admin@bskmt.com' });
    if (existingUser) {
      // Actualizar usuario existente a admin
      existingUser.role = 'admin';
      await existingUser.save();
      console.log('Usuario actualizado a admin:', existingUser.email);
    } else {
      // Crear nuevo usuario admin
      const adminUser = new User({
        documentType: 'CC',
        documentNumber: '12345678',
        firstName: 'Admin',
        lastName: 'BSK',
        birthDate: '1990-01-01',
        birthPlace: 'Bogotá',
        phone: '3001234567',
        email: 'admin@bskmt.com',
        address: 'Calle 123 # 45-67',
        city: 'Bogotá',
        country: 'Colombia',
        binaryGender: 'Masculino',
        emergencyContactName: 'Contacto Admin',
        emergencyContactRelationship: 'Familia',
        emergencyContactPhone: '3007654321',
        membershipType: 'pro',
        password: 'admin123',
        role: 'admin',
        isActive: true,
        isEmailVerified: true,
        acceptedTerms: true,
        acceptedPrivacyPolicy: true,
        acceptedDataProcessing: true
      });

      await adminUser.save();
      console.log('Usuario admin creado exitosamente!');
      console.log('Email: admin@bskmt.com');
      console.log('Password: admin123');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdmin();
