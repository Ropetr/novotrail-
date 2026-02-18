export interface User {
  id: string;
  tenantId: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  tenantId: string;
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'manager' | 'user';
}

export interface LoginDTO {
  email: string;
  password: string;
  tenantId: string;
}
