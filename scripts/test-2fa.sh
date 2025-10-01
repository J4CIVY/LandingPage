#!/bin/bash

# Script de prueba para el sistema 2FA
# Este script prueba el flujo completo de autenticación 2FA

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
BASE_URL="${BASE_URL:-http://localhost:3000}"
TEST_EMAIL="${TEST_EMAIL:-test@bskmotorcycle.com}"
TEST_PASSWORD="${TEST_PASSWORD:-Test123456!}"

echo -e "${YELLOW}==================================${NC}"
echo -e "${YELLOW}  Test Sistema 2FA - BSK Motorcycle${NC}"
echo -e "${YELLOW}==================================${NC}"
echo ""

# Test 1: Generar código OTP
echo -e "${YELLOW}[1/3] Generando código OTP...${NC}"
GENERATE_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/2fa/generate" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\"
  }")

echo "Response: $GENERATE_RESPONSE"
echo ""

# Verificar si la respuesta fue exitosa
if echo "$GENERATE_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Código generado exitosamente${NC}"
  
  # Extraer twoFactorId y phoneNumber
  TWO_FACTOR_ID=$(echo "$GENERATE_RESPONSE" | grep -o '"twoFactorId":"[^"]*"' | cut -d'"' -f4)
  PHONE_NUMBER=$(echo "$GENERATE_RESPONSE" | grep -o '"phoneNumber":"[^"]*"' | cut -d'"' -f4)
  
  echo "Two Factor ID: $TWO_FACTOR_ID"
  echo "Número de teléfono: $PHONE_NUMBER"
  echo ""
else
  echo -e "${RED}✗ Error al generar código${NC}"
  echo "Response: $GENERATE_RESPONSE"
  exit 1
fi

# Test 2: Verificar webhook de MessageBird
echo -e "${YELLOW}[2/3] Testeando webhook de MessageBird...${NC}"
WEBHOOK_URL="https://capture.us-west-1.nest.messagebird.com/webhooks/a2dd52ff-b949-4135-9196-7050c12229f3/0403d97b-fa60-48b7-a45f-8a45b78d0a04"

WEBHOOK_RESPONSE=$(curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"otp\": \"TEST12\",
    \"phoneNumber\": \"${PHONE_NUMBER}\",
    \"email\": \"${TEST_EMAIL}\",
    \"name\": \"Test User\",
    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
  }")

echo "Webhook response: $WEBHOOK_RESPONSE"
echo -e "${GREEN}✓ Webhook enviado${NC}"
echo ""

# Test 3: Solicitar código manualmente
echo -e "${YELLOW}[3/3] Verificación de código${NC}"
echo -e "${YELLOW}Por favor, revisa tu WhatsApp y ingresa el código de 6 dígitos:${NC}"
read -p "Código OTP: " OTP_CODE

if [ -z "$OTP_CODE" ]; then
  echo -e "${RED}✗ No se ingresó ningún código${NC}"
  exit 1
fi

# Verificar el código
echo "Verificando código..."
VERIFY_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/2fa/verify" \
  -H "Content-Type: application/json" \
  -d "{
    \"twoFactorId\": \"${TWO_FACTOR_ID}\",
    \"code\": \"${OTP_CODE}\"
  }")

echo "Response: $VERIFY_RESPONSE"
echo ""

if echo "$VERIFY_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Código verificado exitosamente${NC}"
  echo -e "${GREEN}✓ Autenticación 2FA completada${NC}"
  
  # Extraer tokens
  ACCESS_TOKEN=$(echo "$VERIFY_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
  echo ""
  echo -e "${GREEN}Access Token obtenido (primeros 20 caracteres):${NC}"
  echo "${ACCESS_TOKEN:0:20}..."
else
  echo -e "${RED}✗ Error al verificar código${NC}"
  echo "Response: $VERIFY_RESPONSE"
  exit 1
fi

echo ""
echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}  ✓ Todos los tests pasaron${NC}"
echo -e "${GREEN}==================================${NC}"
