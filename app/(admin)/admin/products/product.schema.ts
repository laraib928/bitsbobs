import { z } from 'zod';

export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'Product name is required'),
  category: z.string().trim().min(1, 'Category is required'),
  code: z.string().trim().default(''),
  barcode: z.string().trim().default(''),
  description: z.string().trim().default(''),
  features: z.array(z.string()).default([]),
  videoUrl: z.string().trim().default(''),
  pageTitle: z.string().trim().default(''),
  webAddress: z.string().trim().default(''),
  metaDesc: z.string().trim().default(''),

  // Public shop
  visibleToPublic: z.boolean().default(true),
  rrp: z
    .number()
    .positive('Retail selling price (RRP) must be greater than £0.00'),
  minQty: z.number().int().min(1).default(1),

  // Trade shop
  visibleToTrade: z.boolean().default(true),
  unitsPerPack: z.number().int().min(1).default(6),
  minPacks: z.number().int().min(1).default(1),
  wholesalePrice: z
    .number()
    .positive('Wholesale price per pack must be greater than £0.00'),

  // Stock
  stockPacks: z.number().int().min(0).default(0),
  lowStockAt: z.number().int().min(0).default(10),

  // Promotions
  bestSeller: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  specialOffer: z.boolean().default(false),
  offerPrice: z.number().optional().nullable(),

  // Photos
  images: z.array(z.string()).default([]),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export interface SaveProductResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  product?: {
    id: string;
    slug: string;
    name: string;
  };
}

