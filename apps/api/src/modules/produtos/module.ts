import { Hono } from 'hono';
import type { HonoContext } from '../../shared/cloudflare/types';
import { createDatabaseConnection } from '../../shared/database/connection';

// Repositories
import { CategoryRepository } from './infrastructure/repositories/category-repository';
import { ProductRepository } from './infrastructure/repositories/product-repository';

// Controllers
import { CategoryController } from './presentation/http/controllers/category-controller';
import { ProductController } from './presentation/http/controllers/product-controller';
import { createProdutosRoutes } from './presentation/http/routes';

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

  router.route('/', createProdutosRoutes());

  return router;
}

// Re-export domain contracts for inter-module communication
