'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  updateDetailsSchema,
  updateAddressesSchema,
  UpdateDetailsInput,
  UpdateAddressesInput,
} from '@/lib/validations/trade-account';

export async function updateAccountDetailsAction(input: UpdateDetailsInput) {
  const result = updateDetailsSchema.safeParse(input);
  if (!result.success) {
    return { error: result.error.issues[0]?.message || 'Invalid form input' };
  }

  const data = result.data;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be signed in to update your account.' };
  }

  // Update contact information in profiles table (preserve role & status)
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      contact_name: data.contactName,
      phone: data.phone,
      email: data.email,
    })
    .eq('id', user.id);

  if (profileError) {
    return { error: profileError.message };
  }

  // Update auth email if it changed
  if (data.email && data.email !== user.email) {
    const { error: emailError } = await supabase.auth.updateUser({
      email: data.email,
    });
    if (emailError) {
      return {
        error: `Profile details updated, but email change failed: ${emailError.message}`,
      };
    }
  }

  // Update password if requested
  if (data.newPassword) {
    if (data.newPassword.length < 6) {
      return { error: 'New password must be at least 6 characters long.' };
    }
    if (data.newPassword !== data.confirmPassword) {
      return { error: 'New passwords do not match.' };
    }
    const { error: pwError } = await supabase.auth.updateUser({
      password: data.newPassword,
    });
    if (pwError) {
      return {
        error: `Profile details updated, but password update failed: ${pwError.message}`,
      };
    }
  }

  revalidatePath('/trade/account');
  revalidatePath('/trade/account/details');
  return { success: true };
}

export async function updateAccountAddressesAction(input: UpdateAddressesInput) {
  const result = updateAddressesSchema.safeParse(input);
  if (!result.success) {
    return { error: result.error.issues[0]?.message || 'Invalid form input' };
  }

  const data = result.data;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be signed in to update your addresses.' };
  }

  const tradingAddressJson = {
    line1: data.tradingAddress,
    line2: data.tradingAddressLine2 || '',
    town: data.tradingTown || '',
    postcode: data.tradingPostcode,
  };

  const deliveryAddressJson = data.sameDelivery
    ? null
    : {
        line1: data.deliveryAddress || data.tradingAddress,
        line2: data.deliveryAddressLine2 || '',
        town: data.deliveryTown || '',
        postcode: data.deliveryPostcode || data.tradingPostcode,
      };

  const { error } = await supabase
    .from('profiles')
    .update({
      trading_address: tradingAddressJson,
      delivery_address: deliveryAddressJson,
    })
    .eq('id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/trade/account');
  revalidatePath('/trade/account/addresses');
  return { success: true };
}

