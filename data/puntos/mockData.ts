import { Usuario, Nivel, PuntosActividad, Recompensa, EstadisticasAdmin } from '@/types/puntos';

// Niveles del sistema
export const niveles: Nivel[] = [
  {
    id: 1,
    nombre: "Rookie",
    puntosMinimos: 0,
    puntosMaximos: 499,
    color: "#CD7F32", // Bronce
    icono: "🥉",
    beneficios: [
      "Acceso a eventos básicos",
      "Descuento 5% en tienda",
      "Foro comunitario"
    ]
  },
  {
    id: 2,
    nombre: "Rider",
    puntosMinimos: 500,
    puntosMaximos: 1499,
    color: "#C0C0C0", // Plata
    icono: "🥈",
    beneficios: [
      "Todos los beneficios anteriores",
      "Acceso a eventos intermedios",
      "Descuento 10% en tienda",
      "Soporte prioritario"
    ]
  },
  {
    id: 3,
    nombre: "Pro Rider",
    puntosMinimos: 1500,
    puntosMaximos: 2999,
    color: "#FFD700", // Oro
    icono: "🥇",
    beneficios: [
      "Todos los beneficios anteriores",
      "Acceso a eventos premium",
      "Descuento 15% en tienda",
      "Invitaciones a eventos exclusivos"
    ]
  },
  {
    id: 4,
    nombre: "Legend",
    puntosMinimos: 3000,
    puntosMaximos: 9999999,
    color: "#00BFFF", // Platino
    icono: "👑",
    beneficios: [
      "Todos los beneficios anteriores",
      "Acceso total a eventos VIP",
      "Descuento 20% en tienda",
      "Asesoría personalizada",
      "Productos exclusivos"
    ]
  }
];

// Recompensas disponibles
export const recompensas: Recompensa[] = [
  {
    id: "1",
    nombre: "Camiseta BSK MT",
    descripcion: "Camiseta oficial del BSK Motorcycle Team con diseño exclusivo. Material 100% algodón, disponible en varias tallas.",
    costoPuntos: 200,
    disponible: true,
    imagen: "/images/rewards/camiseta-bsk.jpg",
    categoria: "Producto",
    stock: 25,
    nivelMinimo: 1
  },
  {
    id: "2",
    nombre: "Descuento 20% Mantenimiento",
    descripcion: "Descuento del 20% en servicios de mantenimiento para tu motocicleta en talleres afiliados.",
    costoPuntos: 300,
    disponible: true,
    imagen: "/images/rewards/descuento-mantenimiento.jpg",
    categoria: "Descuento",
    nivelMinimo: 2
  },
  {
    id: "3",
    nombre: "Entrada VIP Evento Anual",
    descripcion: "Entrada VIP al evento anual del club con acceso a zona exclusiva, comida y bebidas incluidas.",
    costoPuntos: 800,
    disponible: true,
    imagen: "/images/rewards/entrada-vip.jpg",
    categoria: "Experiencia",
    stock: 10,
    nivelMinimo: 3
  },
  {
    id: "4",
    nombre: "Kit de Accesorios BSK",
    descripcion: "Kit completo de accesorios BSK MT: gorra, stickers, llavero y parche bordado.",
    costoPuntos: 150,
    disponible: true,
    imagen: "/images/rewards/kit-accesorios.jpg",
    categoria: "Producto",
    stock: 50
  },
  {
    id: "5",
    nombre: "Asesoría Técnica Personal",
    descripcion: "Sesión de asesoría técnica personalizada de 1 hora con expertos mecánicos del club.",
    costoPuntos: 500,
    disponible: true,
    imagen: "/images/rewards/asesoria-tecnica.jpg",
    categoria: "Servicio",
    nivelMinimo: 3,
    stock: 5
  },
  {
    id: "6",
    nombre: "Chaqueta Legend Edition",
    descripcion: "Chaqueta exclusiva para miembros Legend con bordados especiales y materiales premium.",
    costoPuntos: 1200,
    disponible: true,
    imagen: "/images/rewards/chaqueta-legend.jpg",
    categoria: "Producto",
    nivelMinimo: 4,
    stock: 3
  }
];

