import React, { useState } from 'react';
import { useCart } from '../context/CartContext.tsx';
import { useStore } from '../context/StoreContext.tsx';
import { splitAnnouncementItems } from '../utils/theme.ts';
import { DEFAULT_SITE_CONTENT, resolveSiteText } from '../utils/siteContent.ts';
import { stripHtmlToText } from '../utils/richText.ts';
import {
  ShoppingBag,
  Search,
  User,
  Menu,
  X,
  Truck,
  Banknote,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

export type StaticPageKey = 'about' | 'contact' | 'return-policy' | 'privacy-terms' | 'track-order';

interface HeaderProps {
  currentPage: string;
  activeCategorySlug?: string;
  onSelectProduct: (productId: string) => void;
  onOpenCheckout: () => void;
  onNavigateHome: () => void;
  onNavigateToCategory: (slug: string) => void;
  onNavigateToPage: (page: StaticPageKey) => void;
  onNavigateToAdmin: () => void;
}

const MoroccanRosetteIcon: React.FC<{ className?: string }> = ({ className = 'h-10 w-10' }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
    <g stroke="var(--brand-primary)" strokeWidth="1.6" strokeLinejoin="round">
      <rect x="16" y="16" width="32" height="32" />
      <rect x="16" y="16" width="32" height="32" transform="rotate(45 32 32)" />
      <circle cx="32" cy="32" r="9" stroke="var(--brand-accent)" strokeWidth="1.6" />
      <polygon
        points="32,20 35,29 44,32 35,35 32,44 29,35 20,32 29,29"
        fill="var(--brand-accent)"
        fillOpacity="0.22"
        stroke="var(--brand-primary)"
        strokeWidth="1.2"
      />
      <circle cx="32" cy="32" r="2.5" fill="var(--brand-primary)" />
    </g>
  </svg>
);

const MoroccanFlagBadge: React.FC = () => (
  <svg viewBox="0 0 28 20" className="h-4 w-6 rounded-[2px] shadow-2xs shrink-0" aria-hidden="true">
    <rect width="28" height="20" fill="#C1272D" />
    <path
      d="M14 4.8 L15.5 9.4 L20.3 9.4 L16.4 12.2 L17.9 16.8 L14 14 L10.1 16.8 L11.6 12.2 L7.7 9.4 L12.5 9.4 Z"
      fill="none"
      stroke="#006233"
      strokeWidth="1.35"
      strokeLinejoin="round"
    />
  </svg>
);

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  activeCategorySlug,
  onSelectProduct,
  onNavigateHome,
  onNavigateToCategory,
  onNavigateToPage,
  onNavigateToAdmin,
}) => {
  const { totalItems, setIsCartOpen } = useCart();
  const { settings, categories, searchQuery, setSearchQuery, products } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const visibleNavCategories = categories.slice(0, 4);
  const overflowCategories = categories.slice(4);
  const [announceRight, announceCenter, announceLeft] = splitAnnouncementItems(
    settings.announcement_bar_ar
  );

  const searchResults = searchQuery.trim()
    ? products
        .filter(
          p =>
            p.is_active &&
            (p.name_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
              stripHtmlToText(p.description_ar).toLowerCase().includes(searchQuery.toLowerCase()) ||
              (p.name_fr && p.name_fr.toLowerCase().includes(searchQuery.toLowerCase())))
        )
        .slice(0, 5)
    : [];

  const handleCategoryClick = (slug: string) => {
    setMoreMenuOpen(false);
    setMobileMenuOpen(false);
    onNavigateToCategory(slug);
  };

  const handlePageClick = (page: StaticPageKey) => {
    setMoreMenuOpen(false);
    setMobileMenuOpen(false);
    onNavigateToPage(page);
  };

  return (
    <header className="relative z-40 w-full bg-[var(--brand-bg)] border-b border-[var(--brand-border)]">
      {/* 1. Top Announcement Bar (Live from Admin Settings) */}
      <div className="bg-[var(--brand-primary)] px-4 py-2 text-[11px] sm:text-xs font-medium text-[var(--brand-primary-contrast)] border-b border-[var(--brand-accent)]/30">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="hidden md:flex items-center gap-1.5 text-[var(--brand-accent-light)]">
            <Truck className="h-3.5 w-3.5 text-[var(--brand-accent)]" />
            <span>{announceRight}</span>
          </div>
          <div className="flex-1 text-center flex items-center justify-center gap-1.5 font-tajawal">
            <Banknote className="h-3.5 w-3.5 text-[var(--brand-accent)] hidden sm:inline" />
            <span>{announceCenter}</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-[var(--brand-accent-light)]">
            <Sparkles className="h-3.5 w-3.5 text-[var(--brand-accent)]" />
            <span>{announceLeft}</span>
          </div>
        </div>
      </div>

      {/* 2. Upper Header Tier: Made in Morocco (Right), Centered Brand Logo (Center), Search + Cart (Left) */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-3 pb-2.5">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-4">
          {/* Right Side (RTL): Flag Badge on Desktop / Menu Toggle on Mobile */}
          <div className="flex items-center justify-start gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-1.5 sm:p-2 text-[var(--brand-primary)] hover:bg-[var(--brand-surface)] lg:hidden"
              aria-label="القائمة الرئيسية"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[var(--brand-primary)]">
              <MoroccanFlagBadge />
              <span className="whitespace-nowrap">
                {resolveSiteText(
                  settings.header_made_in_text_ar,
                  DEFAULT_SITE_CONTENT.header_made_in_text_ar
                )}
              </span>
            </div>
          </div>

          {/* Center: Centered Moroccan Rosette + Brand Name */}
          <div className="flex justify-center min-w-0 px-1">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setMoreMenuOpen(false);
                onNavigateHome();
              }}
              className="flex flex-col items-center text-center group cursor-pointer max-w-full"
            >
              <MoroccanRosetteIcon className="h-8 w-8 sm:h-11 sm:w-11 transition-transform duration-300 group-hover:scale-105 shrink-0" />
              <span className="font-amiri text-base sm:text-3xl font-bold tracking-tight text-[var(--brand-primary)] leading-snug mt-0.5 sm:mt-1 truncate max-w-full sm:whitespace-nowrap">
                {settings.store_name}
              </span>
              <span className="hidden sm:block text-[11px] text-stone-600 mt-1 whitespace-nowrap">
                {resolveSiteText(
                  settings.header_tagline_ar,
                  DEFAULT_SITE_CONTENT.header_tagline_ar
                )}
              </span>
            </button>
          </div>

          {/* Left Side (RTL): Search Icon + Admin Icon + Cart Icon with Badge */}
          <div className="flex items-center justify-end gap-1 sm:gap-2.5">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`rounded-full p-2 text-[var(--brand-primary)] transition-colors hover:bg-[var(--brand-surface)] ${
                searchOpen ? 'bg-[var(--brand-surface)]' : ''
              }`}
              aria-label="البحث"
              title="البحث"
            >
              <Search className="h-5 w-5" />
            </button>

            <button
              onClick={() => {
                setSearchOpen(false);
                setMobileMenuOpen(false);
                onNavigateToAdmin();
              }}
              className="rounded-full p-2 text-[var(--brand-primary)] transition-colors hover:bg-[var(--brand-surface)]"
              aria-label="صفحة الإدارة"
              title="دخول الإدارة"
            >
              <User className="h-5 w-5" />
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative rounded-full p-2 text-[var(--brand-primary)] transition-colors hover:bg-[var(--brand-surface)]"
              aria-label="سلة المشتريات"
              title="سلة المشتريات"
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-0.5 -left-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--brand-primary)] px-1 font-mono text-[10px] font-bold text-[var(--brand-primary-contrast)]">
                {totalItems}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Lower Header Tier: Centered Single-Line Navigation Links */}
      <nav
        aria-label="التصنيفات الرئيسية"
        className="hidden lg:block border-t border-[var(--brand-border)]/70 bg-[var(--brand-bg)]"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-6 px-6">
          <button
            onClick={() => onNavigateHome()}
            className={`whitespace-nowrap shrink-0 py-2.5 text-sm font-semibold transition-colors border-b-2 ${
              currentPage === 'home'
                ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] font-bold'
                : 'border-transparent text-stone-700 hover:text-[var(--brand-primary)]'
            }`}
          >
            الرئيسية
          </button>

          {visibleNavCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.slug)}
              className={`whitespace-nowrap shrink-0 py-2.5 text-sm font-semibold transition-colors border-b-2 ${
                currentPage === 'category' && activeCategorySlug === cat.slug
                  ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] font-bold'
                  : 'border-transparent text-stone-700 hover:text-[var(--brand-primary)]'
              }`}
            >
              {cat.name_ar}
            </button>
          ))}

          {overflowCategories.length > 0 && (
            <div className="relative shrink-0">
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className="flex items-center gap-1 whitespace-nowrap py-2.5 text-sm font-semibold text-stone-700 hover:text-[var(--brand-primary)] border-b-2 border-transparent"
              >
                <span>المزيد</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              {moreMenuOpen && (
                <div className="absolute top-full right-0 mt-0.5 w-52 rounded-xl border border-[var(--brand-border)] bg-white py-2 shadow-xl z-50 text-right">
                  {overflowCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.slug)}
                      className={`block w-full px-4 py-2 text-right text-xs font-semibold hover:bg-[var(--brand-bg)] ${
                        currentPage === 'category' && activeCategorySlug === cat.slug
                          ? 'text-[var(--brand-primary)] font-bold'
                          : 'text-stone-700'
                      }`}
                    >
                      {cat.name_ar}
                    </button>
                  ))}
                  <div className="my-1 border-t border-[var(--brand-border)]" />
                  <button
                    onClick={() => handleCategoryClick('all')}
                    className="block w-full px-4 py-2 text-right text-xs font-bold text-[var(--brand-primary)] hover:bg-[var(--brand-bg)]"
                  >
                    عرض جميع المنتجات
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => handlePageClick('about')}
            className={`whitespace-nowrap shrink-0 py-2.5 text-sm font-semibold transition-colors border-b-2 ${
              currentPage === 'about'
                ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] font-bold'
                : 'border-transparent text-stone-700 hover:text-[var(--brand-primary)]'
            }`}
          >
            من نحن
          </button>

          <button
            onClick={() => handlePageClick('track-order')}
            className={`whitespace-nowrap shrink-0 py-2.5 text-sm font-semibold transition-colors border-b-2 ${
              currentPage === 'track-order'
                ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] font-bold'
                : 'border-transparent text-stone-700 hover:text-[var(--brand-primary)]'
            }`}
          >
            تتبع الطلبات
          </button>

          <button
            onClick={() => handlePageClick('contact')}
            className={`whitespace-nowrap shrink-0 py-2.5 text-sm font-semibold transition-colors border-b-2 ${
              currentPage === 'contact'
                ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] font-bold'
                : 'border-transparent text-stone-700 hover:text-[var(--brand-primary)]'
            }`}
          >
            اتصل بنا
          </button>
        </div>
      </nav>

      {/* Expandable Clean Search Bar Drawer */}
      {searchOpen && (
        <div className="border-t border-[var(--brand-border)] bg-white px-4 py-3 shadow-md">
          <div className="mx-auto max-w-2xl relative">
            <input
              type="text"
              autoFocus
              placeholder="ابحث عن جلابة، قفطان، كاندورة، أو سلهام..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  setSearchOpen(false);
                  onNavigateToCategory('all');
                }
              }}
              className="w-full rounded-xl border border-[#D5C9B3] bg-[var(--brand-bg)] py-2.5 pr-10 pl-9 text-xs sm:text-sm text-[#1E2522] placeholder:text-stone-400 focus:border-[var(--brand-primary)] focus:bg-white focus:outline-none"
            />
            <Search className="absolute top-3 right-3 h-4 w-4 text-stone-400" />
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchOpen(false);
              }}
              className="absolute top-2.5 left-2.5 rounded-full p-1 text-stone-400 hover:text-stone-700"
              aria-label="إغلاق البحث"
            >
              <X className="h-4 w-4" />
            </button>

            {searchResults.length > 0 && (
              <div className="mt-2 divide-y divide-stone-100 rounded-xl border border-[var(--brand-border)] bg-white">
                {searchResults.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectProduct(p.id);
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="flex w-full items-center gap-3 p-2.5 text-right hover:bg-[var(--brand-bg)] transition-colors"
                  >
                    <img
                      src={p.main_image}
                      alt={p.name_ar}
                      className="h-11 w-9 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-[var(--brand-primary)] truncate">
                        {p.name_ar}
                      </div>
                      <div className="text-[11px] text-[#B35432] font-mono">
                        {p.discounted_price ?? p.regular_price} د.م.
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-[var(--brand-border)] bg-[var(--brand-bg)] p-4 lg:hidden text-right space-y-1">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigateHome();
            }}
            className="block w-full py-2.5 text-right text-sm font-bold text-[var(--brand-primary)] border-b border-[var(--brand-border)]"
          >
            الرئيسية
          </button>
          <button
            onClick={() => handleCategoryClick('all')}
            className="block w-full py-2.5 text-right text-sm font-semibold text-stone-800 border-b border-[var(--brand-border)]"
          >
            جميع المنتجات
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.slug)}
              className="block w-full py-2.5 text-right text-sm font-semibold text-stone-700 border-b border-[var(--brand-border)]"
            >
              {cat.name_ar}
            </button>
          ))}
          <button
            onClick={() => handlePageClick('track-order')}
            className="block w-full py-2.5 text-right text-sm font-semibold text-stone-700 border-b border-[var(--brand-border)]"
          >
            تتبع الطلبات
          </button>
          <button
            onClick={() => handlePageClick('about')}
            className="block w-full py-2.5 text-right text-sm font-semibold text-stone-700 border-b border-[var(--brand-border)]"
          >
            من نحن
          </button>
          <button
            onClick={() => handlePageClick('return-policy')}
            className="block w-full py-2.5 text-right text-sm font-semibold text-stone-700 border-b border-[var(--brand-border)]"
          >
            سياسة الاستبدال والإرجاع
          </button>
          <button
            onClick={() => handlePageClick('privacy-terms')}
            className="block w-full py-2.5 text-right text-sm font-semibold text-stone-700 border-b border-[var(--brand-border)]"
          >
            سياسة الخصوصية والشروط
          </button>
          <button
            onClick={() => handlePageClick('contact')}
            className="block w-full py-2.5 text-right text-sm font-semibold text-stone-700"
          >
            اتصل بنا
          </button>
        </div>
      )}
    </header>
  );
};
