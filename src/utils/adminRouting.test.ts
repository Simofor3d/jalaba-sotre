import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAppRoute, isAdminRoutePage, resolveAdminRouteGuard } from './adminRouting';

test('parseAppRoute recognizes standalone /admin/login and /admin routes', () => {
  assert.deepEqual(parseAppRoute('/admin/login'), { page: 'admin-login' });
  assert.deepEqual(parseAppRoute('/admin/login/'), { page: 'admin-login' });
  assert.deepEqual(parseAppRoute('/', '#/admin/login'), { page: 'admin-login' });
  assert.deepEqual(parseAppRoute('/admin'), { page: 'admin' });
  assert.deepEqual(parseAppRoute('/admin/orders'), { page: 'admin' });
  assert.deepEqual(parseAppRoute('/', '#/admin'), { page: 'admin' });
});

test('isAdminRoutePage isolates admin pages from public storefront pages', () => {
  assert.equal(isAdminRoutePage('admin-login'), true);
  assert.equal(isAdminRoutePage('admin'), true);
  assert.equal(isAdminRoutePage('home'), false);
  assert.equal(isAdminRoutePage('product'), false);
  assert.equal(isAdminRoutePage('category'), false);
  assert.equal(isAdminRoutePage('track-order'), false);
});

test('resolveAdminRouteGuard enforces redirect between /admin and /admin/login', () => {
  assert.deepEqual(resolveAdminRouteGuard('admin', false), {
    page: 'admin-login',
    redirectUrl: '/admin/login',
  });
  assert.deepEqual(resolveAdminRouteGuard('admin-login', false), {
    page: 'admin-login',
    redirectUrl: null,
  });
  assert.deepEqual(resolveAdminRouteGuard('admin-login', true), {
    page: 'admin',
    redirectUrl: '/admin',
  });
  assert.deepEqual(resolveAdminRouteGuard('admin', true), {
    page: 'admin',
    redirectUrl: null,
  });
  assert.deepEqual(resolveAdminRouteGuard('home', false), {
    page: 'home',
    redirectUrl: null,
  });
});

test('parseAppRoute preserves storefront product, category, and track-order routes', () => {
  assert.deepEqual(parseAppRoute('/products/caftan-royal'), {
    page: 'product',
    slug: 'caftan-royal',
  });
  assert.deepEqual(parseAppRoute('/category/djellaba'), {
    page: 'category',
    slug: 'djellaba',
  });
  assert.deepEqual(parseAppRoute('/track-order', '', '?order=DM-2026-1001&phone=0661234567'), {
    page: 'track-order',
    orderNumber: 'DM-2026-1001',
    phone: '0661234567',
  });
});
