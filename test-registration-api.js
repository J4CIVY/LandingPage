const testRegistration = async () => {
  const testUser = {
    documentType: 'CC',
    documentNumber: '12345678',
    firstName: 'Juan',
    lastName: 'Pérez',
    birthDate: '1990-01-01',
    birthPlace: 'Bogotá',
    phone: '3001234567',
    whatsapp: '3001234567',
    email: 'juan.perez@test.com',
    address: 'Calle 123 #45-67',
    neighborhood: 'Centro',
    city: 'Bogotá',
    country: 'Colombia',
    postalCode: '110111',
    binaryGender: 'Masculino',
    genderIdentity: 'Hombre',
    occupation: 'Ingeniero',
    discipline: 'Tecnología',
    bloodType: 'O',
    rhFactor: '+',
    allergies: 'Ninguna',
    healthInsurance: 'EPS Sura',
    emergencyContactName: 'María Pérez',
    emergencyContactRelationship: 'Madre',
    emergencyContactPhone: '3007654321',
    emergencyContactAddress: 'Calle 456 #78-90',
    emergencyContactNeighborhood: 'Norte',
    emergencyContactCity: 'Bogotá',
    emergencyContactCountry: 'Colombia',
    emergencyContactPostalCode: '110112',
    motorcycleBrand: 'Yamaha',
    motorcycleModel: 'R1',
    motorcycleYear: '2020',
    motorcyclePlate: 'ABC123',
    motorcycleEngineSize: '1000cc',
    motorcycleColor: 'Azul',
    soatExpirationDate: '2025-12-31',
    technicalReviewExpirationDate: '2025-06-30',
    licenseNumber: 'A1234567',
    licenseCategory: 'A2',
    licenseExpirationDate: '2030-01-01',
    membershipType: 'friend',
    password: 'TestPassword123!',
    acceptedTerms: true,
    acceptedPrivacyPolicy: true,
    acceptedDataProcessing: true,
    dataConsent: true,
    liabilityWaiver: true,
    termsAcceptance: true
  };

  try {
    console.log('🧪 Probando registro de usuario...');
    
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    const result = await response.json();
    
    console.log('📡 Respuesta del servidor:');
    console.log('Status:', response.status);
    console.log('OK:', response.ok);
    console.log('Resultado:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('✅ Test de registro exitoso!');
    } else {
      console.log('❌ Test de registro falló');
    }
  } catch (error) {
    console.error('💥 Error en el test:', error);
  }
};

testRegistration();
