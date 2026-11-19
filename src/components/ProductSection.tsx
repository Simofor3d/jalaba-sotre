import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { Product } from '../types/store.ts';
import { ProductCard } from './ProductCard.tsx';
import { DEFAULT_SITE_CONTENT, resolveSiteText } from '../utils/siteContent.ts';
import { ArrowLeft } from 'lucide-react';

interface ProductSectionProps {
  onOpenDetails: (product: Product) => void;
  onQuickBuy: (product: Product) => void;
  onNavigateToShop: () => void;
}

export const ProductSection: React.FC<ProductSectionProps> = ({
  onOpenDetails,
  onQuickBuy,
  onNavigateToShop,
}) => {
  const { products, settings } = useStore();

  const activeProducts = products.filter(p => p.is_active);
  const featured = activeProducts.filter(p => p.is_new_arrival || p.is_featured);
  const previewProducts = (featured.length > 0 ? featured : activeProducts).slice(0, 4);

  if (previewProducts.length === 0) return null;

  return (
    <section
      id="products-section"
      className="bg-[var(--brand-bg)] py-14 border-b border-[var(--brand-border)]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Centered Editorial Heading Flanking Gold Rosette Dividers */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4">
            <div className="hidden sm:flex items-center gap-2 w-24 text-[var(--brand-accent)]">
              <span className="h-[1px] flex-1 bg-[var(--brand-accent)]/60" />
              <span className="h-2 w-2 rotate-45 border border-[var(--brand-accent)]" />
            </div>
            <h2 className="font-amiri text-3xl sm:text-4xl font-bold text-[var(--brand-primary)]">
              {resolveSiteText(
                settings.products_section_title_ar,
                DEFAULT_SITE_CONTENT.products_section_title_ar
              )}
            </h2>
            <div className="hidden sm:flex items-center gap-2 w-24 text-[var(--brand-accent)]">
              <span className="h-2 w-2 rotate-45 border border-[var(--brand-accent)]" />
              <span className="h-[1px] flex-1 bg-[var(--brand-accent)]/60" />
            </div>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-stone-600">
            {resolveSiteText(
              settings.products_section_subtitle_ar,
              DEFAULT_SITE_CONTENT.products_section_subtitle_ar
            )}
          </p>
        </div>

        {/* Clean 4-Card Homepage Preview */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {previewProducts.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onOpenDetails={onOpenDetails}
              onQuickBuy={onQuickBuy}
            />
          ))}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={onNavigateToShop}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--brand-primary)] px-8 py-3 text-xs font-bold text-[var(--brand-primary-contrast)] shadow-sm hover:bg-[var(--brand-primary-hover)] transition-colors"
          >
            <span>
              {resolveSiteText(
                settings.products_section_cta_ar,
                DEFAULT_SITE_CONTENT.products_section_cta_ar
              )}
            </span>
            <ArrowLeft className="h-4 w-4 text-[var(--brand-accent)]" />
          </button>
        </div>
      </div>
    </section>
  );
};
