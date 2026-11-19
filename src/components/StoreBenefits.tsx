import React from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { DEFAULT_SITE_CONTENT, resolveSiteText } from '../utils/siteContent.ts';
import { Banknote, PackageCheck, Award, Leaf } from 'lucide-react';

export const StoreBenefits: React.FC = () => {
  const { settings } = useStore();
  const threshold = settings.free_shipping_threshold ?? 500;

  const benefits = [
    {
      icon: <Banknote className="h-7 w-7 stroke-[1.4] text-[var(--brand-primary)]" />,
      title: resolveSiteText(settings.benefit_1_title_ar, DEFAULT_SITE_CONTENT.benefit_1_title_ar),
      subtitle: resolveSiteText(
        settings.benefit_1_subtitle_ar,
        DEFAULT_SITE_CONTENT.benefit_1_subtitle_ar
      ),
    },
    {
      icon: <PackageCheck className="h-7 w-7 stroke-[1.4] text-[var(--brand-primary)]" />,
      title: resolveSiteText(settings.benefit_2_title_ar, DEFAULT_SITE_CONTENT.benefit_2_title_ar),
      subtitle: resolveSiteText(
        settings.benefit_2_subtitle_ar,
        `لجميع الطلبات فوق ${threshold} د.م.`
      ),
    },
    {
      icon: <Award className="h-7 w-7 stroke-[1.4] text-[var(--brand-primary)]" />,
      title: resolveSiteText(settings.benefit_3_title_ar, DEFAULT_SITE_CONTENT.benefit_3_title_ar),
      subtitle: resolveSiteText(
        settings.benefit_3_subtitle_ar,
        DEFAULT_SITE_CONTENT.benefit_3_subtitle_ar
      ),
    },
    {
      icon: <Leaf className="h-7 w-7 stroke-[1.4] text-[var(--brand-primary)]" />,
      title: resolveSiteText(settings.benefit_4_title_ar, DEFAULT_SITE_CONTENT.benefit_4_title_ar),
      subtitle: resolveSiteText(
        settings.benefit_4_subtitle_ar,
        DEFAULT_SITE_CONTENT.benefit_4_subtitle_ar
      ),
    },
  ];

  return (
    <section className="bg-[var(--brand-surface)] py-7 border-b border-[var(--brand-border)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-x-reverse lg:divide-[#DDD1BC]">
          {benefits.map((b, i) => (
            <div
              key={i}
              className="flex items-center justify-center gap-3.5 px-4 text-right"
            >
              <div className="shrink-0">{b.icon}</div>
              <div>
                <h3 className="font-amiri text-base font-bold text-[var(--brand-primary)] leading-snug">
                  {b.title}
                </h3>
                <p className="text-[11px] text-stone-600">{b.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
