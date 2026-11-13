import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const apiKey = process.env.GETADDRESS_API_KEY;

  // If no API key configured, report unavailable so client shows manual fields
  if (!apiKey || apiKey.trim() === '') {
    return NextResponse.json({
      success: false,
      available: false,
      error: 'Address lookup service is not configured. Please enter your address manually.',
      addresses: [],
    });
  }

  const { searchParams } = new URL(request.url);
  const postcode = searchParams.get('postcode');

  // Handle status check query without postcode
  if (!postcode) {
    return NextResponse.json({
      success: true,
      available: true,
      addresses: [],
    });
  }

  const cleanPostcode = postcode.trim().replace(/\s+/g, '');
  if (cleanPostcode.length < 3) {
    return NextResponse.json(
      {
        success: false,
        available: true,
        error: 'Please enter a valid UK postcode.',
        addresses: [],
      },
      { status: 400 }
    );
  }

  try {
    const endpoint = `https://api.getaddress.io/find/${encodeURIComponent(cleanPostcode)}?api-key=${encodeURIComponent(apiKey.trim())}&expand=true`;

    const res = await fetch(endpoint, {
      headers: {
        Accept: 'application/json',
      },
      next: { revalidate: 86400 }, // Cache postcodes for 24h
    });

    if (res.status === 404) {
      return NextResponse.json({
        success: false,
        available: true,
        error: `No addresses found for postcode "${postcode.trim().toUpperCase()}". Please enter your address manually.`,
        addresses: [],
      });
    }

    if (res.status === 400) {
      return NextResponse.json(
        {
          success: false,
          available: true,
          error: 'Invalid postcode format. Please check and try again.',
          addresses: [],
        },
        { status: 400 }
      );
    }

    if (res.status === 401 || res.status === 403) {
      console.warn('getAddress.io API authorization failed: invalid or expired API key');
      return NextResponse.json({
        success: false,
        available: false,
        error: 'Address lookup is temporarily unavailable. Please enter your address manually.',
        addresses: [],
      });
    }

    if (res.status === 429) {
      return NextResponse.json({
        success: false,
        available: true,
        error: 'Address lookup request limit reached. Please enter your address manually.',
        addresses: [],
      });
    }

    if (!res.ok) {
      return NextResponse.json({
        success: false,
        available: true,
        error: 'Unable to look up postcode. Please enter your address manually.',
        addresses: [],
      });
    }

    const data = await res.json();
    const rawAddresses = data.addresses || [];

    const addresses = rawAddresses.map((addr: any, index: number) => {
      // If getAddress returned simple string lines
      if (typeof addr === 'string') {
        const parts = addr
          .split(',')
          .map((p) => p.trim())
          .filter(Boolean);
        return {
          id: String(index),
          line1: parts[0] || '',
          line2: parts.length > 3 ? parts[1] : (parts.length > 2 ? parts[1] : ''),
          line3: parts.length > 3 ? parts[2] : '',
          town: parts[parts.length - 1] || '',
          postcode: data.postcode || postcode.trim().toUpperCase(),
          formatted: parts.join(', '),
        };
      }

      // If expand=true returned structured object
      const formattedLines: string[] = Array.isArray(addr.formatted_address)
        ? addr.formatted_address
            .map((l: any) => (typeof l === 'string' ? l.trim() : ''))
            .filter(Boolean)
        : [];

      const line1 =
        addr.line_1 ||
        addr.thoroughfare ||
        formattedLines[0] ||
        '';

      const line2 =
        addr.line_2 ||
        (formattedLines.length > 2 ? formattedLines[1] : '') ||
        '';

      const line3 =
        addr.line_3 ||
        (formattedLines.length > 3 ? formattedLines[2] : '') ||
        '';

      const town =
        addr.town_or_city ||
        addr.locality ||
        (formattedLines.length > 0
          ? formattedLines[formattedLines.length - 1]
          : '') ||
        '';

      const label =
        formattedLines.length > 0
          ? formattedLines.join(', ')
          : [line1, line2, line3, town].filter(Boolean).join(', ');

      return {
        id: String(index),
        line1: line1.trim(),
        line2: line2.trim(),
        line3: line3.trim(),
        town: town.trim(),
        postcode: data.postcode || postcode.trim().toUpperCase(),
        formatted: label,
      };
    });

    return NextResponse.json({
      success: true,
      available: true,
      postcode: data.postcode || postcode.trim().toUpperCase(),
      addresses,
    });
  } catch (error) {
    console.error('Error in address lookup route:', error);
    return NextResponse.json({
      success: false,
      available: false,
      error: 'Connection error during postcode lookup. Please enter your address manually.',
      addresses: [],
    });
  }
}

