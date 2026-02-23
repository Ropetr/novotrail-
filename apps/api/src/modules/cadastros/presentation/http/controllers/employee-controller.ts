import { Context } from 'hono';
import type { HonoContext } from '../../../../../shared/cloudflare/types';
import type { IEmployeeRepository } from '../../../domain/repositories';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  paginationSchema,
  idParamSchema,
} from '../validators';
import { ok, fail } from '../../../../../shared/http/response';

export class EmployeeController {
  constructor(private employeeRepository: IEmployeeRepository) {}

  async list(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const query = paginationSchema.parse(c.req.query());

      const result = await this.employeeRepository.list(user.tenantId, query);

      return ok(c, result.data, 200, {
        pagination: {
          page: query.page,
          limit: query.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / query.limit),
        },
      });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to list employees', 400);
    }
  }

  async getById(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());

      const employee = await this.employeeRepository.getById(id, user.tenantId);

      if (!employee) {
        return fail(c, 'Employee not found', 404);
      }

      return ok(c, employee);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to get employee', 400);
    }
  }

  async create(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const body = await c.req.json();
      const data = createEmployeeSchema.parse(body);

      const employee = await this.employeeRepository.create(user.tenantId, data);

      return ok(c, employee, 201);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to create employee', 400);
    }
  }

  async update(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());
      const body = await c.req.json();
      const data = updateEmployeeSchema.parse(body);

      const existing = await this.employeeRepository.getById(id, user.tenantId);
      if (!existing) {
        return fail(c, 'Employee not found', 404);
      }

      const employee = await this.employeeRepository.update(id, user.tenantId, data);

      return ok(c, employee);
    } catch (error: any) {
      return fail(c, error.message || 'Failed to update employee', 400);
    }
  }

  async remove(c: Context<HonoContext>) {
    try {
      const user = c.get('user')!;
      const { id } = idParamSchema.parse(c.req.param());

      const existing = await this.employeeRepository.getById(id, user.tenantId);
      if (!existing) {
        return fail(c, 'Employee not found', 404);
      }

      await this.employeeRepository.softDelete(id, user.tenantId);

      return ok(c, { message: 'Employee deactivated successfully' });
    } catch (error: any) {
      return fail(c, error.message || 'Failed to delete employee', 400);
    }
  }
}
