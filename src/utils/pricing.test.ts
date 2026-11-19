import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCartTotals, validateMoroccanPhone, formatMAD } from './pricing.ts';
import { CartItem } from '../types/store.ts';

test('Cart Totals - Calculates subtotal and free shipping threshold', () => {
  const dummyItem: CartItem = {
    product: {
      id: 'p1',
      slug: 'djellaba-fasia',
      name_ar: 'جلابة فاسيسة راقية',
      description_ar: 'جلابة أصيلة',
      regular_price: 600,
      discounted_price: 550,
      category_id: 'cat-men',
      sku: 'DJ-FES-01',
      main_image: '',
      additional_images: [],
      variants: [],
      is_active: true,
      is_featured: true,
      is_new_arrival: true,
      is_best_seller: true,
      tags: [],
      created_at: new Date().toISOString(),
    },
    variant: {
      id: 'v1',
      color_name_ar: 'أبيض ملكي',
      color_name_fr: 'Blanc',
      color_code: '#FFFFFF',
      size: 'L',
      sku: 'DJ-FES-01-L-WH',
      stock_quantity: 10,
    },
    quantity: 1,
  };

  // Subtotal 550 MAD >= threshold 500 MAD -> Free shipping
  const totals = calculateCartTotals([dummyItem], 40, 500);
  assert.equal(totals.subtotal, 550);
  assert.equal(totals.shippingCost, 0, 'Shipping should be free when subtotal >= 500 MAD');
  assert.equal(totals.total, 550);
  assert.equal(totals.isFreeShipping, true);
  assert.equal(totals.amountNeededForFreeShipping, 0);

  // Subtotal under threshold:
  const lowItem: CartItem = {
    ...dummyItem,
    product: {
      ...dummyItem.product,
      discounted_price: 300,
    },
  };
  const lowTotals = calculateCartTotals([lowItem], 40, 500);
  assert.equal(lowTotals.subtotal, 300);
  assert.equal(lowTotals.shippingCost, 40, 'Shipping cost 40 MAD should apply under 500 MAD');
  assert.equal(lowTotals.total, 340);
  assert.equal(lowTotals.isFreeShipping, false);
  assert.equal(lowTotals.amountNeededForFreeShipping, 200);
});

test('Phone Validation - Accepts valid Moroccan mobile and landline numbers', () => {
  const validNumbers = [
    '0661234567',
    '0712345678',
    '0522123456',
    '+212661234567',
    '00212712345678',
    '06 61 23 45 67',
  ];

  for (const num of validNumbers) {
    const res = validateMoroccanPhone(num);
    assert.equal(res.isValid, true, `Should accept valid Moroccan number: ${num}`);
  }
});

test('Phone Validation - Rejects invalid numbers', () => {
  const invalidNumbers = [
    '0123456789', // Invalid prefix
    '061234', // Too short
    '061234567890123', // Too long
    'abcd',
    '',
  ];

  for (const num of invalidNumbers) {
    const res = validateMoroccanPhone(num);
    assert.equal(res.isValid, false, `Should reject invalid number: ${num}`);
  }
});

test('Currency Formatting - Formats Moroccan Dirham correctly', () => {
  const formatted = formatMAD(1250);
  assert.ok(formatted.includes('1'), 'Should contain amount');
  assert.ok(formatted.includes('د.م.'), 'Should contain Moroccan currency symbol');
});
