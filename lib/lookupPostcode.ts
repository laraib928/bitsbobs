export interface PostcodeData {
  postcode: string;
  city: string;
  county: string;
  country: string;
}

/**
 * Looks up UK postcode data from the free, keyless Postcodes.io API.
 * Normalizes input, applies a 5-second timeout, and returns city, county, and country.
 * Returns null if the postcode is invalid, not found (404), or if the request fails/times out.
 */
export async function lookupPostcode(rawPostcode: string): Promise<PostcodeData | null> {
  const clean = rawPostcode.trim().replace(/\s+/g, '').toUpperCase();
  if (clean.length < 2) {
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(clean)}`, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok || res.status === 404) {
      return null;
    }

    const data = await res.json();
    if (data.status !== 200 || !data.result) {
      return null;
    }

    const result = data.result;
    return {
      postcode: result.postcode || rawPostcode.trim().toUpperCase(),
      city: result.admin_district || '',
      county: result.admin_county || result.region || '',
      country: result.country || 'United Kingdom',
    };
  } catch (error) {
    console.warn('Postcode lookup failed or timed out:', error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

