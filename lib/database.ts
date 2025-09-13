import { Event } from '@/types/events';
import { Product } from '@/types/products';
import { CompatibleUserSchema } from '@/schemas/compatibleUserSchema';

/**
 * Base de datos simulada en memoria para desarrollo
 * En producción, esto debería conectarse a una base de datos real
 */

// Interfaces adicionales para la API
export interface User extends CompatibleUserSchema {
  id: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface EmergencyRequest {
  id: string;
  name: string;
  memberId: string;
  emergencyType: 'mechanical' | 'medical' | 'accident' | 'breakdown' | 'other';
  description: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  contactPhone: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  resolution?: string;
}

export interface MembershipApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipType: 'friend' | 'rider' | 'rider-duo' | 'pro' | 'pro-duo';
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  type: 'general' | 'membership' | 'technical' | 'complaint' | 'suggestion';
  status: 'new' | 'in-progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}

// Almacenes de datos en memoria
class InMemoryDatabase {
  private users: Map<string, User> = new Map();
  private products: Map<string, Product> = new Map();
  private events: Map<string, Event> = new Map();
  private emergencies: Map<string, EmergencyRequest> = new Map();
  private membershipApplications: Map<string, MembershipApplication> = new Map();
  private contactMessages: Map<string, ContactMessage> = new Map();

  constructor() {
    this.initializeSampleData();
  }

  // Métodos para Usuarios
  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
    const id = this.generateId();
    const now = new Date().toISOString();
    const user: User = {
      ...userData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, user);
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  deleteUser(id: string): boolean {
    return this.users.delete(id);
  }

  // Métodos para Productos
  getAllProducts(): Product[] {
    return Array.from(this.products.values());
  }

  getProductById(id: string): Product | undefined {
    return this.products.get(id);
  }

  getFeaturedProducts(limit: number = 6): Product[] {
    return Array.from(this.products.values())
      .filter(product => product.availability === 'in-stock')
      .slice(0, limit);
  }

  getProductsByCategory(category: string): Product[] {
    return Array.from(this.products.values())
      .filter(product => product.category.toLowerCase() === category.toLowerCase());
  }

