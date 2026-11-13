import { z } from 'zod';

export const tradeSignUpSchema = z
  .object({
    businessName: z.string().min(2, 'Business name must be at least 2 characters'),
    contactName: z.string().min(2, 'Contact name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    telephone: z.string().min(5, 'Please enter a valid telephone number'),
    businessType: z.string().min(1, 'Please select your business type'),
    // Separate Trading address fields: Address line 1, Address line 2 (optional), Address line 3 (optional), Town/City, Postcode
    tradingAddressLine1: z.string().optional().default(''),
    tradingAddressLine2: z.string().optional().default(''),
    tradingAddressLine3: z.string().optional().default(''),
    tradingTown: z.string().optional().default(''),
    tradingPostcode: z.string().optional().default(''),
    // Legacy single field fallback
    tradingAddress: z.string().optional().default(''),
    postcode: z.string().optional().default(''),
    symbolGroup: z.string().optional().default(''),
    sameDelivery: z.boolean().default(true),
    // Separate Delivery address fields
    deliveryAddressLine1: z.string().optional().default(''),
    deliveryAddressLine2: z.string().optional().default(''),
    deliveryAddressLine3: z.string().optional().default(''),
    deliveryTown: z.string().optional().default(''),
    deliveryPostcode: z.string().optional().default(''),
    deliveryAddress: z.string().optional().default(''),
    // Nullable/optional fields removed from the UI
    vatNumber: z.string().optional().nullable().default(''),
    companyNumber: z.string().optional().nullable().default(''),
    notes: z.string().optional().default(''),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    repVisit: z.boolean().default(false),
  })
  .refine(
    (data) => {
      const line1 = data.tradingAddressLine1.trim() || data.tradingAddress.trim();
      return line1.length > 0;
    },
    {
      message: 'Please enter Address line 1',
      path: ['tradingAddressLine1'],
    }
  )
  .refine(
    (data) => {
      const pc = data.tradingPostcode.trim() || data.postcode.trim();
      return pc.length >= 2;
    },
    {
      message: 'Please enter a valid postcode',
      path: ['tradingPostcode'],
    }
  );

export type TradeSignUpInput = z.infer<typeof tradeSignUpSchema>;

export const tradeSignInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Please enter your password'),
});

export type TradeSignInInput = z.infer<typeof tradeSignInSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
