import { tenants, users } from '../src/infrastructure/database/schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function seed(db: any) {
  console.log('🌱 Seeding database...');

  // Create tenant
  const tenantId = '00000000-0000-0000-0000-000000000001';
  const existingTenants = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .all();

  if (existingTenants.length === 0) {
    await db.insert(tenants).values({
      id: tenantId,
      name: 'Trail System',
      subdomain: 'trailsystem',
      status: 'active',
      plan: 'enterprise',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('✅ Tenant created');
  } else {
    console.log('ℹ️  Tenant already exists');
  }

  // Create admin user
  const passwordHash = await bcrypt.hash('admin123', 10);
  const existingUsers = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.email, 'admin@trailsystem.com.br'),
        eq(users.tenantId, tenantId)
      )
    )
    .all();

  if (existingUsers.length === 0) {
    await db.insert(users).values({
      tenantId,
      email: 'admin@trailsystem.com.br',
      passwordHash,
      name: 'Admin User',
      role: 'admin',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('✅ Admin user created');
  } else {
    console.log('ℹ️  Admin user already exists');
  }

  console.log('🎉 Seeding completed!');
}
