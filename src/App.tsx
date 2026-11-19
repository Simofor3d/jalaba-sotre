import React, { useState, useEffect, Suspense } from 'react';
import { StoreProvider, useStore } from './context/StoreContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext.tsx';
import { Header, StaticPageKey } from './components/Header.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { StoreBenefits } from './components/StoreBenefits.tsx';
import { CategoryCards } from './components/CategoryCards.tsx';
import { ProductSection } from './components/ProductSection.tsx';
import { PromoBanner } from './components/PromoBanner.tsx';
import { CustomerReviews } from './components/CustomerReviews.tsx';
import { Footer } from './components/Footer.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { ProductPage } from './components/ProductPage.tsx';
import { CategoryProductsPage } from './components/pages/CategoryProductsPage.tsx';
import { AboutPage } from './components/pages/AboutPage.tsx';
import { ContactPage } from './components/pages/ContactPage.tsx';
import { ReturnPolicyPage } from './components/pages/ReturnPolicyPage.tsx';
import { PrivacyTermsPage } from './components/pages/PrivacyTermsPage.tsx';
import { OrderTrackingPage } from './components/pages/OrderTrackingPage.tsx';
import { Product } from './types/store.ts';

import {
  AppRoute,
  parseAppRoute,
  isAdminRoutePage,
  resolveAdminRouteGuard,
} from './utils/adminRouting.ts';

// Lazy-load Admin pages so customer storefront never bundles/renders admin UI unless /admin or /admin/login is visited
const LazyAdminLoginPage = React.lazy(() =>
  import('./components/admin/AdminLoginPage.tsx').then(m => ({ default: m.AdminLoginPage }))
);
const LazyAdminDashboard = React.lazy(() =>
  import('./components/admin/AdminDashboard.tsx').then(m => ({ default: m.AdminDashboard }))
);

function parseCurrentRoute(): AppRoute {
  return parseAppRoute(window.location.pathname, window.location.hash, window.location.search);
}

