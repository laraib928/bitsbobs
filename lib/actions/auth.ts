'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import {
  tradeSignUpSchema,
  tradeSignInSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  TradeSignUpInput,
  TradeSignInInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '@/lib/validations/auth';

export type AuthActionResult = {
  success?: boolean;
  error?: string;
  redirectUrl?: string;
};

/**
 * Handle new trade retailer application (Become a Stockist)
 */
export async function tradeSignUpAction(input: TradeSignUpInput): Promise<AuthActionResult> {
  const parseResult = tradeSignUpSchema.safeParse(input);
  if (!parseResult.success) {
    return {
      error: parseResult.error.issues[0]?.message || 'Invalid form input',
    };
  }

  const data = parseResult.data;
  const supabase = await createClient();

  const tradingAddressJson = {
    line1: data.tradingAddress,
    postcode: data.postcode,
  };

  const deliveryAddressJson = data.sameDelivery
    ? null
    : {
        line1: data.deliveryAddress,
      };

  const fullNotes = [
    data.notes.trim(),
    data.repVisit ? 'Customer requested a sales rep visit for display stand.' : '',
  ]
    .filter(Boolean)
    .join('\n');

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        business_name: data.businessName,
        contact_name: data.contactName,
        phone: data.telephone,
        business_type: data.businessType,
        trading_address: tradingAddressJson,
        delivery_address: deliveryAddressJson,
        symbol_group: data.symbolGroup || null,
        vat_number: data.vatNumber || null,
        company_number: data.companyNumber || null,
        notes: fullNotes || null,
      },
    },
  });

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'An account with this email address already exists. Please log in.' };
    }
    return { error: error.message };
  }

  return { success: true };
}

/**
 * Handle trade retailer login
 */
export async function tradeSignInAction(
  input: TradeSignInInput,
  requestedRedirect?: string
): Promise<AuthActionResult> {
  const parseResult = tradeSignInSchema.safeParse(input);
  if (!parseResult.success) {
    return {
      error: parseResult.error.issues[0]?.message || 'Invalid login details',
    };
  }

  const { email, password } = parseResult.data;
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    return { error: 'Invalid email address or password. Please try again.' };
  }

  // Fetch user profile to verify approval status and role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .maybeSingle();

  if (!profile) {
    // If profile row hasn't synced yet, treat as pending
    return { success: true, redirectUrl: '/trade/pending' };
  }

  // Admin access
  if (profile.role === 'admin') {
    return {
      success: true,
      redirectUrl: requestedRedirect?.startsWith('/admin') ? requestedRedirect : '/admin',
    };
  }

  // Trade retailer status checks
  if (profile.status === 'pending') {
    return { success: true, redirectUrl: '/trade/pending' };
  }

  if (profile.status === 'rejected' || profile.status === 'suspended') {
    await supabase.auth.signOut();
    return {
      error:
        'Your trade account application was not approved or has been suspended. Please contact customer service at 0161 839 5050.',
    };
  }

  // Approved trade retailer
  const defaultRedirect = '/trade/shop';
  const target = requestedRedirect && requestedRedirect.startsWith('/trade') ? requestedRedirect : defaultRedirect;

  return { success: true, redirectUrl: target };
}

/**
 * Handle sign out
 */
export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

/**
 * Request password reset email
 */
export async function forgotPasswordAction(input: ForgotPasswordInput): Promise<AuthActionResult> {
  const parseResult = forgotPasswordSchema.safeParse(input);
  if (!parseResult.success) {
    return { error: parseResult.error.issues[0]?.message || 'Invalid email address' };
  }

  const supabase = await createClient();
  const headersList = headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;

  const { error } = await supabase.auth.resetPasswordForEmail(parseResult.data.email, {
    redirectTo: `${siteUrl}/auth/callback?next=/trade/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

/**
 * Update password (from reset link)
 */
export async function updatePasswordAction(input: ResetPasswordInput): Promise<AuthActionResult> {
  const parseResult = resetPasswordSchema.safeParse(input);
  if (!parseResult.success) {
    return { error: parseResult.error.issues[0]?.message || 'Invalid password' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parseResult.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, redirectUrl: '/trade?tab=login&reset=success' };
}
