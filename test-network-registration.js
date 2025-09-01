// Script para probar el registro usando la IP de red (no localhost)
// Este script simula exactamente lo que haría el usuario en el formulario

const testRegistrationWithNetworkIP = async () => {
  const baseUrl = 'http://10.0.6.147:3000'; // IP de red que funciona con MongoDB
  
  const testUser = {
    // Datos completos para el registro
    documentType: 'CC',
    documentNumber: '1234567890',
    firstName: 'María Alejandra',
    lastName: 'González Rodríguez',
    birthDate: '1985-03-15',
    birthPlace: 'Medellín, Colombia',
    
    phone: '3012345678',
    whatsapp: '3012345678',
    email: 'maria.gonzalez@testbsk.com',
    address: 'Carrera 50 #25-30',
    neighborhood: 'El Poblado',
    city: 'Medellín',
    country: 'Colombia',
    postalCode: '050021',
    
    binaryGender: 'Femenino',
    genderIdentity: 'Mujer',
    occupation: 'Diseñadora Gráfica',
    discipline: 'Arte y Diseño',
    
    bloodType: 'A',
    rhFactor: '+',
    allergies: 'Alergia a mariscos',
    healthInsurance: 'Nueva EPS',
    
    emergencyContactName: 'Carlos González',
    emergencyContactRelationship: 'Padre',
    emergencyContactPhone: '3009876543',
    emergencyContactAddress: 'Carrera 45 #20-15',
    emergencyContactNeighborhood: 'Laureles',
    emergencyContactCity: 'Medellín',
    emergencyContactCountry: 'Colombia',
    emergencyContactPostalCode: '050010',
    
    motorcyclePlate: 'XYZ789',
    motorcycleBrand: 'Kawasaki',
    motorcycleModel: 'Ninja 400',
    motorcycleYear: '2022',
    motorcycleEngineSize: '399cc',
    motorcycleColor: 'Verde',
    soatExpirationDate: '2025-10-15',
    technicalReviewExpirationDate: '2025-03-15',
    
    licenseNumber: 'B9876543210',
    licenseCategory: 'A2',
    licenseExpirationDate: '2029-03-15',
    
    password: 'MiPassword2024!',
    confirmPassword: 'MiPassword2024!',
    dataConsent: true,
    liabilityWaiver: true,
    termsAcceptance: true,
    
    // Campos mapeados para backend
    acceptedTerms: true,
    acceptedPrivacyPolicy: true,
    acceptedDataProcessing: true,
    membershipType: 'friend'
  };

  try {
    console.log('🌐 Probando registro con IP de red:', baseUrl);
    console.log('👤 Datos del usuario de prueba:');
    console.log(`   📧 Email: ${testUser.email}`);
    console.log(`   👤 Nombre: ${testUser.firstName} ${testUser.lastName}`);
    console.log(`   🆔 Documento: ${testUser.documentType} ${testUser.documentNumber}`);
    console.log(`   📱 Teléfono: ${testUser.phone}`);
    console.log(`   🏍️ Moto: ${testUser.motorcycleBrand} ${testUser.motorcycleModel} (${testUser.motorcycleYear})`);
    
    console.log('\n🚀 Enviando petición POST a /api/users...');
    
    const startTime = Date.now();
    
    const response = await fetch(`${baseUrl}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`⏱️ Tiempo de respuesta: ${responseTime}ms`);
    console.log(`📡 Status: ${response.status} (${response.ok ? 'OK' : 'ERROR'})`);
    console.log(`📋 Headers:`, Object.fromEntries(response.headers.entries()));
    
    let result;
    try {
      result = await response.json();
    } catch (jsonError) {
      console.error('❌ Error al parsear JSON:', jsonError);
      const textResponse = await response.text();
      console.log('📄 Respuesta como texto:', textResponse);
      return;
    }
    
    if (response.ok) {
      console.log('\n🎉 ¡REGISTRO EXITOSO!');
      console.log('📊 Resultado completo:', JSON.stringify(result, null, 2));
      
      if (result.data && result.data.user) {
        console.log('\n✅ Usuario registrado correctamente:');
        console.log(`   🆔 ID: ${result.data.user.id}`);
        console.log(`   📧 Email: ${result.data.user.email}`);
        console.log(`   👤 Nombre: ${result.data.user.firstName} ${result.data.user.lastName}`);
        console.log(`   📱 Teléfono: ${result.data.user.phone}`);
        console.log(`   🎖️ Membresía: ${result.data.user.membershipType}`);
        console.log(`   ✅ Activo: ${result.data.user.isActive}`);
        console.log(`   📅 Creado: ${result.data.user.createdAt}`);
      }
      
      console.log(`\n💬 Mensaje del servidor: ${result.message}`);
      
      console.log('\n🔍 Verificación del botón "Finalizar Registro":');
      console.log('   ✅ La API funciona correctamente');
      console.log('   ✅ Los datos se procesan sin errores');
      console.log('   ✅ La validación es exitosa');
      console.log('   ✅ La conexión a MongoDB funciona');
      console.log('   ✅ El usuario se guarda en la base de datos');
      console.log('\n➡️ Si el botón no responde en el navegador, el problema está en:');
      console.log('   🔹 JavaScript del frontend (validación, eventos)');
      console.log('   🔹 Errores en la consola del navegador');
      console.log('   🔹 Bloqueo por validación de formulario');
      
    } else {
      console.log('\n❌ ERROR EN EL REGISTRO');
      console.log('📊 Respuesta completa del error:', JSON.stringify(result, null, 2));
      
      if (result.message) {
        console.log(`💬 Mensaje de error: ${result.message}`);
      }
      
      if (result.errors) {
        console.log('📝 Errores de validación:');
        if (Array.isArray(result.errors)) {
          result.errors.forEach((error, index) => {
            console.log(`   ${index + 1}. ${error.message || error}`);
          });
        } else {
          console.log(`   ${result.errors}`);
        }
      }
      
      console.log('\n🔧 Posibles soluciones:');
      if (response.status === 422) {
        console.log('   🔹 Verificar que todos los campos requeridos estén llenos');
        console.log('   🔹 Revisar formato de email, teléfono, etc.');
      } else if (response.status === 409) {
        console.log('   🔹 El email o documento ya existe, usar datos diferentes');
      } else if (response.status === 500) {
        console.log('   🔹 Error del servidor, revisar conexión a base de datos');
      }
    }
    
  } catch (error) {
    console.error('\n💥 ERROR DE CONEXIÓN:');
    console.error('📋 Detalles:', error);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🔧 Soluciones:');
      console.log('   🔹 Verificar que el servidor esté ejecutándose');
      console.log('   🔹 Confirmar la IP y puerto correctos');
      console.log('   🔹 Revisar configuración de red/firewall');
    }
  }
};

console.log('🧪 INICIANDO PRUEBA DE REGISTRO DE USUARIO');
console.log('=' .repeat(50));
testRegistrationWithNetworkIP();
