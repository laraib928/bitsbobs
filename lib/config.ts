export const SITE_CONFIG = {
  name: "Bits 'N' Bobs",
  domain: 'bitsnbobs.co',
  phone: '0161 839 5050',
  telLink: 'tel:01618395050',
  whatsAppNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '441618395050',
  whatsAppDisplay: '0161 839 5050',
  email: 'sales@bitsnbobs.co',
  sinceYear: 1994,
  vatRate: 0.2, // 20%
  tradeFreeDeliveryThresholdPence: 15000, // £150.00 ex VAT
  defaultDeliveryChargePence: 499, // £4.99 placeholder
  socialLinks: {
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || 'https://www.facebook.com/bitsnbobsuk/',
    tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL || 'https://www.tiktok.com/@bitsnbobsmcr',
  },
  placeholders: {
    shopName: '[Shop name]',
    deliveryCharge: '[Delivery charge]',
    customerReviewText: '[Customer review text]',
    retailerTestimonialText: '[Retailer testimonial text]',
    customerName: '[Customer name]',
    town: '[town]',
    eanBarcode: '[EAN barcode]',
    companyNumber: '[company number]',
    vatNumber: '[VAT number]',
    productDemoVideo: '[Product demo video]',
    inUsePhoto: '[In-use photo]',
    rating: '[rating]',
    reviewsCount: '[number]',
    featureDetail: '[Feature detail from client]',
    standHardwarePrice: '[Stand hardware price]',
    standDimensions: '[Stand description and dimensions from client]',
  },
};

/**
 * Generates a WhatsApp chat link (wa.me) with pre-filled message.
 * Formats UK numbers into international format without leading zero.
 */
export function getWhatsAppUrl(
  text: string = 'Hi Bits N Bobs, I have a question'
): string {
  const rawNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    SITE_CONFIG.whatsAppNumber ||
    '441618395050';
  let clean = rawNumber.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) {
    clean = '44' + clean.slice(1);
  }
  return `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
}

