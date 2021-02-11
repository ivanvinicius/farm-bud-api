import { Repository, getRepository } from 'typeorm';

import Product from '@modules/products/infra/typeorm/entities/Product';
import IProductsRepository from '@modules/products/repositories/IProductsRepository';

export default class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async findAll(): Promise<Product[] | undefined> {
    return this.ormRepository.find();
  }

  public async findAllAvoidingDuplicates(
    provider_id: string,
  ): Promise<Product[] | undefined> {
    const SelectProductsQuery =
      'SELECT products.id AS product_id,' +
      ' products.name AS product_name,' +
      ' products.composition AS product_composition,' +
      ' brands.id AS brand_id,' +
      ' brands.name AS brand_name,' +
      ' subcategories.id AS subcategory_id,' +
      ' subcategories.name AS subcategory_name,' +
      ' categories.id AS category_id,' +
      ' categories.name AS category_name' +
      ' FROM products' +
      ' JOIN brands' +
      ' ON brands.id = products.brand_id' +
      ' JOIN subcategories' +
      ' ON subcategories.id = products.subcategory_id' +
      ' JOIN categories' +
      ' ON categories.id = subcategories.category_id' +
      ' WHERE products.id NOT IN(' +
      'SELECT products_measures.product_id' +
      ' FROM products_measures' +
      ' WHERE products_measures.provider_id = $1)';

    const products = await this.ormRepository.query(SelectProductsQuery, [
      provider_id,
    ]);

    return products;
  }
}
