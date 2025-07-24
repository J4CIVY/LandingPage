export interface Product {
  id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  finalPrice: number;
  availability: 'in-stock' | 'out-of-stock';
  featuredImage: string;
  gallery?: string[];
  newProduct: boolean;
  category: string;
  technicalSpecifications?: { [key: string]: string };
  features?: string[];
  slug?: string;
}