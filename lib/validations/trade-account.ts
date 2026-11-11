import { z } from 'zod';

export const updateDetailsSchema = z.object({
  contactName: z.string().min(2, 'Contact name is required'),
  phone: z.string().min(5, 'Valid phone number is required'),
  email: z.string().email('Valid email address is required'),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
});

export type UpdateDetailsInput = z.infer<typeof updateDetailsSchema>;

export const updateAddressesSchema = z.object({
  tradingAddress: z.string().min(3, 'Trading address is required'),
  tradingAddressLine2: z.string().optional(),
  tradingTown: z.string().optional(),
  tradingPostcode: z.string().min(2, 'Trading postcode is required'),
  sameDelivery: z.boolean().default(true),
  deliveryAddress: z.string().optional(),
  deliveryAddressLine2: z.string().optional(),
  deliveryTown: z.string().optional(),
  deliveryPostcode: z.string().optional(),
});

export type UpdateAddressesInput = z.infer<typeof updateAddressesSchema>;

