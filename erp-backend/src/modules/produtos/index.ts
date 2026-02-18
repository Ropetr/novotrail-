import { Hono } from 'hono';
import type { HonoContext } from '../../shared/cloudflare/types';
import { createDatabaseConnection } from '../../shared/database/connection';

// Repositories
import { CategoryRepository } from './infrastructure/repositories/category-repository';
import { ProductRepository } from './infrastructure/repositories/product-repository';

// Controllers
import { CategoryController } from './presentation/controllers/category-controller';
import { ProductController } from './presentation/controllers/product-controller';

/**
 * Creates and configures the Produtos bounded context module.
 * Manages products and categories.
 *
 * All routes are PROTECTED — auth middleware must be applied externally.
 *
 * Dependency graph (Clean Architecture):
 *   Controller -> Repository interfaces
 *                       ^
 *            Infrastructure (implementations)
 */
export function createProdutosModule() {
  const router = new Hono<HonoContext>();

  // DI middleware - create all dependencies per-request from Cloudflare env
  router.use('*', async (c, next) => {
    const db = createDatabaseConnection(c.env.DB);

    // Repositories
    const categoryRepository = new CategoryRepository(db);
    const productRepository = new ProductRepository(db);

    // Controllers
    const categoryController = new CategoryController(categoryRepository);
    const productController = new ProductController(productRepository);

    c.set('categoryController' as any, categoryController);
    c.set('productController' as any, productController);

    await next();
  });

  const getCategoryCtrl = (c: any) => c.get('categoryController') as unknown as CategoryController;
  const getProductCtrl = (c: any) => c.get('productController') as unknown as ProductController;

  // Categorias routes
  router.get('/categorias', (c) => getCategoryCtrl(c).list(c));
  router.post('/categorias', (c) => getCategoryCtrl(c).create(c));
  router.get('/categorias/:id', (c) => getCategoryCtrl(c).getById(c));
  router.put('/categorias/:id', (c) => getCategoryCtrl(c).update(c));
  router.delete('/categorias/:id', (c) => getCategoryCtrl(c).remove(c));

  // Produtos routes
  router.get('/', (c) => getProductCtrl(c).list(c));
  router.post('/', (c) => getProductCtrl(c).create(c));
  router.get('/:id', (c) => getProductCtrl(c).getById(c));
  router.put('/:id', (c) => getProductCtrl(c).update(c));
  router.delete('/:id', (c) => getProductCtrl(c).remove(c));

  return router;
}

// Re-export domain contracts for inter-module communication
export type { ICategoryRepository, IProductRepository } from './domain/repositories';
export { CategoryRepository } from './infrastructure/repositories/category-repository';
export { ProductRepository } from './infrastructure/repositories/product-repository';
export { categories, products } from './infrastructure/schema';
