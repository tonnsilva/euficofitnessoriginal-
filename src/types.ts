export type Category = 'supplements' | 'apparel';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  image: string;
  description: string;
  tag?: string;
  salesPageUrl?: string;
}
