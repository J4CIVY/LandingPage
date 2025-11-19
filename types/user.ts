/**
 * User Type Definitions (Frontend)
 * Migrated from Mongoose models to plain TypeScript interfaces
 */

export interface IUser {
  _id: string;
  id?: string; // Alias for _id
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  whatsapp?: string;
  documentType?: string;
  documentNumber?: string;
  membershipNumber?: string;
  birthDate?: string;
  birthPlace?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  postalCode?: string;
  binaryGender?: string;
  genderIdentity?: string;
  occupation?: string;
  discipline?: string;
  profileImage?: string;
  
  // Motorcycle Info
  motorcycleBrand?: string;
  motorcycleModel?: string;
  motorcycleYear?: number | string;
  motorcyclePlate?: string;
  motorcycleColor?: string;
  motorcycleDisplacement?: string;
  motorcycleEngineSize?: string;
  soatExpirationDate?: string;
  technicalReviewExpirationDate?: string;
  licenseNumber?: string;
  licenseCategory?: string;
  licenseExpirationDate?: string;
  
  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  emergencyContactAddress?: string;
  emergencyContactNeighborhood?: string;
  emergencyContactCity?: string;
  emergencyContactCountry?: string;
  emergencyContactPostalCode?: string;
  
  // Medical Data
  bloodType?: string;
  rhFactor?: string;
  allergies?: string;
  medicalConditions?: string;
  medications?: string;
  healthInsurance?: string;
  
  // Membership
  membershipType?: string;
  membershipStatus?: 'active' | 'inactive' | 'pending' | 'expired';
  membershipStartDate?: string;
  membershipEndDate?: string;
  
  // Authentication
  role: 'user' | 'admin' | 'super-admin';
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: string;
  
  // 2FA
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  twoFactorBackupCodes?: string[];
  
  // Security
  passwordChangedAt?: string;
  passwordResetToken?: string;
  passwordResetExpires?: string;
  loginAttempts: number;
  lockUntil?: number;
  
  // Activity
  lastLogin?: string;
  lastActivity?: string;
  isActive: boolean;
  
  // Gamification
  points?: number;
  level?: number;
  badges?: string[];
  achievements?: Array<{
    id: string;
    name: string;
    description: string;
    earnedAt: string;
  }>;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface IUserProfile extends IUser {
  eventsAttended?: number;
  totalPoints?: number;
  ranking?: number;
}

export interface IUserUpdate {
  firstName?: string;
  lastName?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  motorcycleBrand?: string;
  motorcycleModel?: string;
  motorcycleYear?: number;
  motorcyclePlate?: string;
  motorcycleColor?: string;
  motorcycleDisplacement?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  bloodType?: string;
  allergies?: string;
  medicalConditions?: string;
  medications?: string;
}
