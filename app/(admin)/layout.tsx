import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminShell } from '@/components/admin/AdminShell';
import { getAdminSidebarData } from '@/lib/data/admin';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isConfigured = supabaseUrl && !supabaseUrl.includes('placeholder');

  if (isConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/trade?redirect=/admin');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile || profile.role !== 'admin') {
      redirect('/');
    }
  }

  const sidebarData = await getAdminSidebarData();

  return <AdminShell sidebarData={sidebarData}>{children}</AdminShell>;
}