  createProduct(productData: Omit<Product, 'id'>): Product {
    const id = this.generateId();
    const product: Product = {
      ...productData,
      id,
    };
    this.products.set(id, product);
    return product;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | undefined {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...updates };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  deleteProduct(id: string): boolean {
    return this.products.delete(id);
  }

  // Métodos para Eventos
  getAllEvents(): Event[] {
    return Array.from(this.events.values());
  }

  getEventById(id: string): Event | undefined {
    return this.events.get(id);
  }

  getUpcomingEvents(limit?: number): Event[] {
    const now = new Date();
    const upcoming = Array.from(this.events.values())
      .filter(event => new Date(event.startDate) > now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    
    return limit ? upcoming.slice(0, limit) : upcoming;
  }

  createEvent(eventData: Omit<Event, '_id'>): Event {
    const id = this.generateId();
    const event: Event = {
      ...eventData,
      _id: id,
    };
    this.events.set(id, event);
    return event;
  }

  updateEvent(id: string, updates: Partial<Event>): Event | undefined {
    const event = this.events.get(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...updates };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  deleteEvent(id: string): boolean {
    return this.events.delete(id);
  }

  // Métodos para Emergencias
  getAllEmergencies(): EmergencyRequest[] {
    return Array.from(this.emergencies.values());
  }

  getEmergencyById(id: string): EmergencyRequest | undefined {
    return this.emergencies.get(id);
  }

  getPendingEmergencies(): EmergencyRequest[] {
    return Array.from(this.emergencies.values())
      .filter(emergency => emergency.status === 'pending')
      .sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
  }

  createEmergency(emergencyData: Omit<EmergencyRequest, 'id' | 'createdAt' | 'updatedAt'>): EmergencyRequest {
    const id = this.generateId();
    const now = new Date().toISOString();
    const emergency: EmergencyRequest = {
      ...emergencyData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.emergencies.set(id, emergency);
    return emergency;
  }

  updateEmergency(id: string, updates: Partial<EmergencyRequest>): EmergencyRequest | undefined {
    const emergency = this.emergencies.get(id);
    if (!emergency) return undefined;
    
    const updatedEmergency = {
      ...emergency,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.emergencies.set(id, updatedEmergency);
    return updatedEmergency;
  }

  deleteEmergency(id: string): boolean {
    return this.emergencies.delete(id);
  }

  // Métodos para Aplicaciones de Membresía
  getAllMembershipApplications(): MembershipApplication[] {
    return Array.from(this.membershipApplications.values());
  }

  getMembershipApplicationById(id: string): MembershipApplication | undefined {
    return this.membershipApplications.get(id);
  }

  createMembershipApplication(appData: Omit<MembershipApplication, 'id' | 'createdAt' | 'updatedAt'>): MembershipApplication {
    const id = this.generateId();
    const now = new Date().toISOString();
    const application: MembershipApplication = {
      ...appData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.membershipApplications.set(id, application);
    return application;
  }

  updateMembershipApplication(id: string, updates: Partial<MembershipApplication>): MembershipApplication | undefined {
    const application = this.membershipApplications.get(id);
    if (!application) return undefined;
    
    const updatedApplication = {
      ...application,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.membershipApplications.set(id, updatedApplication);
    return updatedApplication;
  }

  // Métodos para Mensajes de Contacto
  getAllContactMessages(): ContactMessage[] {
    return Array.from(this.contactMessages.values());
  }

  getContactMessageById(id: string): ContactMessage | undefined {
    return this.contactMessages.get(id);
  }

  createContactMessage(messageData: Omit<ContactMessage, 'id' | 'createdAt' | 'updatedAt'>): ContactMessage {
    const id = this.generateId();
    const now = new Date().toISOString();
    const message: ContactMessage = {
      ...messageData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.contactMessages.set(id, message);
    return message;
  }

  updateContactMessage(id: string, updates: Partial<ContactMessage>): ContactMessage | undefined {
    const message = this.contactMessages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = {
      ...message,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.contactMessages.set(id, updatedMessage);
    return updatedMessage;
  }

  // Utilidades
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private initializeSampleData(): void {
    // Productos de ejemplo
    const sampleProducts: Omit<Product, 'id'>[] = [
      {
        name: "Casco BSK Pro",
        shortDescription: "Casco premium con tecnología avanzada",
        longDescription: "Casco de alta gama con sistema de ventilación avanzado, visera anti-empañamiento y diseño aerodinámico. Certificación DOT y ECE.",
        finalPrice: 450000,
        availability: 'in-stock',
        featuredImage: "/products/casco-bsk-pro.webp",
        gallery: ["/products/casco-1.webp", "/products/casco-2.webp"],
        newProduct: true,
        category: "Cascos",
        technicalSpecifications: {
          "Material": "Fibra de carbono",
          "Peso": "1.2 kg",
          "Certificación": "DOT, ECE R22.05",
          "Tallas": "S, M, L, XL"
        },
        features: ["Anti-empañamiento", "Ventilación avanzada", "Micrófono integrado"]
      },
      {
        name: "Chaqueta BSK Touring",
        shortDescription: "Chaqueta para largas travesías",
        longDescription: "Chaqueta impermeable con protecciones CE en hombros, codos y espalda. Ideal para touring y viajes largos.",
        finalPrice: 320000,
        availability: 'in-stock',
        featuredImage: "/products/chaqueta-touring.webp",
        newProduct: false,
        category: "Chaquetas",
        technicalSpecifications: {
          "Material": "Cordura 600D",
          "Protecciones": "CE Nivel 2",
          "Impermeabilidad": "10.000mm",
          "Tallas": "S, M, L, XL, XXL"
        },
        features: ["Impermeable", "Ventilación", "Protecciones CE", "Bolsillos internos"]
      },
      {
        name: "Guantes BSK Sport",
        shortDescription: "Guantes deportivos de cuero premium",
        longDescription: "Guantes de cuero de canguro con protecciones en nudillos y palma reforzada para máximo agarre.",
        finalPrice: 180000,
        availability: 'in-stock',
        featuredImage: "/products/guantes-sport.webp",
        newProduct: true,
        category: "Guantes",
        technicalSpecifications: {
          "Material": "Cuero de canguro",
          "Protecciones": "Nudillos reforzados",
          "Tallas": "S, M, L, XL"
        },
        features: ["Cuero premium", "Protección nudillos", "Palma reforzada", "Touchscreen compatible"]
      }
    ];

    sampleProducts.forEach(product => this.createProduct(product));

    // Eventos de ejemplo
    const sampleEvents: Omit<Event, '_id'>[] = [
      {
        name: "Ruta Laguna de Guatavita",
        startDate: "2025-09-15T08:00:00Z",
        description: "Ruta panorámica hacia la famosa Laguna de Guatavita. Incluye desayuno y almuerzo.",
        mainImage: "/events/guatavita.webp",
        eventType: "Rodada",
        status: "published",
        organizer: {
          name: "BSK Motorcycle Team",
          phone: "+57 300 123 4567",
          email: "eventos@bskmt.com"
        },
        currentParticipants: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        departureLocation: {
          address: "Estación de Servicio Terpel Calle 85",
          city: "Bogotá",
          country: "Colombia"
        }
      },
      {
        name: "Curso de Mantenimiento Básico",
        startDate: "2025-09-20T14:00:00Z",
        description: "Aprende a realizar el mantenimiento básico de tu motocicleta con nuestros expertos mecánicos.",
        mainImage: "/events/mantenimiento.webp",
        eventType: "Taller",
        status: "published",
        organizer: {
          name: "BSK Motorcycle Team",
          phone: "+57 300 123 4567",
          email: "eventos@bskmt.com"
        },
        currentParticipants: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        departureLocation: {
          address: "Sede BSK Motorcycle Team",
          city: "Bogotá",
          country: "Colombia"
        }
      },
      {
        name: "Track Day - Autódromo de Tocancipá",
        startDate: "2025-09-25T07:00:00Z",
        description: "Día de pista en el autódromo de Tocancipá. Niveles principiante, intermedio y avanzado.",
        mainImage: "/events/track-day.webp",
        eventType: "Competencia",
        status: "published",
        organizer: {
          name: "BSK Motorcycle Team",
          phone: "+57 300 123 4567",
          email: "eventos@bskmt.com"
        },
        currentParticipants: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        departureLocation: {
          address: "Autódromo de Tocancipá",
          city: "Tocancipá",
          country: "Colombia"
        }
      }
    ];

    sampleEvents.forEach(event => this.createEvent(event));
  }

  // Método para limpiar todos los datos (útil para testing)
  clearAllData(): void {
    this.users.clear();
    this.products.clear();
    this.events.clear();
    this.emergencies.clear();
    this.membershipApplications.clear();
    this.contactMessages.clear();
  }

  // Método para obtener estadísticas
  getStats() {
    return {
      users: this.users.size,
      products: this.products.size,
      events: this.events.size,
      emergencies: this.emergencies.size,
      membershipApplications: this.membershipApplications.size,
      contactMessages: this.contactMessages.size,
    };
  }
}

// Instancia global de la base de datos
export const db = new InMemoryDatabase();
