export type SubscriptionPlan = 'basic' | 'medium' | 'premium';

export interface SubscriptionFeatures {
  pos: boolean;
  inventoryManagement: boolean;
  stockAdjustment: boolean;
  crm: boolean;
  pharmacyAds: boolean;
  auditReports: 'none' | 'standard' | 'advanced';
  creditManagement: boolean;
  maxStaffAccounts: number | 'unlimited';
  maxBranches: number | 'unlimited';
  advancedNotifications: boolean;
}

export interface SubscriptionPackage {
  id: SubscriptionPlan;
  name: string;
  price: number; // in TZS
  features: SubscriptionFeatures;
  description: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: 'trial' | 'active' | 'expired' | 'cancelled';
  startDate: string; // ISO date string
  trialEndDate: string; // ISO date string
  subscriptionEnd?: string; // ISO date string
  currentPeriodEnd: string; // ISO date string
  cancelAtPeriodEnd: boolean;
  lastPaymentDate?: string; // ISO date string
  nextBillingDate: string; // ISO date string
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, SubscriptionPackage> = {
  basic: {
    id: 'basic',
    name: 'Basic Package',
    price: 10000,
    description: 'Essential features for small businesses',
    features: {
      pos: true,
      inventoryManagement: true,
      stockAdjustment: true,
      crm: false,
      pharmacyAds: false,
      auditReports: 'none',
      creditManagement: false,
      maxStaffAccounts: 1,
      maxBranches: 0,
      advancedNotifications: false,
    },
  },
  medium: {
    id: 'medium',
    name: 'Medium Package',
    price: 25000,
    description: 'Advanced features for growing businesses',
    features: {
      pos: true,
      inventoryManagement: true,
      stockAdjustment: true,
      crm: false,
      pharmacyAds: false,
      auditReports: 'standard',
      creditManagement: true,
      maxStaffAccounts: 3,
      maxBranches: 2,
      advancedNotifications: false,
    },
  },
  premium: {
    id: 'premium',
    name: 'Premium Package',
    price: 40000,
    description: 'Complete solution for established businesses',
    features: {
      pos: true,
      inventoryManagement: true,
      stockAdjustment: true,
      crm: true,
      pharmacyAds: true,
      auditReports: 'advanced',
      creditManagement: true,
      maxStaffAccounts: 'unlimited',
      maxBranches: 10,
      advancedNotifications: true,
    },
  },
};
