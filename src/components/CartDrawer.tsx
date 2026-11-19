import React from 'react';
import { useCart } from '../context/CartContext.tsx';
import { formatMAD } from '../utils/pricing.ts';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Truck } from 'lucide-react';

interface CartDrawerProps {
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenCheckout }) => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    totalItems,
    subtotal,
    shippingCost,
    total,
    freeThreshold,
    isFreeShipping,
    amountNeededForFreeShipping,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  if (!isCartOpen) return null;

  const thresholdValue = freeThreshold > 0 ? freeThreshold : 500;
  const progressPct = Math.min(100, (subtotal / thresholdValue) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 left-0 flex max-w-full">
        <div className="relative w-screen max-w-md bg-[var(--brand-bg)] text-right shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="border-b border-[var(--brand-border)] p-4 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-[var(--brand-primary)]" />
              <h2 className="font-amiri text-lg font-bold text-[var(--brand-primary)]">
                سلة المشتريات ({totalItems})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              aria-label="إغلاق السلة"
              className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-[var(--brand-primary)] px-4 py-2.5 text-xs text-[var(--brand-primary-contrast)]">
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Truck className="h-3.5 w-3.5 text-[var(--brand-accent)]" />
                {isFreeShipping
                  ? 'تهانينا! حصلت على توصيل مجاني'
                  : `أضف ${formatMAD(amountNeededForFreeShipping)} للحصول على توصيل مجاني`}
              </span>
              <span className="text-[10px] text-[var(--brand-accent)] font-mono tabular-nums">
                حد الشحن: {formatMAD(thresholdValue)}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full bg-[var(--brand-accent)] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-stone-500">
                <ShoppingBag className="h-14 w-14 text-stone-300 mb-3" />
                <p className="font-amiri text-lg font-bold text-[var(--brand-primary)]">
                  سلتك فارغة حالياً
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  تصفح تشكيلة الجلابيب والقفاطين وأضف ما يعجبك
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 rounded-xl bg-[var(--brand-primary)] px-5 py-2 text-xs font-semibold text-[var(--brand-primary-contrast)] hover:bg-[var(--brand-primary-hover)]"
                >
                  تصفح المنتجات
                </button>
              </div>
            ) : (
              cart.map(item => {
                const basePrice = item.product.discounted_price ?? item.product.regular_price;
                const itemPrice = basePrice + (item.variant.additional_price || 0);
                return (
                  <div
                    key={item.variant.id}
                    className="flex items-center gap-3 rounded-xl border border-[var(--brand-border)] bg-white p-3 shadow-xs"
                  >
                    <img
                      src={item.product.main_image}
                      alt={item.product.name_ar}
                      className="h-20 w-16 shrink-0 rounded-lg object-cover"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[var(--brand-primary)] truncate">
                        {item.product.name_ar}
                      </h4>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-stone-500">
                        <span className="flex items-center gap-1">
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full border border-stone-300"
                            style={{ backgroundColor: item.variant.color_code }}
                          />
                          {item.variant.color_name_ar}
                        </span>
                        <span>·</span>
                        <span className="font-semibold text-stone-700">
                          المقاس: {item.variant.size}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center rounded-lg border border-[#D5C9B3] bg-stone-50">
                          <button
                            onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
                            aria-label="إنقاص الكمية"
                            className="p-1 hover:text-[var(--brand-primary)]"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 text-xs font-mono font-bold text-[var(--brand-primary)] tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                            disabled={item.quantity >= item.variant.stock_quantity}
                            aria-label="زيادة الكمية"
                            className="p-1 hover:text-[var(--brand-primary)] disabled:opacity-30"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <span className="text-xs font-bold text-[#B35432] font-mono tabular-nums">
                          {formatMAD(itemPrice * item.quantity)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.variant.id)}
                      aria-label={`حذف ${item.product.name_ar} من السلة`}
                      className="p-1.5 text-stone-400 hover:text-red-600"
                      title="حذف من السلة"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Action */}
          {cart.length > 0 && (
            <div className="border-t border-[var(--brand-border)] bg-white p-4 space-y-3">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span className="font-semibold text-stone-800 font-mono tabular-nums">
                    {formatMAD(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>مصاريف التوصيل:</span>
                  <span className="font-semibold text-stone-800 font-mono tabular-nums">
                    {shippingCost === 0 ? (
                      <span className="text-emerald-700 font-bold">مجاني</span>
                    ) : (
                      formatMAD(shippingCost)
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-t border-stone-200 pt-2 text-sm font-bold text-[var(--brand-primary)]">
                  <span>المجموع الإجمالي:</span>
                  <span className="text-base text-[#B35432] font-mono tabular-nums">
                    {formatMAD(total)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onOpenCheckout();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] py-3 text-sm font-bold text-[var(--brand-primary-contrast)] shadow-lg transition-all hover:bg-[var(--brand-primary-hover)]"
              >
                <span>متابعة الطلب والدفع</span>
                <ArrowLeft className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
