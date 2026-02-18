export type UserRole = 'admin' | 'manager' | 'user';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  tenantId: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

/** User data exposed to the frontend (without passwordHash) */
export interface UserPublic {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
}

export interface CreateUserDTO {
  tenantId: string;
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface LoginDTO {
  email: string;
  password: string;
  tenantId: string;
}
