import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { DEFAULT_SITE_CONTENT, resolveSiteText } from '../utils/siteContent.ts';
import { StaticPageKey } from './Header.tsx';
import { Sparkles, Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onNavigateToCategory: (slug: string) => void;
  onNavigateToPage: (page: StaticPageKey) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateToCategory, onNavigateToPage }) => {
  const { settings, categories } = useStore();

  return (
    <footer className="bg-[var(--brand-dark)] text-[var(--brand-primary-contrast)] border-t border-[var(--brand-accent)]/40 text-right">
      {/* Upper Footer */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-primary)] text-[var(--brand-accent)] border border-[var(--brand-accent)]/40 shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="font-amiri text-2xl font-bold text-[var(--brand-accent-light)]">
                {settings.store_name}
              </span>
            </div>

            <p className="text-xs leading-relaxed text-stone-300">
              {resolveSiteText(
                settings.footer_about_text_ar,
                DEFAULT_SITE_CONTENT.footer_about_text_ar
              )}
            </p>

            <div className="pt-2 text-xs text-[var(--brand-accent)] font-medium flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>
                {resolveSiteText(
                  settings.footer_trust_badge_ar,
                  DEFAULT_SITE_CONTENT.footer_trust_badge_ar
                )}
              </span>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div className="space-y-3">
            <h4 className="font-amiri text-base font-bold text-[var(--brand-accent)]">
              {resolveSiteText(
                settings.footer_col_categories_title_ar,
                DEFAULT_SITE_CONTENT.footer_col_categories_title_ar
              )}
            </h4>
            <ul className="space-y-2 text-xs text-stone-300">
              {categories.map(c => (
                <li key={c.id}>
                  <button
                    onClick={() => onNavigateToCategory(c.slug)}
                    className="hover:text-[var(--brand-accent-light)] hover:underline transition-colors cursor-pointer"
                  >
                    {c.name_ar}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => onNavigateToCategory('all')}
                  className="hover:text-[var(--brand-accent-light)] hover:underline transition-colors font-semibold text-[var(--brand-accent-light)] cursor-pointer"
                >
                  جميع المنتجات
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Standalone Pages & Store Policies */}
          <div className="space-y-3">
            <h4 className="font-amiri text-base font-bold text-[var(--brand-accent)]">
              {resolveSiteText(
                settings.footer_col_pages_title_ar,
                DEFAULT_SITE_CONTENT.footer_col_pages_title_ar
              )}
            </h4>
            <ul className="space-y-2 text-xs text-stone-300">
              <li>
                <button
                  onClick={() => onNavigateToPage('about')}
                  className="hover:text-[var(--brand-accent-light)] hover:underline transition-colors cursor-pointer"
                >
                  من نحن وقصة الدار
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToPage('track-order')}
                  className="hover:text-[var(--brand-accent-light)] hover:underline transition-colors cursor-pointer"
                >
                  تتبع حالة الطلبات
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToPage('return-policy')}
                  className="hover:text-[var(--brand-accent-light)] hover:underline transition-colors cursor-pointer"
                >
                  سياسة الاستبدال والإرجاع
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToPage('privacy-terms')}
                  className="hover:text-[var(--brand-accent-light)] hover:underline transition-colors cursor-pointer"
                >
                  سياسة الخصوصية والشروط والأحكام
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateToPage('contact')}
                  className="hover:text-[var(--brand-accent-light)] hover:underline transition-colors cursor-pointer"
                >
                  اتصل بنا وخدمة الزبناء
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Location */}
          <div className="space-y-3">
            <h4 className="font-amiri text-base font-bold text-[var(--brand-accent)]">
              {resolveSiteText(
                settings.footer_col_contact_title_ar,
                DEFAULT_SITE_CONTENT.footer_col_contact_title_ar
              )}
            </h4>
            <ul className="space-y-2 text-xs text-stone-300">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[var(--brand-accent)] shrink-0" />
                <span className="font-mono">{settings.store_phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#25D366] shrink-0" />
                <span className="font-mono">واتساب: {settings.store_whatsapp}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[var(--brand-accent)] shrink-0" />
                <span>{settings.store_email}</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[var(--brand-accent)] shrink-0" />
                <span>{settings.store_city}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Payment Providers */}
      <div className="border-t border-[var(--brand-primary)] bg-[var(--brand-dark-deep)] py-6 text-xs text-stone-400">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="flex items-center gap-1 text-center sm:text-right">
            <span>جميع الحقوق محفوظة © {new Date().getFullYear()} {settings.store_name}</span>
            <span>· صُنع بكل</span>
            <Heart className="h-3 w-3 text-red-500 fill-current" />
            <span>
              {resolveSiteText(
                settings.footer_copyright_suffix_ar,
                DEFAULT_SITE_CONTENT.footer_copyright_suffix_ar
              )}
            </span>
          </p>

          <div className="flex items-center gap-3 text-[11px] text-[var(--brand-accent)]">
            <span className="rounded border border-[var(--brand-accent)]/40 px-2 py-0.5">
              الدفع عند الاستلام (COD)
            </span>
            <span className="rounded border border-[var(--brand-accent)]/40 px-2 py-0.5">
              مركز النقديات CMI
            </span>
            <span className="rounded border border-[var(--brand-accent)]/40 px-2 py-0.5">
              Visa / Mastercard
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
