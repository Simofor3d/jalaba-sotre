import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import { Product } from '../../types/store.ts';
import { ProductCard } from '../ProductCard.tsx';
import { stripHtmlToText } from '../../utils/richText.ts';
import { Filter, Search, X, ArrowRight } from 'lucide-react';

interface CategoryProductsPageProps {
  categorySlug: string;
  onSelectCategorySlug: (slug: string) => void;
  onNavigateHome: () => void;
  onOpenDetails: (product: Product) => void;
  onQuickBuy: (product: Product) => void;
}

export const CategoryProductsPage: React.FC<CategoryProductsPageProps> = ({
  categorySlug,
  onSelectCategorySlug,
  onNavigateHome,
  onOpenDetails,
  onQuickBuy,
}) => {
  const { products, categories, loading, searchQuery, setSearchQuery } = useStore();
  const [filterTab, setFilterTab] = useState<'all' | 'best_seller' | 'new_arrival'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc'>('default');

  const activeCategory =
    categorySlug && categorySlug !== 'all'
      ? categories.find(c => c.slug === categorySlug || c.id === categorySlug)
      : undefined;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [categorySlug]);

  let filtered = products.filter(p => p.is_active);

  if (activeCategory) {
    filtered = filtered.filter(p => p.category_id === activeCategory.id);
  }

  if (filterTab === 'best_seller') {
    filtered = filtered.filter(p => p.is_best_seller);
  } else if (filterTab === 'new_arrival') {
    filtered = filtered.filter(p => p.is_new_arrival);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      p =>
        p.name_ar.toLowerCase().includes(q) ||
        stripHtmlToText(p.description_ar).toLowerCase().includes(q) ||
        (p.name_fr && p.name_fr.toLowerCase().includes(q))
    );
  }

  if (sortBy === 'price_asc') {
    filtered = [...filtered].sort(
      (a, b) => (a.discounted_price ?? a.regular_price) - (b.discounted_price ?? b.regular_price)
    );
  } else if (sortBy === 'price_desc') {
    filtered = [...filtered].sort(
      (a, b) => (b.discounted_price ?? b.regular_price) - (a.discounted_price ?? a.regular_price)
    );
  }

  const pageTitle = activeCategory ? activeCategory.name_ar : 'جميع المنتجات';
  const pageSubtitle = activeCategory?.description_ar
    ? activeCategory.description_ar
    : 'تصفح مجموعتنا المختارة من الأزياء المغربية التقليدية الأصيلة بخياطة المعلم.';

  return (
    <section className="min-h-[75vh] bg-[var(--brand-bg)] py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Clean Breadcrumb */}
        <nav aria-label="مسار التنقل" className="mb-6 flex items-center gap-2 text-xs text-stone-500">
          <button
            onClick={onNavigateHome}
            className="hover:text-[var(--brand-primary)] transition-colors cursor-pointer"
          >
            الرئيسية
          </button>
          <span aria-hidden="true">/</span>
          <button
            onClick={() => onSelectCategorySlug('all')}
            className="hover:text-[var(--brand-primary)] transition-colors cursor-pointer"
          >
            المنتجات
          </button>
          {activeCategory && (
            <>
              <span aria-hidden="true">/</span>
              <span className="font-bold text-[var(--brand-primary)]">{activeCategory.name_ar}</span>
            </>
          )}
        </nav>

        {/* Clean Category Title Header */}
        <div className="mb-8 flex flex-col gap-4 border-b border-[#E5DAC6] pb-6 md:flex-row md:items-end md:justify-between">
          <div className="text-right space-y-1.5">
            <h1 className="font-amiri text-3xl sm:text-4xl font-bold text-[var(--brand-primary)]">
              {pageTitle}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 max-w-2xl">{pageSubtitle}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-600 font-mono tabular-nums">
              {filtered.length} منتج متوفر
            </span>
          </div>
        </div>

        {/* Category Switcher + Filter Controls (2 clean uncrowded rows) */}
        <div className="mb-8 space-y-4 border-b border-[#E5DAC6] pb-4">
          {/* Row 1: Category Switcher */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-[#E5DAC6]/70 pb-3 text-xs sm:text-sm">
            <button
              onClick={() => onSelectCategorySlug('all')}
              className={`whitespace-nowrap shrink-0 pb-1.5 border-b-2 transition-colors ${
                !activeCategory
                  ? 'border-[var(--brand-primary)] font-bold text-[var(--brand-primary)]'
                  : 'border-transparent text-stone-600 hover:text-[var(--brand-primary)]'
              }`}
            >
              جميع المجموعات
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => onSelectCategorySlug(cat.slug)}
                className={`whitespace-nowrap shrink-0 pb-1.5 border-b-2 transition-colors ${
                  activeCategory?.id === cat.id
                    ? 'border-[var(--brand-primary)] font-bold text-[var(--brand-primary)]'
                    : 'border-transparent text-stone-600 hover:text-[var(--brand-primary)]'
                }`}
              >
                {cat.name_ar}
              </button>
            ))}
          </div>

          {/* Row 2: Inline Search + Sub-filter + Sort */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 text-xs shrink-0">
              <button
                onClick={() => setFilterTab('all')}
                className={`whitespace-nowrap ${
                  filterTab === 'all'
                    ? 'font-bold text-[var(--brand-primary)] underline underline-offset-4'
                    : 'text-stone-500 hover:text-[var(--brand-primary)]'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setFilterTab('new_arrival')}
                className={`whitespace-nowrap ${
                  filterTab === 'new_arrival'
                    ? 'font-bold text-[var(--brand-primary)] underline underline-offset-4'
                    : 'text-stone-500 hover:text-[var(--brand-primary)]'
                }`}
              >
                جديدنا
              </button>
              <button
                onClick={() => setFilterTab('best_seller')}
                className={`whitespace-nowrap ${
                  filterTab === 'best_seller'
                    ? 'font-bold text-[var(--brand-primary)] underline underline-offset-4'
                    : 'text-stone-500 hover:text-[var(--brand-primary)]'
                }`}
              >
                الأكثر مبيعاً
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="ابحث داخل المنتجات..."
                  aria-label="ابحث داخل المنتجات"
                  className="w-52 sm:w-64 rounded-lg border border-[#D5C9B3] bg-white py-1.5 pr-8 pl-7 text-xs text-[#1E2522] placeholder:text-stone-400 focus:border-[var(--brand-primary)] focus:outline-none"
                />
                <Search className="absolute top-2 right-2.5 h-3.5 w-3.5 text-stone-400" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    aria-label="مسح البحث"
                    className="absolute top-1.5 left-2 rounded-full p-0.5 text-stone-400 hover:text-stone-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'default' | 'price_asc' | 'price_desc')}
                aria-label="ترتيب المنتجات"
                className="rounded-lg border border-[#D5C9B3] bg-white px-3 py-1.5 text-xs text-[#1E2522] focus:border-[var(--brand-primary)] focus:outline-none"
              >
                <option value="default">الترتيب الافتراضي</option>
                <option value="price_asc">السعر: من الأقل إلى الأعلى</option>
                <option value="price_desc">السعر: من الأعلى إلى الأقل</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading or Products Grid */}
        {loading && products.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#E5DAC6] border-t-[var(--brand-primary)] mb-3" />
            <p className="text-xs text-stone-600">جاري تحميل المنتجات...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-[#E5DAC6] bg-white py-16 text-center text-stone-500">
            <Filter className="mx-auto h-12 w-12 text-stone-300 mb-3" />
            <p className="font-amiri text-xl font-bold text-[var(--brand-primary)]">
              لم يتم العثور على منتجات في هذا التصنيف حالياً
            </p>
            <p className="text-xs text-stone-500 mt-1">
              يمكنك عرض جميع المنتجات أو اختيار تصنيف آخر
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  setFilterTab('all');
                  setSearchQuery('');
                  onSelectCategorySlug('all');
                }}
                className="rounded-lg bg-[var(--brand-primary)] px-6 py-2.5 text-xs font-bold text-white hover:bg-[var(--brand-primary-hover)]"
              >
                عرض جميع المنتجات
              </button>
              <button
                onClick={onNavigateHome}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5C9B3] bg-white px-5 py-2.5 text-xs font-semibold text-[var(--brand-primary)] hover:bg-[var(--brand-bg)]"
              >
                <ArrowRight className="h-3.5 w-3.5" />
                <span>العودة للرئيسية</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetails={onOpenDetails}
                onQuickBuy={onQuickBuy}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
