export type CategoriaTypes = 
  | 'talleres-mecanica'
  | 'accesorios-repuestos'
  | 'restaurantes-hoteles'
  | 'seguros-finanzas'
  | 'salud-bienestar'
  | 'otros';

export interface Categoria {
  id: CategoriaTypes;
  nombre: string;
  icon: string;
  color: string;
}

export type EstadoBeneficio = 'activo' | 'proximamente' | 'expirado';

export interface Beneficio {
  id: string;
  nombre: string;
  categoria: CategoriaTypes;
  descripcionBreve: string;
  descripcionCompleta: string;
  descuento: string;
  ubicacion?: string;
  enlaceWeb?: string;
  imagen: string;
  logo?: string;
  empresa: string;
  codigoPromocional: string;
  qrCode?: string;
  fechaInicio: Date;
  fechaFin: Date;
  estado: EstadoBeneficio;
  requisitos: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type EstadoUso = 'vigente' | 'expirado' | 'usado';

export interface HistorialUso {
  id: string;
  beneficioId: string;
  beneficioNombre: string;
  usuarioId: string;
  fechaUso: Date;
  estado: EstadoUso;
  codigoUsado: string;
}

export interface EstadisticasBeneficio {
  beneficioId: string;
  numeroUsuarios: number;
  valorAhorroEstimado: number;
  fechasUso: Date[];
}

// Interfaces para formularios
export interface BeneficioFormData {
  nombre: string;
  categoria: CategoriaTypes;
  descripcionBreve: string;
  descripcionCompleta: string;
  descuento: string;
  ubicacion?: string;
  enlaceWeb?: string;
  empresa: string;
  codigoPromocional: string;
  fechaInicio: string;
  fechaFin: string;
  requisitos: string[];
  imagen?: File | null;
}

// Props para componentes
export interface BeneficioCardProps {
  beneficio: Beneficio;
  onVerDetalles: (beneficio: Beneficio) => void;
  onObtenerBeneficio: (beneficio: Beneficio) => void;
}

export interface BeneficioModalProps {
  beneficio: Beneficio | null;
  isOpen: boolean;
  onClose: () => void;
  onCompartir: (beneficio: Beneficio) => void;
}

export interface CategoriesTabsProps {
  categorias: Categoria[];
  categoriaActiva: CategoriaTypes | 'todos';
  onCategoriaChange: (categoria: CategoriaTypes | 'todos') => void;
}

export interface BeneficiosHeaderProps {
  isAdmin: boolean;
  onAgregarBeneficio: () => void;
}

export interface HistorialUsoProps {
  historial: HistorialUso[];
  isLoading?: boolean;
}

export interface BeneficioFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BeneficioFormData) => void;
  beneficio?: Beneficio | null;
  isLoading?: boolean;
}