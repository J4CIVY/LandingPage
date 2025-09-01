// Script de prueba para el formulario de registro
// Este script simula el llenado del formulario paso a paso

const testCompleteRegistration = async () => {
  const testUser = {
    // Paso 1: Información personal básica
    documentType: 'CC',
    documentNumber: '12345678901',
    firstName: 'Juan Carlos',
    lastName: 'Pérez García',
    birthDate: '1990-01-15',
    birthPlace: 'Bogotá, Colombia',
    
    // Paso 2: Información de contacto
    phone: '3001234567',
    whatsapp: '3001234567',
    email: 'juan.carlos.perez@example.com',
    address: 'Calle 123 #45-67',
    neighborhood: 'Centro',
    city: 'Bogotá',
    country: 'Colombia',
    postalCode: '110111',
    
    // Paso 3: Información de género y ocupación
    binaryGender: 'Masculino',
    genderIdentity: 'Hombre',
    occupation: 'Ingeniero de Software',
    discipline: 'Tecnología',
    
    // Paso 4: Información de salud
    bloodType: 'O',
    rhFactor: '+',
    allergies: 'Ninguna conocida',
    healthInsurance: 'EPS Sura',
    
    // Paso 5: Contacto de emergencia
    emergencyContactName: 'María José Pérez',
    emergencyContactRelationship: 'Madre',
    emergencyContactPhone: '3007654321',
    emergencyContactAddress: 'Calle 456 #78-90',
    emergencyContactNeighborhood: 'Norte',
    emergencyContactCity: 'Bogotá',
    emergencyContactCountry: 'Colombia',
    emergencyContactPostalCode: '110112',
    
    // Paso 6: Información de motocicleta
    motorcyclePlate: 'ABC123',
    motorcycleBrand: 'Yamaha',
    motorcycleModel: 'MT-09',
    motorcycleYear: '2023',
    motorcycleEngineSize: '847cc',
    motorcycleColor: 'Azul',
    soatExpirationDate: '2025-12-31',
    technicalReviewExpirationDate: '2025-06-30',
    
    // Información de licencia
    licenseNumber: 'A1234567890',
    licenseCategory: 'A2',
    licenseExpirationDate: '2030-01-15',
    
    // Paso 7: Seguridad y consentimientos
    password: 'TestPassword123!',
    confirmPassword: 'TestPassword123!',
    dataConsent: true,
    liabilityWaiver: true,
    termsAcceptance: true,
    
    // Campos mapeados para la API
    acceptedTerms: true,
    acceptedPrivacyPolicy: true,
    acceptedDataProcessing: true,
    membershipType: 'friend'
  };

  try {
    console.log('🧪 Iniciando prueba completa del formulario de registro...');
    console.log('📝 Datos del usuario de prueba:');
    console.log(`- Email: ${testUser.email}`);
    console.log(`- Nombre: ${testUser.firstName} ${testUser.lastName}`);
    console.log(`- Documento: ${testUser.documentType} ${testUser.documentNumber}`);
    console.log(`- Teléfono: ${testUser.phone}`);
    
    console.log('\n🚀 Enviando datos a la API...');
    
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    console.log(`📡 Respuesta recibida - Status: ${response.status}`);
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ ¡REGISTRO EXITOSO!');
      console.log('📋 Detalles del usuario registrado:');
      console.log(`- ID: ${result.data.user.id}`);
      console.log(`- Email: ${result.data.user.email}`);
      console.log(`- Nombre: ${result.data.user.firstName} ${result.data.user.lastName}`);
      console.log(`- Membresía: ${result.data.user.membershipType}`);
      console.log(`- Activo: ${result.data.user.isActive}`);
      console.log(`- Fecha de registro: ${result.data.user.createdAt}`);
      console.log(`\n💬 Mensaje: ${result.message}`);
      
      console.log('\n🎯 El botón "Finalizar Registro" debería:');
      console.log('1. ✅ Enviar los datos a la API (FUNCIONANDO)');
      console.log('2. ✅ Registrar el usuario en la base de datos (FUNCIONANDO)');
      console.log('3. 🔄 Mostrar mensaje de éxito');
      console.log('4. 🔄 Redirigir a /registration-success');
      
    } else {
      console.log('❌ ERROR EN EL REGISTRO');
      console.log(`📋 Detalles del error:`);
      console.log(`- Status: ${response.status}`);
      console.log(`- Mensaje: ${result.message || result.error || 'Error desconocido'}`);
      
      if (result.errors) {
        console.log('- Errores de validación:');
        if (Array.isArray(result.errors)) {
          result.errors.forEach((error, index) => {
            console.log(`  ${index + 1}. ${error.message || error}`);
          });
        } else {
          console.log(`  ${result.errors}`);
        }
      }
    }
    
  } catch (error) {
    console.error('💥 ERROR DE CONEXIÓN:', error.message);
    console.log('\n🔍 Posibles causas:');
    console.log('- El servidor no está ejecutándose');
    console.log('- Problema de conectividad');
    console.log('- Error en la configuración de la API');
  }
};

// Ejecutar la prueba
testCompleteRegistration();
