export interface PublicMenuSection {
  category: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}
