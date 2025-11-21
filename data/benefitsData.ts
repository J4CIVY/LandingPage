import { Category, Benefit, UsageHistory, CategoryType } from '@/types/benefits';

// Categories with their configurations
export const categories: Category[] = [
  {
    id: 'workshops-mechanics',
    name: 'Workshops & Mechanics',
    icon: 'FaWrench',
    color: 'blue'
  },
  {
    id: 'accessories-parts',
    name: 'Accessories & Parts',
    icon: 'FaCog',
    color: 'green'
  },
  {
    id: 'restaurants-hotels',
    name: 'Restaurants & Hotels',
    icon: 'FaUtensils',
    color: 'orange'
  },
  {
    id: 'insurance-finance',
    name: 'Insurance & Finance',
    icon: 'FaShieldAlt',
    color: 'purple'
  },
  {
    id: 'health-wellness',
    name: 'Health & Wellness',
    icon: 'FaHeartbeat',
    color: 'red'
  },
  {
    id: 'others',
    name: 'Others',
    icon: 'FaEllipsisH',
    color: 'gray'
  }
];

// Mock benefits data
export const benefitsMock: Benefit[] = [
  // Workshops & Mechanics
  {
    id: '1',
    name: 'Complete maintenance service',
    category: 'workshops-mechanics',
    briefDescription: 'Complete maintenance service for your motorcycle with 20% discount',
    fullDescription: 'Get a complete maintenance service for your motorcycle that includes oil change, brake inspection, chain adjustment, suspension check and general diagnostics. Valid for all brands and models.',
    discount: '20% OFF',
    location: 'Main Ave 123, Downtown',
    website: 'https://workshopbsk.com',
    image: '/images/benefits/workshop-mechanics.jpg',
    logo: '/images/logos/workshop-logo.png',
    company: 'MechanicsPro Workshop',
    promoCode: 'BSK2024MAINT',
    qrCode: '/images/qr/qr-maintenance.png',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    status: 'active',
    requirements: [
      'Show BSK member card',
      'Book appointment in advance',
      'Valid only for preventive maintenance'
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Free diagnostics',
    category: 'workshops-mechanics',
    briefDescription: 'Complete free diagnostics to detect failures in your motorcycle',
    fullDescription: 'Receive a professional diagnosis completely free that includes computerized scanning, complete visual inspection and detailed report of faults found. Service does not include repairs.',
    discount: '100% Free',
    location: 'Street 45 #67-89, Industrial Zone',
    image: '/images/benefits/diagnostics.jpg',
    logo: '/images/logos/diagno-logo.png',
    company: 'Moto Diagnostic Center',
    promoCode: 'BSKDIAG2024',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-11-30'),
    status: 'active',
    requirements: [
      'Present member card',
      'Once per year per member',
      'Prior appointment required'
    ],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },

  // Accessories & Parts
  {
    id: '3',
    name: 'Discount on original parts',
    category: 'accessories-parts',
    briefDescription: 'Save 15% on original parts for all brands',
    fullDescription: '15% discount on original parts from all brands: Honda, Yamaha, Kawasaki, Suzuki, BMW, KTM and more. Includes filters, brake pads, chains, sprockets, pinions and other wear parts.',
    discount: '15% OFF',
    location: 'MotoWorld Shopping Center, Store 205',
    image: '/images/benefits/parts.jpg',
    logo: '/images/logos/parts-logo.png',
    company: 'BSK Moto Parts',
    promoCode: 'BSK15PARTS2024',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-12-15'),
    status: 'active',
    requirements: [
      'Valid only for original parts',
      'Not combinable with other promotions',
      'Minimum purchase $100'
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '4',
    name: 'Protection gear',
    category: 'accessories-parts',
    briefDescription: 'Complete protection kit with special discount',
    fullDescription: 'Complete protection kit that includes: full-face helmet, protective jacket, gloves, knee pads and elbow pads. Special discount for BSK members on top brand equipment.',
    discount: '25% OFF',
    location: 'Las Americas Ave 890',
    website: 'https://motogear.com',
    image: '/images/benefits/protection.jpg',
    logo: '/images/logos/protection-logo.png',
    company: 'SafeRide Equipment',
    promoCode: 'BSKPROT25',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2025-02-28'),
    status: 'active',
    requirements: [
      'Valid for purchases over $500',
      'Includes extended warranty',
      'Sizes subject to availability'
    ],
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01')
  },

  // Restaurants & Hotels
  {
    id: '5',
    name: 'Route accommodation',
    category: 'restaurants-hotels',
    briefDescription: 'Discounts on accommodation for long trips on the road',
    fullDescription: 'Network of allied hotels with special discounts for motorcyclists. Includes secure parking for motorcycles, breakfast and wifi. Available on main tourist routes in the country.',
    discount: '30% OFF',
    location: 'National hotel network',
    website: 'https://motorcyclisthotels.com',
    image: '/images/benefits/hotel.jpg',
    logo: '/images/logos/hotel-logo.png',
    company: 'Moto Route Hotels Network',
    promoCode: 'BSKHOTEL30',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    status: 'active',
    requirements: [
      'Book 48 hours in advance',
      'Includes guarded parking',
      'Valid Sunday to Thursday'
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '6',
    name: 'The Biker Restaurant',
    category: 'restaurants-hotels',
    briefDescription: 'Traditional food with biker atmosphere and special discount',
    fullDescription: 'Themed restaurant for motorcyclists with traditional food, unique biker atmosphere, exclusive parking and special attention for motorcyclist groups.',
    discount: '20% OFF',
    location: 'Km 45 North Highway',
    image: '/images/benefits/restaurant.jpg',
    company: 'The Biker Restaurant',
    promoCode: 'BSKBIKER20',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-12-31'),
    status: 'active',
    requirements: [
      'Minimum consumption $50',
      'Valid Monday to Friday',
      'Present member card'
    ],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },

  // Insurance & Finance
  {
    id: '7',
    name: 'SOAT insurance with discount',
    category: 'insurance-finance',
    briefDescription: 'SOAT for motorcycles with preferential price',
    fullDescription: 'Mandatory Traffic Accident Insurance (SOAT) with preferential price for BSK members. Fast process, complete coverage and personalized attention.',
    discount: '10% OFF',
    website: 'https://motoinsurance.com',
    image: '/images/benefits/soat.jpg',
    logo: '/images/logos/insurance-logo.png',
    company: 'Moto Plus Insurance',
    promoCode: 'BSKSOAT10',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    status: 'active',
    requirements: [
      'Motorcycle up to date with technical inspection',
      'Owner documents up to date',
      'Cash payment'
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '8',
    name: 'Comprehensive insurance',
    category: 'insurance-finance',
    briefDescription: 'Comprehensive insurance for your motorcycle with wide coverage',
    fullDescription: 'Comprehensive insurance that covers theft, total loss, accidents, civil liability, medical expenses and 24-hour roadside assistance.',
    discount: '15% OFF',
    website: 'https://comprehensivemoto.com',
    image: '/images/benefits/comprehensive-insurance.jpg',
    company: 'SecureAll Moto',
    promoCode: 'BSKTOTAL15',
    startDate: new Date('2024-04-01'),
    endDate: new Date('2025-03-31'),
    status: 'coming-soon',
    requirements: [
      'Motorcycle model 2018 onwards',
      'Insured value up to $50,000',
      'Prior motorcycle evaluation'
    ],
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date('2024-04-01')
  },

  // Health & Wellness
  {
    id: '9',
    name: 'Specialized physiotherapy',
    category: 'health-wellness',
    briefDescription: 'Physiotherapy specialized for motorcyclists',
    fullDescription: 'Physiotherapy center specialized in common motorcyclist injuries: spine, wrist, knee and ankle problems. Personalized therapy and recovery plans.',
    discount: '25% OFF',
    location: 'Total Health Medical Center, 3rd Floor',
    image: '/images/benefits/physiotherapy.jpg',
    logo: '/images/logos/physio-logo.png',
    company: 'MotoPhysio Rehabilitation',
    promoCode: 'BSKPHYSIO25',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-12-31'),
    status: 'active',
    requirements: [
      'Mandatory initial assessment',
      'Minimum 4 sessions',
      'Prior appointment required'
    ],
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01')
  },

  // Others
  {
    id: '10',
    name: 'Defensive driving course',
    category: 'others',
    briefDescription: 'Specialized course in safe driving techniques',
    fullDescription: 'Theoretical-practical defensive driving course for motorcyclists. Includes braking techniques, curves, rain driving and basic first aid.',
    discount: 'Free',
    location: 'BSK training track',
    image: '/images/benefits/driving-course.jpg',
    company: 'BSK Driving School',
    promoCode: 'BSKCOURSE2024',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-12-31'),
    status: 'coming-soon',
    requirements: [
      'Valid driving license',
      'Own motorcycle for practice',
      'Complete protection equipment'
    ],
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-01')
  }
];

// Mock usage history data
export const usageHistoryMock: UsageHistory[] = [
  {
    id: 'hist1',
    benefitId: '1',
    benefitName: 'Complete maintenance service',
    userId: 'user123',
    usageDate: new Date('2024-08-15'),
    status: 'used',
    codeUsed: 'BSK2024MAINT'
  },
  {
    id: 'hist2',
    benefitId: '3',
    benefitName: 'Discount on original parts',
    userId: 'user123',
    usageDate: new Date('2024-09-02'),
    status: 'active',
    codeUsed: 'BSK15PARTS2024'
  },
  {
    id: 'hist3',
    benefitId: '5',
    benefitName: 'Route accommodation',
    userId: 'user123',
    usageDate: new Date('2024-07-20'),
    status: 'used',
    codeUsed: 'BSKHOTEL30'
  },
  {
    id: 'hist4',
    benefitId: '6',
    benefitName: 'The Biker Restaurant',
    userId: 'user123',
    usageDate: new Date('2024-08-30'),
    status: 'used',
    codeUsed: 'BSKBIKER20'
  },
  {
    id: 'hist5',
    benefitId: '7',
    benefitName: 'SOAT insurance with discount',
    userId: 'user123',
    usageDate: new Date('2024-01-10'),
    status: 'expired',
    codeUsed: 'BSKSOAT10'
  }
];

// Utility functions for data
export const getBenefitsByCategory = (category: CategoryType | 'all'): Benefit[] => {
  if (category === 'all') {
    return benefitsMock;
  }
  return benefitsMock.filter(benefit => benefit.category === category);
};

export const getBenefitById = (id: string): Benefit | undefined => {
  return benefitsMock.find(benefit => benefit.id === id);
};

export const getHistoryByUser = (userId: string): UsageHistory[] => {
  return usageHistoryMock.filter(history => history.userId === userId);
};

export const getBenefitsStats = () => {
  return {
    totalBenefits: benefitsMock.length,
    activeBenefits: benefitsMock.filter(b => b.status === 'active').length,
    comingSoonBenefits: benefitsMock.filter(b => b.status === 'coming-soon').length,
    expiredBenefits: benefitsMock.filter(b => b.status === 'expired').length,
    partnerCompanies: [...new Set(benefitsMock.map(b => b.company))].length,
    thisMonthUsage: usageHistoryMock.filter(h => 
      new Date(h.usageDate).getMonth() === new Date().getMonth()
    ).length,
    estimatedSavings: 2450 // Simulated value
  };
};
