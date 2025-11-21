import { Categoria, Beneficio, HistorialUso, CategoriaTypes } from '@/types/beneficios';

// Categorías con sus configuraciones
export const categorias: Categoria[] = [
  {
    id: 'talleres-mecanica',
    nombre: 'Talleres y Mecánica',
    icon: 'FaWrench',
    color: 'blue'
  },
  {
    id: 'accesorios-repuestos',
    nombre: 'Accesorios y Repuestos',
    icon: 'FaCog',
    color: 'green'
  },
  {
    id: 'restaurantes-hoteles',
    nombre: 'Restaurantes y Hoteles',
    icon: 'FaUtensils',
    color: 'orange'
  },
  {
    id: 'seguros-finanzas',
    nombre: 'Seguros y Finanzas',
    icon: 'FaShieldAlt',
    color: 'purple'
  },
  {
    id: 'salud-bienestar',
    nombre: 'Salud y Bienestar',
    icon: 'FaHeartbeat',
    color: 'red'
  },
  {
    id: 'otros',
    nombre: 'Otros',
    icon: 'FaEllipsisH',
    color: 'gray'
  }
];

// Datos simulados de beneficios
export const beneficiosMock: Beneficio[] = [
  // Talleres y Mecánica
  {
    id: '1',
    nombre: 'Servicio completo de mantenimiento',
    categoria: 'talleres-mecanica',
    descripcionBreve: 'Servicio completo de mantenimiento para tu moto con 20% de descuento',
    descripcionCompleta: 'Obtén un servicio completo de mantenimiento para tu motocicleta que incluye cambio de aceite, revisión de frenos, ajuste de cadena, revisión de suspensión y diagnóstico general. Válido para todas las marcas y modelos.',
    descuento: '20% OFF',
    ubicacion: 'Av. Principal 123, Centro',
    enlaceWeb: 'https://tallermotobsk.com',
    imagen: '/images/beneficios/taller-mecanica.jpg',
    logo: '/images/logos/taller-logo.png',
    empresa: 'Taller MecánicaPro',
    codigoPromocional: 'BSK2024MANT',
    qrCode: '/images/qr/qr-mantenimiento.png',
    fechaInicio: new Date('2024-01-01'),
    fechaFin: new Date('2024-12-31'),
    estado: 'activo',
    requisitos: [
      'Mostrar carné de miembro BSK',
      'Reservar cita con anticipación',
      'Válido solo para mantenimiento preventivo'
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    nombre: 'Diagnóstico gratuito',
    categoria: 'talleres-mecanica',
    descripcionBreve: 'Diagnóstico completo gratuito para detectar fallas en tu motocicleta',
    descripcionCompleta: 'Recibe un diagnóstico profesional completamente gratuito que incluye escaneo computarizado, revisión visual completa y reporte detallado de fallas encontradas. El servicio no incluye reparaciones.',
    descuento: '100% Gratis',
    ubicacion: 'Calle 45 #67-89, Zona Industrial',
    imagen: '/images/beneficios/diagnostico.jpg',
    logo: '/images/logos/diagno-logo.png',
    empresa: 'Centro de Diagnóstico Moto',
    codigoPromocional: 'BSKDIAG2024',
    fechaInicio: new Date('2024-02-01'),
    fechaFin: new Date('2024-11-30'),
    estado: 'activo',
    requisitos: [
      'Presentar carné de miembro',
      'Una vez por año por socio',
      'Cita previa obligatoria'
    ],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },

  // Accesorios y Repuestos
  {
    id: '3',
    nombre: 'Descuento en repuestos originales',
    categoria: 'accesorios-repuestos',
    descripcionBreve: 'Ahorra 15% en repuestos originales para todas las marcas',
    descripcionCompleta: 'Descuento del 15% en repuestos originales de todas las marcas: Honda, Yamaha, Kawasaki, Suzuki, BMW, KTM y más. Incluye filtros, pastillas de freno, cadenas, coronas, piñones y demás repuestos de desgaste.',
    descuento: '15% OFF',
    ubicacion: 'Centro Comercial MotoWorld, Local 205',
    imagen: '/images/beneficios/repuestos.jpg',
    logo: '/images/logos/repuestos-logo.png',
    empresa: 'Repuestos Moto BSK',
    codigoPromocional: 'BSK15REP2024',
    fechaInicio: new Date('2024-01-15'),
    fechaFin: new Date('2024-12-15'),
    estado: 'activo',
    requisitos: [
      'Válido solo para repuestos originales',
      'No acumulable con otras promociones',
      'Mínimo de compra $100.000'
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '4',
    nombre: 'Accesorios de protección',
    categoria: 'accesorios-repuestos',
    descripcionBreve: 'Kit completo de protección con descuento especial',
    descripcionCompleta: 'Kit de protección completo que incluye: casco integral, chaqueta protectora, guantes, rodilleras y coderas. Descuento especial para miembros BSK en equipos de primeras marcas.',
    descuento: '25% OFF',
    ubicacion: 'Av. Las Américas 890',
    enlaceWeb: 'https://proteccionmoto.com',
    imagen: '/images/beneficios/proteccion.jpg',
    logo: '/images/logos/proteccion-logo.png',
    empresa: 'SafeRide Equipment',
    codigoPromocional: 'BSKPROT25',
    fechaInicio: new Date('2024-03-01'),
    fechaFin: new Date('2025-02-28'),
    estado: 'activo',
    requisitos: [
      'Válido para compras superiores a $500.000',
      'Incluye garantía extendida',
      'Tallas sujetas a disponibilidad'
    ],
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01')
  },

  // Restaurantes y Hoteles
  {
    id: '5',
    nombre: 'Hospedaje en ruta',
    categoria: 'restaurantes-hoteles',
    descripcionBreve: 'Descuentos en hospedaje para viajes largos en ruta',
    descripcionCompleta: 'Red de hoteles aliados con descuentos especiales para motociclistas. Incluye parqueadero seguro para motos, desayuno y wifi. Disponible en principales rutas turísticas del país.',
    descuento: '30% OFF',
    ubicacion: 'Red nacional de hoteles',
    enlaceWeb: 'https://hotelesmotociclistas.com',
    imagen: '/images/beneficios/hotel.jpg',
    logo: '/images/logos/hotel-logo.png',
    empresa: 'Red Hoteles Ruta Moto',
    codigoPromocional: 'BSKHOTEL30',
    fechaInicio: new Date('2024-01-01'),
    fechaFin: new Date('2024-12-31'),
    estado: 'activo',
    requisitos: [
      'Reserva con 48 horas de anticipación',
      'Incluye parqueadero vigilado',
      'Válido de domingo a jueves'
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '6',
    nombre: 'Restaurante El Motero',
    categoria: 'restaurantes-hoteles',
    descripcionBreve: 'Comida típica con ambiente motero y descuento especial',
    descripcionCompleta: 'Restaurante temático para motociclistas con comida típica colombiana, ambiente motero único, parqueadero exclusivo y atención especial para grupos de motociclistas.',
    descuento: '20% OFF',
    ubicacion: 'Km 45 Autopista Norte',
    imagen: '/images/beneficios/restaurante.jpg',
    empresa: 'Restaurante El Motero',
    codigoPromocional: 'BSKMOTERO20',
    fechaInicio: new Date('2024-02-01'),
    fechaFin: new Date('2024-12-31'),
    estado: 'activo',
    requisitos: [
      'Consumo mínimo $50.000',
      'Válido de lunes a viernes',
      'Presentar carné de miembro'
    ],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },

  // Seguros y Finanzas
  {
    id: '7',
    nombre: 'Seguro SOAT con descuento',
    categoria: 'seguros-finanzas',
    descripcionBreve: 'SOAT para motocicletas con precio preferencial',
    descripcionCompleta: 'Seguro Obligatorio de Accidentes de Tránsito (SOAT) con precio preferencial para miembros BSK. Trámite ágil, cobertura completa y atención personalizada.',
    descuento: '10% OFF',
    enlaceWeb: 'https://segurosmotos.com',
    imagen: '/images/beneficios/soat.jpg',
    logo: '/images/logos/seguro-logo.png',
    empresa: 'Seguros Moto Plus',
    codigoPromocional: 'BSKSOAT10',
    fechaInicio: new Date('2024-01-01'),
    fechaFin: new Date('2024-12-31'),
    estado: 'activo',
    requisitos: [
      'Moto al día con revisión técnica',
      'Documentos del propietario al día',
      'Pago de contado'
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '8',
    nombre: 'Seguro todo riesgo',
    categoria: 'seguros-finanzas',
    descripcionBreve: 'Seguro integral para tu motocicleta con cobertura amplia',
    descripcionCompleta: 'Seguro todo riesgo que cubre hurto, pérdida total, accidentes, responsabilidad civil, gastos médicos y asistencia en carretera las 24 horas.',
    descuento: '15% OFF',
    enlaceWeb: 'https://todoriesgomoto.com',
    imagen: '/images/beneficios/seguro-integral.jpg',
    empresa: 'AseguraMoto Total',
    codigoPromocional: 'BSKTOTAL15',
    fechaInicio: new Date('2024-04-01'),
    fechaFin: new Date('2025-03-31'),
    estado: 'proximamente',
    requisitos: [
      'Moto modelo 2018 en adelante',
      'Valor asegurado hasta $50.000.000',
      'Evaluación previa de la moto'
    ],
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date('2024-04-01')
  },

  // Salud y Bienestar
  {
    id: '9',
    nombre: 'Fisioterapia especializada',
    categoria: 'salud-bienestar',
    descripcionBreve: 'Fisioterapia especializada para motociclistas',
    descripcionCompleta: 'Centro de fisioterapia especializado en lesiones comunes de motociclistas: problemas de columna, muñecas, rodillas y tobillos. Terapia personalizada y planes de recuperación.',
    descuento: '25% OFF',
    ubicacion: 'Centro Médico Salud Total, Piso 3',
    imagen: '/images/beneficios/fisioterapia.jpg',
    logo: '/images/logos/fisio-logo.png',
    empresa: 'FisioMoto Rehabilitación',
    codigoPromocional: 'BSKFISIO25',
    fechaInicio: new Date('2024-03-01'),
    fechaFin: new Date('2024-12-31'),
    estado: 'activo',
    requisitos: [
      'Valoración inicial obligatoria',
      'Mínimo 4 sesiones',
      'Cita previa requerida'
    ],
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01')
  },

  // Otros
  {
    id: '10',
    nombre: 'Curso de conducción defensiva',
    categoria: 'otros',
    descripcionBreve: 'Curso especializado en técnicas de conducción segura',
    descripcionCompleta: 'Curso teórico-práctico de conducción defensiva para motociclistas. Incluye técnicas de frenado, curvas, conducción en lluvia y primeros auxilios básicos.',
    descuento: 'Gratis',
    ubicacion: 'Pista de entrenamiento BSK',
    imagen: '/images/beneficios/curso-conduccion.jpg',
    empresa: 'Escuela de Conducción BSK',
    codigoPromocional: 'BSKCURSO2024',
    fechaInicio: new Date('2024-06-01'),
    fechaFin: new Date('2024-12-31'),
    estado: 'proximamente',
    requisitos: [
      'Licencia de conducir vigente',
      'Moto propia para práctica',
      'Equipo de protección completo'
    ],
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-01')
  }
];

// Datos simulados de historial de uso
export const historialUsoMock: HistorialUso[] = [
  {
    id: 'hist1',
    beneficioId: '1',
    beneficioNombre: 'Servicio completo de mantenimiento',
    usuarioId: 'user123',
    fechaUso: new Date('2024-08-15'),
    estado: 'usado',
    codigoUsado: 'BSK2024MANT'
  },
  {
    id: 'hist2',
    beneficioId: '3',
    beneficioNombre: 'Descuento en repuestos originales',
    usuarioId: 'user123',
    fechaUso: new Date('2024-09-02'),
    estado: 'vigente',
    codigoUsado: 'BSK15REP2024'
  },
  {
    id: 'hist3',
    beneficioId: '5',
    beneficioNombre: 'Hospedaje en ruta',
    usuarioId: 'user123',
    fechaUso: new Date('2024-07-20'),
    estado: 'usado',
    codigoUsado: 'BSKHOTEL30'
  },
  {
    id: 'hist4',
    beneficioId: '6',
    beneficioNombre: 'Restaurante El Motero',
    usuarioId: 'user123',
    fechaUso: new Date('2024-08-30'),
    estado: 'usado',
    codigoUsado: 'BSKMOTERO20'
  },
  {
    id: 'hist5',
    beneficioId: '7',
    beneficioNombre: 'Seguro SOAT con descuento',
    usuarioId: 'user123',
    fechaUso: new Date('2024-01-10'),
    estado: 'expirado',
    codigoUsado: 'BSKSOAT10'
  }
];

// Funciones utilitarias para los datos
export const getBeneficiosPorCategoria = (categoria: CategoriaTypes | 'todos'): Beneficio[] => {
  if (categoria === 'todos') {
    return beneficiosMock;
  }
  return beneficiosMock.filter(beneficio => beneficio.categoria === categoria);
};

export const getBeneficioPorId = (id: string): Beneficio | undefined => {
  return beneficiosMock.find(beneficio => beneficio.id === id);
};

export const getHistorialPorUsuario = (usuarioId: string): HistorialUso[] => {
  return historialUsoMock.filter(historial => historial.usuarioId === usuarioId);
};

export const getEstadisticasBeneficios = () => {
  return {
    totalBeneficios: beneficiosMock.length,
    beneficiosActivos: beneficiosMock.filter(b => b.estado === 'activo').length,
    beneficiosProximamente: beneficiosMock.filter(b => b.estado === 'proximamente').length,
    beneficiosExpirados: beneficiosMock.filter(b => b.estado === 'expirado').length,
    empresasAliadas: [...new Set(beneficiosMock.map(b => b.empresa))].length,
    usosEsteMes: historialUsoMock.filter(h => 
      new Date(h.fechaUso).getMonth() === new Date().getMonth()
    ).length,
    ahorroEstimado: 2450 // Valor simulado
  };
};
