import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import { Order } from '../../types/store.ts';
import { formatMAD } from '../../utils/pricing.ts';
import {
  Search,
  Package,
  CheckCircle2,
  Truck,
  Clock,
  XCircle,
  MapPin,
  Phone,
  MessageSquare,
} from 'lucide-react';

interface OrderTrackingPageProps {
  initialOrderNumber?: string;
  initialPhone?: string;
  onNavigateHome: () => void;
  onNavigateToContact: () => void;
}

const ORDER_STEPS: { key: Order['order_status']; label: string; desc: string }[] = [
  { key: 'PENDING', label: 'استلام الطلب', desc: 'تم تسجيل طلبك وهو قيد المراجعة الأولية' },
  { key: 'CONFIRMED', label: 'تأكيد الطلب', desc: 'تم تأكيد الطلب وجاري التحقق من المقاس واللون' },
  { key: 'PROCESSING', label: 'تجهيز وتغليف', desc: 'يتم كي وتغليف القطعة بعناية في الورشة' },
  { key: 'SHIPPED', label: 'في الطريق إليك', desc: 'تم تسليم الطرد لشركة التوصيل السريع' },
  { key: 'DELIVERED', label: 'تم التسليم', desc: 'وصلت طلبيتك بنجاح، بالصحة والراحة' },
];

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({
  initialOrderNumber = '',
  initialPhone = '',
  onNavigateHome,
  onNavigateToContact,
}) => {
  const { settings } = useStore();
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [phone, setPhone] = useState(initialPhone);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackedOrder, setTrackedOrder] = useState<Omit<Order, 'internal_notes' | 'customer_email'> | null>(
    null
  );

  const performLookup = useCallback(async (numToFind: string, phoneToFind: string) => {
    setError(null);
    if (!numToFind.trim() || !phoneToFind.trim()) {
      setError('يرجى إدخال رقم الطلب ورقم الهاتف المسجل عند الشراء');
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        orderNumber: numToFind.trim(),
        phone: phoneToFind.trim(),
      });
      const res = await fetch(`/api/orders/track?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.order) {
        setTrackedOrder(null);
        setError(data.error || 'لم يتم العثور على طلب مطابق للبيانات المدخلة');
        return;
      }
      setTrackedOrder(data.order);
    } catch {
      setError('حدث خطأ أثناء الاتصال بالخادم، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = `تتبع الطلبات | ${settings.store_name}`;
    if (initialOrderNumber && initialPhone) {
      setOrderNumber(initialOrderNumber);
      setPhone(initialPhone);
      performLookup(initialOrderNumber, initialPhone);
    }
  }, [initialOrderNumber, initialPhone, settings.store_name, performLookup]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(orderNumber, phone);
  };

  const currentStepIdx = trackedOrder
    ? ORDER_STEPS.findIndex(s => s.key === trackedOrder.order_status)
    : -1;

  return (
    <div className="min-h-[75vh] bg-[var(--brand-bg)] py-10 sm:py-14 text-right">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav aria-label="مسار التنقل" className="flex items-center gap-2 text-xs text-stone-500">
          <button onClick={onNavigateHome} className="hover:text-[var(--brand-primary)] cursor-pointer">
            الرئيسية
          </button>
          <span aria-hidden="true">/</span>
          <span className="font-bold text-[var(--brand-primary)]">تتبع الطلبات</span>
        </nav>

        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="font-amiri text-3xl sm:text-4xl font-bold text-[var(--brand-primary)]">
            تتبع حالة طلبك
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto">
            أدخل رقم الطلب الذي وصلك بعد الشراء مع رقم هاتفك للتحقق من مرحلة التجهيز والشحن فوراً.
          </p>
        </div>

        {/* Tracking Search Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#D5C9B3] bg-white p-6 shadow-xs space-y-4"
        >
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="track-order-number"
                className="block text-xs font-bold text-[var(--brand-primary)] mb-1.5"
              >
                رقم الطلب *
              </label>
              <input
                id="track-order-number"
                type="text"
                required
                placeholder="مثال: DM-2026-4812-A"
                value={orderNumber}
                onChange={e => setOrderNumber(e.target.value)}
                dir="ltr"
                className="w-full rounded-xl border border-[#D5C9B3] bg-[var(--brand-bg)] p-3 text-xs font-mono text-[#1E2522] focus:border-[var(--brand-primary)] focus:bg-white focus:outline-none text-right"
              />
            </div>

            <div>
              <label
                htmlFor="track-order-phone"
                className="block text-xs font-bold text-[var(--brand-primary)] mb-1.5"
              >
                رقم الهاتف المسجل في الطلب *
              </label>
              <input
                id="track-order-phone"
                type="tel"
                required
                placeholder="06XXXXXXXX"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                dir="ltr"
                className="w-full rounded-xl border border-[#D5C9B3] bg-[var(--brand-bg)] p-3 text-xs font-mono text-[#1E2522] focus:border-[var(--brand-primary)] focus:bg-white focus:outline-none text-right"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] py-3.5 text-xs font-bold text-[var(--brand-bg)] hover:bg-[var(--brand-primary-hover)] disabled:opacity-50 transition-colors"
          >
            <Search className="h-4 w-4 text-[var(--brand-accent)]" />
            <span>{loading ? 'جاري البحث عن الطلب...' : 'تتبع الطلب الآن'}</span>
          </button>
        </form>

        {/* Tracked Order Result */}
        {trackedOrder && (
          <div className="rounded-2xl border border-[#D5C9B3] bg-white p-6 sm:p-8 shadow-xs space-y-6">
            {/* Header Summary */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#E5DAC6] pb-4">
              <div>
                <span className="text-[11px] text-stone-500">رقم الطلب</span>
                <h2 className="font-mono text-lg font-bold text-[var(--brand-primary)] tabular-nums">
                  {trackedOrder.order_number}
                </h2>
              </div>
              <div className="text-xs text-stone-600 space-y-0.5 sm:text-left">
                <div>
                  <span className="text-stone-500">تاريخ الطلب: </span>
                  <span className="font-mono tabular-nums">
                    {new Date(trackedOrder.created_at).toLocaleDateString('ar-MA')}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500">طريقة الدفع: </span>
                  <span className="font-bold text-[var(--brand-primary)]">
                    {trackedOrder.payment_method === 'COD' ? 'الدفع عند الاستلام' : 'بطاقة بنكية'}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Status Timeline */}
            {trackedOrder.order_status === 'CANCELLED' ? (
              <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
                <XCircle className="h-5 w-5 text-red-600 shrink-0" />
                <div>
                  <p className="font-bold">تم إلغاء هذا الطلب</p>
                  <p className="text-red-700 mt-0.5">
                    للاستفسار أو إعادة تفعيل الطلب يرجى التواصل مع فريق خدمة الزبناء.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="font-amiri text-lg font-bold text-[var(--brand-primary)] flex items-center gap-2">
                  <Truck className="h-4 w-4 text-[var(--brand-accent)]" />
                  <span>مراحل الشحن والتوصيل</span>
                </h3>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
                  {ORDER_STEPS.map((step, idx) => {
                    const isDone = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    return (
                      <div
                        key={step.key}
                        className={`rounded-xl border p-3.5 transition-colors ${
                          isCurrent
                            ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5'
                            : isDone
                            ? 'border-emerald-200 bg-emerald-50/50'
                            : 'border-stone-200 bg-stone-50/50 opacity-65'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          {isDone ? (
                            <CheckCircle2 className="h-4 w-4 text-[var(--brand-primary)] shrink-0" />
                          ) : (
                            <Clock className="h-4 w-4 text-stone-400 shrink-0" />
                          )}
                          <span className="text-xs font-bold text-[var(--brand-primary)]">{step.label}</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-stone-600">{step.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Shipping Destination & Customer Summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-xl border border-[#E5DAC6] bg-[var(--brand-bg)] p-4 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-[var(--brand-primary)] mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-[var(--brand-primary)] block">وجهة التوصيل</span>
                  <span className="text-stone-600">
                    {trackedOrder.region_name_ar} — {trackedOrder.province_name_ar}
                    {trackedOrder.commune_name_ar &&
                    trackedOrder.commune_name_ar !== trackedOrder.province_name_ar
                      ? ` (${trackedOrder.commune_name_ar})`
                      : ''}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 text-[var(--brand-primary)] mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-[var(--brand-primary)] block">صاحب الطلب</span>
                  <span className="text-stone-600">
                    {trackedOrder.customer_name} · <span className="font-mono">{trackedOrder.customer_phone}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Ordered Items */}
            <div className="space-y-2.5">
              <h3 className="font-amiri text-lg font-bold text-[var(--brand-primary)] flex items-center gap-2">
                <Package className="h-4 w-4 text-[var(--brand-accent)]" />
                <span>المنتجات المطلوبة</span>
              </h3>
              <div className="divide-y divide-stone-100 rounded-xl border border-[#E5DAC6]">
                {trackedOrder.items.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 text-xs">
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="h-14 w-12 rounded-lg object-cover border border-[#E5DAC6] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[var(--brand-primary)] truncate">{item.product_name}</p>
                      <p className="text-stone-500 mt-0.5">
                        {item.color_name} · المقاس: {item.size} · الكمية: {item.quantity}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-[var(--brand-primary)] tabular-nums shrink-0">
                      {formatMAD(item.total_price)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 text-sm font-bold text-[var(--brand-primary)]">
                <span>المجموع الإجمالي</span>
                <span className="font-mono text-base text-[#B35432] tabular-nums">
                  {formatMAD(trackedOrder.total_amount)}
                </span>
              </div>
            </div>

            {/* WhatsApp Help */}
            <div className="border-t border-[#E5DAC6] pt-4 flex flex-wrap items-center justify-between gap-3">
              <a
                href={`https://wa.me/${settings.store_whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`السلام عليكم، أستفسر عن حالة الطلب رقم ${trackedOrder.order_number}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#20ba59]"
              >
                <MessageSquare className="h-4 w-4" />
                <span>استفسر عن الشحنة عبر واتساب</span>
              </a>
              <button
                onClick={onNavigateToContact}
                className="text-xs font-semibold text-stone-600 hover:text-[var(--brand-primary)] underline underline-offset-4"
              >
                إرسال رسالة لخدمة الزبناء
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
