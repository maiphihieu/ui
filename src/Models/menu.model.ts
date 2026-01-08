import { Product } from "./product.model";

export interface Menu {
  categoryId: number;
  categoryName: string;
  products: Product[];
}