function StorefrontApp() {
  const { products, settings } = useStore();
  const { isAdminLoggedIn, isCheckingSession, setIsAdminOpen } = useAdminAuth();
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => parseCurrentRoute());
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const isAdminRoute = isAdminRoutePage(currentRoute.page);

  // Sync admin open state and enforce standalone route guard (/admin <-> /admin/login)
  useEffect(() => {
    setIsAdminOpen(currentRoute.page === 'admin' && isAdminLoggedIn);
    if (isCheckingSession) return;

    const guard = resolveAdminRouteGuard(currentRoute.page, isAdminLoggedIn);
    if (guard.redirectUrl && guard.page !== currentRoute.page) {
      window.history.replaceState({ page: guard.page }, '', guard.redirectUrl);
      setCurrentRoute({ page: guard.page });
    }
  }, [currentRoute.page, isAdminLoggedIn, isCheckingSession, setIsAdminOpen]);

  // Sync route on popstate (browser back/forward button)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(parseCurrentRoute());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToAdminLogin = () => {
    window.history.pushState({ page: 'admin-login' }, '', '/admin/login');
    setCurrentRoute({ page: 'admin-login' });
    window.scrollTo({ top: 0 });
  };

  const navigateToAdminDashboard = () => {
    window.history.pushState({ page: 'admin' }, '', '/admin');
    setCurrentRoute({ page: 'admin' });
    window.scrollTo({ top: 0 });
  };

  const navigateToProduct = (slug: string) => {
    window.history.pushState({ page: 'product', slug }, '', `/products/${encodeURIComponent(slug)}`);
    setCurrentRoute({ page: 'product', slug });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCategory = (slug: string) => {
    const targetUrl = slug === 'all' ? '/shop' : `/category/${encodeURIComponent(slug)}`;
    window.history.pushState({ page: 'category', slug }, '', targetUrl);
    setCurrentRoute({ page: 'category', slug });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPage = (page: StaticPageKey, query?: { order?: string; phone?: string }) => {
    let url = `/${page}`;
    if (page === 'track-order' && query?.order && query?.phone) {
      const qs = new URLSearchParams({ order: query.order, phone: query.phone }).toString();
      url = `/track-order?${qs}`;
    }
    window.history.pushState({ page }, '', url);
    setCurrentRoute({ page, orderNumber: query?.order, phone: query?.phone });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => {
    window.history.pushState({ page: 'home' }, '', '/');
    setCurrentRoute({ page: 'home' });
    document.title = `${settings.store_name} | أرقى الأزياء المغربية التقليدية`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProductById = (productIdOrSlug: string) => {
    const p = products.find(prod => prod.id === productIdOrSlug || prod.slug === productIdOrSlug);
    if (p) {
      navigateToProduct(p.slug);
    }
  };

  const handleOpenProductDetails = (product: Product) => {
    navigateToProduct(product.slug);
  };

  const handleQuickBuy = (product: Product) => {
    navigateToProduct(product.slug);
  };

  // Dedicated standalone Admin routes — zero storefront chrome rendered
  if (isAdminRoute) {
    const loadingFallback = (
      <div
        dir="rtl"
        className="flex min-h-screen w-full items-center justify-center bg-[var(--brand-bg)] text-sm font-semibold text-[var(--brand-primary)]"
      >
        جاري تحميل بوابة الإدارة...
      </div>
    );

    if (isCheckingSession) {
      return loadingFallback;
    }

    if (!isAdminLoggedIn || currentRoute.page === 'admin-login') {
      return (
        <Suspense fallback={loadingFallback}>
          <LazyAdminLoginPage
            onLoginSuccess={navigateToAdminDashboard}
            onNavigateHome={navigateToHome}
          />
        </Suspense>
      );
    }

    return (
      <Suspense fallback={loadingFallback}>
        <LazyAdminDashboard
          onExitAdmin={navigateToHome}
          onLoggedOut={navigateToAdminLogin}
        />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--brand-bg)] text-[#1E2522] flex flex-col justify-between selection:bg-[var(--brand-primary)] selection:text-[var(--brand-accent-light)]">
      {/* Non-sticky Navigation Header */}
      <Header
        currentPage={currentRoute.page}
        activeCategorySlug={currentRoute.slug}
        onSelectProduct={handleSelectProductById}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
        onNavigateHome={navigateToHome}
        onNavigateToCategory={navigateToCategory}
        onNavigateToPage={navigateToPage}
        onNavigateToAdmin={isAdminLoggedIn ? navigateToAdminDashboard : navigateToAdminLogin}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentRoute.page === 'product' && currentRoute.slug ? (
          <ProductPage
            slug={currentRoute.slug}
            onNavigateHome={navigateToHome}
            onNavigateToCategory={navigateToCategory}
            onNavigateToProduct={navigateToProduct}
            onOpenCheckout={() => setIsCheckoutOpen(true)}
          />
        ) : currentRoute.page === 'category' ? (
          <CategoryProductsPage
            categorySlug={currentRoute.slug || 'all'}
            onSelectCategorySlug={navigateToCategory}
            onNavigateHome={navigateToHome}
            onOpenDetails={handleOpenProductDetails}
            onQuickBuy={handleQuickBuy}
          />
        ) : currentRoute.page === 'about' ? (
          <AboutPage
            onNavigateHome={navigateToHome}
            onNavigateToShop={() => navigateToCategory('all')}
            onNavigateToContact={() => navigateToPage('contact')}
          />
        ) : currentRoute.page === 'contact' ? (
          <ContactPage
            onNavigateHome={navigateToHome}
            onNavigateToTrackOrder={() => navigateToPage('track-order')}
          />
        ) : currentRoute.page === 'return-policy' ? (
          <ReturnPolicyPage
            onNavigateHome={navigateToHome}
            onNavigateToContact={() => navigateToPage('contact')}
            onNavigateToShop={() => navigateToCategory('all')}
          />
        ) : currentRoute.page === 'privacy-terms' ? (
          <PrivacyTermsPage
            onNavigateHome={navigateToHome}
            onNavigateToContact={() => navigateToPage('contact')}
          />
        ) : currentRoute.page === 'track-order' ? (
          <OrderTrackingPage
            initialOrderNumber={currentRoute.orderNumber}
            initialPhone={currentRoute.phone}
            onNavigateHome={navigateToHome}
            onNavigateToContact={() => navigateToPage('contact')}
          />
        ) : (
          <>
            <HeroSection onNavigateToShop={() => navigateToCategory('all')} />
            <StoreBenefits />
            <CategoryCards onSelectCategorySlug={navigateToCategory} />
            <ProductSection
              onOpenDetails={handleOpenProductDetails}
              onQuickBuy={handleQuickBuy}
              onNavigateToShop={() => navigateToCategory('all')}
            />
            <PromoBanner onNavigateToShop={() => navigateToCategory('all')} />
            <CustomerReviews />
          </>
        )}
      </main>

      <Footer
        onNavigateToCategory={navigateToCategory}
        onNavigateToPage={navigateToPage}
      />
      <CartDrawer onOpenCheckout={() => setIsCheckoutOpen(true)} />
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onTrackOrder={(orderNumber, phone) => {
          setIsCheckoutOpen(false);
          navigateToPage('track-order', { order: orderNumber, phone });
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AdminAuthProvider>
      <StoreProvider>
        <CartProvider>
          <StorefrontApp />
        </CartProvider>
      </StoreProvider>
    </AdminAuthProvider>
  );
}
