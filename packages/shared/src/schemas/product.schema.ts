import { z } from 'zod';

const productBase = z.object({
  sku: z.string().min(1).max(100),
  name: z.string().min(1).max(300),
  description: z.string().max(5000).optional(),
  category: z.string().min(1).max(100),
  unit: z.string().min(1).max(50),
  priceUsdCents: z.number().int().positive(),
  priceRangeMin: z.number().int().positive(),
  priceRangeMax: z.number().int().positive(),
  cbmPerUnit: z.number().positive(),
  weightKg: z.number().positive().optional(),
  hsCode: z.string().max(20).optional(),
  originCountry: z.string().length(2).default('VN'),
});

export const createProductSchema = productBase.refine(
  (d) => d.priceRangeMin <= d.priceRangeMax,
  { message: 'priceRangeMin must be ≤ priceRangeMax', path: ['priceRangeMin'] },
);

// partial() works on the base object (not the refined version)
export const updateProductSchema = productBase.partial().refine(
  (d) => d.priceRangeMin === undefined || d.priceRangeMax === undefined || d.priceRangeMin <= d.priceRangeMax,
  { message: 'priceRangeMin must be ≤ priceRangeMax', path: ['priceRangeMin'] },
);

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
