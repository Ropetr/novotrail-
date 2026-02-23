import { eq, and, or, like, sql } from 'drizzle-orm';
import type { IEmployeeRepository, ListResult } from '../../domain/repositories';
import type { Employee, CreateEmployeeDTO, UpdateEmployeeDTO } from '../../domain/entities';
import type { DatabaseConnection } from '../../../../shared/database/connection';
import type { PaginationInput } from '@trailsystem/types';
import { employees } from '../schema';

export class EmployeeRepository implements IEmployeeRepository {
  constructor(private db: DatabaseConnection) {}

  async list(tenantId: string, params: PaginationInput): Promise<ListResult<Employee>> {
    const { page, limit, search } = params;
    const offset = (page - 1) * limit;

    const baseWhere = eq(employees.tenantId, tenantId);

    const whereClause = search
      ? and(
          baseWhere,
          or(
            like(employees.name, `%${search}%`),
            like(employees.code, `%${search}%`),
            like(employees.document, `%${search}%`),
            like(employees.email, `%${search}%`)
          )
        )
      : baseWhere;

    const [data, countResult] = await Promise.all([
      this.db.select().from(employees).where(whereClause).limit(limit).offset(offset),
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(employees)
        .where(whereClause),
    ]);

    return {
      data: data as Employee[],
      total: Number(countResult[0].count),
    };
  }

  async getById(id: string, tenantId: string): Promise<Employee | null> {
    const result = await this.db
      .select()
      .from(employees)
      .where(and(eq(employees.id, id), eq(employees.tenantId, tenantId)))
      .limit(1);

    return (result[0] as Employee) || null;
  }

  async create(tenantId: string, data: CreateEmployeeDTO): Promise<Employee> {
    const countResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(employees)
      .where(eq(employees.tenantId, tenantId));

    const code = data.code || `COL-${String(Number(countResult[0].count) + 1).padStart(3, '0')}`;

    const newRecord = {
      id: crypto.randomUUID(),
      tenantId,
      userId: data.userId ?? null,
      code,
      name: data.name,
      document: data.document,
      email: data.email,
      phone: data.phone,
      department: data.department ?? null,
      position: data.position ?? null,
      hireDate: data.hireDate ?? null,
      status: 'active' as const,
      notes: data.notes ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.db.insert(employees).values(newRecord);

    return newRecord as Employee;
  }

  async update(id: string, tenantId: string, data: UpdateEmployeeDTO): Promise<Employee> {
    await this.db
      .update(employees)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(employees.id, id), eq(employees.tenantId, tenantId)));

    const updated = await this.getById(id, tenantId);
    if (!updated) throw new Error('Employee not found after update');

    return updated;
  }

  async softDelete(id: string, tenantId: string): Promise<void> {
    await this.db
      .update(employees)
      .set({ status: 'inactive', updatedAt: new Date() })
      .where(and(eq(employees.id, id), eq(employees.tenantId, tenantId)));
  }
}
