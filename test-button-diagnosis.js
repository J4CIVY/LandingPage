// Script para probar directamente la funcionalidad del registro
// Este script probará si el problema está en el backend o frontend

const testButtonFunctionality = async () => {
  const baseUrl = 'http://10.0.6.147:3000';
  
  console.log('🔬 DIAGNÓSTICO DEL BOTÓN "FINALIZAR REGISTRO"');
  console.log('=' .repeat(60));
  
  // Test 1: Verificar que el servidor esté respondiendo
  console.log('\n📡 Test 1: Verificando servidor...');
  try {
    const healthCheck = await fetch(`${baseUrl}/api/users`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    console.log(`✅ Servidor responde: ${healthCheck.status} ${healthCheck.ok ? 'OK' : 'ERROR'}`);
  } catch (error) {
    console.log(`❌ Servidor no responde: ${error.message}`);
    return;
  }
  
  // Test 2: Probar registro con datos mínimos
  console.log('\n🧪 Test 2: Registro con datos mínimos...');
  const minimalUser = {
    documentType: 'CC',
    documentNumber: `TEST${Date.now()}`,
    firstName: 'Usuario',
    lastName: 'Prueba',
    birthDate: '1990-01-01',
    birthPlace: 'Bogotá',
    phone: '3001234567',
    email: `test${Date.now()}@prueba.com`,
    address: 'Dirección de prueba',
    city: 'Bogotá',
    country: 'Colombia',
    binaryGender: 'Masculino',
    emergencyContactName: 'Contacto Emergencia',
    emergencyContactRelationship: 'Familiar',
    emergencyContactPhone: '3007654321',
    password: 'TestPassword123!',
    membershipType: 'friend',
    acceptedTerms: true,
    acceptedPrivacyPolicy: true,
    acceptedDataProcessing: true
  };
  
  try {
    const response = await fetch(`${baseUrl}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(minimalUser),
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Registro mínimo EXITOSO');
      console.log(`   📧 Usuario creado: ${result.data?.user?.email}`);
      console.log(`   🆔 ID: ${result.data?.user?.id}`);
    } else {
      console.log('❌ Registro mínimo FALLÓ');
      console.log(`   📋 Error: ${result.message}`);
      if (result.errors) {
        console.log('   📝 Detalles:', result.errors);
      }
    }
  } catch (error) {
    console.log(`❌ Error de conexión: ${error.message}`);
  }
  
  // Test 3: Probar registro con datos del formulario completo
  console.log('\n🎯 Test 3: Registro con datos completos del formulario...');
  const completeUser = {
    // Información personal básica
    documentType: 'CC',
    documentNumber: `FULL${Date.now()}`,
    firstName: 'María Alejandra',
    lastName: 'González Rodríguez',
    birthDate: '1985-03-15',
    birthPlace: 'Medellín, Colombia',
    
    // Información de contacto
    phone: '3012345678',
    whatsapp: '3012345678',
    email: `maria.gonzalez${Date.now()}@testbsk.com`,
    address: 'Carrera 50 #25-30',
    neighborhood: 'El Poblado',
    city: 'Medellín',
    country: 'Colombia',
    postalCode: '050021',
    
    // Información de género
    binaryGender: 'Femenino',
    genderIdentity: 'Mujer',
    occupation: 'Diseñadora Gráfica',
    discipline: 'Arte y Diseño',
    
    // Información de salud
    bloodType: 'A',
    rhFactor: '+',
    allergies: 'Alergia a mariscos',
    healthInsurance: 'Nueva EPS',
    
    // Contacto de emergencia
    emergencyContactName: 'Carlos González',
    emergencyContactRelationship: 'Padre',
    emergencyContactPhone: '3009876543',
    emergencyContactAddress: 'Carrera 45 #20-15',
    emergencyContactNeighborhood: 'Laureles',
    emergencyContactCity: 'Medellín',
    emergencyContactCountry: 'Colombia',
    emergencyContactPostalCode: '050010',
    
    // Información de motocicleta
    motorcyclePlate: 'XYZ789',
    motorcycleBrand: 'Kawasaki',
    motorcycleModel: 'Ninja 400',
    motorcycleYear: '2022',
    motorcycleEngineSize: '399cc',
    motorcycleColor: 'Verde',
    soatExpirationDate: '2025-10-15',
    technicalReviewExpirationDate: '2025-03-15',
    
    // Información de licencia
    licenseNumber: 'B9876543210',
    licenseCategory: 'A2',
    licenseExpirationDate: '2029-03-15',
    
    // BSK y autenticación
    membershipType: 'friend',
    password: 'MiPassword2024!',
    
    // Términos y condiciones
    acceptedTerms: true,
    acceptedPrivacyPolicy: true,
    acceptedDataProcessing: true
  };
  
  try {
    const response = await fetch(`${baseUrl}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(completeUser),
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Registro completo EXITOSO');
      console.log(`   📧 Usuario creado: ${result.data?.user?.email}`);
      console.log(`   👤 Nombre: ${result.data?.user?.firstName} ${result.data?.user?.lastName}`);
      console.log(`   🆔 ID: ${result.data?.user?.id}`);
      console.log(`   🎖️ Membresía: ${result.data?.user?.membershipType}`);
    } else {
      console.log('❌ Registro completo FALLÓ');
      console.log(`   📋 Error: ${result.message}`);
      if (result.errors) {
        console.log('   📝 Detalles:', result.errors);
      }
    }
  } catch (error) {
    console.log(`❌ Error de conexión: ${error.message}`);
  }
  
  // Conclusiones
  console.log('\n📊 CONCLUSIONES DEL DIAGNÓSTICO:');
  console.log('─'.repeat(40));
  console.log('Si ambos tests fueron exitosos:');
  console.log('  → El backend funciona correctamente');
  console.log('  → El problema está en el frontend (JavaScript/React)');
  console.log('  → Revisar validación de formulario y event handlers');
  console.log('');
  console.log('Si los tests fallaron:');
  console.log('  → Hay un problema en el backend o base de datos');
  console.log('  → Revisar configuración de MongoDB');
  console.log('  → Verificar estructura de datos y validaciones');
  console.log('');
  console.log('Pasos siguientes recomendados:');
  console.log('  1. Abrir http://10.0.6.147:3000/register-simple');
  console.log('  2. Abrir consola del navegador (F12)');
  console.log('  3. Llenar formulario y probar el botón');
  console.log('  4. Observar logs y errores en consola');
};

testButtonFunctionality();
