import 'server-only';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

if (!stripeSecretKey && process.env.NODE_ENV === 'production') {
  console.warn('STRIPE_SECRET_KEY is missing in environment variables.');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-06-20' as any,
  appInfo: {
    name: 'Bits N Bobs E-Commerce',
    version: '1.0.0',
  },
  typescript: true,
});

