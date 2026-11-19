import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { StoreDatabase, LOCAL_ASSETS } from './database.ts';

function createTempDb() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dar-prod-test-'));
  const instance = new StoreDatabase(path.join(dir, 'test.db'));
  return {
    instance,
    cleanup: () => {
      instance.close();
      fs.rmSync(dir, { recursive: true, force: true });
    },
  };
}

test('Product by Slug - Retrieves existing Moroccan garment', () => {
  const { instance, cleanup } = createTempDb();
  try {
    const product = instance.getProductBySlug('djellaba-makhzania-homme-verte');
    assert.ok(product, 'Product should be found by slug');
    assert.strictEqual(product.name_ar, 'جلابة مخزنية رجالية ملكية خضراء');
    assert.ok(Array.isArray(product.additional_images), 'additional_images must be an array');
    assert.ok(product.additional_images.length > 0, 'additional_images should contain gallery items');
    assert.ok(Array.isArray(product.specifications), 'specifications must be an array');
    assert.ok(product.specifications.length >= 2, 'Should have craftsmanship specifications');
    assert.ok(product.care_instructions, 'Should have care instructions');
    assert.ok(product.shipping_info, 'Should have shipping info');
    assert.ok(product.return_policy, 'Should have return policy');
  } finally {
    cleanup();
  }
});

test('Product Admin Edit - Updates gallery images, slug, and specs dynamically', () => {
  const { instance, cleanup } = createTempDb();
  try {
    const existing = instance.getProductBySlug('djellaba-makhzania-homme-verte');
    assert.ok(existing);

    const updated = instance.saveProduct({
      ...existing,
      slug: 'djellaba-makhzania-homme-verte',
      additional_images: [
        ...existing.additional_images,
        LOCAL_ASSETS.hero,
      ],
      specifications: [
        ...(existing.specifications || []),
        { label: 'الضمان', value: 'أصلي 100%' },
      ],
    });

    assert.strictEqual(updated.slug, 'djellaba-makhzania-homme-verte');
    assert.ok(updated.additional_images.length >= 2);
    const foundSpec = updated.specifications?.find(s => s.label === 'الضمان');
    assert.ok(foundSpec, 'New specification should be persisted');
  } finally {
    cleanup();
  }
});
