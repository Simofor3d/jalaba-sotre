import React from 'react';
import { useStore } from '../context/StoreContext.tsx';

interface HeroSectionProps {
  onNavigateToShop: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigateToShop }) => {
  const { settings } = useStore();

  const handleScrollToProducts = () => {
    onNavigateToShop();
  };

  return (
    <section className="relative overflow-hidden bg-[var(--brand-primary)] min-h-[420px] sm:min-h-[480px] lg:min-h-[540px] flex items-center justify-center border-b border-[var(--brand-border)]">
      {/* Full-bleed Campaign Photography */}
      <img
        src={settings.hero_image_url}
        alt={settings.hero_title_ar}
        referrerPolicy="no-referrer"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      {/* Atmospheric Center Vignette for High-Contrast Editorial Typography */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at center, rgba(14, 24, 18, 0.72) 0%, rgba(14, 24, 18, 0.45) 55%, rgba(14, 24, 18, 0.35) 100%)',
        }}
      />

      {/* Centered Editorial Copy */}
      <div className="relative z-10 mx-auto max-w-2xl px-6 py-16 text-center space-y-5">
        {/* Moroccan Geometric Rosette Accent */}
        <div className="flex justify-center">
          <svg
            viewBox="0 0 48 48"
            fill="none"
            className="h-10 w-10 text-[var(--brand-accent)]"
            aria-hidden="true"
          >
            <rect x="12" y="12" width="24" height="24" stroke="currentColor" strokeWidth="1.2" />
            <rect
              x="12"
              y="12"
              width="24"
              height="24"
              transform="rotate(45 24 24)"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <circle cx="24" cy="24" r="5" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </div>

        <h1 className="font-amiri text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.2] drop-shadow-sm">
          {settings.hero_title_ar}
        </h1>

        <p className="mx-auto max-w-xl text-sm sm:text-base leading-relaxed text-[#F2ECE1]/95 font-tajawal">
          {settings.hero_subtitle_ar}
        </p>

        <div className="pt-2">
          <button
            onClick={handleScrollToProducts}
            className="inline-flex items-center justify-center rounded-lg border border-[var(--brand-accent)] bg-[var(--brand-primary)]/90 px-9 py-3 text-sm font-bold text-[var(--brand-primary-contrast)] shadow-xl backdrop-blur-xs transition-all hover:bg-[var(--brand-primary-hover)] hover:scale-102 cursor-pointer"
          >
            {settings.hero_cta_text_ar || 'تسوق الآن'}
          </button>
        </div>
      </div>
    </section>
  );
};
