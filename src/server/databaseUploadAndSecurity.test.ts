import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { StoreDatabase } from './database.ts';

function createTempDb() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dar-sec-test-'));
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

test('SQLite Media BLOB - Saves, reads, lists, and deletes uploaded files directly in DB', () => {
  const { instance, cleanup } = createTempDb();
  try {
    const sampleBytes = Buffer.from('fake-png-binary-payload-for-test');
    const saved = instance.saveMedia({
      filename: 'kaftan_gold.png',
      mime_type: 'image/png',
      buffer: sampleBytes,
    });

    assert.ok(saved.id.startsWith('media-'));
    assert.equal(saved.url, `/api/media/${saved.id}`);
    assert.equal(saved.size_bytes, sampleBytes.length);

    const retrieved = instance.getMediaById(saved.id);
    assert.ok(retrieved);
    assert.equal(retrieved.mime_type, 'image/png');
    assert.deepEqual(retrieved.data, sampleBytes);

    const list = instance.listMedia();
    assert.equal(list.length, 1);
    assert.equal(list[0].filename, 'kaftan_gold.png');

    const deleted = instance.deleteMedia(saved.id);
    assert.equal(deleted, true);
    assert.equal(instance.getMediaById(saved.id), undefined);
  } finally {
    cleanup();
  }
});

test('SQLite Categories CRUD - Create, update, toggle visibility, and delete categories', () => {
  const { instance, cleanup } = createTempDb();
  try {
    const initialActive = instance.getCategories(false);
    assert.ok(initialActive.length >= 4);

    // Create new category with uploaded media path
    const created = instance.saveCategory({
      name_ar: 'تكشيطة مغربية ملكية',
      name_fr: 'Takchita Royale',
      slug: 'royal-takchita',
      description_ar: 'تكاشط فاخرة للأعراس والمناسبات',
      image_url: '/api/media/media-demo-123',
      display_order: 5,
      is_active: true,
    });

    assert.equal(created.name_ar, 'تكشيطة مغربية ملكية');
    assert.equal(instance.getCategories(false).length, initialActive.length + 1);

    // Toggle inactive
    const updated = instance.saveCategory({
      ...created,
      name_ar: 'تكاشط وأثواب فاخرة',
      is_active: false,
    });
    assert.equal(updated.name_ar, 'تكاشط وأثواب فاخرة');
    assert.equal(updated.is_active, false);
    assert.equal(instance.getCategories(false).length, initialActive.length);
    assert.equal(instance.getCategories(true).length, initialActive.length + 1);

    // Delete category
    assert.equal(instance.deleteCategory(created.id), true);
    assert.equal(instance.getCategories(true).length, initialActive.length);
  } finally {
    cleanup();
  }
});

test('Admin Security - Scrypt password verification, session tokens, logout, and credential rotation', () => {
  const { instance, cleanup } = createTempDb();
  try {
    // Reject invalid password
    assert.equal(instance.verifyAdmin('admin', 'wrong_pass'), null);

    // Verify default admin
    const admin = instance.verifyAdmin('admin', 'admin123');
    assert.ok(admin);
    assert.equal(admin.username, 'admin');
    assert.equal((admin as any).password_hash, undefined, 'Must never expose password_hash');

    // Create & verify random session token
    const token = instance.createAdminSession(admin.id, 24);
    assert.ok(token.length >= 64);
    const verifiedUser = instance.verifySessionToken(token);
    assert.ok(verifiedUser);
    assert.equal(verifiedUser.id, admin.id);

    // Rotate password & invalidate previous sessions
    const changed = instance.updateAdminCredentials(admin.id, 'admin123', 'StrongPass2026!', 'atelier_admin');
    assert.equal(changed.success, true);
    assert.equal(instance.verifySessionToken(token), null, 'Old session token must be invalidated after password change');
    assert.equal(instance.verifyAdmin('admin', 'admin123'), null, 'Old credentials must no longer work');
    assert.ok(instance.verifyAdmin('atelier_admin', 'StrongPass2026!'), 'New credentials must authenticate');

    // Logout removes session
    const newToken = instance.createAdminSession(admin.id, 24);
    assert.ok(instance.verifySessionToken(newToken));
    instance.deleteSessionToken(newToken);
    assert.equal(instance.verifySessionToken(newToken), null);
  } finally {
    cleanup();
  }
});

test('Public Order Tracking - Matches orderNumber + phone variants while stripping sensitive notes', () => {
  const { instance, cleanup } = createTempDb();
  try {
    const product = instance.getProducts()[0];
    const variant = product.variants[0];
    const orderRes = instance.createOrder({
      customer_name: 'ياسين بنجلون',
      customer_phone: '0661554433',
      customer_email: 'yassine@example.com',
      address_line: 'شارع محمد الخامس رقم 10',
      region_id: 'reg-06',
      province_id: 'prov-casablanca',
      commune_id: 'com-maarif',
      region_name_ar: 'جهة الدار البيضاء-سطات',
      province_name_ar: 'عمالة الدار البيضاء',
      commune_name_ar: 'المعاريف',
      payment_method: 'COD',
      items: [{ product_id: product.id, variant_id: variant.id, quantity: 1 }],
      internal_notes: 'SECRET_ADMIN_INTERNAL_NOTE',
    });

    assert.equal(orderRes.success, true);
    const created = orderRes.order!;

    // Exact match works (case-insensitive order number)
    const foundExact = instance.trackOrder(created.order_number.toLowerCase(), '0661554433');
    assert.ok(foundExact);
    assert.equal(foundExact.order_number, created.order_number);
    assert.equal((foundExact as any).internal_notes, undefined);
    assert.equal((foundExact as any).customer_email, undefined);

    // +212 international format matches same Moroccan subscriber number
    const foundIntl = instance.trackOrder(created.order_number, '+212 661-554433');
    assert.ok(foundIntl);
    assert.equal(foundIntl.order_number, created.order_number);

    // Wrong phone rejects lookup
    assert.equal(instance.trackOrder(created.order_number, '0661999999'), undefined);
    assert.equal(instance.trackOrder('DM-0000-NONE', '0661554433'), undefined);
  } finally {
    cleanup();
  }
});
