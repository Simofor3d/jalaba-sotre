import React, { useState } from 'react';
import { Product, ProductVariant } from '../types/store.ts';
import { useCart } from '../context/CartContext.tsx';
import { useStore } from '../context/StoreContext.tsx';
import { formatMAD } from '../utils/pricing.ts';
import { sanitizeProductHtml } from '../utils/richText.ts';
import {
  X,
  ShoppingBag,
  Zap,
  Check,
  Star,
  Shield,
  Truck,
  RotateCcw,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onBuyNow: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onBuyNow,
}) => {
  const { addToCart, setIsCartOpen } = useCart();
  const { reviews, refreshData } = useStore();

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Review submission state inside product modal
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewCity, setReviewCity] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Sync state when product changes
  React.useEffect(() => {
    if (product) {
      setSelectedImage(product.main_image);
      setSelectedVariant(product.variants[0] || null);
      setQuantity(1);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const activeVariant: ProductVariant = selectedVariant || product.variants[0] || {
    id: 'default',
    color_name_ar: 'الافتراضي',
    color_name_fr: 'Standard',
    color_code: '#123624',
    size: 'L',
    sku: product.sku,
    stock_quantity: 10,
  };
  const activeImage = selectedImage || product.main_image;

  const images = [product.main_image, ...(product.additional_images || [])].filter(Boolean);
  const productReviews = reviews.filter(r => r.product_id === product.id && r.is_approved);

  const uniqueColors = Array.from(
    new Map(
      product.variants.map(v => [
        v.color_name_ar,
        { name: v.color_name_ar, code: v.color_code },
      ])
    ).values()
  );
  const uniqueSizes = Array.from(new Set(product.variants.map(v => v.size)));

  const currentPrice = product.discounted_price ?? product.regular_price;
  const hasDiscount = product.discounted_price && product.discounted_price < product.regular_price;

  const handleAddToCart = () => {
    addToCart(product, activeVariant, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleDirectBuy = () => {
    addToCart(product, activeVariant, quantity);
    setIsCartOpen(false);
    onClose();
    onBuyNow();
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return;

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          customer_name: reviewName,
          customer_city: reviewCity,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      if (res.ok) {
        setReviewSubmitted(true);
        setShowReviewForm(false);
        refreshData();
      }
    } catch (e) {
      console.error('Failed to submit review', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[#D5C9B3] bg-[var(--brand-bg)] p-6 text-right shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 rounded-full bg-white/80 p-2 text-stone-500 shadow-sm backdrop-blur-xs hover:bg-white hover:text-stone-800"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Right Column in RTL: Image Gallery */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl border border-[var(--brand-border)] bg-white shadow-xs aspect-3/4">
              <img
                src={activeImage}
                alt={product.name_ar}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
              {hasDiscount && (
                <div className="absolute top-3 right-3 rounded-lg bg-[#B35432] px-3 py-1 font-bold text-xs text-white shadow-md">
                  تخفيض حصري
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      activeImage === img
                        ? 'border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/20'
                        : 'border-[var(--brand-border)] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`thumbnail-${i}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 rounded-xl border border-[var(--brand-border)] bg-white p-3 text-center text-[11px] text-stone-600">
              <div className="flex flex-col items-center">
                <Truck className="h-4 w-4 text-[var(--brand-accent)] mb-1" />
                <span className="font-semibold text-stone-800">توصيل سريع</span>
                <span className="text-[10px] text-stone-400">كافة مدن المغرب</span>
              </div>
              <div className="flex flex-col items-center border-x border-[var(--brand-border)]">
                <Shield className="h-4 w-4 text-[var(--brand-accent)] mb-1" />
                <span className="font-semibold text-stone-800">دفع عند الاستلام</span>
                <span className="text-[10px] text-stone-400">عاين قبل الدفع</span>
              </div>
              <div className="flex flex-col items-center">
                <RotateCcw className="h-4 w-4 text-[var(--brand-accent)] mb-1" />
                <span className="font-semibold text-stone-800">استبدال المقاس</span>
                <span className="text-[10px] text-stone-400">مضمون خلال 7 أيام</span>
              </div>
            </div>
          </div>

          {/* Left Column in RTL: Details & Purchasing */}
          <div className="space-y-5">
            {/* Title & SKU */}
            <div>
              <div className="flex items-center gap-2 text-xs text-[var(--brand-accent)] mb-1 font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>أزياء مغربية تقليدية أصيلة</span>
                <span>·</span>
                <span className="text-stone-400">رمز المنتج: {product.sku}</span>
              </div>
              <h1 className="font-amiri text-2xl font-bold text-[var(--brand-primary)] leading-snug">
                {product.name_ar}
              </h1>
              {product.name_fr && (
                <p className="text-xs text-stone-500 font-sans mt-0.5">{product.name_fr}</p>
              )}
            </div>

            {/* Price Box */}
            <div className="flex items-baseline gap-3 rounded-xl border border-[var(--brand-border)] bg-white p-3.5 shadow-2xs">
              <span className="text-2xl font-bold text-[#B35432] font-mono">
                {formatMAD(currentPrice + (activeVariant.additional_price || 0))}
              </span>
              {hasDiscount && (
                <span className="text-sm font-medium text-stone-400 line-through font-mono">
                  {formatMAD(product.regular_price)}
                </span>
              )}
              {hasDiscount && (
                <span className="mr-auto rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800">
                  وفرت {formatMAD(product.regular_price - product.discounted_price!)}
                </span>
              )}
            </div>

            {/* Description */}
            <div
              className="rich-content text-xs leading-relaxed text-stone-700"
              dangerouslySetInnerHTML={{ __html: sanitizeProductHtml(product.description_ar) }}
            />

            {/* Fabric & Craftsmanship specs */}
            {(product.fabric || product.craftsmanship) && (
              <div className="rounded-xl border border-[var(--brand-border)] bg-stone-50/70 p-3 space-y-1.5 text-xs">
                {product.fabric && (
                  <div className="flex gap-2">
                    <span className="font-bold text-[var(--brand-primary)]">نوع القماش:</span>
                    <span className="text-stone-700">{product.fabric}</span>
                  </div>
                )}
                {product.craftsmanship && (
                  <div className="flex gap-2">
                    <span className="font-bold text-[var(--brand-primary)]">الخياطة والتطريز:</span>
                    <span className="text-stone-700">{product.craftsmanship}</span>
                  </div>
                )}
              </div>
            )}

            {/* Color Selector (Deduplicated) */}
            <div>
              <label className="mb-2 block text-xs font-bold text-[var(--brand-primary)]">
                اللون: <span className="text-[var(--brand-accent)]">{activeVariant.color_name_ar}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {uniqueColors.map(c => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      const match =
                        product.variants.find(
                          v => v.color_name_ar === c.name && v.size === activeVariant.size
                        ) || product.variants.find(v => v.color_name_ar === c.name);
                      if (match) {
                        setSelectedVariant(match);
                        setQuantity(prev => Math.max(1, Math.min(prev, Math.max(1, match.stock_quantity))));
                      }
                    }}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-all ${
                      activeVariant.color_name_ar === c.name
                        ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white ring-2 ring-[var(--brand-primary)]/20'
                        : 'border-[#D5C9B3] bg-white text-stone-700 hover:border-[var(--brand-primary)]'
                    }`}
                  >
                    <span
                      className="h-3 w-3 rounded-full border border-stone-300"
                      style={{ backgroundColor: c.code }}
                    />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector (Deduplicated) */}
            <div>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-bold text-[var(--brand-primary)]">
                  المقاس: <span className="text-[var(--brand-accent)]">{activeVariant.size}</span>
                </span>
                <span className="text-stone-400">
                  {activeVariant.stock_quantity > 0 ? (
                    <span className="text-emerald-700 font-medium">
                      متوفر في المخزون ({activeVariant.stock_quantity} قطع)
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium">نفد من المخزون</span>
                  )}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {uniqueSizes.map(sz => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => {
                      const match =
                        product.variants.find(
                          v => v.size === sz && v.color_name_ar === activeVariant.color_name_ar
                        ) || product.variants.find(v => v.size === sz);
                      if (match) {
                        setSelectedVariant(match);
                        setQuantity(prev => Math.max(1, Math.min(prev, Math.max(1, match.stock_quantity))));
                      }
                    }}
                    className={`min-w-12 rounded-lg border py-2 text-center text-xs font-bold transition-all ${
                      activeVariant.size === sz
                        ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white ring-2 ring-[var(--brand-primary)]/20'
                        : 'border-[#D5C9B3] bg-white text-stone-700 hover:border-[var(--brand-primary)]'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div>
              <label className="mb-2 block text-xs font-bold text-[var(--brand-primary)]">الكمية المطلوبة:</label>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-xl border border-[#D5C9B3] bg-white p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-8 w-8 rounded-lg text-stone-600 hover:bg-stone-100 font-bold"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-mono font-bold text-sm text-[var(--brand-primary)]">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(activeVariant.stock_quantity, quantity + 1))
                    }
                    disabled={quantity >= activeVariant.stock_quantity}
                    className="h-8 w-8 rounded-lg text-stone-600 hover:bg-stone-100 disabled:opacity-30 font-bold"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-stone-500">
                  الإجمالي: {formatMAD(currentPrice * quantity)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleDirectBuy}
                disabled={activeVariant.stock_quantity <= 0}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] py-3.5 text-sm font-bold text-[#FAF7F2] shadow-lg transition-all hover:bg-[var(--brand-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Zap className="h-4 w-4 text-[var(--brand-accent)]" />
                <span>شراء الآن والدفع عند الاستلام</span>
              </button>

              <button
                onClick={handleAddToCart}
                disabled={activeVariant.stock_quantity <= 0}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[var(--brand-primary)] bg-white py-3 text-sm font-bold text-[var(--brand-primary)] transition-all hover:bg-[var(--brand-primary)]/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {addedAnimation ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-700" />
                    <span className="text-emerald-700">تمت الإضافة إلى السلة!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4 text-[var(--brand-accent)]" />
                    <span>إضافة إلى السلة</span>
                  </>
                )}
              </button>
            </div>

            {/* Product Customer Reviews */}
            <div className="border-t border-[var(--brand-border)] pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[var(--brand-accent)]" />
                  <h3 className="font-amiri text-base font-bold text-[var(--brand-primary)]">
                    آراء الزبائن ({productReviews.length})
                  </h3>
                </div>
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="text-xs font-semibold text-[var(--brand-primary)] hover:underline"
                >
                  {showReviewForm ? 'إلغاء' : 'أضف تقييمك'}
                </button>
              </div>

              {/* Review Submit Form */}
              {showReviewForm && (
                <form
                  onSubmit={handleReviewSubmit}
                  className="mb-4 rounded-xl border border-[var(--brand-border)] bg-white p-3 space-y-2 text-xs"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="اسمك الكامل"
                      value={reviewName}
                      onChange={e => setReviewName(e.target.value)}
                      className="rounded-lg border border-stone-300 p-2 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="مدينتك (مثال: الرباط)"
                      value={reviewCity}
                      onChange={e => setReviewCity(e.target.value)}
                      className="rounded-lg border border-stone-300 p-2 text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-stone-600">التقييم:</span>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1"
                      >
                        <Star
                          className={`h-4 w-4 ${
                            star <= reviewRating
                              ? 'fill-[#C5A059] text-[var(--brand-accent)]'
                              : 'text-stone-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <textarea
                    required
                    placeholder="اكتب تجربتك مع جودة الخياطة والقماش والتوصيل..."
                    rows={2}
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    className="w-full rounded-lg border border-stone-300 p-2 text-xs"
                  />

                  <button
                    type="submit"
                    className="rounded-lg bg-[var(--brand-primary)] px-4 py-1.5 font-bold text-white text-xs hover:bg-[var(--brand-primary-hover)]"
                  >
                    إرسال التقييم
                  </button>
                </form>
              )}

              {reviewSubmitted && (
                <div className="mb-3 rounded-lg bg-emerald-50 p-2 text-xs text-emerald-800">
                  تم إرسال تقييمكم بنجاح وسيظهر بعد المراجعة. شكراً لكم!
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {productReviews.length === 0 ? (
                  <p className="text-xs text-stone-400">كن أول من يكتب تقييماً عن هذا المنتج الفاخر.</p>
                ) : (
                  productReviews.map(rev => (
                    <div
                      key={rev.id}
                      className="rounded-lg border border-[var(--brand-border)] bg-white p-2.5 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[var(--brand-primary)]">
                          {rev.customer_name} {rev.customer_city && `(${rev.customer_city})`}
                        </span>
                        <div className="flex text-[var(--brand-accent)]">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-stone-600 text-[11px]">{rev.comment}</p>
                      {rev.admin_reply && (
                        <div className="mt-1 rounded bg-[var(--brand-bg)] p-1.5 text-[10px] text-stone-700 border-r-2 border-[var(--brand-primary)]">
                          <span className="font-bold text-[var(--brand-primary)]">رد المتجر:</span>{' '}
                          {rev.admin_reply}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
