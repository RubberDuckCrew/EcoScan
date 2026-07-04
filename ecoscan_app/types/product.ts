export type Product = {
  id: string;
  name: string;
  description: string;
  categories: string;
  score: number | undefined;
  socialScore: number | undefined;
  healthScore: number | undefined;
  environmentScore: number | undefined;
  justification: string | undefined;
  imageUrl: string;
};
