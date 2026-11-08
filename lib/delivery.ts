/**
 * UK Retail Delivery Fee Configuration (all money in pence)
 * Free delivery on orders >= £50 (5000 pence), otherwise flat £3.99 (399 pence).
 */
export const DELIVERY_FLAT_FEE_PENCE = 399; // £3.99
export const FREE_DELIVERY_THRESHOLD_PENCE = 5000; // £50.00

export function getDeliveryFee(subtotalPence: number): number {
  if (subtotalPence >= FREE_DELIVERY_THRESHOLD_PENCE) {
    return 0;
  }
  return DELIVERY_FLAT_FEE_PENCE;
}

/**
 * Trade Delivery Fee Configuration (ex VAT, in pence)
 * Free delivery on trade orders >= £150 (15000 pence ex VAT), otherwise flat £4.99 (499 pence).
 */
export const TRADE_FREE_DELIVERY_THRESHOLD_PENCE = 15000; // £150.00 ex VAT
export const TRADE_DEFAULT_DELIVERY_FEE_PENCE = 499; // £4.99

export function getTradeDeliveryFee(subtotalExVatPence: number): number {
  if (subtotalExVatPence >= TRADE_FREE_DELIVERY_THRESHOLD_PENCE) {
    return 0;
  }
  return TRADE_DEFAULT_DELIVERY_FEE_PENCE;
}

