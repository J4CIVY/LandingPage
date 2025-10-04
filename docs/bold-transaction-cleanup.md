# Sistema de Limpieza de Transacciones Bold

## Descripción General

El sistema automáticamente cancela transacciones pendientes que han expirado después de 24 horas sin completarse.

## Funcionamiento

### 1. Limpieza Automática al Consultar (Usuario)

Cuando un usuario consulta su historial de transacciones en `/api/bold/transactions/user`, el sistema:

- Busca todas las transacciones PENDING o PROCESSING del usuario
- Verifica si tienen más de 24 horas de antigüedad
- Las actualiza automáticamente a estado CANCELLED
- Retorna el listado actualizado

**Ventaja**: No requiere configuración adicional, se ejecuta cada vez que el usuario consulta.

### 2. Endpoint de Limpieza Global (Opcional - Cron Job)

Para limpiar transacciones de todos los usuarios periódicamente:

#### Endpoint
```
POST /api/bold/transactions/cleanup
GET  /api/bold/transactions/cleanup
```

#### Autenticación
Requiere header de autorización:
```
Authorization: Bearer YOUR_CRON_SECRET_TOKEN
```

#### Variables de Entorno
```env
CRON_SECRET_TOKEN=tu-token-super-secreto-aqui
```

#### Uso con Cron Job

**Opción 1: Vercel Cron Jobs**

Agrega a `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/bold/transactions/cleanup",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

**Opción 2: GitHub Actions**

Crea `.github/workflows/cleanup-transactions.yml`:
```yaml
name: Cleanup Expired Transactions

on:
  schedule:
    - cron: '0 */6 * * *' # Cada 6 horas

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Call cleanup endpoint
        run: |
          curl -X POST https://tu-dominio.com/api/bold/transactions/cleanup \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET_TOKEN }}"
```

**Opción 3: Servicio Externo (Cron-Job.org, EasyCron, etc.)**

Configura una tarea programada que llame al endpoint cada 6 horas.

#### Respuesta

**POST** (Limpieza):
```json
{
  "success": true,
  "message": "Transacciones expiradas limpiadas exitosamente",
  "data": {
    "cancelledCount": 5,
    "expirationTime": "2025-10-03T10:00:00.000Z",
    "transactions": [
      {
        "orderId": "EVT-20251003-ABC123",
        "userId": "user123",
        "amount": 50000,
        "createdAt": "2025-10-02T10:00:00.000Z"
      }
    ]
  }
}
```

**GET** (Verificar):
```json
{
  "success": true,
  "data": {
    "expiredTransactionsCount": 3,
    "expirationTime": "2025-10-03T10:00:00.000Z"
  }
}
```

## Estados de Transacciones

| Estado | Descripción |
|--------|-------------|
| PENDING | Transacción creada, esperando pago |
| PROCESSING | Pago en proceso |
| APPROVED | Pago aprobado exitosamente |
| DECLINED | Pago rechazado por el banco/pasarela |
| FAILED | Error en el proceso de pago |
| **CANCELLED** | **Transacción cancelada por expiración (>24h)** |
| VOIDED | Transacción anulada manualmente |

## Tiempo de Expiración

**Actual**: 24 horas desde la creación de la transacción

Para modificar el tiempo, edita el valor en:
- `/app/api/bold/transactions/user/route.ts`
- `/app/api/bold/transactions/cleanup/route.ts`

```typescript
// Cambiar de 24 a otro valor (en horas)
expirationTime.setHours(expirationTime.getHours() - 24);
```

## Seguridad

### Token de Cron Job

1. Genera un token seguro:
```bash
openssl rand -base64 32
```

2. Agrégalo a tus variables de entorno:
```env
CRON_SECRET_TOKEN=tu_token_generado_aqui
```

3. En producción, usa el sistema de secrets de tu plataforma:
   - Vercel: Environment Variables
   - GitHub Actions: Repository Secrets
   - Otros: Variables de entorno seguras

### Protección del Endpoint

El endpoint `/api/bold/transactions/cleanup` requiere autenticación y **solo debe ser accesible desde cron jobs autorizados**.

## Monitoreo

### Ver Transacciones Canceladas

Dashboard de usuario: `/dashboard/billing`
- Filtro por estado: "Cancelados"
- Color: Gris
- Icono: ❌

### Logs

El sistema registra:
- Número de transacciones canceladas
- IDs de órdenes afectadas
- Timestamp de limpieza

## Preguntas Frecuentes

**Q: ¿Por qué 24 horas?**  
A: Bold típicamente expira los links de pago en 24 horas. Después de este tiempo, es muy improbable que se complete el pago.

**Q: ¿Qué pasa si un usuario intenta pagar después de 24 horas?**  
A: El link de pago de Bold ya habrá expirado. El usuario debe crear una nueva transacción.

**Q: ¿Se puede recuperar una transacción cancelada?**  
A: No. El usuario debe crear una nueva transacción para el evento.

**Q: ¿Afecta esto a las transacciones aprobadas?**  
A: No. Solo se cancelan transacciones en estado PENDING o PROCESSING.

**Q: ¿Necesito configurar el cron job?**  
A: No es obligatorio. La limpieza automática al consultar ya funciona. El cron job es opcional para limpiar más frecuentemente y de forma global.

## Recomendaciones

1. ✅ **Deja activa** la limpieza automática al consultar (ya implementada)
2. ✅ **Configura un cron job** si tienes muchos usuarios (limpieza global cada 6 horas)
3. ✅ **Monitorea** las cancelaciones para detectar problemas en el flujo de pago
4. ✅ **Notifica a los usuarios** si tienen transacciones pendientes por expirar (opcional)

## Testing

### Probar Limpieza Manual

```bash
# Verificar transacciones expiradas
curl -X GET https://tu-dominio.com/api/bold/transactions/cleanup \
  -H "Authorization: Bearer tu_token"

# Ejecutar limpieza
curl -X POST https://tu-dominio.com/api/bold/transactions/cleanup \
  -H "Authorization: Bearer tu_token"
```

### Crear Transacción de Prueba Expirada

```javascript
// En MongoDB directamente
db.boldtransactions.insertOne({
  orderId: "TEST-EXPIRED-001",
  userId: ObjectId("..."),
  eventId: ObjectId("..."),
  eventName: "Evento de Prueba",
  status: "PENDING",
  amount: 10000,
  currency: "COP",
  createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 horas atrás
  updatedAt: new Date()
});
```

Luego consulta el dashboard para verificar que se cancele automáticamente.
