import mongoose from 'mongoose';

// Configuración de MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bsk-motorcycle-team';

// Esquema del evento (simplificado para el script)
const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  longDescription: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  mainImage: { type: String, required: true },
  eventType: { type: String, required: true },
  status: { type: String, default: 'published' },
  departureLocation: {
    address: String,
    city: String,
    country: String
  },
  arrivalLocation: {
    address: String,
    city: String,
    country: String
  },
  maxParticipants: Number,
  currentParticipants: { type: Number, default: 0 },
  registrationDeadline: Date,
  price: { type: Number, default: 0 },
  difficulty: String,
  distance: Number,
  duration: Number,
  organizer: {
    name: String,
    phone: String,
    email: String
  },
  tags: [String],
  isActive: { type: Boolean, default: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);

const sampleEvents = [
  {
    name: "Rodada de Primavera 2025",
    description: "Una emocionante rodada por las montañas para recibir la primavera con estilo.",
    longDescription: "Únete a nosotros en esta increíble aventura por las montañas donde podrás disfrutar de paisajes únicos y la camaradería del grupo. La ruta incluye paradas estratégicas para descanso y refrigerio.",
    startDate: new Date('2025-03-15T08:00:00Z'),
    endDate: new Date('2025-03-15T18:00:00Z'),
    mainImage: "https://images.unsplash.com/photo-1558618666-9c2c1e0e7c7b?w=800&h=600&fit=crop",
    eventType: "Rodada Recreativa",
    status: "published",
    departureLocation: {
      address: "Parque Central",
      city: "Bogotá",
      country: "Colombia"
    },
    arrivalLocation: {
      address: "Mirador de La Calera",
      city: "La Calera",
      country: "Colombia"
    },
    maxParticipants: 50,
    currentParticipants: 23,
    registrationDeadline: new Date('2025-03-13T23:59:59Z'),
    price: 0,
    difficulty: "intermediate",
    distance: 120,
    duration: 8,
    organizer: {
      name: "Carlos Pérez",
      phone: "+57 300 123 4567",
      email: "carlos@bskmotorcycleteam.com"
    },
    tags: ["montaña", "recreativa", "paisajes"],
    isActive: true
  },
  {
    name: "Taller de Mantenimiento Básico",
    description: "Aprende técnicas esenciales de mantenimiento para tu motocicleta.",
    longDescription: "En este taller aprenderás a realizar el mantenimiento básico de tu motocicleta, incluyendo cambio de aceite, revisión de frenos, ajuste de cadena y más. Incluye materiales y herramientas.",
    startDate: new Date('2025-03-22T14:00:00Z'),
    endDate: new Date('2025-03-22T18:00:00Z'),
    mainImage: "https://images.unsplash.com/photo-1623844999984-5bf4b2d2e56a?w=800&h=600&fit=crop",
    eventType: "Taller Educativo",
    status: "published",
    departureLocation: {
      address: "Sede del Club BSK",
      city: "Bogotá",
      country: "Colombia"
    },
    maxParticipants: 20,
    currentParticipants: 12,
    registrationDeadline: new Date('2025-03-20T23:59:59Z'),
    price: 25000,
    difficulty: "beginner",
    duration: 4,
    organizer: {
      name: "Ana García",
      phone: "+57 310 987 6543",
      email: "ana@bskmotorcycleteam.com"
    },
    tags: ["educativo", "mantenimiento", "técnico"],
    isActive: true
  },
  {
    name: "Ruta Extrema - Boyacá Adventure",
    description: "Una ruta desafiante para motociclistas experimentados por los paisajes de Boyacá.",
    longDescription: "Esta ruta está diseñada para motociclistas con experiencia que buscan un verdadero desafío. Recorreremos terrenos variados, incluyendo montaña, tierra y asfalto, con paradas en pueblos típicos de Boyacá.",
    startDate: new Date('2025-04-05T06:00:00Z'),
    endDate: new Date('2025-04-06T20:00:00Z'),
    mainImage: "https://images.unsplash.com/photo-1566065659739-bdcfe2a7ad24?w=800&h=600&fit=crop",
    eventType: "Ruta Extrema",
    status: "published",
    departureLocation: {
      address: "Estación de Servicio Shell",
      city: "Bogotá",
      country: "Colombia"
    },
    arrivalLocation: {
      address: "Villa de Leyva",
      city: "Villa de Leyva",
      country: "Colombia"
    },
    maxParticipants: 25,
    currentParticipants: 18,
    registrationDeadline: new Date('2025-04-02T23:59:59Z'),
    price: 150000,
    difficulty: "expert",
    distance: 380,
    duration: 36,
    organizer: {
      name: "Miguel Rodríguez",
      phone: "+57 320 456 7890",
      email: "miguel@bskmotorcycleteam.com"
    },
    tags: ["extrema", "boyacá", "aventura", "paisajes"],
    isActive: true
  },
  {
    name: "Concentración Motera Nacional",
    description: "El evento moter más grande del año con participantes de todo el país.",
    longDescription: "Únete a la concentración motera más importante de Colombia. Tres días de música, competencias, exhibiciones y mucha diversión. Incluye camping, comidas y actividades para toda la familia motera.",
    startDate: new Date('2025-04-25T16:00:00Z'),
    endDate: new Date('2025-04-27T20:00:00Z'),
    mainImage: "https://images.unsplash.com/photo-1558618026-f0c4a6b60c8e?w=800&h=600&fit=crop",
    eventType: "Concentración",
    status: "published",
    departureLocation: {
      address: "Parque Las Américas",
      city: "Medellín",
      country: "Colombia"
    },
    maxParticipants: 500,
    currentParticipants: 287,
    registrationDeadline: new Date('2025-04-20T23:59:59Z'),
    price: 80000,
    difficulty: "beginner",
    duration: 72,
    organizer: {
      name: "Laura Martínez",
      phone: "+57 315 234 5678",
      email: "laura@bskmotorcycleteam.com"
    },
    tags: ["concentración", "nacional", "música", "competencias"],
    isActive: true
  },
  {
    name: "Curso de Conducción Segura",
    description: "Curso teórico-práctico sobre técnicas de conducción segura en motocicleta.",
    longDescription: "Un curso completo que combina teoría y práctica para mejorar tus habilidades de conducción segura. Incluye técnicas de frenado, manejo en curvas, conducción en diferentes condiciones climáticas y primeros auxilios básicos.",
    startDate: new Date('2025-03-29T09:00:00Z'),
    endDate: new Date('2025-03-29T17:00:00Z'),
    mainImage: "https://images.unsplash.com/photo-1544956718-e7e3c4c8b4b6?w=800&h=600&fit=crop",
    eventType: "Curso",
    status: "published",
    departureLocation: {
      address: "Autódromo de Tocancipá",
      city: "Tocancipá",
      country: "Colombia"
    },
    maxParticipants: 30,
    currentParticipants: 8,
    registrationDeadline: new Date('2025-03-27T23:59:59Z'),
    price: 120000,
    difficulty: "intermediate",
    duration: 8,
    organizer: {
      name: "Roberto Silva",
      phone: "+57 318 765 4321",
      email: "roberto@bskmotorcycleteam.com"
    },
    tags: ["seguridad", "educativo", "conducción", "técnicas"],
    isActive: true
  }
];

async function seedEvents() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
    
    // Insertar eventos de ejemplo
    const events = await Event.insertMany(sampleEvents);
    
    console.log(`✅ ${events.length} eventos de ejemplo creados exitosamente:`);
    events.forEach(event => {
      console.log(`- ${event.name} (${event._id})`);
    });
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear eventos de ejemplo:', error);
    process.exit(1);
  }
}

seedEvents();