// Historial de actividades simulado
export const historialActividades: PuntosActividad[] = [
  {
    id: "1",
    fecha: "2024-12-10",
    tipo: "Evento",
    descripcion: "Participación en Ruta de Navidad BSK MT",
    puntos: 150,
    saldo: 850
  },
  {
    id: "2",
    fecha: "2024-12-05",
    tipo: "Comunidad",
    descripcion: "Comentario destacado en foro",
    puntos: 25,
    saldo: 700
  },
  {
    id: "3",
    fecha: "2024-12-01",
    tipo: "Membresía",
    descripcion: "Renovación de membresía anual",
    puntos: 200,
    saldo: 675
  },
  {
    id: "4",
    fecha: "2024-11-28",
    tipo: "Evento",
    descripcion: "Asistencia a taller de mecánica",
    puntos: 100,
    saldo: 475
  },
  {
    id: "5",
    fecha: "2024-11-25",
    tipo: "Beneficio",
    descripcion: "Canje: Camiseta BSK MT",
    puntos: -200,
    saldo: 375
  },
  {
    id: "6",
    fecha: "2024-11-20",
    tipo: "Evento",
    descripcion: "Organización de evento comunitario",
    puntos: 300,
    saldo: 575
  },
  {
    id: "7",
    fecha: "2024-11-15",
    tipo: "Comunidad",
    descripcion: "Publicación de ruta recomendada",
    puntos: 75,
    saldo: 275
  },
  {
    id: "8",
    fecha: "2024-11-10",
    tipo: "Otro",
    descripcion: "Bono de bienvenida",
    puntos: 200,
    saldo: 200
  }
];

// Usuario actual simulado
export const usuarioActual: Usuario = {
  id: "user-1",
  nombre: "Carlos Rodríguez",
  alias: "CarlosR_BSK",
  puntosTotales: 850,
  nivel: niveles[1], // Rider
  posicionRanking: 5,
  avatar: "/images/avatars/carlos.jpg",
  esAdmin: true // Cambio a true para probar funcionalidades admin
};

// Leaderboard simulado
export const leaderboard: Usuario[] = [
  {
    id: "user-2",
    nombre: "María González",
    alias: "MariG_Legend",
    puntosTotales: 3250,
    nivel: niveles[3], // Legend
    posicionRanking: 1,
    avatar: "/images/avatars/maria.jpg"
  },
  {
    id: "user-3",
    nombre: "José Martínez",
    alias: "JoseMart_Pro",
    puntosTotales: 2890,
    nivel: niveles[3], // Legend
    posicionRanking: 2,
    avatar: "/images/avatars/jose.jpg"
  },
  {
    id: "user-4",
    nombre: "Ana López",
    alias: "AnaL_Rider",
    puntosTotales: 1750,
    nivel: niveles[2], // Pro Rider
    posicionRanking: 3,
    avatar: "/images/avatars/ana.jpg"
  },
  {
    id: "user-5",
    nombre: "David Sánchez",
    alias: "DavidS_Pro",
    puntosTotales: 1650,
    nivel: niveles[2], // Pro Rider
    posicionRanking: 4,
    avatar: "/images/avatars/david.jpg"
  },
  usuarioActual,
  {
    id: "user-6",
    nombre: "Laura Herrera",
    alias: "LauraH_Rider",
    puntosTotales: 750,
    nivel: niveles[1], // Rider
    posicionRanking: 6,
    avatar: "/images/avatars/laura.jpg"
  },
  {
    id: "user-7",
    nombre: "Miguel Torres",
    alias: "MiguelT_Rookie",
    puntosTotales: 380,
    nivel: niveles[0], // Rookie
    posicionRanking: 7,
    avatar: "/images/avatars/miguel.jpg"
  }
];

// Estadísticas para admin
export const estadisticasAdmin: EstadisticasAdmin = {
  puntosGeneradosMes: 15420,
  recompensasMasCanjeadas: [
    { recompensa: recompensas[0], cantidad: 12 },
    { recompensa: recompensas[3], cantidad: 8 },
    { recompensa: recompensas[1], cantidad: 6 }
  ],
  topMiembrosActivos: leaderboard.slice(0, 5),
  totalCanjes: 45,
  totalPuntosCirculacion: 25680
};

// Funciones API simuladas
export const obtenerUsuarioActual = async (): Promise<Usuario> => {
  // Simular delay de API
  await new Promise(resolve => setTimeout(resolve, 500));
  return usuarioActual;
};

export const obtenerNiveles = async (): Promise<Nivel[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return niveles;
};

export const obtenerRecompensas = async (): Promise<Recompensa[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return recompensas.filter(r => r.disponible);
};

export const obtenerHistorialPuntos = async (usuarioId: string): Promise<PuntosActividad[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return historialActividades;
};

export const obtenerLeaderboard = async (periodo: "Mensual" | "Anual" | "Histórico" = "Histórico"): Promise<Usuario[]> => {
  await new Promise(resolve => setTimeout(resolve, 350));
  return leaderboard.sort((a, b) => b.puntosTotales - a.puntosTotales);
};

export const obtenerEstadisticasAdmin = async (): Promise<EstadisticasAdmin> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return estadisticasAdmin;
};

export const canjearRecompensa = async (recompensaId: string, usuarioId: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  // Simular éxito del canje
  return true;
};