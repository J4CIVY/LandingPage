# Configuración de Variables de Entorno - Sistema de Pagos Bold

## Variables Requeridas para Limpieza de Transacciones

### CRON_SECRET_TOKEN

Token secreto para proteger el endpoint de limpieza automática de transacciones expiradas.

**Generación del token:**

```bash
# Opción 1: OpenSSL
openssl rand -base64 32

# Opción 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Opción 3: Python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Configuración:**

```env
# .env.local
CRON_SECRET_TOKEN=tu_token_super_secreto_generado_aqui
```

**Uso:**

Este token se usa para autenticar llamadas al endpoint de limpieza:

```bash
curl -X POST https://tu-dominio.com/api/bold/transactions/cleanup \
  -H "Authorization: Bearer tu_token_super_secreto_generado_aqui"
```

## Configuración en Diferentes Plataformas

### Vercel

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega: `CRON_SECRET_TOKEN` = tu token generado
4. Aplica a: Production, Preview, Development (según necesites)

### GitHub Actions

1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions
3. New repository secret
4. Name: `CRON_SECRET_TOKEN`
5. Value: tu token generado

### Local Development

Crea o edita `.env.local`:

```env
CRON_SECRET_TOKEN=tu_token_para_desarrollo_local
```

⚠️ **Importante**: Usa tokens diferentes para desarrollo y producción.

## Seguridad

- ✅ **Nunca** commitees el token al repositorio
- ✅ **Agrega** `.env.local` a `.gitignore`
- ✅ **Usa** tokens diferentes por ambiente
- ✅ **Rota** el token periódicamente (cada 3-6 meses)
- ✅ **Genera** tokens con alta entropía (mínimo 32 caracteres)

## Verificación

Para verificar que la variable está configurada:

```bash
# En desarrollo
echo $CRON_SECRET_TOKEN

# En producción (Vercel)
vercel env ls
```

## Más Información

Ver documentación completa: [/docs/bold-transaction-cleanup.md](../docs/bold-transaction-cleanup.md)
