# Sincronización de Estados con la API de Bold

## 📋 Descripción

El sistema ahora sincroniza los estados de las transacciones consultando la **API oficial de Bold** antes de cancelar transacciones pendientes. Esto asegura que los estados reflejen la realidad y no se cancelen pagos que fueron aprobados.

## 🔄 Cómo Funciona

### 1. Consulta al Dashboard de Usuario

Cuando un usuario consulta `/dashboard/billing`:

```
Usuario consulta historial
    ↓
Sistema detecta transacciones PENDING > 24h (máx 20)
    ↓
Para cada transacción:
  ├─ Consulta estado en Bold API (timeout 3s)
  ├─ Si Bold responde: actualiza con estado real
  ├─ Si Bold retorna 404: marca como CANCELLED
  └─ Si hay error/timeout: marca como CANCELLED
    ↓
Retorna historial actualizado
```

**Ventajas:**
- ✅ No cancela pagos que Bold aprobó
- ✅ Sincroniza estados automáticamente
- ✅ Timeout corto (3s) para no bloquear la UI
- ✅ Procesa máximo 20 transacciones por consulta

### 2. Cron Job de Limpieza Global

`POST /api/bold/transactions/cleanup`

```
Cron ejecuta cada 6 horas
    ↓
Busca TODAS las transacciones PENDING > 24h (máx 100)
    ↓
Para cada transacción:
  ├─ Consulta estado en Bold API (timeout 5s)
  ├─ Si Bold responde: actualiza con estado real
  ├─ Si Bold retorna 404: marca como CANCELLED
  └─ Si hay error/timeout: marca como CANCELLED
    ↓
Retorna estadísticas detalladas
```

**Ventajas:**
- ✅ Limpieza proactiva de todo el sistema
- ✅ Estadísticas completas
- ✅ Procesa en lotes de 100
- ✅ No depende de que usuarios consulten

## 🎯 Estados Sincronizados

| Estado Bold | Estado Local | Acción |
|-------------|--------------|--------|
| APPROVED | APPROVED | ✅ Sincronizado |
| PENDING | PENDING | ⏳ Sin cambios |
| PROCESSING | PROCESSING | ⏳ Sin cambios |
| REJECTED | REJECTED | 🔴 Sincronizado |
| FAILED | FAILED | 🔴 Sincronizado |
| VOIDED | VOIDED | ⚫ Sincronizado |
| 404 (No encontrado) | CANCELLED | ⚪ Cancelado |
| Error/Timeout | CANCELLED | ⚪ Cancelado por seguridad |

## 📡 Endpoint de Bold Utilizado

```
GET https://payments.api.bold.co/v2/payment-voucher/{orderId}
```

**Headers:**
```
Authorization: x-api-key YOUR_BOLD_API_KEY
Content-Type: application/json
```

**Respuesta Exitosa (200):**
```json
{
  "payment_status": "APPROVED",
  "transaction_id": "BOLD123456",
  "payment_method": "CREDIT_CARD",
  "transaction_date": "2025-10-04T10:00:00Z",
  ...
}
```

**Transacción No Encontrada (404):**
```json
{
  "error": "Transaction not found"
}
```

## ⚡ Optimizaciones de Performance

### Consulta de Usuario
- **Timeout**: 3 segundos
- **Límite**: Máximo 20 transacciones
- **Estrategia**: Solo transacciones > 24h
- **Impacto**: < 3s adicionales en carga de página

### Cron Job
- **Timeout**: 5 segundos
- **Límite**: Máximo 100 transacciones por ejecución
- **Frecuencia**: Cada 6 horas
- **Impacto**: Ninguno en el usuario

## 🔒 Variables de Entorno Requeridas

```env
# API Key de Bold (para consultas)
BOLD_API_KEY=tu_api_key_aqui

# Token para el cron job
CRON_SECRET_TOKEN=tu_token_secreto_aqui
```

## 📊 Respuesta del Cron Job

```json
{
  "success": true,
  "message": "Transacciones expiradas procesadas exitosamente",
  "data": {
    "total": 15,
    "updated": 12,
    "cancelled": 10,
    "approved": 2,
    "failed": 0,
    "errors": 3,
    "expirationTime": "2025-10-03T10:00:00.000Z",
    "note": "Los estados se actualizaron consultando la API de Bold",
    "transactions": [
      {
        "orderId": "EVT-123456",
        "userId": "user123",
        "oldStatus": "PENDING",
        "newStatus": "APPROVED",
        "amount": 50000,
        "createdAt": "2025-10-02T10:00:00.000Z",
        "boldStatus": "APPROVED"
      },
      {
        "orderId": "EVT-789012",
        "userId": "user456",
        "oldStatus": "PENDING",
        "newStatus": "CANCELLED",
        "amount": 30000,
        "createdAt": "2025-10-02T12:00:00.000Z",
        "boldStatus": "NOT_FOUND"
      }
    ]
  }
}
```

