import { Hono } from 'hono';
import type { HonoContext } from '../../../shared/cloudflare/types';
import type { ProductController } from './controllers/product-controller';
import type { CategoryController } from './controllers/category-controller';

export function createProdutosRoutes(
  productController: ProductController,
  categoryController: CategoryController
) {
  const router = new Hono<HonoContext>();

  // Categorias
  router.get('/categorias', (c) => categoryController.list(c));
  router.post('/categorias', (c) => categoryController.create(c));
  router.get('/categorias/:id', (c) => categoryController.getById(c));
  router.put('/categorias/:id', (c) => categoryController.update(c));
  router.delete('/categorias/:id', (c) => categoryController.remove(c));

  // Produtos
  router.get('/', (c) => productController.list(c));
  router.post('/', (c) => productController.create(c));
  router.get('/:id', (c) => productController.getById(c));
  router.put('/:id', (c) => productController.update(c));
  router.delete('/:id', (c) => productController.remove(c));

  return router;
}
