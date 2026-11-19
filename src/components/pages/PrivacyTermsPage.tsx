import React, { useEffect } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import {
  DEFAULT_SITE_CONTENT,
  resolveSiteText,
  splitMultilineItems,
} from '../../utils/siteContent.ts';
import { Lock, FileText } from 'lucide-react';

interface PrivacyTermsPageProps {
  onNavigateHome: () => void;
  onNavigateToContact: () => void;
}

export const PrivacyTermsPage: React.FC<PrivacyTermsPageProps> = ({
  onNavigateHome,
  onNavigateToContact,
}) => {
  const { settings } = useStore();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = `سياسة الخصوصية والشروط والأحكام | ${settings.store_name}`;
  }, [settings.store_name]);

  return (
    <div className="bg-[var(--brand-bg)] py-10 sm:py-14 text-right">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumb */}
        <nav aria-label="مسار التنقل" className="flex items-center gap-2 text-xs text-stone-500">
          <button onClick={onNavigateHome} className="hover:text-[var(--brand-primary)] cursor-pointer">
            الرئيسية
          </button>
          <span aria-hidden="true">/</span>
          <span className="font-bold text-[var(--brand-primary)]">سياسة الخصوصية والشروط والأحكام</span>
        </nav>

        <div className="border-b border-[#E5DAC6] pb-6 space-y-2">
          <h1 className="font-amiri text-3xl sm:text-4xl font-bold text-[var(--brand-primary)]">
            سياسة الخصوصية والشروط والأحكام
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            {resolveSiteText(settings.privacy_intro_ar, DEFAULT_SITE_CONTENT.privacy_intro_ar)}
          </p>
        </div>

        {/* Part 1: Privacy */}
        <section className="rounded-2xl border border-[#E5DAC6] bg-white p-6 sm:p-8 space-y-4 text-xs sm:text-sm leading-relaxed text-stone-700">
          <div className="flex items-center gap-2 text-[var(--brand-primary)]">
            <Lock className="h-5 w-5 text-[var(--brand-accent)]" />
            <h2 className="font-amiri text-2xl font-bold">أولاً: سياسة الخصوصية وسرية المعطيات</h2>
          </div>

          <div className="space-y-3 text-stone-600">
            <p>
              نلتزم في <strong className="text-[var(--brand-primary)]">{settings.store_name}</strong> باحترام خصوصية كل زائر وزبون وحماية بياناته الشخصية وفقاً للمعايير المعتمدة بالمملكة المغربية (القانون رقم 09-08 المتعلق بحماية الأشخاص الذاتيين تجاه معالجة المعطيات ذات الطابع الشخصي).
            </p>
            <ul className="space-y-1.5 pr-5 list-disc">
              {splitMultilineItems(
                settings.privacy_body_ar,
                DEFAULT_SITE_CONTENT.privacy_body_ar
              ).map((line, idx) => (
                <li key={idx}>{line}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Part 2: Terms */}
        <section className="rounded-2xl border border-[#E5DAC6] bg-white p-6 sm:p-8 space-y-4 text-xs sm:text-sm leading-relaxed text-stone-700">
          <div className="flex items-center gap-2 text-[var(--brand-primary)]">
            <FileText className="h-5 w-5 text-[var(--brand-accent)]" />
            <h2 className="font-amiri text-2xl font-bold">ثانياً: الشروط والأحكام العامة للبيع</h2>
          </div>

          <div className="space-y-3 text-stone-600">
            <ul className="space-y-1.5 pr-5 list-disc">
              {splitMultilineItems(
                settings.terms_body_ar,
                DEFAULT_SITE_CONTENT.terms_body_ar
              ).map((line, idx) => (
                <li key={idx}>{line}</li>
              ))}
            </ul>
          </div>

          <div className="border-t border-[#E5DAC6] pt-4 flex items-center justify-between text-xs">
            <span className="text-stone-500">لأي استفسار قانوني أو بخصوص بياناتك:</span>
            <button
              onClick={onNavigateToContact}
              className="font-bold text-[var(--brand-primary)] underline underline-offset-4 hover:text-[#B35432]"
            >
              تواصل مع إدارة المتجر
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
