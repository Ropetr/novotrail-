import { tenants } from '../src/modules/tenant/infrastructure/schema';
import { users } from '../src/modules/auth/infrastructure/schema';
import { clients, suppliers, partners, employees } from '../src/modules/cadastros/infrastructure/schema';
import { categories, products } from '../src/modules/produtos/infrastructure/schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function seed(db: any) {
  console.log('Seeding database...');

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
    console.log('Tenant created');
  } else {
    console.log('Tenant already exists');
  }

  // Create demo users
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const demoPasswordHash = await bcrypt.hash('123456', 10);

  const usersToEnsure = [
    {
      email: 'admin@trailsystem.com.br',
      name: 'Admin User',
      role: 'admin',
      passwordHash: adminPasswordHash,
    },
    {
      email: 'admin@demo.com',
      name: 'Admin Demo',
      role: 'admin',
      passwordHash: demoPasswordHash,
    },
  ];

  for (const user of usersToEnsure) {
    const existing = await db
      .select()
      .from(users)
      .where(and(eq(users.email, user.email), eq(users.tenantId, tenantId)))
      .all();

    if (existing.length === 0) {
      await db.insert(users).values({
        tenantId,
        email: user.email,
        passwordHash: user.passwordHash,
        name: user.name,
        role: user.role,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`User created: ${user.email}`);
    } else {
      console.log(`User already exists: ${user.email}`);
    }
  }

  // Seed clients
  const existingClients = await db
    .select()
    .from(clients)
    .where(eq(clients.tenantId, tenantId))
    .all();

  if (existingClients.length === 0) {
    await db.insert(clients).values([
      {
        tenantId,
        code: 'CLI-001',
        name: 'Construtora Horizonte',
        tradeName: 'Horizonte Obras',
        type: 'pj',
        document: '12.345.678/0001-90',
        stateRegistration: '123456789',
        email: 'contato@horizonte.com',
        phone: '(44) 3000-1000',
        cellphone: '(44) 99999-1000',
        city: 'Maringa',
        state: 'PR',
        status: 'active',
        creditLimit: 50000,
        balance: 12000,
        lastPurchase: '2026-02-10',
      },
      {
        tenantId,
        code: 'CLI-002',
        name: 'MegaObras Ltda',
        tradeName: 'MegaObras',
        type: 'pj',
        document: '98.765.432/0001-10',
        stateRegistration: '987654321',
        email: 'financeiro@megaobras.com',
        phone: '(43) 3000-2000',
        cellphone: '(43) 98888-2000',
        city: 'Londrina',
        state: 'PR',
        status: 'active',
        creditLimit: 75000,
        balance: 8000,
        lastPurchase: '2026-02-12',
      },
      {
        tenantId,
        code: 'CLI-003',
        name: 'Decor Plus',
        tradeName: 'Decor Plus',
        type: 'pj',
        document: '11.222.333/0001-44',
        stateRegistration: '112233445',
        email: 'contato@decorplus.com',
        phone: '(41) 3000-3000',
        cellphone: '(41) 97777-3000',
        city: 'Curitiba',
        state: 'PR',
        status: 'active',
        creditLimit: 40000,
        balance: 3500,
        lastPurchase: '2026-02-08',
      },
      {
        tenantId,
        code: 'CLI-004',
        name: 'Reforma Express',
        tradeName: 'Reforma Express',
        type: 'pj',
        document: '55.666.777/0001-88',
        stateRegistration: '556677889',
        email: 'contato@reformaexpress.com',
        phone: '(44) 3000-4000',
        cellphone: '(44) 96666-4000',
        city: 'Maringa',
        state: 'PR',
        status: 'active',
        creditLimit: 30000,
        balance: 0,
        lastPurchase: '2026-02-05',
      },
    ]);
    console.log('Clients seeded');
  } else {
    console.log('Clients already exist');
  }

  // Seed suppliers
  const existingSuppliers = await db
    .select()
    .from(suppliers)
    .where(eq(suppliers.tenantId, tenantId))
    .all();

  if (existingSuppliers.length === 0) {
    await db.insert(suppliers).values([
      {
        tenantId,
        code: 'FOR-001',
        name: 'Steel Master',
        tradeName: 'Steel Master',
        type: 'pj',
        document: '33.444.555/0001-22',
        stateRegistration: '334455667',
        email: 'vendas@steelmaster.com',
        phone: '(11) 3000-5000',
        cellphone: '(11) 95555-5000',
        city: 'Sao Paulo',
        state: 'SP',
        status: 'active',
        paymentTerms: '30/60',
      },
      {
        tenantId,
        code: 'FOR-002',
        name: 'Drywall Brasil',
        tradeName: 'Drywall Brasil',
        type: 'pj',
        document: '66.777.888/0001-99',
        stateRegistration: '667788990',
        email: 'comercial@drywallbr.com',
        phone: '(21) 3000-6000',
        cellphone: '(21) 94444-6000',
        city: 'Rio de Janeiro',
        state: 'RJ',
        status: 'active',
        paymentTerms: '30/45',
      },
    ]);
    console.log('Suppliers seeded');
  } else {
    console.log('Suppliers already exist');
  }

  // Seed partners
  const existingPartners = await db
    .select()
    .from(partners)
    .where(eq(partners.tenantId, tenantId))
    .all();

  if (existingPartners.length === 0) {
    await db.insert(partners).values([
      {
        tenantId,
        code: 'PAR-001',
        name: 'Carlos Silva',
        tradeName: 'Carlos Silva',
        type: 'pf',
        document: '123.456.789-00',
        email: 'carlos@parceiro.com',
        phone: '(44) 3333-1111',
        cellphone: '(44) 98888-1111',
        city: 'Maringa',
        state: 'PR',
        status: 'active',
        commissionRate: 5,
      },
      {
        tenantId,
        code: 'PAR-002',
        name: 'Ana Costa',
        tradeName: 'Ana Costa',
        type: 'pf',
        document: '987.654.321-00',
        email: 'ana@parceiro.com',
        phone: '(43) 3333-2222',
        cellphone: '(43) 97777-2222',
        city: 'Londrina',
        state: 'PR',
        status: 'active',
        commissionRate: 4,
      },
    ]);
    console.log('Partners seeded');
  } else {
    console.log('Partners already exist');
  }

  // Seed employees
  const existingEmployees = await db
    .select()
    .from(employees)
    .where(eq(employees.tenantId, tenantId))
    .all();

  if (existingEmployees.length === 0) {
    await db.insert(employees).values([
      {
        tenantId,
        code: 'COL-001',
        name: 'Joao Oliveira',
        document: '123.123.123-12',
        email: 'joao@trailsystem.com.br',
        phone: '(44) 3333-3333',
        department: 'Vendas',
        position: 'Vendedor',
        hireDate: '2024-06-10',
        status: 'active',
      },
      {
        tenantId,
        code: 'COL-002',
        name: 'Maria Santos',
        document: '321.321.321-21',
        email: 'maria@trailsystem.com.br',
        phone: '(44) 3333-4444',
        department: 'Comercial',
        position: 'Gerente',
        hireDate: '2023-02-15',
        status: 'active',
      },
    ]);
    console.log('Employees seeded');
  } else {
    console.log('Employees already exist');
  }

  // Seed categories
  const existingCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.tenantId, tenantId))
    .all();

  if (existingCategories.length === 0) {
    await db.insert(categories).values([
      { tenantId, name: 'Drywall', status: 'active' },
      { tenantId, name: 'Steel Frame', status: 'active' },
      { tenantId, name: 'Acessorios', status: 'active' },
    ]);
    console.log('Categories seeded');
  } else {
    console.log('Categories already exist');
  }

  // Seed products
  const existingProducts = await db
    .select()
    .from(products)
    .where(eq(products.tenantId, tenantId))
    .all();

  if (existingProducts.length === 0) {
    const seededCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.tenantId, tenantId))
      .all();

    const drywallId = seededCategories.find((c: any) => c.name === 'Drywall')?.id;
    const steelId = seededCategories.find((c: any) => c.name === 'Steel Frame')?.id;
    const accessoriesId = seededCategories.find((c: any) => c.name === 'Acessorios')?.id;

    await db.insert(products).values([
      {
        tenantId,
        code: 'PRO-001',
        name: 'Placa Drywall ST 12.5mm',
        description: 'Placa standard para drywall',
        categoryId: drywallId,
        sku: 'DRY-125',
        barcode: '789000000001',
        unit: 'UN',
        costPrice: 32.5,
        salePrice: 49.9,
        status: 'active',
        minStock: 50,
        currentStock: 420,
      },
      {
        tenantId,
        code: 'PRO-002',
        name: 'Perfil Montante 70mm',
        description: 'Perfil metalico para estrutura',
        categoryId: steelId,
        sku: 'STE-070',
        barcode: '789000000002',
        unit: 'UN',
        costPrice: 18.0,
        salePrice: 29.9,
        status: 'active',
        minStock: 80,
        currentStock: 300,
      },
      {
        tenantId,
        code: 'PRO-003',
        name: 'Massa para Drywall 28kg',
        description: 'Massa pronta para acabamento',
        categoryId: drywallId,
        sku: 'MAS-028',
        barcode: '789000000003',
        unit: 'UN',
        costPrice: 42.0,
        salePrice: 69.9,
        status: 'active',
        minStock: 40,
        currentStock: 120,
      },
      {
        tenantId,
        code: 'PRO-004',
        name: 'Parafuso Drywall 25mm',
        description: 'Parafuso ponta agulha',
        categoryId: accessoriesId,
        sku: 'PAR-025',
        barcode: '789000000004',
        unit: 'CX',
        costPrice: 9.5,
        salePrice: 16.9,
        status: 'active',
        minStock: 60,
        currentStock: 220,
      },
      {
        tenantId,
        code: 'PRO-005',
        name: 'Fita Telada 50m',
        description: 'Fita para juntas',
        categoryId: accessoriesId,
        sku: 'FIT-050',
        barcode: '789000000005',
        unit: 'UN',
        costPrice: 11.0,
        salePrice: 19.9,
        status: 'active',
        minStock: 30,
        currentStock: 90,
      },
    ]);
    console.log('Products seeded');
  } else {
    console.log('Products already exist');
  }

  console.log('Seeding completed!');
}
