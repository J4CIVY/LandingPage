# Sistema de Subida de Imágenes para Formulario de Eventos

## Resumen de Cambios

Se ha implementado un sistema completo de subida de imágenes a Cloudinary para el formulario de eventos, reemplazando los inputs manuales de URL con componentes de subida interactivos.

## Componentes Integrados

### 1. ImageUpload - Imagen Principal
- **Ubicación**: Sección de "Imágenes del Evento"
- **Función**: Maneja la subida de la imagen principal del evento
- **Configuración**:
  - Carpeta: `events`
  - Prefijo: `event_${timestamp}`
  - Transformaciones: 1200x800px, optimizado para paisajes

### 2. ImageGalleryUpload - Galería
- **Ubicación**: Después de la imagen principal
- **Función**: Permite subir hasta 10 imágenes adicionales
- **Configuración**:
  - Carpeta: `events/gallery`
  - Prefijo: `event_gallery_${timestamp}`
  - Máximo: 10 imágenes

## Mejoras en la UI

### Sección de Imágenes
- Agrupada en un contenedor visual separado con fondo gris claro
- Mejor organización y flujo visual
- Textos explicativos para guiar al usuario

### Sección del Organizador
- Agrupada en un contenedor azul claro
- Mejor separación visual del resto del formulario

### Modal Mejorado
- Tamaño aumentado (max-w-5xl)
- Header fijo con mejor interacción
- Mejor espaciado y organización

## Validaciones Añadidas

1. **Imagen Principal**: Requerida antes de enviar el formulario
2. **Ubicación de Salida**: Dirección y ciudad requeridas
3. **Organizador**: Todos los campos requeridos
4. **Mensajes de Error**: Retroalimentación clara al usuario

## Configuración de Cloudinary

### Transformaciones Específicas para Eventos
- **Imagen Principal**: 1200x800px, crop: 'fill', gravity: 'center'
- **Galería**: Mismas transformaciones
- **Formato**: WebP automático para mejor compresión
- **Calidad**: Auto:good para equilibrio calidad/tamaño

### Carpetas Organizadas
- `events/` - Imágenes principales de eventos
- `events/gallery/` - Galería de imágenes de eventos
- `user-profiles/` - Continúa usando las transformaciones originales

## Características Destacadas

1. **Drag & Drop**: Subida por arrastrar y soltar
2. **Preview Inmediato**: Vista previa antes de confirmar
3. **Validación de Archivos**: Tipos y tamaños permitidos
4. **Rate Limiting**: Control de subidas por minuto
5. **Gestión de Errores**: Manejo robusto de errores
6. **Responsive**: Adaptado a diferentes tamaños de pantalla

## Flujo de Usuario

1. Usuario abre el formulario de evento
2. Sube imagen principal (requerida)
3. Opcionalmente sube imágenes a la galería
4. Completa el resto del formulario
5. Al enviar, se validan las imágenes y otros campos requeridos
6. Los datos se envían con las URLs de Cloudinary

## Archivos Modificados

- `components/eventos/EventoForm.tsx` - Formulario principal
- `lib/cloudinary-service.ts` - Servicio de Cloudinary mejorado

## Dependencias Utilizadas

- `@/components/shared/ImageUpload` - Componente existente
- `@/components/shared/ImageGalleryUpload` - Componente existente
- `@/hooks/useImageUpload` - Hook existente
- `@/lib/cloudinary-service` - Servicio existente (mejorado)