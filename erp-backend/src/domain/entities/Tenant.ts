export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  status: 'active' | 'suspended' | 'cancelled';
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTenantDTO {
  name: string;
  subdomain: string;
  plan?: 'free' | 'starter' | 'professional' | 'enterprise';
}
