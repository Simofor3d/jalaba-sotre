import type { CartItem } from '../types/store.ts';

/**
 * Format currency in Moroccan Dirham (MAD / درهم مغربي)
 */
export function formatMAD(amount: number): string {
  const rounded = Math.round(amount);
  return `${rounded.toLocaleString('ar-MA')} د.م.`;
}

/**
 * Calculate Cart Totals
 */
export function calculateCartTotals(
  items: CartItem[],
  shippingFee: number = 40,
  freeShippingThreshold: number = 500
): {
  subtotal: number;
  shippingCost: number;
  total: number;
  isFreeShipping: boolean;
  amountNeededForFreeShipping: number;
} {
  const subtotal = items.reduce((acc, item) => {
    const unitPrice = item.product.discounted_price ?? item.product.regular_price;
    const variantExtra = item.variant.additional_price || 0;
    return acc + (unitPrice + variantExtra) * item.quantity;
  }, 0);

  const isFreeShipping = subtotal >= freeShippingThreshold && items.length > 0;
  const shippingCost = items.length === 0 ? 0 : isFreeShipping ? 0 : shippingFee;
  const total = subtotal + shippingCost;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return {
    subtotal,
    shippingCost,
    total,
    isFreeShipping,
    amountNeededForFreeShipping,
  };
}

/**
 * Validate and normalize Moroccan phone numbers
 * Accepts: 06XXXXXXXX, 07XXXXXXXX, 05XXXXXXXX, +2126XXXXXXXX, +2127XXXXXXXX, 002126XXXXXXXX
 */
export function validateMoroccanPhone(phone: string): {
  isValid: boolean;
  normalized?: string;
  error?: string;
} {
  if (!phone) {
    return { isValid: false, error: 'رقم الهاتف مطلوب' };
  }

  // Remove spaces, hyphens, parentheses
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');

  // Regex for Moroccan numbers
  // Local: 0[567]\d{8}
  // International: (\+212|00212)[567]\d{8}
  const localMatch = cleaned.match(/^0([567]\d{8})$/);
  const intlMatch = cleaned.match(/^(?:\+212|00212)([567]\d{8})$/);

  if (localMatch) {
    return {
      isValid: true,
      normalized: `0${localMatch[1]}`,
    };
  } else if (intlMatch) {
    return {
      isValid: true,
      normalized: `0${intlMatch[1]}`,
    };
  }

  return {
    isValid: false,
    error: 'يرجى إدخال رقم هاتف مغربي صالح (يبدأ بـ 06 أو 07 أو 05 مكون من 10 أرقام)',
  };
}

/**
 * Generate unique order number (e.g. DM-2026-7842)
 */
export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `DM-${year}-${randomPart}`;
}
