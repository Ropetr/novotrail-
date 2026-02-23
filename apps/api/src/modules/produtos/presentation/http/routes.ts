import { Hono } from 'hono';
import type { HonoContext } from '../../../../shared/cloudflare/types';
import type { ProductController } from './controllers/product-controller';
import type { CategoryController } from './controllers/category-controller';

export function createProdutosRoutes() {
  const router = new Hono<HonoContext>();
  const getCategoryCtrl = (c: any) => c.get('categoryController') as CategoryController;
  const getProductCtrl = (c: any) => c.get('productController') as ProductController;

  // Categorias
  router.get('/categorias', (c) => getCategoryCtrl(c).list(c));
  router.post('/categorias', (c) => getCategoryCtrl(c).create(c));
  router.get('/categorias/:id', (c) => getCategoryCtrl(c).getById(c));
  router.put('/categorias/:id', (c) => getCategoryCtrl(c).update(c));
  router.delete('/categorias/:id', (c) => getCategoryCtrl(c).remove(c));

  // Produtos
  router.get('/', (c) => getProductCtrl(c).list(c));
  router.post('/', (c) => getProductCtrl(c).create(c));
  router.get('/:id', (c) => getProductCtrl(c).getById(c));
  router.put('/:id', (c) => getProductCtrl(c).update(c));
  router.delete('/:id', (c) => getProductCtrl(c).remove(c));

  return router;
}
