#!/bin/bash

# Script para probar el registro de usuario directamente
echo "🧪 Probando registro de usuario directamente..."

# Datos de prueba que coinciden con el esquema
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "documentType": "cedula",
    "documentNumber": "12345678",
    "firstName": "Juan",
    "lastName": "Pérez",
    "birthDate": "1990-01-01",
    "birthPlace": "Bogotá",
    "phone": "3001234567",
    "whatsapp": "3001234567",
    "email": "juan.test@example.com",
    "address": "Calle 123 #45-67",
    "neighborhood": "Centro",
    "city": "Bogotá",
    "country": "Colombia",
    "postalCode": "11001",
    "binaryGender": "masculino",
    "genderIdentity": "masculino",
    "occupation": "Ingeniero",
    "discipline": "Sistemas",
    "bloodType": "O",
    "rhFactor": "positivo",
    "allergies": "Ninguna",
    "healthInsurance": "EPS",
    "emergencyContactName": "María Pérez",
    "emergencyContactRelationship": "Hermana",
    "emergencyContactPhone": "3007654321",
    "emergencyContactAddress": "Calle 456 #78-90",
    "emergencyContactNeighborhood": "Norte",
    "emergencyContactCity": "Bogotá",
    "emergencyContactCountry": "Colombia",
    "emergencyContactPostalCode": "11002",
    "motorcycleBrand": "Yamaha",
    "motorcycleModel": "FZ16",
    "motorcycleYear": "2020",
    "motorcyclePlate": "ABC123",
    "motorcycleEngineSize": "150cc",
    "motorcycleDisplacement": "150",
    "password": "password123",
    "dataConsent": true,
    "liabilityWaiver": true,
    "termsAcceptance": true
  }' \
  -w "\n\nStatus: %{http_code}\n" \
  -v
