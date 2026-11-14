import { NextRequest, NextResponse } from 'next/server';
import { lookupPostcode } from '@/lib/lookupPostcode';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postcode = searchParams.get('postcode');

  if (!postcode) {
    return NextResponse.json({
      success: true,
      available: true,
      postcode: '',
      city: '',
      county: '',
      country: '',
    });
  }

  const result = await lookupPostcode(postcode);

  if (!result) {
    return NextResponse.json(
      {
        success: false,
        available: true,
        error: 'Invalid postcode. Please check and try again.',
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    available: true,
    ...result,
  });
}
