const gbpFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
});

/**
 * Formats pence into GBP string.
 * If allowPenceOnly is true and amount is positive and less than 100 pence, returns e.g. "99p".
 */
export function formatMoney(
  pence: number,
  options: { allowPenceOnly?: boolean } = {}
): string {
  const roundedPence = Math.round(pence);
  if (options.allowPenceOnly && roundedPence > 0 && roundedPence < 100) {
    return `${roundedPence}p`;
  }
  return gbpFormatter.format(roundedPence / 100);
}

/**
 * Calculates trade profit per pack and profit percentage.
 * Profit = (RRP * unitsPerPack) - wholesalePackPrice
 * Margin percentage = (Profit / (RRP * unitsPerPack)) * 100
 */
export function calculateTradeProfit(
  retailPricePence: number,
  unitsPerPack: number,
  wholesalePackPricePence: number
): {
  profitPence: number;
  profitFormatted: string;
  marginPercent: number;
  displayString: string; // e.g. "Profit £2.62" or "£2.62 (44%)"
} {
  const totalRrpPence = retailPricePence * unitsPerPack;
  const profitPence = totalRrpPence - wholesalePackPricePence;
  const marginPercent =
    totalRrpPence > 0 ? Math.round((profitPence / totalRrpPence) * 100) : 0;

  return {
    profitPence,
    profitFormatted: formatMoney(profitPence),
    marginPercent,
    displayString: `${formatMoney(profitPence)} (${marginPercent}%)`,
  };
}

