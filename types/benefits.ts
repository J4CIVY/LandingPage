export type CategoryType = 
  | 'workshops-mechanics'
  | 'accessories-parts'
  | 'restaurants-hotels'
  | 'insurance-finance'
  | 'health-wellness'
  | 'others';

export interface Category {
  id: CategoryType;
  name: string;
  icon: string;
  color: string;
}

export type BenefitStatus = 'active' | 'coming-soon' | 'expired';

export interface Benefit {
  id: string;
  name: string;
  category: CategoryType;
  briefDescription: string;
  fullDescription: string;
  discount: string;
  location?: string;
  website?: string;
  image: string;
  logo?: string;
  company: string;
  promoCode: string;
  qrCode?: string;
  startDate: Date;
  endDate: Date;
  status: BenefitStatus;
  requirements: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type UsageStatus = 'active' | 'expired' | 'used';

export interface UsageHistory {
  id: string;
  benefitId: string;
  benefitName: string;
  userId: string;
  usageDate: Date;
  status: UsageStatus;
  codeUsed: string;
}

export interface BenefitStats {
  benefitId: string;
  userCount: number;
  estimatedSavings: number;
  usageDates: Date[];
}

// Form interfaces
export interface BenefitFormData {
  name: string;
  category: CategoryType;
  briefDescription: string;
  fullDescription: string;
  discount: string;
  location?: string;
  website?: string;
  company: string;
  promoCode: string;
  startDate: string;
  endDate: string;
  requirements: string[];
  image?: File | null;
}

// Component props
export interface BenefitCardProps {
  benefit: Benefit;
  onViewDetails: (benefit: Benefit) => void;
  onClaimBenefit: (benefit: Benefit) => void;
}

export interface BenefitModalProps {
  benefit: Benefit | null;
  isOpen: boolean;
  onClose: () => void;
  onShare: (benefit: Benefit) => void;
}

export interface CategoryTabsProps {
  categories: Category[];
  activeCategory: CategoryType | 'all';
  onCategoryChange: (category: CategoryType | 'all') => void;
}

export interface BenefitsHeaderProps {
  isAdmin: boolean;
  onAddBenefit: () => void;
}

export interface UsageHistoryProps {
  history: UsageHistory[];
  isLoading?: boolean;
}

export interface BenefitFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BenefitFormData) => void;
  benefit?: Benefit | null;
  isLoading?: boolean;
}