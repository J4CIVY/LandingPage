# Sistema de Subida de PDFs para Eventos

## Resumen de la Funcionalidad

Se ha implementado un sistema completo para subir archivos PDF como documentos detallados de eventos, siguiendo el mismo patrón establecido para las imágenes. Los PDFs se suben a Cloudinary y las URLs se almacenan en la base de datos junto con la información del evento.

## Componentes Implementados

### 1. Servicio de Cloudinary Extendido (`lib/cloudinary-service.ts`)

#### Nueva Función `uploadPdfToCloudinary()`
```typescript
export async function uploadPdfToCloudinary(
  file: string,
  folder: string = 'documents',
  publicId?: string
): Promise<CloudinaryUploadResult>
```

**Características:**
- `resource_type: 'raw'` para archivos que no son imágenes/videos
- `allowed_formats: ['pdf']` para restringir solo PDFs
- Carpeta por defecto: `documents`
- Metadatos incluyen `pages` (número de páginas del PDF)

#### Nueva Función `validatePdfFile()`
```typescript
export function validatePdfFile(file: File): { isValid: boolean; error?: string }
```

**Validaciones:**
- ✅ Tipo de archivo: Solo `application/pdf`
- ✅ Tamaño máximo: 10MB (mayor que imágenes)
- ✅ Mensajes de error específicos

### 2. Hook para Subida de PDFs (`hooks/usePdfUpload.ts`)

#### Interfaz `UsePdfUploadReturn`
```typescript
export interface UsePdfUploadReturn {
  uploading: boolean;
  uploadPdf: (file: File, folder?: string, publicId?: string) => Promise<PdfUploadResult>;
  uploadError: string | null;
  clearError: () => void;
}
```

**Funcionalidades:**
- Estado de carga (`uploading`)
- Función de subida con validaciones
- Manejo de errores específicos para PDFs
- Integración con la API `/api/upload-pdf`

### 3. API Route (`app/api/upload-pdf/route.ts`)

#### Endpoint `POST /api/upload-pdf`
- **Rate Limiting**: 2 subidas por minuto (más restrictivo que imágenes)
- **Validación**: Archivos PDF únicamente
- **Respuesta**: URL de Cloudinary y metadatos

**Request:**
```typescript
FormData {
  file: File,
  folder?: string,
  publicId?: string
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    url: string,
    publicId: string,
    format: string,
    bytes: number,
    pages?: number
  }
}
```

### 4. Componente de Subida (`components/shared/PdfUpload.tsx`)

#### Props del Componente
```typescript
interface PdfUploadProps {
  onPdfUploaded: (pdfUrl: string) => void;
  currentPdfUrl?: string;
  disabled?: boolean;
  className?: string;
  folder?: string;
  publicIdPrefix?: string;
}
```

#### Características UX
- **Drag & Drop**: Arrastrar y soltar PDFs
- **Visual Feedback**: Iconos y estados específicos para PDFs
- **Botones de Acción**:
  - 👁️ **Ver**: Abre el PDF en nueva pestaña
  - ❌ **Quitar**: Elimina el PDF seleccionado
- **Estados Visuales**:
  - Vacío con instrucciones
  - Cargando con spinner
  - PDF cargado con opciones

## Integración en el Formulario de Eventos

### 1. Tipos Actualizados

#### `types/events.ts`
```typescript
export interface Event {
  // ... otros campos
  detailsPdf?: string; // URL del PDF con detalles del evento
}

export interface CreateEventData {
  // ... otros campos  
  detailsPdf?: string; // URL del PDF con detalles del evento
}
```

#### `lib/models/Event.ts`
```typescript
export interface IEvent extends Document {
  // ... otros campos
  detailsPdf?: string; // URL del PDF con detalles del evento
}

const EventSchema = new Schema<IEvent>({
  // ... otros campos
  detailsPdf: { type: String }, // URL del PDF con detalles del evento
});
```

### 2. Formulario Actualizado

#### Ubicación en el Formulario
- **Sección**: "Imágenes y Documentos del Evento" (renombrada)
- **Posición**: Después de la galería de imágenes
- **Obligatorio**: No (opcional)

#### Configuración
- **Carpeta**: `events/documents`
- **Prefijo**: `event_details_${timestamp}`
- **Tamaño máximo**: 10MB

## Estructura de Carpetas en Cloudinary

```
cloudinary_root/
├── events/                     # Imágenes principales de eventos
├── events/gallery/            # Galería de imágenes de eventos  
├── events/documents/          # PDFs de detalles de eventos
└── user-profiles/             # Imágenes de perfil de usuarios
```

## Flujo Completo de Usuario

### Crear Evento con PDF
1. Usuario completa información básica del evento
2. Sube imagen principal (requerida)
3. Opcionalmente sube imágenes a la galería
4. **Opcionalmente sube PDF con detalles**
5. Completa el resto del formulario
6. Al enviar: todos los archivos están ya subidos a Cloudinary
7. Se guarda el evento con las URLs correspondientes

### Editar Evento Existente
1. Formulario carga con PDF existente (si hay)
2. Usuario puede ver el PDF actual
3. Puede reemplazar con nuevo PDF
4. Puede quitar el PDF existente
5. Los cambios se guardan al actualizar el evento

## Características Técnicas

### Validaciones
- ✅ **Tipo de archivo**: Solo PDFs (`application/pdf`)
- ✅ **Tamaño**: Máximo 10MB
- ✅ **Rate limiting**: 2 subidas por minuto por IP
- ✅ **Seguridad**: Validación en cliente y servidor

### Performance y UX
- ✅ **Preview inmediato**: Vista del PDF subido
- ✅ **Drag & Drop**: Interfaz intuitiva
- ✅ **Estados de carga**: Feedback visual claro
- ✅ **Manejo de errores**: Mensajes específicos
- ✅ **Responsive**: Adaptado a móviles

### Integración con Cloudinary
- ✅ **Transformaciones**: Automáticas para PDFs
- ✅ **CDN**: Entrega optimizada
- ✅ **Metadatos**: Información de páginas y tamaño
- ✅ **Formato**: Preservación del formato original

## Casos de Uso

### ✅ Eventos con Itinerario Detallado
- Subir PDF con cronograma completo
- Mapas de rutas detallados
- Información de hospedaje y comidas

### ✅ Eventos con Requisitos Específicos
- Documentos legales requeridos
- Listas de equipamiento necesario
- Formularios de inscripción adicionales

### ✅ Eventos Técnicos/Educativos
- Material de apoyo
- Presentaciones
- Manuales técnicos

## Beneficios

1. **📄 Información Completa**: Los organizadores pueden proporcionar detalles extensos
2. **🎯 Mejor Organización**: Documentos centralizados con el evento
3. **🔄 Consistencia**: Mismo patrón que las imágenes
4. **📱 Accesibilidad**: PDFs se abren en cualquier dispositivo
5. **⚡ Performance**: CDN de Cloudinary para entrega rápida

## Archivos Creados/Modificados

### Nuevos Archivos
- ✅ `/hooks/usePdfUpload.ts`
- ✅ `/app/api/upload-pdf/route.ts`  
- ✅ `/components/shared/PdfUpload.tsx`

### Archivos Modificados
- ✅ `/lib/cloudinary-service.ts` - Funciones para PDFs
- ✅ `/types/events.ts` - Campo `detailsPdf`
- ✅ `/lib/models/Event.ts` - Campo en modelo de DB
- ✅ `/components/eventos/EventoForm.tsx` - Integración del componente

La funcionalidad está completamente implementada y lista para usar! 🚀