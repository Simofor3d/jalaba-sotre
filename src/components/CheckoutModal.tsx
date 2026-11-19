import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext.tsx';
import { useStore } from '../context/StoreContext.tsx';
import { MoroccoAddressSelector, SelectedGeoLocation } from './MoroccoAddressSelector.tsx';
import { formatMAD, validateMoroccanPhone } from '../utils/pricing.ts';
import { Order } from '../types/store.ts';
import {
  X,
  CreditCard,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  Phone,
  User,
  ShoppingBag,
  ExternalLink,
  Lock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrackOrder?: (orderNumber: string, phone: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onTrackOrder }) => {
  const { cart, totalItems, total, subtotal, shippingCost, clearCart, setIsCartOpen } = useCart();
  const { settings, refreshData } = useStore();

  const codEnabled = settings.enable_cod !== false;
  const onlineEnabled = settings.enable_online_payment !== false;

  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE_CARD'>(
    codEnabled ? 'COD' : 'ONLINE_CARD'
  );
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  // Moroccan address (2-step: Region -> City/Village)
  const [geoAddress, setGeoAddress] = useState<SelectedGeoLocation>({
    regionId: '',
    regionNameAr: '',
    cityId: '',
    cityNameAr: '',
    provinceId: '',
    provinceNameAr: '',
    communeId: '',
    communeNameAr: '',
    addressDetails: '',
  });

  // Card payment simulation states
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Reset stale completed order receipt whenever modal closes or reopens with new cart items
  useEffect(() => {
    if (!isOpen) {
      setCompletedOrder(null);
      setErrorMessage(null);
    }
  }, [isOpen]);

  // Keep paymentMethod aligned with store payment toggles
  useEffect(() => {
    if (paymentMethod === 'COD' && !codEnabled && onlineEnabled) {
      setPaymentMethod('ONLINE_CARD');
    } else if (paymentMethod === 'ONLINE_CARD' && !onlineEnabled && codEnabled) {
      setPaymentMethod('COD');
    }
  }, [codEnabled, onlineEnabled, paymentMethod]);

  if (!isOpen) return null;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!customerName.trim() || customerName.trim().length < 2) {
      setErrorMessage('يرجى إدخال الاسم الكامل بشكل صحيح');
      return;
    }

    const phoneValidation = validateMoroccanPhone(customerPhone);
    if (!phoneValidation.isValid) {
      setErrorMessage(phoneValidation.error || 'رقم الهاتف المغربي غير صحيح');
      return;
    }

    if (!geoAddress.regionId || !geoAddress.cityId) {
      setErrorMessage('يرجى اختيار الجهة ثم المدينة أو القرية من القائمة');
      return;
    }

    if (!geoAddress.addressDetails.trim() || geoAddress.addressDetails.trim().length < 3) {
      setErrorMessage('يرجى كتابة تفاصيل الشارع والمنزل بدقة لتسهيل وصول موزع الإرساليات');
      return;
    }

    if (paymentMethod === 'ONLINE_CARD') {
      if (!cardNumber.replace(/\s/g, '') || cardNumber.replace(/\s/g, '').length < 16) {
        setErrorMessage('يرجى إدخال رقم البطاقة البنكية المكون من 16 رقماً');
        return;
      }
      if (!cardHolder.trim()) {
        setErrorMessage('يرجى إدخال اسم صاحب البطاقة كما هو مكتوب عليها');
        return;
      }
      if (!cardExpiry || !cardExpiry.includes('/')) {
        setErrorMessage('يرجى إدخال تاريخ انتهاء صلاحية البطاقة (MM/YY)');
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        setErrorMessage('يرجى إدخال رمز الأمان CVV الموجود خلف البطاقة');
        return;
      }
    }

    try {
      setIsSubmitting(true);

      // Prepare order payload
      const orderPayload = {
        customer_name: customerName.trim(),
        customer_phone: phoneValidation.normalized,
        address_line: geoAddress.addressDetails.trim(),
        region_id: geoAddress.regionId,
        city_id: geoAddress.cityId,
        province_id: geoAddress.provinceId,
        commune_id: geoAddress.communeId,
        region_name_ar: geoAddress.regionNameAr,
        province_name_ar: geoAddress.cityNameAr,
        commune_name_ar: geoAddress.cityNameAr,
        payment_method: paymentMethod,
        items: cart.map(item => ({
          product_id: item.product.id,
          variant_id: item.variant.id,
          quantity: item.quantity,
        })),
        internal_notes: internalNotes.trim() || undefined,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'تعذر إتمام الطلب، يرجى التحقق من توفر المنتجات');
        setIsSubmitting(false);
        return;
      }

      let finalOrder: Order = data.order;

      // If Online Payment, process card transaction simulation
      if (paymentMethod === 'ONLINE_CARD') {
        const payRes = await fetch('/api/payments/process-card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: finalOrder.id,
            card_number_last4: cardNumber.slice(-4),
            card_holder: cardHolder,
          }),
        });
        const payData = await payRes.json();
        if (payData.success && payData.order) {
          finalOrder = payData.order;
        }
      }

      setCompletedOrder(finalOrder);
      clearCart();
      setIsCartOpen(false);
      refreshData();

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#123624', '#c5a059', '#e0be77'],
        });
      } catch (err) {
        // ignore confetti errors
      }
    } catch (err: any) {
      console.error('Order checkout error', err);
      setErrorMessage('حدث خطأ أثناء معالجة الطلب، يرجى المحاولة ثانية');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppOrderLink = (order: Order) => {
    const cleanPhone = settings.store_whatsapp.replace(/[^0-9]/g, '');
    const itemsSummary = order.items
      .map(i => `• ${i.product_name} (${i.color_name} - ${i.size}) × ${i.quantity}`)
      .join('%0A');

    const locationText =
      order.commune_name_ar && order.commune_name_ar !== order.province_name_ar
        ? `${order.region_name_ar}، ${order.province_name_ar} - ${order.commune_name_ar}`
        : `${order.region_name_ar}، ${order.province_name_ar}`;

    const msg = `السلام عليكم الدار المغربية، قمت بطلب جديد عبر موقعكم:%0Aرقم الطلب: ${order.order_number}%0Aالاسم: ${order.customer_name}%0Aالعنوان: ${locationText}%0Aطريقة الدفع: ${order.payment_method === 'COD' ? 'الدفع عند الاستلام' : 'بطاقة بنكية'}%0Aالمجموع: ${order.total_amount} درهم%0Aالمنتجات:%0A${itemsSummary}%0Aيرجى تأكيد موعد الشحن. شكراً لكم.`;

    return `https://wa.me/${cleanPhone}?text=${msg}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4">
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#D5C9B3] bg-[var(--brand-bg)] p-6 text-right shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--brand-border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-primary)] text-[var(--brand-accent)]">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-amiri text-xl font-bold text-[var(--brand-primary)]">
                {completedOrder ? 'تم تأكيد طلبكم بنجاح' : 'إتمام الطلب والتوصيل الفاخر'}
              </h2>
              <p className="text-xs text-stone-500">
                {completedOrder
                  ? 'شكراً لثقتكم بالدار المغربية للأزياء التقليدية'
                  : 'خدمة التوصيل السريع إلى باب منزلك بكافة مدن وقرى المملكة'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-stone-400 hover:bg-stone-200 hover:text-stone-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* COMPLETED ORDER VIEW */}
        {completedOrder ? (
          <div className="mt-6 space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div>
              <h3 className="font-amiri text-2xl font-bold text-[var(--brand-primary)]">
                مبروك! تم تسجيل طلبكم برقم:
              </h3>
              <div className="mt-2 inline-block rounded-xl border border-[#C5A059] bg-[var(--brand-primary)] px-6 py-2 font-mono text-lg font-bold tracking-wider text-[#FAF7F2]">
                {completedOrder.order_number}
              </div>
            </div>

            <div className="rounded-xl border border-[var(--brand-border)] bg-white p-4 text-right text-xs leading-relaxed text-stone-700">
              <div className="flex justify-between border-b border-stone-100 pb-2">
                <span className="font-semibold text-stone-500">اسم الزبون:</span>
                <span className="font-bold text-[var(--brand-primary)]">{completedOrder.customer_name}</span>
              </div>
              <div className="flex justify-between border-b border-stone-100 py-2">
                <span className="font-semibold text-stone-500">رقم الهاتف:</span>
                <span className="font-mono font-bold text-[var(--brand-primary)]">{completedOrder.customer_phone}</span>
              </div>
              <div className="flex justify-between border-b border-stone-100 py-2">
                <span className="font-semibold text-stone-500">مدينة وعنوان التوصيل:</span>
                <span className="font-medium text-stone-800">
                  {completedOrder.region_name_ar} — {completedOrder.province_name_ar}
                  {completedOrder.commune_name_ar &&
                  completedOrder.commune_name_ar !== completedOrder.province_name_ar
                    ? ` - ${completedOrder.commune_name_ar}`
                    : ''}{' '}
                  ({completedOrder.address_line})
                </span>
              </div>
              <div className="flex justify-between border-b border-stone-100 py-2">
                <span className="font-semibold text-stone-500">طريقة الدفع:</span>
                <span className="font-bold text-emerald-800">
                  {completedOrder.payment_method === 'COD' ? 'الدفع نقداً عند الاستلام (COD)' : 'بطاقة بنكية (مدفوع)'}
                </span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-bold text-[var(--brand-primary)]">
                <span>المبلغ الإجمالي المطلوب:</span>
                <span className="text-base text-[#B35432]">{formatMAD(completedOrder.total_amount)}</span>
              </div>
            </div>

            {/* Quick WhatsApp Confirmation Link */}
            <div className="space-y-3">
              <a
                href={getWhatsAppOrderLink(completedOrder)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-[#20ba59]"
              >
                <span>تأكيد موعد التسليم عبر الواتساب فوراً</span>
                <ExternalLink className="h-4 w-4" />
              </a>

              {onTrackOrder && (
                <button
                  onClick={() => onTrackOrder(completedOrder.order_number, completedOrder.customer_phone)}
                  className="w-full rounded-xl bg-[var(--brand-primary)] py-3 text-sm font-bold text-[#FAF7F2] hover:bg-[var(--brand-primary-hover)] transition-colors"
                >
                  تتبع حالة طلبك الآن
                </button>
              )}

              <button
                onClick={onClose}
                className="w-full rounded-xl border border-stone-300 bg-white py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50"
              >
                متابعة تصفح المتجر
              </button>
            </div>
          </div>
        ) : (
          /* CHECKOUT FORM VIEW */
          <form onSubmit={handleSubmitOrder} className="mt-5 space-y-5">
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Payment Method Selection */}
            <div>
              <label className="mb-2 block text-xs font-bold text-[var(--brand-primary)]">
                اختر طريقة الدفع المفضلة:
              </label>
              <div className={`grid grid-cols-1 gap-3 ${codEnabled && onlineEnabled ? 'sm:grid-cols-2' : ''}`}>
                {/* Method 1: COD */}
                {codEnabled && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`flex items-start gap-3 rounded-xl border p-3.5 text-right transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5 ring-2 ring-[var(--brand-primary)]'
                        : 'border-[#D5C9B3] bg-white hover:border-[var(--brand-primary)]'
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        paymentMethod === 'COD' ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]' : 'border-stone-300'
                      }`}
                    >
                      {paymentMethod === 'COD' && <div className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-[var(--brand-primary)]">
                        <Banknote className="h-4 w-4 text-[var(--brand-accent)]" />
                        <span>الدفع عند الاستلام (COD)</span>
                      </div>
                      <p className="mt-1 text-[11px] leading-tight text-stone-500">
                        ادفع نقداً لعامل التوصيل بعد استلام ومعاينة جلابتك براحة وأمان.
                      </p>
                    </div>
                  </button>
                )}

                {/* Method 2: Online Card Payment */}
                {onlineEnabled && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('ONLINE_CARD')}
                    className={`flex items-start gap-3 rounded-xl border p-3.5 text-right transition-all ${
                      paymentMethod === 'ONLINE_CARD'
                        ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5 ring-2 ring-[var(--brand-primary)]'
                        : 'border-[#D5C9B3] bg-white hover:border-[var(--brand-primary)]'
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        paymentMethod === 'ONLINE_CARD'
                          ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]'
                          : 'border-stone-300'
                      }`}
                    >
                      {paymentMethod === 'ONLINE_CARD' && (
                        <div className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-[var(--brand-primary)]">
                        <CreditCard className="h-4 w-4 text-[var(--brand-accent)]" />
                        <span>بطاقة بنكية مغربية ودولية (CMI)</span>
                      </div>
                      <p className="mt-1 text-[11px] leading-tight text-stone-500">
                        دفع آمن 100% مشفر عبر بوابات CMI و Payzone والبطاقات المغربية.
                      </p>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* 2. Customer Personal Info (Fast 2 Fields: Name & Phone) */}
            <div className="rounded-xl border border-[var(--brand-border)] bg-white p-4">
              <h3 className="mb-3 flex items-center gap-2 text-xs font-bold text-[var(--brand-primary)]">
                <User className="h-4 w-4 text-[var(--brand-accent)]" />
                <span>بيانات الزبون للتوصيل:</span>
              </h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-700">
                    الاسم الكامل <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="مثال: يوسف الإدريسي"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full rounded-lg border border-[#D5C9B3] bg-stone-50/50 p-2.5 pr-8 text-xs text-[#1E2522] focus:border-[var(--brand-primary)] focus:bg-white focus:outline-none"
                    />
                    <User className="absolute top-3 right-2.5 h-3.5 w-3.5 text-stone-400" />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-stone-700">
                    رقم الهاتف المغربي <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="06XXXXXXXX أو 07XXXXXXXX"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      className="w-full rounded-lg border border-[#D5C9B3] bg-stone-50/50 p-2.5 pr-8 text-xs font-mono text-[#1E2522] focus:border-[var(--brand-primary)] focus:bg-white focus:outline-none"
                    />
                    <Phone className="absolute top-3 right-2.5 h-3.5 w-3.5 text-stone-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Moroccan Address Geographic Selector */}
            <MoroccoAddressSelector value={geoAddress} onChange={setGeoAddress} />

            {/* 4. Online Card Details (Only when Online Payment chosen) */}
            {paymentMethod === 'ONLINE_CARD' && (
              <div className="space-y-3 rounded-xl border border-[#C5A059] bg-[var(--brand-bg)] p-4 text-xs">
                <div className="flex items-center justify-between border-b border-[var(--brand-border)] pb-2">
                  <div className="flex items-center gap-2 font-bold text-[var(--brand-primary)]">
                    <Lock className="h-4 w-4 text-[var(--brand-accent)]" />
                    <span>بيانات البطاقة البنكية (محمية بتشفير 256-bit SSL)</span>
                  </div>
                  <span className="text-[11px] text-stone-500">معتمدة من CMI</span>
                </div>

                <div>
                  <label className="mb-1 block font-medium text-stone-700">رقم البطاقة البنكية</label>
                  <input
                    type="text"
                    placeholder="4000 1234 5678 9010"
                    maxLength={19}
                    value={cardNumber}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                      const formatted = v.match(/.{1,4}/g)?.join(' ') || v;
                      setCardNumber(formatted);
                    }}
                    className="w-full rounded-lg border border-[#D5C9B3] bg-white p-2.5 font-mono text-xs text-[#1E2522] focus:border-[var(--brand-primary)] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="mb-1 block font-medium text-stone-700">تاريخ الانتهاء</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={e => setCardExpiry(e.target.value)}
                      className="w-full rounded-lg border border-[#D5C9B3] bg-white p-2.5 text-center font-mono text-xs text-[#1E2522] focus:border-[var(--brand-primary)] focus:outline-none"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="mb-1 block font-medium text-stone-700">رمز الأمان (CVV)</label>
                    <input
                      type="password"
                      placeholder="123"
                      maxLength={4}
                      value={cardCvv}
                      onChange={e => setCardCvv(e.target.value)}
                      className="w-full rounded-lg border border-[#D5C9B3] bg-white p-2.5 text-center font-mono text-xs text-[#1E2522] focus:border-[var(--brand-primary)] focus:outline-none"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="mb-1 block font-medium text-stone-700">اسم صاحب البطاقة</label>
                    <input
                      type="text"
                      placeholder="Youssef Idrissi"
                      value={cardHolder}
                      onChange={e => setCardHolder(e.target.value)}
                      className="w-full rounded-lg border border-[#D5C9B3] bg-white p-2.5 text-xs text-[#1E2522] focus:border-[var(--brand-primary)] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. Additional Notes */}
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600">
                ملاحظات إضافية للتوصيل <span className="text-stone-400">(اختياري)</span>
              </label>
              <input
                type="text"
                placeholder="مثال: يرجى الاتصال قبل الوصول بنصف ساعة، التوصيل بعد العصر"
                value={internalNotes}
                onChange={e => setInternalNotes(e.target.value)}
                className="w-full rounded-lg border border-[#D5C9B3] bg-white p-2.5 text-xs text-[#1E2522] focus:border-[var(--brand-primary)] focus:outline-none"
              />
            </div>

            {/* 6. Order Summary & Price Breakdown */}
            <div className="rounded-xl border border-[var(--brand-border)] bg-stone-50 p-4">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>مجموع المنتجات ({totalItems} قطع):</span>
                  <span className="font-semibold text-stone-800">{formatMAD(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>تكلفة الشحن والتوصيل:</span>
                  <span className="font-semibold text-stone-800">
                    {shippingCost === 0 ? (
                      <span className="text-emerald-700 font-bold">مجاني ✨</span>
                    ) : (
                      formatMAD(shippingCost)
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[var(--brand-border)] pt-2 text-sm font-bold text-[var(--brand-primary)]">
                  <span>المبلغ الصافي للدفع:</span>
                  <span className="text-base text-[#B35432]">{formatMAD(total)}</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || cart.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] py-3.5 text-sm font-bold text-[#FAF7F2] shadow-lg transition-all hover:bg-[var(--brand-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>جاري معالجة الطلب...</span>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5 text-[var(--brand-accent)]" />
                  <span>
                    {paymentMethod === 'COD'
                      ? `تأكيد الطلب الآن (${formatMAD(total)} عند الاستلام)`
                      : `دفع ${formatMAD(total)} بالبطاقة وتأكيد الطلب`}
                  </span>
                  <ArrowRight className="h-4 w-4 rotate-180" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
