
export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  businessName?: string;
  registeredAt: string;
}
