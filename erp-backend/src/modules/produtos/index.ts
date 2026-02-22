export { createProdutosModule } from './module';
export type { ICategoryRepository, IProductRepository } from './domain/repositories';
export { CategoryRepository } from './infrastructure/repositories/category-repository';
export { ProductRepository } from './infrastructure/repositories/product-repository';
export { categories, products } from './infrastructure/schema';
