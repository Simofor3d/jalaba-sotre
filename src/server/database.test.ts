import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { StoreDatabase } from './database.ts';

function createTempDb() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dar-store-test-'));
  const dbPath = path.join(dir, 'test.db');
  const instance = new StoreDatabase(dbPath);
  return {
    instance,
    cleanup: () => {
      instance.close();
      fs.rmSync(dir, { recursive: true, force: true });
    },
  };
}

test('Database - Initial products and categories loaded in SQLite', () => {
  const { instance, cleanup } = createTempDb();
  try {
    const products = instance.getProducts();
    assert.ok(products.length >= 6, 'Should load initial traditional products');
    const categories = instance.getCategories();
    assert.ok(categories.length >= 4, 'Should load initial categories');
    assert.ok(
      products.every(p => !p.main_image.includes('images.unsplash.com')),
      'Seeded products must use local authentic assets instead of external Unsplash URLs'
    );
  } finally {
    cleanup();
  }
});

test('Database - Order placement verifies stock, deducts in SQLite, and restores on cancel', () => {
  const { instance, cleanup } = createTempDb();
  try {
    const prod = instance.getProducts()[0];
    const variant = prod.variants[0];
    const initialStock = variant.stock_quantity;

    const orderResult = instance.createOrder({
      customer_name: 'محمد بناني',
      customer_phone: '0661223344',
      address_line: 'شارع المسيرة الخضراء عمارة 12 شقة 4',
      region_id: 'reg-06',
      province_id: 'prov-casa',
      commune_id: 'com-casa-maar',
      region_name_ar: 'جهة الدار البيضاء - سطات',
      province_name_ar: 'عمالة الدار البيضاء',
      commune_name_ar: 'جماعة المعاريف',
      payment_method: 'COD',
      items: [
        {
          product_id: prod.id,
          variant_id: variant.id,
          quantity: 1,
        },
      ],
    });

    assert.equal(orderResult.success, true, 'Order should be created successfully');
    assert.ok(orderResult.order?.order_number.startsWith('DM-'), 'Order number should start with DM-');

    const afterOrderProd = instance.getProductById(prod.id)!;
    assert.equal(
      afterOrderProd.variants[0].stock_quantity,
      initialStock - 1,
      'Stock must be deducted by 1 in SQLite'
    );

    if (orderResult.order) {
      instance.updateOrderStatus(orderResult.order.id, { order_status: 'CANCELLED' });
      const afterCancelProd = instance.getProductById(prod.id)!;
      assert.equal(
        afterCancelProd.variants[0].stock_quantity,
        initialStock,
        'Stock must be restored on cancellation'
      );
    }
  } finally {
    cleanup();
  }
});

test('Database - Reviews moderation workflow', () => {
  const { instance, cleanup } = createTempDb();
  try {
    const prod = instance.getProducts()[0];
    const newRev = instance.addReview({
      product_id: prod.id,
      customer_name: 'يوسف الفاسي',
      rating: 5,
      comment: 'جلابة قمة في الأناقة والروعة',
    });

    assert.equal(newRev.is_approved, false, 'New review must require moderation');

    instance.updateReview(newRev.id, { is_approved: true, admin_reply: 'شكراً لكم سي يوسف' });
    const approvedList = instance.getReviews(false);
    assert.ok(approvedList.some(r => r.id === newRev.id), 'Approved review should be visible publicly');
  } finally {
    cleanup();
  }
});
