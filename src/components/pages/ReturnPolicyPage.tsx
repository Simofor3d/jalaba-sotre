import React, { useEffect } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import {
  DEFAULT_SITE_CONTENT,
  resolveSiteText,
  splitMultilineItems,
} from '../../utils/siteContent.ts';
import { RotateCcw, CheckCircle2, ShieldCheck, MessageSquare, ArrowLeft } from 'lucide-react';

interface ReturnPolicyPageProps {
  onNavigateHome: () => void;
  onNavigateToContact: () => void;
  onNavigateToShop: () => void;
}

export const ReturnPolicyPage: React.FC<ReturnPolicyPageProps> = ({
  onNavigateHome,
  onNavigateToContact,
  onNavigateToShop,
}) => {
  const { settings } = useStore();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = `سياسة الاستبدال والإرجاع | ${settings.store_name}`;
  }, [settings.store_name]);

  const steps = [
    {
      num: '01',
      title: 'تواصل معنا خلال 7 أيام',
      detail: 'أرسل لنا رقم طلبك والقطعة المطلوب استبدالها أو إرجاعها عبر صفحة اتصل بنا أو الواتساب.',
    },
    {
      num: '02',
      title: 'مراجعة حالة القطعة',
      detail: 'نتحقق من أن القطعة غير مستعملة ومحفوظة بتغليفها وبطاقتها الأصلية.',
    },
    {
      num: '03',
      title: 'التوصيل أو استرجاع المبلغ',
      detail: 'نرسل لك المقاس البديل عبر الموزع، أو نسترجع مبلغك خلال 48 ساعة عمل بعد الاستلام.',
    },
  ];

  return (
    <div className="bg-[var(--brand-bg)] py-10 sm:py-14 text-right">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb */}
        <nav aria-label="مسار التنقل" className="flex items-center gap-2 text-xs text-stone-500">
          <button onClick={onNavigateHome} className="hover:text-[var(--brand-primary)] cursor-pointer">
            الرئيسية
          </button>
          <span aria-hidden="true">/</span>
          <span className="font-bold text-[var(--brand-primary)]">سياسة الاستبدال والإرجاع</span>
        </nav>

        {/* Page Header */}
        <div className="border-b border-[#E5DAC6] pb-6 space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#B35432]">
            <RotateCcw className="h-4 w-4" />
            <span>
              {resolveSiteText(
                settings.return_policy_badge_ar,
                DEFAULT_SITE_CONTENT.return_policy_badge_ar
              )}
            </span>
          </div>
          <h1 className="font-amiri text-3xl sm:text-4xl font-bold text-[var(--brand-primary)]">
            سياسة الاستبدال والإرجاع
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl">
            {resolveSiteText(
              settings.return_policy_intro_ar,
              DEFAULT_SITE_CONTENT.return_policy_intro_ar
            )}
          </p>
        </div>

        {/* 3-Step Process */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {steps.map(s => (
            <div key={s.num} className="rounded-2xl border border-[#E5DAC6] bg-white p-6 space-y-2">
              <span className="font-mono text-xs font-bold text-[var(--brand-accent)] tabular-nums">{s.num}</span>
              <h2 className="font-amiri text-xl font-bold text-[var(--brand-primary)]">{s.title}</h2>
              <p className="text-xs leading-relaxed text-stone-600">{s.detail}</p>
            </div>
          ))}
        </div>

        {/* Detailed Policy Sections */}
        <div className="rounded-2xl border border-[#E5DAC6] bg-white p-6 sm:p-8 space-y-6 text-xs sm:text-sm leading-relaxed text-stone-700">
          <div className="space-y-2">
            <h3 className="font-amiri text-xl font-bold text-[var(--brand-primary)] flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[var(--brand-primary)]" />
              <span>الحالات المشمولة بالاستبدال أو الإرجاع المجاني</span>
            </h3>
            <ul className="space-y-1.5 pr-5 list-disc text-stone-600">
              {splitMultilineItems(
                settings.return_policy_cases_ar,
                DEFAULT_SITE_CONTENT.return_policy_cases_ar
              ).map((line, idx) => (
                <li key={idx}>{line}</li>
              ))}
            </ul>
          </div>

          <div className="border-t border-[#E5DAC6] pt-5 space-y-2">
            <h3 className="font-amiri text-xl font-bold text-[var(--brand-primary)] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[var(--brand-primary)]" />
              <span>الشروط الأساسية لقبول الطلب</span>
            </h3>
            <ul className="space-y-1.5 pr-5 list-disc text-stone-600">
              {splitMultilineItems(
                settings.return_policy_conditions_ar,
                DEFAULT_SITE_CONTENT.return_policy_conditions_ar
              ).map((line, idx) => (
                <li key={idx}>{line}</li>
              ))}
            </ul>
          </div>

          <div className="border-t border-[#E5DAC6] pt-5 space-y-2">
            <h3 className="font-amiri text-xl font-bold text-[var(--brand-primary)]">طريقة استرداد المبلغ</h3>
            <p className="text-stone-600">
              {resolveSiteText(
                settings.return_policy_refund_ar,
                DEFAULT_SITE_CONTENT.return_policy_refund_ar
              )}
            </p>
          </div>
        </div>

        {/* Action Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E5DAC6] bg-white p-6">
          <div>
            <h3 className="font-amiri text-lg font-bold text-[var(--brand-primary)]">هل لديك طلب استبدال؟</h3>
            <p className="text-xs text-stone-600">فريق خدمة الزبناء جاهز لمساعدتك فوراً.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToContact}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-primary)] px-5 py-2.5 text-xs font-bold text-white hover:bg-[var(--brand-primary-hover)]"
            >
              <MessageSquare className="h-4 w-4 text-[var(--brand-accent)]" />
              <span>طلب استبدال أو إرجاع</span>
            </button>
            <button
              onClick={onNavigateToShop}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5C9B3] px-5 py-2.5 text-xs font-bold text-[var(--brand-primary)] hover:bg-[var(--brand-bg)]"
            >
              <span>تصفح المتجر</span>
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
