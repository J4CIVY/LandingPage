#!/usr/bin/env node

// Script para probar el cambio de contraseña localmente
const https = require('https');

const testPasswordChange = async () => {
  console.log('🧪 Iniciando prueba de cambio de contraseña...\n');
  
  // Datos de prueba
  const loginData = {
    email: 'bjaci9698@gmail.com',
    password: '#BJaci960419*'
  };
  
  const passwordChangeData = {
    currentPassword: '#BJaci960419*',
    newPassword: '#BJaci960419_'
  };

  try {
    console.log('Paso 1: Intentando login para obtener token...');
    
    // Primero hacer login para obtener el token
    const loginResponse = await makeRequest('POST', '/api/auth/login', loginData);
    
    if (!loginResponse.success) {
      console.error('❌ Error en login:', loginResponse);
      return;
    }
    
    console.log('✅ Login exitoso');
    const token = loginResponse.token;
    
    console.log('\nPaso 2: Probando cambio de contraseña con token válido...');
    
    // Ahora probar el cambio de contraseña
    const changeResponse = await makeRequest('POST', '/api/auth/change-password', passwordChangeData, token);
    
    console.log('\n📋 Resultado del cambio de contraseña:');
    console.log(JSON.stringify(changeResponse, null, 2));
    
    if (changeResponse.success) {
      console.log('\n✅ Cambio de contraseña exitoso!');
    } else {
      console.log('\n❌ Error en cambio de contraseña:', changeResponse.error);
    }
    
  } catch (error) {
    console.error('\n💥 Error en la prueba:', error.message);
  }
};

function makeRequest(method, path, data, token = null) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'bskmt.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'NodeJS-Test-Client/1.0'
      }
    };
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve(response);
        } catch (e) {
          reject(new Error(`Error parsing response: ${body}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

// Ejecutar la prueba
testPasswordChange();