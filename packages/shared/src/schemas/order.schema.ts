import { z } from 'zod';
import { ORDER_STATUS } from '../constants/order-status.js';

export const createPOSchema = z.object({
  sellerId: z.string().uuid(),
  notes: z.string().max(2000).optional(),
  shippingTerms: z.string().max(50).optional(),
  portOfLoading: z.string().max(200).optional(),
  portOfDischarge: z.string().max(200).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, 'At least one item is required'),
});

export const updatePOItemsSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive(),
    }),
  ).min(1),
  changeReason: z.string().max(500).optional(),
});

export const updatePOStatusSchema = z.object({
  status: z.nativeEnum(ORDER_STATUS),
  changeReason: z.string().max(500).optional(),
});

export type CreatePOInput = z.infer<typeof createPOSchema>;
export type UpdatePOItemsInput = z.infer<typeof updatePOItemsSchema>;
export type UpdatePOStatusInput = z.infer<typeof updatePOStatusSchema>;
