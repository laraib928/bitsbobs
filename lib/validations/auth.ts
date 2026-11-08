import { z } from 'zod';

export const tradeSignUpSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  contactName: z.string().min(2, 'Contact name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  telephone: z.string().min(5, 'Please enter a valid telephone number'),
  businessType: z.string().min(1, 'Please select your business type'),
  tradingAddress: z.string().min(5, 'Please enter your trading address'),
  postcode: z.string().min(4, 'Please enter a valid postcode'),
  symbolGroup: z.string().optional().default(''),
  sameDelivery: z.boolean().default(true),
  deliveryAddress: z.string().optional().default(''),
  vatNumber: z.string().optional().default(''),
  companyNumber: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  repVisit: z.boolean().default(false),
});

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

