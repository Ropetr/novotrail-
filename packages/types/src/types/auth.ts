import type { UserPublic } from './user';

export interface AuthResponse {
  success: boolean;
  data: {
    user: UserPublic;
    token: string;
  };
}

export interface AuthTokenPayload {
  id: string;
  tenantId: string;
  email: string;
  role: string;
}
