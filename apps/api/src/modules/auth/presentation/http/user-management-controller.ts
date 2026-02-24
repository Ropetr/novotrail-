import { Context } from 'hono';
import type { HonoContext } from '../../../../shared/cloudflare/types';
import type { IUserRepository } from '../../domain/repositories';
import { ok, fail } from '../../../../shared/http/response';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'manager', 'user']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  password: z.string().min(6).optional(),
});

export class UserManagementController {
  constructor(private userRepository: IUserRepository) {}

  async list(c: Context<HonoContext>) {
    try {
      const tenantId = c.get('tenantId');
      if (!tenantId) return fail(c, 'Tenant not resolved', 400);

      const page = parseInt(c.req.query('page') || '1');
      const limit = parseInt(c.req.query('limit') || '50');
      const offset = (page - 1) * limit;

      const users = await this.userRepository.findByTenantId(tenantId, limit, offset);

      // Never return password hashes
      const safeUsers = users.map(({ passwordHash, ...user }) => user);

      return ok(c, safeUsers);
    } catch (error: any) {
      return fail(c, error.message || 'Erro ao listar usuários', 500);
    }
  }

  async getById(c: Context<HonoContext>) {
    try {
      const id = c.req.param('id');
      const user = await this.userRepository.findById(id);

      if (!user) return fail(c, 'Usuário não encontrado', 404);

      const { passwordHash, ...safeUser } = user;
      return ok(c, safeUser);
    } catch (error: any) {
      return fail(c, error.message || 'Erro ao buscar usuário', 500);
    }
  }

  async update(c: Context<HonoContext>) {
    try {
      const id = c.req.param('id');
      const body = await c.req.json();
      const data = updateUserSchema.parse(body);

      const existing = await this.userRepository.findById(id);
      if (!existing) return fail(c, 'Usuário não encontrado', 404);

      // If password provided, hash it
      const updateData: any = { ...data };
      if (data.password) {
        updateData.passwordHash = await bcrypt.hash(data.password, 10);
        delete updateData.password;
      }

      const updated = await this.userRepository.update(id, updateData);
      const { passwordHash, ...safeUser } = updated;

      return ok(c, safeUser);
    } catch (error: any) {
      return fail(c, error.message || 'Erro ao atualizar usuário', 400);
    }
  }

  async remove(c: Context<HonoContext>) {
    try {
      const id = c.req.param('id');
      const currentUser = c.get('user') as any;

      // Prevent self-deletion
      if (currentUser?.id === id) {
        return fail(c, 'Você não pode excluir sua própria conta', 400);
      }

      const existing = await this.userRepository.findById(id);
      if (!existing) return fail(c, 'Usuário não encontrado', 404);

      await this.userRepository.delete(id);
      return ok(c, { deleted: true });
    } catch (error: any) {
      return fail(c, error.message || 'Erro ao remover usuário', 500);
    }
  }
}