## 🎨 Casos de Uso

### Caso 1: Pago Aprobado Tardíamente
```
Usuario crea transacción → PENDING
Usuario no completa el pago inmediatamente
Después de 25 horas, Bold procesa el pago → APPROVED
Usuario consulta dashboard
Sistema consulta Bold → APPROVED
✅ Transacción se marca como APPROVED (no se cancela)
```

### Caso 2: Transacción Expirada
```
Usuario crea transacción → PENDING
Usuario abandona el pago
Después de 25 horas, link expira
Usuario consulta dashboard
Sistema consulta Bold → 404
✅ Transacción se marca como CANCELLED
```

### Caso 3: Pago Rechazado
```
Usuario intenta pagar → PENDING
Tarjeta es rechazada → Bold marca como REJECTED
Después de 25 horas
Usuario consulta dashboard
Sistema consulta Bold → REJECTED
✅ Transacción se marca como REJECTED
```

## ⚠️ Manejo de Errores

### Error al Consultar Bold
Si Bold no responde o hay un error de red:
- ✅ Se cancela la transacción por seguridad
- ✅ Se registra el error en logs
- ✅ No se bloquea la consulta del usuario

### Timeout
Si Bold tarda más del timeout:
- ✅ Usuario: 3 segundos → cancela
- ✅ Cron: 5 segundos → cancela
- ✅ No afecta otras transacciones

### Rate Limiting
Si Bold limita las peticiones:
- ✅ El error se captura
- ✅ La transacción se cancela por expiración
- ✅ El cron volverá a intentar en la siguiente ejecución

## 🧪 Testing

### Probar Sincronización Manual

1. **Crear transacción de prueba expirada:**
```javascript
// En MongoDB
db.boldtransactions.insertOne({
  orderId: "TEST-SYNC-001",
  userId: ObjectId("tu_user_id"),
  eventId: ObjectId("tu_event_id"),
  eventName: "Evento de Prueba",
  status: "PENDING",
  amount: 10000,
  currency: "COP",
  createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 horas atrás
  updatedAt: new Date()
});
```

2. **Consultar dashboard:** 
   - Visita `/dashboard/billing`
   - La transacción debe sincronizarse con Bold

3. **Ver resultado:**
   - Si existe en Bold: estado actualizado
   - Si no existe (404): CANCELLED

### Probar Cron Job

```bash
# Ejecutar limpieza
curl -X POST https://tu-dominio.com/api/bold/transactions/cleanup \
  -H "Authorization: Bearer tu_token" \
  -H "Content-Type: application/json"
```

## 📈 Métricas y Monitoreo

### Qué Monitorear

1. **Tasa de sincronización**
   - % de transacciones sincronizadas exitosamente
   - % de timeouts
   - % de errores

2. **Distribución de estados**
   - Cuántas APPROVED tardíamente
   - Cuántas CANCELLED por expiración
   - Cuántas REJECTED/FAILED

3. **Performance**
   - Tiempo promedio de consulta a Bold
   - Impacto en tiempo de carga del dashboard

### Logs Importantes

```
✅ Transaction EVT-123 synced: PENDING → APPROVED
❌ Transaction EVT-456 Bold timeout, marked as CANCELLED
⚠️ Transaction EVT-789 Bold returned 404, marked as CANCELLED
```

## 🚀 Mejoras Futuras

1. **Cache de Consultas**
   - Cachear respuestas de Bold por 5 minutos
   - Reducir llamadas redundantes

2. **Webhook como Fuente Principal**
   - Usar webhook de Bold como fuente primaria
   - API de consulta como respaldo

3. **Retry Logic**
   - Reintentar consultas fallidas con backoff exponencial

4. **Notificaciones**
   - Alertar a usuarios si su pago fue aprobado tardíamente

## 📞 Soporte

**¿La sincronización no funciona?**

Verifica:
1. ✅ Variable `BOLD_API_KEY` está configurada
2. ✅ API Key tiene permisos de consulta
3. ✅ Bold está en el ambiente correcto (sandbox/production)
4. ✅ Firewall permite conexiones a Bold API

**Logs de debug:**
```bash
# Ver logs del servidor
# Las consultas a Bold se registran automáticamente
```

## 📚 Referencias

- [Bold API Documentation](https://docs.bold.co/)
- [Implementación Original](/docs/bold-transaction-cleanup.md)
- [Configuración de Seguridad](/docs/env-cron-token.md)

---

**✅ Sistema implementado y sincronizando con Bold API** 🎉
