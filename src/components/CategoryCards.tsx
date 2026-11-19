import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { DEFAULT_SITE_CONTENT, resolveSiteText } from '../utils/siteContent.ts';

interface CategoryCardsProps {
  onSelectCategorySlug: (slug: string) => void;
}

export const CategoryCards: React.FC<CategoryCardsProps> = ({ onSelectCategorySlug }) => {
  const { categories, settings } = useStore();
  const ctaLabel = resolveSiteText(
    settings.category_cta_text_ar,
    DEFAULT_SITE_CONTENT.category_cta_text_ar
  );

  if (categories.length === 0) return null;

  const primaryCategories = categories.slice(0, 2);
  const secondaryCategories = categories.slice(2);

  return (
    <section
      id="categories-section"
      className="bg-[var(--brand-bg)] py-10 sm:py-12 border-b border-[var(--brand-border)]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Primary 2-Column Spacious Editorial Showcase */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {primaryCategories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategorySlug(cat.slug)}
              className="group relative w-full text-right cursor-pointer overflow-hidden rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-dark)] aspect-[16/10] shadow-md transition-all duration-300 hover:shadow-xl"
            >
              <img
                src={cat.image_url}
                alt={cat.name_ar}
                className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
              />
              {/* Editorial Gradient Vignette on Right Side (RTL Text Anchor) */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(270deg, rgba(16, 22, 18, 0.86) 0%, rgba(16, 22, 18, 0.56) 45%, rgba(16, 22, 18, 0.12) 100%)',
                }}
              />

              <div className="absolute inset-y-0 right-0 flex w-2/3 sm:w-1/2 flex-col items-center justify-center p-6 text-center">
                <h3 className="font-amiri text-3xl sm:text-4xl font-bold text-white leading-tight drop-shadow-xs">
                  {cat.name_ar}
                </h3>

                {/* Gold Geometric Hairline Divider */}
                <div className="my-3 flex w-36 items-center gap-2 text-[var(--brand-accent)]">
                  <span className="h-[1px] flex-1 bg-[var(--brand-accent)]/70" />
                  <span className="h-2 w-2 rotate-45 border border-[var(--brand-accent)]" />
                  <span className="h-[1px] flex-1 bg-[var(--brand-accent)]/70" />
                </div>

                <span className="inline-flex items-center justify-center rounded-lg border border-[var(--brand-accent)] bg-[var(--brand-primary)]/90 px-6 py-2 text-xs font-bold text-[var(--brand-primary-contrast)] shadow-md transition-colors group-hover:bg-[var(--brand-primary-hover)]">
                  {ctaLabel}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Uncrowded Secondary Categories Row */}
        {secondaryCategories.length > 0 && (
          <div
            className={`grid grid-cols-1 gap-6 ${
              secondaryCategories.length === 1
                ? 'md:grid-cols-1 max-w-2xl mx-auto'
                : secondaryCategories.length === 2
                ? 'md:grid-cols-2'
                : 'md:grid-cols-3'
            }`}
          >
            {secondaryCategories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategorySlug(cat.slug)}
                className="group relative w-full text-right cursor-pointer overflow-hidden rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-dark)] aspect-[16/9] shadow-sm transition-all duration-300 hover:shadow-lg"
              >
                <img
                  src={cat.image_url}
                  alt={cat.name_ar}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(270deg, rgba(16, 22, 18, 0.84) 0%, rgba(16, 22, 18, 0.45) 55%, rgba(16, 22, 18, 0.1) 100%)',
                  }}
                />
                <div className="absolute inset-y-0 right-0 flex w-3/5 flex-col items-center justify-center p-5 text-center">
                  <h3 className="font-amiri text-2xl sm:text-3xl font-bold text-white leading-tight">
                    {cat.name_ar}
                  </h3>
                  <div className="my-2.5 flex w-28 items-center gap-1.5 text-[var(--brand-accent)]">
                    <span className="h-[1px] flex-1 bg-[var(--brand-accent)]/60" />
                    <span className="h-1.5 w-1.5 rotate-45 border border-[var(--brand-accent)]" />
                    <span className="h-[1px] flex-1 bg-[var(--brand-accent)]/60" />
                  </div>
                  <span className="inline-flex items-center justify-center rounded-lg border border-[var(--brand-accent)] bg-[var(--brand-primary)]/90 px-5 py-1.5 text-xs font-bold text-[var(--brand-primary-contrast)] group-hover:bg-[var(--brand-primary-hover)]">
                    {ctaLabel}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
