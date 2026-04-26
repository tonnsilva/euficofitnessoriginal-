export type Category = 'supplements' | 'apparel';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  image: string;
  variants?: string[]; // Adicionado para carrossel de modelos/cores
  description: string;
  tag?: string;
  salesPageUrl?: string;
}
