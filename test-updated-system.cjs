require('dotenv').config({ path: '.env.local' });

async function testUpdatedSystem() {
  try {
    console.log('🧪 Probando el sistema actualizado...');
    
    // Simular una llamada al endpoint de notificaciones mejorado
    const testData = {
      type: 'welcome',
      recipientEmail: 'test@example.com',
      recipientName: 'Usuario Prueba',
      templateData: {
        userData: {
          firstName: 'Usuario',
          lastName: 'Prueba',
          membershipType: 'friend',
          registrationDate: new Date().toISOString()
        }
      },
      priority: 'high'
    };

    console.log('📋 Datos de prueba:', JSON.stringify(testData, null, 2));

    const response = await fetch('http://localhost:3000/api/email/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('\n📡 Respuesta del servidor:');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const result = await response.json();
    console.log('Body:', JSON.stringify(result, null, 2));

    return response.ok;

  } catch (error) {
    console.error('\n💥 Error durante la prueba:', error.message);
    return false;
  }
}

// Dar tiempo para que el servidor esté listo
setTimeout(() => {
  testUpdatedSystem().then(success => {
    console.log(success ? '\n✅ Prueba exitosa' : '\n❌ Prueba falló');
  });
}, 3000);
