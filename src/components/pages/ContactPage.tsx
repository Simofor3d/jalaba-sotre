import React, { useEffect } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import { ContactSection } from '../ContactSection.tsx';

interface ContactPageProps {
  onNavigateHome: () => void;
  onNavigateToTrackOrder: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  onNavigateHome,
  onNavigateToTrackOrder,
}) => {
  const { settings } = useStore();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = `اتصل بنا | ${settings.store_name}`;
  }, [settings.store_name]);

  return (
    <div className="bg-[var(--brand-bg)]">
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8 flex items-center justify-between">
        <nav aria-label="مسار التنقل" className="flex items-center gap-2 text-xs text-stone-500">
          <button onClick={onNavigateHome} className="hover:text-[var(--brand-primary)] cursor-pointer">
            الرئيسية
          </button>
          <span aria-hidden="true">/</span>
          <span className="font-bold text-[var(--brand-primary)]">اتصل بنا</span>
        </nav>

        <button
          onClick={onNavigateToTrackOrder}
          className="text-xs font-bold text-[var(--brand-primary)] underline underline-offset-4 hover:text-[#B35432]"
        >
          تريد معرفة حالة طلبك؟ تتبع الطلب الآن
        </button>
      </div>

      <ContactSection />
    </div>
  );
};
