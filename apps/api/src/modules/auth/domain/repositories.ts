import type { User, CreateUserDTO } from './entities';

export interface IUserRepository {
  create(data: CreateUserDTO): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string, tenantId: string): Promise<User | null>;
  findByTenantId(tenantId: string, limit?: number, offset?: number): Promise<User[]>;
  update(id: string, data: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}
