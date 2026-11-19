export type AppPageType =
  | 'home'
  | 'category'
  | 'product'
  | 'about'
  | 'contact'
  | 'return-policy'
  | 'privacy-terms'
  | 'track-order'
  | 'admin-login'
  | 'admin';

export interface AppRoute {
  page: AppPageType;
  slug?: string;
  orderNumber?: string;
  phone?: string;
}

export function parseAppRoute(pathnameRaw: string, hashRaw = '', searchRaw = ''): AppRoute {
  const pathname = (pathnameRaw || '/').toLowerCase();
  const hash = (hashRaw || '').toLowerCase();
  const params = new URLSearchParams(searchRaw || '');

  if (
    pathname === '/admin/login' ||
    pathname === '/admin/login/' ||
    hash === '#/admin/login' ||
    hash === '#admin/login'
  ) {
    return { page: 'admin-login' };
  }

  if (
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    hash === '#/admin' ||
    hash === '#admin'
  ) {
    return { page: 'admin' };
  }

  if (pathname === '/about' || pathname === '/about-us') {
    return { page: 'about' };
  }

  if (pathname === '/contact' || pathname === '/contact-us') {
    return { page: 'contact' };
  }

  if (pathname === '/return-policy' || pathname === '/returns') {
    return { page: 'return-policy' };
  }

  if (pathname === '/privacy-terms' || pathname === '/privacy' || pathname === '/terms') {
    return { page: 'privacy-terms' };
  }

  if (pathname === '/track-order') {
    return {
      page: 'track-order',
      orderNumber: params.get('order') || undefined,
      phone: params.get('phone') || undefined,
    };
  }

  if (pathname === '/shop' || pathname === '/products' || pathname === '/categories') {
    return { page: 'category', slug: 'all' };
  }

  if (pathname.startsWith('/category/')) {
    const slug = decodeURIComponent(
      (pathnameRaw || '').replace(/^\/category\//i, '').split('/')[0].trim()
    );
    return { page: 'category', slug: slug || 'all' };
  }

  if (pathname.startsWith('/products/')) {
    const slug = decodeURIComponent(
      (pathnameRaw || '').replace(/^\/products\//i, '').split('/')[0].trim()
    );
    if (slug) {
      return { page: 'product', slug };
    }
  }

  if (hash.startsWith('#/products/') || hash.startsWith('#products/')) {
    const slug = decodeURIComponent(
      (hashRaw || '').replace(/^#\/?products\//i, '').split('/')[0].trim()
    );
    if (slug) {
      return { page: 'product', slug };
    }
  }

  return { page: 'home' };
}

export function isAdminRoutePage(page: AppPageType): boolean {
  return page === 'admin' || page === 'admin-login';
}

export function resolveAdminRouteGuard(
  page: AppPageType,
  isAdminLoggedIn: boolean
): { page: AppPageType; redirectUrl: string | null } {
  if (page === 'admin' && !isAdminLoggedIn) {
    return { page: 'admin-login', redirectUrl: '/admin/login' };
  }
  if (page === 'admin-login' && isAdminLoggedIn) {
    return { page: 'admin', redirectUrl: '/admin' };
  }
  return { page, redirectUrl: null };
}
