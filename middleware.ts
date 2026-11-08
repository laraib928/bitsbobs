import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { response, user, profile, isConfigured } = await updateSession(request);

  // If Supabase is not configured yet (local stub environment), allow requests through
  if (!isConfigured) {
    return response;
  }

  // 1. Admin Protection: /admin and all subpaths
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/trade';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = profile?.status === 'approved' ? '/trade/shop' : '/';
      url.searchParams.delete('redirect');
      return NextResponse.redirect(url);
    }

    return response;
  }

  // 2. Trade Protected Routes: /trade/shop, /trade/stands, /trade/checkout, /trade/account
  const tradeProtectedPrefixes = [
    '/trade/shop',
    '/trade/stands',
    '/trade/checkout',
    '/trade/account',
  ];

  const isTradeProtected = tradeProtectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (isTradeProtected) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/trade';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    // Admins always have access to preview trade shop
    if (profile?.role === 'admin') {
      return response;
    }

    // Pending retailer check
    if (profile?.status === 'pending') {
      const url = request.nextUrl.clone();
      url.pathname = '/trade/pending';
      return NextResponse.redirect(url);
    }

    // Suspended or rejected check
    if (profile?.status === 'rejected' || profile?.status === 'suspended') {
      const url = request.nextUrl.clone();
      url.pathname = '/trade';
      url.searchParams.set('error', 'suspended');
      return NextResponse.redirect(url);
    }

    // Approved retailer
    return response;
  }

  // 3. Trade Pending Page Protection: /trade/pending
  if (pathname === '/trade/pending') {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/trade';
      return NextResponse.redirect(url);
    }

    // If already approved, take directly to the trade shop
    if (profile?.status === 'approved' || profile?.role === 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/trade/shop';
      return NextResponse.redirect(url);
    }

    return response;
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/trade/shop/:path*',
    '/trade/stands/:path*',
    '/trade/checkout/:path*',
    '/trade/account/:path*',
    '/trade/pending',
  ],
};
