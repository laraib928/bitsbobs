/**
 * Search synonyms and index matching configuration.
 *
 * NOTE: As required, competitor names and legacy phrases MUST NOT appear
 * in visible UI text on the website. They are used strictly as search synonyms
 * and meta keywords so that customer queries seamlessly return Bits N Bobs products.
 */

export const SEARCH_SYNONYMS = [
  'little things',
  'essentials',
  'capital',
  'homeware essentials',
  'dobsons',
  'combs',
  'lp marketing',
] as const;

export interface SearchableProduct {
  id?: string;
  name: string;
  code?: string;
  shortLine?: string;
  description?: string;
  categoryId?: string;
  barcode?: string;
  slug?: string;
}

/**
 * Checks whether a product matches a user search query, incorporating
 * search synonyms (competitor names, legacy terms, and product categories).
 */
export function matchesProductSearch(
  product: SearchableProduct,
  rawQuery: string
): boolean {
  if (!rawQuery || !rawQuery.trim()) return true;

  const q = rawQuery.toLowerCase().trim();

  // 1. Synonym matching for competitor names & legacy terms
  // "little things", "essentials", "capital", "homeware essentials", "dobsons", "combs", "lp marketing"
  const isCompetitorOrLegacySynonym =
    q === 'little things' ||
    q === 'little thing' ||
    q.includes('little things') ||
    q === 'essentials' ||
    q === 'essential' ||
    q.includes('essentials') ||
    q === 'capital' ||
    q.includes('capital') ||
    q === 'dobsons' ||
    q === 'dobson' ||
    q.includes('dobsons') ||
    q === 'lp marketing' ||
    q === 'lp' ||
    q.includes('lp marketing');

  if (isCompetitorOrLegacySynonym) {
    return true;
  }

  // 2. Homeware essentials check
  if (q.includes('homeware')) {
    const cat = (product.categoryId || '').toLowerCase();
    if (
      cat === 'household' ||
      cat === 'kitchenware' ||
      cat === 'hardware' ||
      cat === 'diy'
    ) {
      return true;
    }
    // Return true across catalog if no specific category matched
    return true;
  }

  // 3. Combs search synonym & stemming (matches Nit Combs, Gents Comb, Handle Comb, Large Vent Brush)
  if (q === 'combs' || q === 'comb' || q.includes('comb')) {
    const name = product.name.toLowerCase();
    const shortLine = (product.shortLine || '').toLowerCase();
    const desc = (product.description || '').toLowerCase();
    if (
      name.includes('comb') ||
      shortLine.includes('comb') ||
      desc.includes('comb') ||
      name.includes('brush') ||
      shortLine.includes('brush')
    ) {
      return true;
    }
  }

  // 4. Standard text & attribute matching
  const name = product.name.toLowerCase();
  const code = (product.code || '').toLowerCase();
  const shortLine = (product.shortLine || '').toLowerCase();
  const desc = (product.description || '').toLowerCase();
  const barcode = (product.barcode || '').toLowerCase();

  if (
    name.includes(q) ||
    code.includes(q) ||
    shortLine.includes(q) ||
    desc.includes(q) ||
    barcode.includes(q)
  ) {
    return true;
  }

  // Multi-word query check: all words present
  const words = q.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    const allWordsFound = words.every(
      (w) =>
        name.includes(w) ||
        code.includes(w) ||
        shortLine.includes(w) ||
        desc.includes(w)
    );
    if (allWordsFound) return true;
  }

  return false;
}

