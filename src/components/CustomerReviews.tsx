import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { DEFAULT_SITE_CONTENT, resolveSiteText } from '../utils/siteContent.ts';
import { Star, MessageSquarePlus, CheckCircle, Quote } from 'lucide-react';

export const CustomerReviews: React.FC = () => {
  const { reviews, products, settings, refreshData } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [productId, setProductId] = useState(products[0]?.id || '');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!productId && products.length > 0) {
      setProductId(products[0].id);
    }
  }, [products, productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !comment) return;

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId || products[0]?.id,
          customer_name: customerName,
          customer_city: customerCity,
          rating,
          comment,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        refreshData();
        setTimeout(() => {
          setShowAddModal(false);
          setSubmitted(false);
          setCustomerName('');
          setCustomerCity('');
          setComment('');
        }, 2500);
      }
    } catch (err) {
      console.error('Error submitting review', err);
    }
  };

  return (
    <section id="reviews-section" className="bg-white py-16 border-b border-[var(--brand-border)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12 text-right">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-accent)] uppercase tracking-wider mb-1">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span>
                {resolveSiteText(settings.reviews_badge_ar, DEFAULT_SITE_CONTENT.reviews_badge_ar)}
              </span>
            </div>
            <h2 className="font-amiri text-3xl font-bold text-[var(--brand-primary)] sm:text-4xl">
              {resolveSiteText(settings.reviews_title_ar, DEFAULT_SITE_CONTENT.reviews_title_ar)}
            </h2>
            <p className="mt-1 text-xs text-stone-600">
              {resolveSiteText(
                settings.reviews_subtitle_ar,
                DEFAULT_SITE_CONTENT.reviews_subtitle_ar
              )}
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 py-2.5 text-xs font-bold text-[var(--brand-primary-contrast)] shadow-sm hover:bg-[var(--brand-primary-hover)] transition-all"
          >
            <MessageSquarePlus className="h-4 w-4 text-[var(--brand-accent)]" />
            <span>
              {resolveSiteText(settings.reviews_cta_ar, DEFAULT_SITE_CONTENT.reviews_cta_ar)}
            </span>
          </button>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map(rev => (
            <div
              key={rev.id}
              className="relative flex flex-col justify-between rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-bg)] p-6 text-right shadow-2xs hover:shadow-md transition-shadow"
            >
              <Quote className="absolute top-4 left-4 h-8 w-8 text-[var(--brand-accent)]/20" />

              <div>
                {/* Rating Stars */}
                <div className="flex items-center gap-1 text-[var(--brand-accent)] mb-3">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>

                {/* Comment Text */}
                <p className="text-xs leading-relaxed text-stone-700 font-normal">
                  "{rev.comment}"
                </p>
              </div>

              <div className="mt-5 border-t border-[var(--brand-border)] pt-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-amiri text-sm font-bold text-[var(--brand-primary)]">
                      {rev.customer_name}
                    </h4>
                    <span className="text-[11px] text-stone-500">
                      {rev.customer_city || 'المغرب'}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                    <CheckCircle className="h-3 w-3" />
                    <span>مشتري موثوق</span>
                  </span>
                </div>

                {/* Admin Reply */}
                {rev.admin_reply && (
                  <div className="mt-3 rounded-xl border border-[var(--brand-accent)]/40 bg-white p-2.5 text-[11px] text-stone-600">
                    <span className="font-bold text-[var(--brand-primary)]">رد إدارة المتجر:</span>{' '}
                    {rev.admin_reply}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Review Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl border border-[#D5C9B3] bg-[var(--brand-bg)] p-6 text-right shadow-2xl">
              <h3 className="font-amiri text-xl font-bold text-[var(--brand-primary)] mb-2">
                أضف تقييمك لمنتجات الدار المغربية
              </h3>
              <p className="text-xs text-stone-500 mb-4">
                رأيك يساعد زبناءنا في اختيار أرقى القطع التقليدية
              </p>

              {submitted ? (
                <div className="rounded-xl bg-emerald-100 p-4 text-center text-xs font-bold text-emerald-800">
                  شكراً جزيلاً! تم إرسال تقييمكم وسيظهر على الموقع بعد المراجعة.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      الاسم الكامل
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: لالة فاطمة الزهراء"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full rounded-lg border border-[#D5C9B3] bg-white p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      المدينة بالمغرب
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: فاس / الدار البيضاء"
                      value={customerCity}
                      onChange={e => setCustomerCity(e.target.value)}
                      className="w-full rounded-lg border border-[#D5C9B3] bg-white p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      المنتج الذي جربته
                    </label>
                    <select
                      value={productId}
                      onChange={e => setProductId(e.target.value)}
                      className="w-full rounded-lg border border-[#D5C9B3] bg-white p-2 text-xs"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name_ar}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      التقييم العام
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(st => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setRating(st)}
                          className="p-1"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              st <= rating
                                ? 'fill-[var(--brand-accent)] text-[var(--brand-accent)]'
                                : 'text-stone-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      تعليقك وتجربتك
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="حدثنا عن جودة الخياطة، القماش، أو سرعة التوصيل..."
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      className="w-full rounded-lg border border-[#D5C9B3] bg-white p-2 text-xs"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 rounded-xl bg-[var(--brand-primary)] py-2.5 text-xs font-bold text-[var(--brand-primary-contrast)] hover:bg-[var(--brand-primary-hover)]"
                    >
                      إرسال التقييم
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="rounded-xl border border-stone-300 px-4 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-100"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
