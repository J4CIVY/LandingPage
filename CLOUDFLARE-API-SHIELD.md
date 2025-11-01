# API Schema Validation - Cloudflare API Shield

Este directorio contiene los esquemas OpenAPI 3.0 para la validación de API en Cloudflare API Shield.

## Archivos Disponibles

- **`api-schema.yml`**: Esquema completo en formato YAML (recomendado)
- **`api-schema.json`**: Esquema completo en formato JSON (alternativa)

## 📋 Características del Esquema

El esquema incluye validación para:

### ✅ Autenticación y Usuarios
- Registro de usuarios con validación de email y password
- Login/Logout
- Gestión de perfiles
- Reset de contraseñas
- Verificación de email

### ✅ Eventos
- CRUD completo de eventos
- Registro y cancelación de asistencia
- Control de asistencia (admin)
- Paginación y filtros

### ✅ Gamificación
- Puntos y recompensas
- Logros y badges
- Rankings y leaderboards
- Estadísticas de usuario

### ✅ Membresías
- Progreso de membresía
- Solicitudes de upgrade
- Aplicaciones de voluntario
- Aplicaciones de líder

### ✅ Emergencias (SOS)
- Creación de emergencias con geolocalización
- Estados y prioridades
- Seguimiento de casos

### ✅ PQRSDF
- Peticiones, quejas, reclamos, sugerencias
- Sistema de respuestas
- Categorización y prioridades

### ✅ Contacto
- Formularios de contacto
- Validación de campos

## 🚀 Implementación en Cloudflare

### Opción 1: Via Dashboard (Recomendado)

1. **Accede al Dashboard de Cloudflare**
   ```
   https://dash.cloudflare.com/
   ```

2. **Navega a API Shield**
   - Selecciona tu cuenta y dominio
   - Ve a `Security > API Shield`
   - Selecciona `Schema Validation`

3. **Sube el Esquema**
   - Click en `Add validation`
   - Selecciona `api-schema.yml` o `api-schema.json`
   - Revisa los endpoints detectados
   - Selecciona la acción para requests no conformes:
     - **Log**: Solo registra en logs (recomendado para empezar)
     - **Block**: Bloquea requests no válidos
     - **None**: No toma acción

4. **Aplica el Esquema**
   - Click en `Add schema and endpoints`
   - Espera unos minutos para que se procesen los endpoints

### Opción 2: Via API de Cloudflare

```bash
# 1. Obtén tu Zone ID y API Token
ZONE_ID="your-zone-id"
API_TOKEN="your-api-token"

# 2. Sube el esquema
curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/api_gateway/schemas" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data-binary @api-schema.json

# 3. Lista los esquemas subidos
curl -X GET "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/api_gateway/schemas" \
  -H "Authorization: Bearer ${API_TOKEN}"
```

### Opción 3: Via Terraform

```hcl
resource "cloudflare_api_shield" "bsk_api" {
  zone_id = var.zone_id
  
  auth_id_characteristics = [
    {
      name = "authorization_header"
      type = "header"
    }
  ]
}

resource "cloudflare_api_shield_schema" "bsk_schema" {
  zone_id = var.zone_id
  name    = "BSK Motorcycle Team API"
  kind    = "openapi_v3"
  source  = file("${path.module}/api-schema.yml")
}

resource "cloudflare_api_shield_schema_validation_settings" "bsk_validation" {
  zone_id                          = var.zone_id
  default_mitigation_action        = "log"
  override_mitigation_action       = null
}
```

## ⚙️ Configuración Recomendada

### Fase 1: Monitoreo (Semana 1-2)
```yaml
Default Action: Log
```
- Monitorea los logs en Firewall Events
- Identifica falsos positivos
- Ajusta el esquema si es necesario

### Fase 2: Bloqueo Selectivo (Semana 3-4)
```yaml
Default Action: Log
Endpoints Críticos: Block
```
- Bloquea solo endpoints críticos (auth, admin)
- Mantén el resto en modo Log
- Revisa métricas diariamente

### Fase 3: Protección Completa (Mes 2+)
```yaml
Default Action: Block
Endpoints Problemáticos: None (temporal)
```
- Bloquea todo tráfico no conforme
- Mantén lista blanca para casos específicos

## 🔒 Regla Fallthrough (Catch-All)

Para proteger contra endpoints zombies o no documentados:

1. **Ve a Settings > Fallthrough settings**
2. **Click en "Use Template"**
3. **Selecciona tu hostname**
4. **Configura la acción**:
   ```
   Rule Name: API Fallthrough Protection
   Expression: cf.api_gateway.fallthrough_triggered
   Action: Block (o Log)
   ```

## 📊 Monitoreo y Métricas

### Ver Eventos Bloqueados
```
Security > Firewall Events
Filter: Action = "API Shield"
```

### Métricas Importantes
- Total de requests validados
- Requests bloqueados vs permitidos
- Endpoints con más violaciones
- Tipos de errores más comunes

### Dashboards Recomendados
```graphql
# GraphQL Query para Analytics
query {
  viewer {
    zones(filter: { zoneTag: $zoneId }) {
      firewallEventsAdaptive(
        filter: { 
          action: "apiShield",
          datetime_geq: $startDate,
          datetime_leq: $endDate
        }
        limit: 1000
      ) {
        clientRequestHTTPHost
        clientRequestHTTPMethodName
        clientRequestPath
        edgeResponseStatus
        action
      }
    }
  }
}
```

## 🔧 Mantenimiento del Esquema

### Actualizar el Esquema

1. **Edita el archivo YAML/JSON**
2. **Valida con Swagger Editor**:
   ```
   https://editor.swagger.io/
   ```
3. **Re-sube a Cloudflare**
4. **Verifica que no haya conflictos**

### Aplicar Schema Aprendido

Cloudflare puede aprender automáticamente tu API:

1. **Ve a Schema Validation**
2. **Filter por "Learned Schema"**
3. **Click en "Apply learned schema"**
4. **Revisa los cambios**
5. **Aplica si es correcto**

### Cambiar Acción Global

```bash
# Via Dashboard
Security > API Shield > Schema Validation > Change Default Action

# Via API
curl -X PATCH \
  "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/api_gateway/settings/schema_validation" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "validation_default_mitigation_action": "block"
  }'
```

### Cambiar Acción por Endpoint

1. **Filtra el endpoint específico**
2. **Click en el menú (...)** 
3. **Select "Change action"**
4. **Elige: Log, Block, o None**

## 🐛 Troubleshooting

### Falsos Positivos
```yaml
Síntoma: Requests válidos son bloqueados
Solución: 
  1. Revisa el log del request
  2. Identifica el campo que falla
  3. Ajusta el esquema o cambia a "None" temporalmente
```

### Schema No Aplica
```yaml
Síntoma: Cambios no se reflejan
Solución:
  1. Espera 5-10 minutos
  2. Limpia caché de Cloudflare
  3. Verifica que el endpoint esté en Endpoint Management
```

### Demasiados Endpoints
```yaml
Síntoma: Error "Limit exceeded" (10,000 operations)
Solución:
  1. Contacta a tu Account Team
  2. O divide en múltiples zonas
  3. O prioriza endpoints críticos
```

## 📝 Especificaciones Técnicas

### Formato Soportado
- OpenAPI v3.0.x (todas las versiones patch)
- ❌ No soporta OpenAPI v3.1 o v2.0

### Content-Types Validados
- `application/json` (validado completamente)
- `application/*` (permitido sin validación de body)
- `*/*` (permitido sin validación)

### Limitaciones
- Máximo 10,000 operaciones (Enterprise con API Shield)
- No valida: responses, referencias externas, path templating complejo
- Parámetros tipo `object` no son validados

### Formatos Validados
✅ Soportados:
- date-time, time, date
- email, hostname
- ipv4, ipv6
- uri, uri-reference
- int32, int64, float, double
- uuid, byte
- password

❌ No Validados:
- uniqueItems
- anyOf en parámetros

## 🔗 Referencias

- [Cloudflare API Shield Docs](https://developers.cloudflare.com/api-shield/)
- [Schema Validation Guide](https://developers.cloudflare.com/api-shield/security/schema-validation/)
- [OpenAPI 3.0 Spec](https://spec.openapis.org/oas/v3.0.3)
- [Swagger Editor](https://editor.swagger.io/)

## 📧 Soporte

Para problemas con el esquema:
1. Revisa los logs en Firewall Events
2. Valida el esquema en Swagger Editor
3. Contacta al equipo de desarrollo

---

**Última actualización**: Noviembre 2025  
**Versión del Schema**: 1.0.0  
**Compatible con**: Cloudflare API Shield (todos los planes)
