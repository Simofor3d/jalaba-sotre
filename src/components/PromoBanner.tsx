import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { DEFAULT_SITE_CONTENT, resolveSiteText } from '../utils/siteContent.ts';
import { ArrowLeft, Compass, ShieldCheck } from 'lucide-react';

interface PromoBannerProps {
  onNavigateToShop: () => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ onNavigateToShop }) => {
  const { settings } = useStore();

  if (!settings.promo_banner_active) return null;

  const showcaseImage =
    settings.promo_banner_image_url || DEFAULT_SITE_CONTENT.promo_banner_image_url;

  return (
    <section
      id="promo-showcase-section"
      aria-label="إصدار الحرفيين والمجموعة المختارة"
      className="bg-[var(--brand-surface)] py-14 sm:py-16 border-b border-[var(--brand-border)]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch overflow-hidden rounded-3xl border border-[var(--brand-border)] bg-white shadow-sm">
          {/* Right Editorial Column (RTL — 7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between p-8 sm:p-12 text-right space-y-6">
            <div className="space-y-4">
              {/* Unboxed Quiet Kicker (Zero Pill Enclosures) */}
              <div className="flex items-center gap-2 text-xs font-semibold text-[#B35432]">
                <span>
                  {resolveSiteText(
                    settings.promo_banner_discount,
                    DEFAULT_SITE_CONTENT.promo_banner_discount
                  )}
                </span>
              </div>

              <h2 className="font-amiri text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-[var(--brand-primary)] leading-[1.25] text-balance">
                {resolveSiteText(
                  settings.promo_banner_title_ar,
                  DEFAULT_SITE_CONTENT.promo_banner_title_ar
                )}
              </h2>

              <p className="max-w-xl text-sm sm:text-base leading-relaxed text-stone-600 font-tajawal">
                {resolveSiteText(
                  settings.promo_banner_text_ar,
                  DEFAULT_SITE_CONTENT.promo_banner_text_ar
                )}
              </p>
            </div>

            {/* Craftsmanship Pillars separated by Hairline Dividers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[var(--brand-border)] pt-6">
              <div className="flex items-start gap-3">
                <Compass className="h-5 w-5 text-[var(--brand-accent)] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-[var(--brand-primary)]">
                    {resolveSiteText(
                      settings.promo_pillar_1_title_ar,
                      DEFAULT_SITE_CONTENT.promo_pillar_1_title_ar
                    )}
                  </h3>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-stone-500">
                    {resolveSiteText(
                      settings.promo_pillar_1_text_ar,
                      DEFAULT_SITE_CONTENT.promo_pillar_1_text_ar
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-[var(--brand-accent)] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-[var(--brand-primary)]">
                    {resolveSiteText(
                      settings.promo_pillar_2_title_ar,
                      DEFAULT_SITE_CONTENT.promo_pillar_2_title_ar
                    )}
                  </h3>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-stone-500">
                    {resolveSiteText(
                      settings.promo_pillar_2_text_ar,
                      DEFAULT_SITE_CONTENT.promo_pillar_2_text_ar
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Single Clear Primary CTA */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onNavigateToShop}
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[var(--brand-primary)] px-7 py-3.5 text-sm font-bold text-[var(--brand-primary-contrast)] shadow-sm transition-colors hover:bg-[var(--brand-primary-hover)] cursor-pointer whitespace-nowrap"
              >
                <span>
                  {resolveSiteText(
                    settings.promo_cta_text_ar,
                    DEFAULT_SITE_CONTENT.promo_cta_text_ar
                  )}
                </span>
                <ArrowLeft className="h-4 w-4 text-[var(--brand-accent)]" />
              </button>
              <span className="text-xs text-stone-500">
                {resolveSiteText(
                  settings.promo_delivery_note_ar,
                  DEFAULT_SITE_CONTENT.promo_delivery_note_ar
                )}
              </span>
            </div>
          </div>

          {/* Left Lookbook Photography Column (RTL — 5 cols) */}
          <div className="lg:col-span-5 relative min-h-[280px] sm:min-h-[340px] lg:min-h-full bg-[var(--brand-dark)] overflow-hidden">
            <img
              src={showcaseImage}
              alt={settings.promo_banner_title_ar}
              referrerPolicy="no-referrer"
              className="h-full w-full lg:h-full object-cover object-top"
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(11, 34, 22, 0.55) 100%)',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
