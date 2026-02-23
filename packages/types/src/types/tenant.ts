export type TenantStatus = 'active' | 'suspended' | 'cancelled';
export type TenantPlan = 'free' | 'starter' | 'professional' | 'enterprise';

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  status: TenantStatus;
  plan: TenantPlan;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTenantDTO {
  name: string;
  subdomain: string;
  plan?: TenantPlan;
}
