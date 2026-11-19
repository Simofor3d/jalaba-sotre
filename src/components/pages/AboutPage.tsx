import React, { useEffect } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import { DEFAULT_SITE_CONTENT, resolveSiteText } from '../../utils/siteContent.ts';
import { ShieldCheck, Award, Truck, Scissors, ArrowLeft } from 'lucide-react';

interface AboutPageProps {
  onNavigateHome: () => void;
  onNavigateToShop: () => void;
  onNavigateToContact: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onNavigateHome,
  onNavigateToShop,
  onNavigateToContact,
}) => {
  const { settings } = useStore();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = `من نحن | ${settings.store_name}`;
  }, [settings.store_name]);

  const values = [
    {
      num: '01',
      title: 'حرفية المعلم الأصيلة',
      description:
        'تُخاط كل قطعة في ورشاتنا بفاس ومراكش على يد صناع ومعلمين متمرسين يحافظون على تقنيات السفيفة، العقاد، والبرشمان بدقة متناهية.',
      icon: Scissors,
    },
    {
      num: '02',
      title: 'أقمشة طبيعية فاخرة',
      description:
        'ننتقي أجود خامات الصوف الوزاني، الكشمير، الحرير، وقطن السوسدي لضمان متانة القطعة وراحتها طوال الفصول.',
      icon: Award,
    },
    {
      num: '03',
      title: 'ثقة الدفع عند الاستلام',
      description:
        'نوفر خدمة الدفع عند الاستلام بجميع مدن وقرى المملكة المغربية مع حق التحقق والمقارنة قبل الأداء.',
      icon: ShieldCheck,
    },
    {
      num: '04',
      title: 'توصيل سريع ومضمون',
      description:
        'شبكة توصيل تغطي جميع الجهات الـ 12 للمملكة المغربية خلال 24 إلى 48 ساعة مع خدمة استبدال مرنة.',
      icon: Truck,
    },
  ];

  return (
    <div className="bg-[var(--brand-bg)] py-10 sm:py-14 text-right">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Breadcrumb */}
        <nav aria-label="مسار التنقل" className="flex items-center gap-2 text-xs text-stone-500">
          <button onClick={onNavigateHome} className="hover:text-[var(--brand-primary)] cursor-pointer">
            الرئيسية
          </button>
          <span aria-hidden="true">/</span>
          <span className="font-bold text-[var(--brand-primary)]">من نحن</span>
        </nav>

        {/* Editorial Hero Split */}
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-5">
            <p className="text-xs font-bold tracking-wider text-[#B35432]">
              {resolveSiteText(settings.about_kicker_ar, DEFAULT_SITE_CONTENT.about_kicker_ar)}
            </p>
            <h1 className="font-amiri text-3xl sm:text-5xl font-bold text-[var(--brand-primary)] leading-tight">
              {settings.store_name}:{' '}
              {resolveSiteText(settings.about_title_ar, DEFAULT_SITE_CONTENT.about_title_ar)}
            </h1>
            <p className="text-sm leading-relaxed text-stone-700">
              {resolveSiteText(
                settings.about_paragraph_1_ar,
                DEFAULT_SITE_CONTENT.about_paragraph_1_ar
              )}
            </p>
            <p className="text-sm leading-relaxed text-stone-600">
              {resolveSiteText(
                settings.about_paragraph_2_ar,
                DEFAULT_SITE_CONTENT.about_paragraph_2_ar
              )}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onNavigateToShop}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-primary)] px-6 py-3 text-xs font-bold text-[var(--brand-primary-contrast)] hover:bg-[var(--brand-primary-hover)] transition-colors"
              >
                <span>اكتشف تشكيلتنا</span>
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                onClick={onNavigateToContact}
                className="inline-flex items-center justify-center rounded-lg border border-[#D5C9B3] bg-white px-6 py-3 text-xs font-bold text-[var(--brand-primary)] hover:bg-[#F2ECE1] transition-colors"
              >
                تواصل مع مستشارينا
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="overflow-hidden rounded-2xl border border-[#E5DAC6] bg-white">
              <img
                src={settings.about_image_1_url || DEFAULT_SITE_CONTENT.about_image_1_url}
                alt="الجلابة الرجالية المغربية الأصيلة"
                className="h-full w-full min-h-[260px] object-cover object-top"
              />
            </div>
            <div className="overflow-hidden rounded-2xl border border-[#E5DAC6] bg-white">
              <img
                src={settings.about_image_2_url || DEFAULT_SITE_CONTENT.about_image_2_url}
                alt="القفطان المغربي المطرز"
                className="h-full w-full min-h-[260px] object-cover object-top"
              />
            </div>
          </div>
        </section>

        {/* Values & Why Customers Trust Us */}
        <section className="border-t border-[#E5DAC6] pt-12 space-y-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="font-amiri text-2xl sm:text-3xl font-bold text-[var(--brand-primary)]">
              {resolveSiteText(
                settings.about_why_title_ar,
                DEFAULT_SITE_CONTENT.about_why_title_ar
              )}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              {resolveSiteText(
                settings.about_why_subtitle_ar,
                DEFAULT_SITE_CONTENT.about_why_subtitle_ar
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(val => {
              const Icon = val.icon;
              return (
                <div
                  key={val.num}
                  className="rounded-2xl border border-[#E5DAC6] bg-white p-6 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-bg)] text-[var(--brand-primary)] border border-[#E5DAC6]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-xs font-bold text-[var(--brand-accent)] tabular-nums">
                      {val.num}
                    </span>
                  </div>
                  <h3 className="font-amiri text-xl font-bold text-[var(--brand-primary)]">{val.title}</h3>
                  <p className="text-xs leading-relaxed text-stone-600">{val.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
