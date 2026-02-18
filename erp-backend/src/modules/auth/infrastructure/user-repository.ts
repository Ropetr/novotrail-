import { eq, and } from 'drizzle-orm';
import type { IUserRepository } from '../domain/repositories';
import type { User, CreateUserDTO } from '../domain/entities';
import type { DatabaseConnection } from '../../../shared/database/connection';
import { users } from './schema';
import bcrypt from 'bcryptjs';

export class UserRepository implements IUserRepository {
  constructor(private db: DatabaseConnection) {}

  async create(data: CreateUserDTO): Promise<User> {
    const passwordHash = await bcrypt.hash(data.password, 10);

    const newUser = {
      id: crypto.randomUUID(),
      tenantId: data.tenantId,
      email: data.email,
      passwordHash,
      name: data.name,
      role: data.role || ('user' as const),
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db.insert(users).values(newUser);
    return newUser;
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0] || null;
  }

  async findByEmail(email: string, tenantId: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.tenantId, tenantId)))
      .limit(1);
    return result[0] || null;
  }

  async findByTenantId(tenantId: string, limit = 50, offset = 0): Promise<User[]> {
    return await this.db
      .select()
      .from(users)
      .where(eq(users.tenantId, tenantId))
      .limit(limit)
      .offset(offset);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    await this.db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id));

    const updated = await this.findById(id);
    if (!updated) throw new Error('User not found after update');
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(users).where(eq(users.id, id));
  }
}
