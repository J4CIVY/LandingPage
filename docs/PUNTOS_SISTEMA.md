# Sistema de Puntos y Recompensas - BSK Motorcycle Team

## 📖 Descripción

Sistema completo de gamificación para el dashboard del BSK Motorcycle Team que permite a los miembros acumular puntos por sus actividades y canjearlos por recompensas exclusivas.

## 🗂️ Estructura de Archivos

```
/app/dashboard/puntos/
├── page.tsx                    # Página principal del sistema

/components/puntos/
├── PuntosHeader.tsx           # Header con puntos actuales del usuario
├── ProgresoNivel.tsx          # Barra de progreso hacia siguiente nivel
├── HistorialPuntos.tsx        # Tabla de historial con filtros
├── RecompensaCard.tsx         # Tarjeta individual de recompensa
├── RecompensaModal.tsx        # Modal para detalles y canje
├── Leaderboard.tsx            # Ranking de miembros
├── AdminPanel.tsx             # Panel administrativo
└── NotificacionesToast.tsx    # Sistema de notificaciones

/types/puntos/
└── index.ts                   # Interfaces y tipos TypeScript

/data/puntos/
└── mockData.ts               # Datos simulados para desarrollo

/hooks/
└── useNotificacionesPuntos.ts # Hook para gestión de notificaciones
```

## 🎮 Funcionalidades

### Para Usuarios Regulares

- **Dashboard Principal**: Visualización de puntos actuales y progreso
- **Sistema de Niveles**: 
  - 🥉 Rookie (0-499 puntos)
  - 🥈 Rider (500-1499 puntos) 
  - 🥇 Pro Rider (1500-2999 puntos)
  - 👑 Legend (3000+ puntos)
- **Historial de Actividades**: Filtrado por tipo y fecha
- **Catálogo de Recompensas**: Cards con detalles y sistema de canje
- **Ranking**: Leaderboard con filtros temporales

### Para Administradores

- **Estadísticas**: Métricas de puntos generados, canjes, etc.
- **Gestión de Recompensas**: CRUD completo
- **Asignación Manual**: Dar/quitar puntos a miembros
- **Reportes**: Top recompensas y miembros más activos

## 🎨 Características de Diseño

### Colores de Niveles
- **Bronce**: `#CD7F32` (Rookie)
- **Plata**: `#C0C0C0` (Rider)
- **Oro**: `#FFD700` (Pro Rider)
- **Platino**: `#00BFFF` (Legend)

### Responsividad
- Mobile-first design
- Grids adaptativos
- Navegación por tabs optimizada para móvil
- Cards responsivas

### Animaciones
- Transiciones suaves en hover
- Loading states
- Animaciones de progreso
- Confirmaciones visuales

## 🔧 Configuración

### 1. Navegación
Para integrar con el dashboard existente, agregar a la navegación:

```typescript
{
  name: "Puntos",
  href: "/dashboard/puntos",
  icon: "🏍️",
  current: false
}
```

### 2. Datos Reales
Reemplazar `mockData.ts` con llamadas a API reales:

```typescript
// Ejemplo de integración con API
const obtenerUsuarioActual = async (): Promise<Usuario> => {
  const response = await fetch('/api/puntos/usuario-actual');
  return response.json();
};
```

### 3. Imágenes
Agregar imágenes de recompensas en `/public/images/rewards/`
- Formato recomendado: WebP o JPG
- Tamaño recomendado: 300x200px
- Placeholder automático incluido

## 📱 Uso

### Canje de Recompensas
1. Usuario navega a la sección "Recompensas"
2. Hace clic en "Ver detalles" o "Canjear" 
3. Se abre modal con información completa
4. Confirma el canje si cumple requisitos
5. Recibe notificación de éxito

### Administración
1. Solo usuarios con `esAdmin: true` ven la pestaña "Admin"
2. Pueden crear/gestionar recompensas
3. Asignar puntos manualmente
4. Ver estadísticas detalladas

## 🎯 Próximas Mejoras

### Backend Integration
- [ ] API endpoints para CRUD de recompensas
- [ ] Sistema de notificaciones por email
- [ ] Webhook para asignación automática de puntos
- [ ] Backup y restauración de datos

### Funcionalidades Adicionales
- [ ] Sistema de badges/logros
- [ ] Challenges temporales
- [ ] Referidos y bonificaciones
- [ ] Exportación de reportes (PDF/Excel)
- [ ] Notificaciones push

### UX/UI Improvements
- [ ] Dark mode support
- [ ] Animaciones más avanzadas
- [ ] Filtros avanzados en historial
- [ ] Vista de calendario para eventos

## 🐛 Solución de Problemas

### Error de TypeScript
Si aparecen errores de tipos, verificar que todas las interfaces estén importadas correctamente desde `/types/puntos/index.ts`.

### Imágenes no cargan
Las imágenes tienen fallback automático a placeholder SVG. Para usar imágenes reales, colocarlas en la carpeta `public/images/rewards/`.

### Performance
El sistema usa lazy loading y paginación simulada. Para datasets grandes, implementar paginación real en el backend.

## 🚀 Deployment

### Desarrollo
```bash
npm run dev
# Navegar a http://localhost:3000/dashboard/puntos
```

### Producción
- Configurar variables de entorno para APIs
- Optimizar imágenes de recompensas
- Configurar CDN si es necesario
- Testear en diferentes dispositivos

## 📞 Soporte

Para dudas o problemas:
1. Revisar esta documentación
2. Verificar tipos TypeScript
3. Comprobar datos simulados
4. Contactar al equipo de desarrollo

---

**Versión**: 1.0.0  
**Última actualización**: Diciembre 2024  
**Desarrollado para**: BSK Motorcycle Team Dashboard