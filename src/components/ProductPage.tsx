import React, { useState, useEffect, useRef } from 'react';
import { Product, ProductVariant } from '../types/store.ts';
import { useStore } from '../context/StoreContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { formatMAD } from '../utils/pricing.ts';
import { sanitizeProductHtml, stripHtmlToText } from '../utils/richText.ts';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  Zap,
  Check,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  MessageCircle,
  Ruler,
  Star,
  Layers,
  Heart,
  Share2,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

interface ProductPageProps {
  slug: string;
  onNavigateHome: () => void;
  onNavigateToCategory?: (slug: string) => void;
  onNavigateToProduct: (slug: string) => void;
  onOpenCheckout: () => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({
  slug,
  onNavigateHome,
  onNavigateToCategory,
  onNavigateToProduct,
  onOpenCheckout,
}) => {
  const { products, categories, reviews, addReview, settings, loading } = useStore();
  const { addToCart } = useCart();

  // Find product by slug or id
  const product = products.find(p => p.slug === slug || p.id === slug);

  // Gallery state
  const [activeImage, setActiveImage] = useState<string>('');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Zoom magnifier state
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Variant selection state
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');

  // UI tabs & modals state
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'shipping' | 'returns'>('desc');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    city: 'الدار البيضاء',
    rating: 5,
    comment: '',
  });
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Initialize or reset state when product changes
  useEffect(() => {
    if (product) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveImage(product.main_image);
      const defaultVariant = product.variants[0] || null;
      setSelectedVariant(defaultVariant);
      if (defaultVariant) {
        setSelectedColor(defaultVariant.color_name_ar);
        setSelectedSize(defaultVariant.size);
      }
      setQuantity(1);

      // Set document title & SEO
      document.title = product.seo_title || `${product.name_ar} | الدار المغربية للأزياء التقليدية`;
    }
  }, [product]);

  if (loading && !product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center bg-[#FAF7F2]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E5DAC6] border-t-[#123624] mb-4" />
        <p className="font-amiri text-lg font-bold text-[#123624]">جاري تحميل تفاصيل القطعة...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center bg-[#FAF7F2]">
        <div className="w-16 h-16 rounded-full bg-[#123624]/10 text-[#123624] flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-amiri text-2xl font-bold text-[#123624] mb-2">المنتج غير موجود</h2>
        <p className="text-stone-600 text-sm max-w-md mb-6">
          عذراً، لم نتمكن من العثور على المنتج المطلوب أو ربما تم تغيير رابطه.
        </p>
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2 rounded-xl bg-[#123624] px-6 py-3 text-sm font-bold text-[#FAF7F2] hover:bg-[#1b4d34] shadow-md transition-all"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى الصفحة الرئيسية والمتجر</span>
        </button>
      </div>
    );
  }

  // Gallery images array
  const allImages = [product.main_image, ...(product.additional_images || [])].filter(Boolean);

  // Get Category
  const category = categories.find(c => c.id === product.category_id);

  // Unique colors and sizes
  const uniqueColors = Array.from(
    new Map(
      product.variants.map(v => [
        v.color_name_ar,
        { name: v.color_name_ar, name_fr: v.color_name_fr, code: v.color_code },
      ])
    ).values()
  );

  const uniqueSizes = Array.from(new Set(product.variants.map(v => v.size)));

  // Pricing calculations
  const currentPrice =
    (product.discounted_price ?? product.regular_price) + (selectedVariant?.additional_price || 0);
  const hasDiscount = product.discounted_price && product.discounted_price < product.regular_price;
  const savingsAmount = hasDiscount ? product.regular_price - product.discounted_price! : 0;
  const discountPercent = hasDiscount
    ? Math.round((savingsAmount / product.regular_price) * 100)
    : 0;

  // Stock
  const currentStock = selectedVariant ? selectedVariant.stock_quantity : 0;
  const isOutOfStock = currentStock <= 0;

  // Reviews for this product
  const productReviews = reviews.filter(r => r.product_id === product.id && r.is_approved);
  const avgRating =
    productReviews.length > 0
      ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
      : '5.0';

  // Related products (from product.related_product_ids or same category)
  const relatedProducts = products
    .filter(
      p =>
        p.id !== product.id &&
        (product.related_product_ids?.includes(p.id) || p.category_id === product.category_id)
    )
    .slice(0, 4);

  // Handle color click
  const handleColorSelect = (colorName: string) => {
    setSelectedColor(colorName);
    // Find variant with this color and current size, or any with this color
    const match =
      product.variants.find(v => v.color_name_ar === colorName && v.size === selectedSize) ||
      product.variants.find(v => v.color_name_ar === colorName);
    if (match) {
      setSelectedVariant(match);
      setSelectedSize(match.size);
      setQuantity(prev => Math.max(1, Math.min(prev, Math.max(1, match.stock_quantity))));
    }
  };

  // Handle size click
  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    const match =
      product.variants.find(v => v.size === size && v.color_name_ar === selectedColor) ||
      product.variants.find(v => v.size === size);
    if (match) {
      setSelectedVariant(match);
      setSelectedColor(match.color_name_ar);
      setQuantity(prev => Math.max(1, Math.min(prev, Math.max(1, match.stock_quantity))));
    }
  };

  // Mouse move zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  // Add to cart
  const handleAddToCart = () => {
    if (!selectedVariant || isOutOfStock) return;
    addToCart(product, selectedVariant, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2200);
  };

  // Direct Buy (Buy Now)
  const handleBuyNow = () => {
    if (!selectedVariant || isOutOfStock) return;
    addToCart(product, selectedVariant, quantity);
    onOpenCheckout();
  };

  // WhatsApp Order URL (sanitized digits for wa.me, avoids window.open)
  const cleanWhatsappDigits = (settings.store_whatsapp || '212661000000').replace(/[^0-9]/g, '');
  const whatsAppOrderMessage = encodeURIComponent(
    `السلام عليكم ورحمة الله، أود طلب المنتج التالي من متجر ${settings.store_name}:\n` +
      `*المنتج:* ${product.name_ar}\n` +
      `*رمز المنتج (SKU):* ${selectedVariant?.sku || product.sku}\n` +
      `*اللون:* ${selectedColor}\n` +
      `*المقاس:* ${selectedSize}\n` +
      `*الكمية:* ${quantity}\n` +
      `*السعر الإجمالي:* ${formatMAD(currentPrice * quantity)}\n\n` +
      `يرجى تأكيد إمكانية التوصيل والدفع عند الاستلام. شكراً لكم.`
  );
  const whatsAppOrderHref = `https://wa.me/${cleanWhatsappDigits}?text=${whatsAppOrderMessage}`;

  const plainDescription = stripHtmlToText(product.description_ar);
  const sanitizedDescriptionHtml = sanitizeProductHtml(product.description_ar);

  // Share link
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name_ar,
        text: plainDescription.slice(0, 180),
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Review submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.comment) return;
    await addReview({
      product_id: product.id,
      customer_name: reviewForm.name,
      customer_city: reviewForm.city,
      rating: reviewForm.rating,
      comment: reviewForm.comment,
    });
    setReviewSuccess(true);
    setTimeout(() => {
      setReviewSuccess(false);
      setIsReviewModalOpen(false);
      setReviewForm({ name: '', city: 'الدار البيضاء', rating: 5, comment: '' });
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[var(--brand-bg)] text-[#1E2522]">
      {/* 1. Breadcrumb Bar */}
      <div className="border-b border-[var(--brand-border)] bg-white/70 backdrop-blur-xs py-3 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex items-center justify-between text-xs">
          <nav
            aria-label="مسار التنقل"
            className="flex items-center gap-1.5 text-stone-500 overflow-x-auto whitespace-nowrap"
          >
            <button
              onClick={onNavigateHome}
              className="hover:text-[var(--brand-primary)] font-medium transition-colors"
            >
              الرئيسية
            </button>
            <ChevronLeft className="h-3.5 w-3.5 text-stone-400" />
            {category && (
              <>
                <button
                  onClick={() =>
                    onNavigateToCategory ? onNavigateToCategory(category.slug) : onNavigateHome()
                  }
                  className="hover:text-[var(--brand-primary)] font-medium transition-colors cursor-pointer"
                >
                  {category.name_ar}
                </button>
                <ChevronLeft className="h-3.5 w-3.5 text-stone-400" />
              </>
            )}
            <span className="font-bold text-[var(--brand-primary)] truncate max-w-[200px] sm:max-w-xs">
              {product.name_ar}
            </span>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs text-stone-600 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-all"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>{copiedLink ? 'تم نسخ الرابط!' : 'مشاركة'}</span>
            </button>
            <button
              onClick={() => (onNavigateToCategory ? onNavigateToCategory('all') : onNavigateHome())}
              className="flex items-center gap-1 text-xs font-semibold text-[var(--brand-primary)] hover:underline cursor-pointer"
            >
              <span>جميع المنتجات</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Product Hero Section (Gallery + Purchase Panel) */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ==========================================
              LEFT/GALLERY COLUMN (Lg: 7 cols)
              ========================================== */}
          <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails strip (Vertical on md+, Horizontal on mobile) */}
            {allImages.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto pb-2 md:pb-0 md:max-h-[620px] shrink-0">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative h-20 w-16 sm:h-24 sm:w-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      activeImage === img
                        ? 'border-[var(--brand-primary)] ring-2 ring-[var(--brand-accent)]/40 scale-102'
                        : 'border-[#E5DAC6] hover:border-stone-400 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`صورة ${idx + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image with Zoom Magnifier & Lightbox Trigger */}
            <div className="relative flex-1 rounded-2xl overflow-hidden border border-[#E5DAC6] bg-white shadow-md">
              {/* Badges on main image */}
              <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                {hasDiscount && (
                  <span className="rounded-xl bg-[#B35432] px-3 py-1.5 text-xs font-bold text-white shadow-md">
                    خصم {discountPercent}%
                  </span>
                )}
                {product.is_best_seller && (
                  <span className="rounded-xl bg-[var(--brand-primary)] px-3 py-1.5 text-xs font-bold text-[#E8D8B0] shadow-md">
                    الأكثر طلباً ⭐
                  </span>
                )}
                {product.is_new_arrival && (
                  <span className="rounded-xl bg-[var(--brand-accent)] px-3 py-1.5 text-xs font-bold text-[var(--brand-primary)] shadow-md">
                    وصل حديثاً ✨
                  </span>
                )}
              </div>

              {/* Lightbox full-screen button */}
              <button
                onClick={() => {
                  const idx = allImages.indexOf(activeImage);
                  setLightboxIndex(idx >= 0 ? idx : 0);
                  setIsLightboxOpen(true);
                }}
                className="absolute top-4 left-4 z-20 rounded-xl bg-white/90 backdrop-blur-xs p-2.5 text-[var(--brand-primary)] shadow-md hover:bg-[var(--brand-primary)] hover:text-white transition-all"
                title="عرض بكامل الشاشة"
              >
                <Maximize2 className="h-4 w-4" />
              </button>

              {/* Main Image Container */}
              <div
                ref={imageContainerRef}
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
                onMouseMove={handleMouseMove}
                onClick={() => {
                  const idx = allImages.indexOf(activeImage);
                  setLightboxIndex(idx >= 0 ? idx : 0);
                  setIsLightboxOpen(true);
                }}
                className="relative aspect-3/4 w-full cursor-zoom-in overflow-hidden bg-stone-100"
              >
                <img
                  src={activeImage || product.main_image}
                  alt={product.name_ar}
                  className={`h-full w-full object-cover transition-transform duration-200 ${
                    isZooming ? 'scale-130' : 'scale-100'
                  }`}
                  style={
                    isZooming
                      ? {
                          transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                        }
                      : undefined
                  }
                />
              </div>

              {/* Craftsmanship watermark badge */}
              <div className="absolute bottom-4 right-4 left-4 z-10 flex items-center justify-between rounded-xl bg-white/90 backdrop-blur-xs px-4 py-2 text-xs text-[var(--brand-primary)] border border-[#E5DAC6]/60 shadow-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[var(--brand-accent)]" />
                  <span className="font-semibold">صناعة يدوية مغربية أصيلة — خياطة المعلم</span>
                </div>
                <span className="text-[11px] text-stone-500 hidden sm:inline">
                  حرك المؤشر للتكبير
                </span>
              </div>
            </div>
          </div>

          {product.video_url && (
            <div className="rounded-2xl overflow-hidden border border-[#E5DAC6] bg-black shadow-sm">
              <video
                src={product.video_url}
                controls
                playsInline
                className="w-full max-h-[360px] object-contain mx-auto"
              />
            </div>
          )}
          </div>

          {/* ==========================================
              RIGHT/PURCHASE COLUMN (Lg: 5 cols)
              ========================================== */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              {/* Category & Tags */}
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-[var(--brand-primary)]/10 px-3 py-1 text-xs font-bold text-[var(--brand-primary)]">
                  {category ? category.name_ar : 'أزياء تقليدية فاخرة'}
                </span>
                <span className="text-xs font-mono text-stone-500">
                  SKU: {selectedVariant?.sku || product.sku}
                </span>
              </div>

              {/* Arabic Product Title */}
              <h1 className="mt-3 font-amiri text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--brand-primary)] leading-tight">
                {product.name_ar}
              </h1>

              {/* French Name (Sub) */}
              {product.name_fr && (
                <p className="text-xs text-stone-500 font-sans tracking-wide mt-1">
                  {product.name_fr}
                </p>
              )}

              {/* Reviews Summary Rating */}
              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-bold text-stone-700">{avgRating}</span>
                <span className="text-stone-300">·</span>
                <button
                  onClick={() => {
                    setActiveTab('desc');
                    const revSection = document.getElementById('reviews-section');
                    revSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-xs text-[var(--brand-primary)] underline hover:text-[var(--brand-accent)]"
                >
                  ({productReviews.length} تقييم زبون حقيقي)
                </button>
              </div>

              {/* Price Banner */}
              <div className="mt-5 rounded-2xl border border-[#E5DAC6] bg-gradient-to-r from-amber-50/60 to-white p-4">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-bold text-[#B35432] font-mono">
                      {formatMAD(currentPrice)}
                    </span>
                    {hasDiscount && (
                      <span className="text-base text-stone-400 line-through font-mono">
                        {formatMAD(product.regular_price)}
                      </span>
                    )}
                  </div>
                  {hasDiscount && (
                    <div className="text-left">
                      <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                        وفرت: {formatMAD(savingsAmount)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-2 flex items-center gap-2 text-xs text-stone-600">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>شامل ضريبة القيمة المضافة والتوصيل لجميع المدن المغربية</span>
                </div>
              </div>

              {/* Short Description Summary (clean text without raw HTML tags) */}
              {plainDescription && (
                <p className="mt-4 text-xs sm:text-sm text-stone-700 leading-relaxed line-clamp-3">
                  {plainDescription}
                </p>
              )}

              {/* 3. Color Selection */}
              {uniqueColors.length > 0 && (
                <div className="mt-6 border-t border-[#E5DAC6] pt-5">
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-bold text-stone-800">
                      اللون المختار: <span className="text-[var(--brand-primary)] font-bold">{selectedColor}</span>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {uniqueColors.map(c => {
                      const isSelected = selectedColor === c.name;
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => handleColorSelect(c.name)}
                          className={`group flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-all ${
                            isSelected
                              ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white shadow-sm'
                              : 'border-stone-300 bg-white text-stone-700 hover:border-stone-400'
                          }`}
                        >
                          <span
                            className="h-4 w-4 rounded-full border border-stone-300 shadow-2xs"
                            style={{ backgroundColor: c.code }}
                          />
                          <span className="font-medium">{c.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. Size Selection */}
              {uniqueSizes.length > 0 && (
                <div className="mt-5 border-t border-[#E5DAC6] pt-5">
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-bold text-stone-800">
                      المقاس المختار: <span className="text-[var(--brand-primary)] font-bold">{selectedSize}</span>
                    </label>

                    {/* Size Guide Modal Trigger */}
                    <button
                      type="button"
                      onClick={() => setIsSizeGuideOpen(true)}
                      className="flex items-center gap-1 text-xs font-semibold text-[var(--brand-primary)] hover:text-[var(--brand-accent)] transition-colors"
                    >
                      <Ruler className="h-3.5 w-3.5" />
                      <span>دليل المقاسات المغربية</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {uniqueSizes.map(sz => {
                      const isSelected = selectedSize === sz;
                      // Check stock for this size in current color
                      const v = product.variants.find(
                        item => item.size === sz && (!selectedColor || item.color_name_ar === selectedColor)
                      );
                      const szStock = v ? v.stock_quantity : 0;
                      const szDisabled = szStock <= 0;

                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => handleSizeSelect(sz)}
                          className={`min-w-[50px] rounded-xl border py-2.5 px-4 text-xs font-bold transition-all ${
                            isSelected
                              ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white shadow-sm'
                              : szDisabled
                              ? 'border-stone-200 bg-stone-100 text-stone-400 line-through'
                              : 'border-stone-300 bg-white text-stone-800 hover:border-[var(--brand-primary)]'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5. Stock status */}
              <div className="mt-4 flex items-center gap-2 text-xs">
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1 font-bold text-red-800">
                    <span className="h-2 w-2 rounded-full bg-red-600"></span>
                    نفد هذا المقاس واللون حالياً
                  </span>
                ) : currentStock <= 4 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-1 font-bold text-amber-900">
                    <span className="h-2 w-2 rounded-full bg-amber-600 animate-ping"></span>
                    سارع بالطلب: متبقي فقط {currentStock} قطع في المخزون!
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-1 font-bold text-emerald-900">
                    <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
                    متوفر في المخزون — جاهز للإرسال الفوري (24 ساعة)
                  </span>
                )}
              </div>

              {/* 6. Quantity Selector */}
              {!isOutOfStock && (
                <div className="mt-5 flex items-center gap-4">
                  <span className="text-xs font-bold text-stone-800">الكمية:</span>
                  <div className="flex items-center rounded-xl border border-stone-300 bg-white shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="px-3.5 py-2 text-stone-600 hover:bg-stone-100 disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-mono text-sm font-bold text-[var(--brand-primary)]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                      disabled={quantity >= currentStock}
                      className="px-3.5 py-2 text-stone-600 hover:bg-stone-100 disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-stone-500">
                    الإجمالي: <strong className="text-[#B35432] font-mono">{formatMAD(currentPrice * quantity)}</strong>
                  </span>
                </div>
              )}

              {/* 7. Action Buttons */}
              <div className="mt-6 space-y-2.5">
                {/* Buy Now / Quick COD Button */}
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[var(--brand-primary)] py-3.5 text-sm sm:text-base font-bold text-[var(--brand-primary-contrast)] shadow-md hover:bg-[var(--brand-primary-hover)] disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Zap className="h-5 w-5 text-[var(--brand-accent)]" />
                  <span>شراء الآن والدفع نقداً عند الاستلام</span>
                </button>

                {/* Add to Cart Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-[var(--brand-primary)] bg-white py-3 text-sm font-bold text-[var(--brand-primary)] shadow-xs hover:bg-[var(--brand-primary)]/5 disabled:opacity-50 transition-all ${
                    addedAnimation ? 'bg-emerald-50 border-emerald-600 text-emerald-800' : ''
                  }`}
                >
                  {addedAnimation ? (
                    <>
                      <Check className="h-5 w-5 text-emerald-600" />
                      <span>تمت إضافة القطعة بنجاح إلى السلة!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-5 w-5" />
                      <span>إضافة إلى سلة المشتريات</span>
                    </>
                  )}
                </button>

                {/* Direct WhatsApp Ordering */}
                <a
                  href={whatsAppOrderHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border border-emerald-500 bg-emerald-50/50 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100/70 transition-all"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-600" />
                  <span>طلب مباشر واستشارة المقاس عبر واتساب (WhatsApp)</span>
                </a>
              </div>

              {/* 8. Trust & Guarantee Badges */}
              <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-[#E5DAC6] bg-white p-4 text-xs">
                <div className="flex items-center gap-2 text-stone-700">
                  <Truck className="h-4 w-4 text-[var(--brand-primary)] shrink-0" />
                  <span>توصيل سريع 24-48 ساعة لجميع المدن</span>
                </div>
                <div className="flex items-center gap-2 text-stone-700">
                  <ShieldCheck className="h-4 w-4 text-[var(--brand-primary)] shrink-0" />
                  <span>الدفع عند الاستلام بعد المعاينة</span>
                </div>
                <div className="flex items-center gap-2 text-stone-700">
                  <RotateCcw className="h-4 w-4 text-[var(--brand-primary)] shrink-0" />
                  <span>استبدال المقاس مجاناً خلال 7 أيام</span>
                </div>
                <div className="flex items-center gap-2 text-stone-700">
                  <Sparkles className="h-4 w-4 text-[var(--brand-accent)] shrink-0" />
                  <span>صناعة تقليدية يدوية مغربية 100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            3. PRODUCT DETAILS TABS SECTION (Description, Specs, Shipping, Returns)
            ======================================================== */}
        <div className="mt-14 rounded-3xl border border-[#E5DAC6] bg-white p-6 sm:p-8 shadow-sm">
          {/* Tabs Navigation */}
          <div className="flex border-b border-[#E5DAC6] gap-2 sm:gap-6 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('desc')}
              className={`pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'desc'
                  ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              الوصف وأصالة الخياطة
            </button>

            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'specs'
                  ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              المواصفات الفنية وتعليمات العناية
            </button>

            <button
              onClick={() => setActiveTab('shipping')}
              className={`pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'shipping'
                  ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              الشحن والتوصيل بالمغرب
            </button>

            <button
              onClick={() => setActiveTab('returns')}
              className={`pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'returns'
                  ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              سياسة الاستبدال والضمان
            </button>
          </div>

          {/* Tab 1: Description (Supports Rich HTML formatted from Admin WYSIWYG Editor) */}
          {activeTab === 'desc' && (
            <div className="mt-6 space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
              <div
                className="rich-content text-stone-800"
                dangerouslySetInnerHTML={{
                  __html: sanitizedDescriptionHtml || '<p>قطعة تقليدية مغربية أصيلة مصنوعة بعناية فائقة.</p>',
                }}
              />
              {product.description_fr && (
                <p className="text-stone-500 italic mt-2">{product.description_fr}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-4 border-t border-stone-100">
                <div className="rounded-2xl border border-stone-200 bg-[var(--brand-bg)] p-4">
                  <h4 className="font-amiri text-base font-bold text-[var(--brand-primary)] mb-2">
                    عراقة الصنعة المغربية
                  </h4>
                  <p className="text-xs text-stone-600">
                    تمت خياطة هذه القطعة الفاخرة بأيادي أمهر المعلمين والصناع التقليديين، مع الحرص
                    على أدق تفاصيل السفايف والعقد المبرومة يدوياً والطرز الأصيل الذي يعكس الهوية
                    المغربية الراقية عبر العصور.
                  </p>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-[var(--brand-bg)] p-4">
                  <h4 className="font-amiri text-base font-bold text-[var(--brand-primary)] mb-2">
                    أقمشة ملكية مختارة بعناية
                  </h4>
                  <p className="text-xs text-stone-600">
                    {product.fabric ||
                      'نختار فقط الأقمشة الطبيعية عالية الجودة المقاومة للتجاعيد والمريحة على الجسم سواء في المناسبات والأعياد الدينية أو الاستخدام اليومي الأنيق.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Specifications */}
          {activeTab === 'specs' && (
            <div className="mt-6 space-y-6">
              <div className="overflow-hidden rounded-2xl border border-stone-200">
                <table className="w-full text-right text-xs sm:text-sm">
                  <tbody className="divide-y divide-stone-100">
                    <tr className="bg-stone-50/70">
                      <td className="p-3 font-bold text-stone-600 w-1/3">نوع القماش</td>
                      <td className="p-3 text-stone-800">{product.fabric || 'قماش تقليدي فاخر'}</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-stone-600">نوع الخياطة</td>
                      <td className="p-3 text-stone-800">
                        {product.craftsmanship || 'خياطة المعلم بالسفيفة والعقد الحريرية يدوياً'}
                      </td>
                    </tr>
                    <tr className="bg-stone-50/70">
                      <td className="p-3 font-bold text-stone-600">بلد المنشأ</td>
                      <td className="p-3 text-stone-800">المملكة المغربية 🇲🇦 (فاس / الرباط / مراكش)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-stone-600">تعليمات العناية والغسيل</td>
                      <td className="p-3 text-stone-800">
                        {product.care_instructions ||
                          'غسيل جاف (Dry Clean) أو غسيل يدوي بماء بارد. تجنب المبيضات والكي بحرارة خفيفة لحماية السفيفة الحريرية.'}
                      </td>
                    </tr>
                    {product.specifications &&
                      product.specifications.map((spec, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-stone-50/70' : ''}>
                          <td className="p-3 font-bold text-stone-600">{spec.label}</td>
                          <td className="p-3 text-stone-800">{spec.value}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Shipping & Delivery */}
          {activeTab === 'shipping' && (
            <div className="mt-6 space-y-4 text-xs sm:text-sm text-stone-700">
              <div className="rounded-2xl border border-[var(--brand-accent)]/40 bg-amber-50/40 p-4">
                <h4 className="font-bold text-[var(--brand-primary)] text-sm mb-1 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-[var(--brand-accent)]" />
                  <span>توصيل سريع ومجاني للطلبات فوق 500 درهم</span>
                </h4>
                <p className="text-stone-600 text-xs">
                  {product.shipping_info ||
                    'نوصل لجميع مدن وقرى المملكة المغربية من طنجة إلى الكويرة عبر شبكة إرساليات وطنية موثوقة (أمانة، ستيم، إرساليات سريعة) خلال 24 إلى 48 ساعة فقط.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="rounded-xl border border-stone-200 p-3 bg-white">
                  <span className="font-bold text-[var(--brand-primary)] block">الدار البيضاء والرباط:</span>
                  <span className="text-xs text-stone-500">توصيل خلال 24 ساعة مع إمكانية تجربة القياس.</span>
                </div>
                <div className="rounded-xl border border-stone-200 p-3 bg-white">
                  <span className="font-bold text-[var(--brand-primary)] block">مراكش، فاس، طنجة، أكادير:</span>
                  <span className="text-xs text-stone-500">توصيل خلال 24 إلى 48 ساعة حتى باب المنزل.</span>
                </div>
                <div className="rounded-xl border border-stone-200 p-3 bg-white">
                  <span className="font-bold text-[var(--brand-primary)] block">باقي الأقاليم والمناطق الجنوبية:</span>
                  <span className="text-xs text-stone-500">توصيل سريع وآمن خلال 48 إلى 72 ساعة.</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Returns & Warranty */}
          {activeTab === 'returns' && (
            <div className="mt-6 space-y-4 text-xs sm:text-sm text-stone-700">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4">
                <h4 className="font-bold text-emerald-900 text-sm mb-1 flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-emerald-700" />
                  <span>ضمان استبدال المقاس مجاناً بنسبة 100%</span>
                </h4>
                <p className="text-stone-600 text-xs">
                  {product.return_policy ||
                    'إذا لم يناسبكم المقاس أو كان لديكم أي ملاحظة على القطعة، يسعدنا استبدالها بمقاس آخر أو منتج بديل مجاناً خلال 7 أيام من الاستلام.'}
                </p>
              </div>

              <ul className="list-disc list-inside space-y-1.5 text-xs text-stone-600 pr-2">
                <li>يجب أن تكون القطعة بحالتها الأصلية غير مغسولة وببطاقتها الأصلية.</li>
                <li>يتحمل المتجر كافة تكاليف إرجاع واستبدال المقاس لتوفير تجربة تسوق راقية ومريحة.</li>
                <li>فريق خدمة العملاء متاح يومياً عبر الهاتف والواتساب لتنسيق موعد الاستبدال.</li>
              </ul>
            </div>
          )}
        </div>

        {/* ========================================================
            4. CUSTOMER REVIEWS & RATINGS SECTION
            ======================================================== */}
        <div id="reviews-section" className="mt-14 rounded-3xl border border-[#E5DAC6] bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5DAC6] pb-5">
            <div>
              <h3 className="font-amiri text-2xl font-bold text-[var(--brand-primary)]">
                تقييمات وتجارب الزبائن
              </h3>
              <div className="mt-1 flex items-center gap-2 text-xs text-stone-500">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span>متوسط التقييم {avgRating} من 5 نجوم بناءً على {productReviews.length} تقييم</span>
              </div>
            </div>

            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-[var(--brand-primary)] bg-[var(--brand-bg)] px-4 py-2 text-xs font-bold text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white transition-all"
            >
              <Star className="h-4 w-4" />
              <span>أضف تجربتك وتقييمك للمنتج</span>
            </button>
          </div>

          {/* Reviews List */}
          <div className="mt-6 space-y-4">
            {productReviews.length === 0 ? (
              <div className="text-center py-8 text-stone-500 text-xs">
                كن أول من يشارك تجربته مع هذا الموديل التقليدي الراقي!
              </div>
            ) : (
              productReviews.map(r => (
                <div key={r.id} className="rounded-2xl border border-stone-200 bg-[var(--brand-bg)]/60 p-4 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--brand-primary)]">{r.customer_name}</span>
                      <span className="text-[11px] text-stone-400">({r.customer_city || 'المغرب'})</span>
                    </div>
                    <div className="flex text-amber-400">
                      {[...Array(r.rating)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 text-stone-700 leading-relaxed">{r.comment}</p>
                  {r.admin_reply && (
                    <div className="mt-3 rounded-xl bg-white p-3 border-r-2 border-[var(--brand-primary)] text-[11px]">
                      <strong className="text-[var(--brand-primary)] block mb-0.5">رد إدارة الدار المغربية:</strong>
                      <span className="text-stone-600">{r.admin_reply}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ========================================================
            5. RELATED PRODUCTS SECTION
            ======================================================== */}
        {relatedProducts.length > 0 && (
          <div className="mt-14">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-amiri text-2xl font-bold text-[var(--brand-primary)]">
                  قطع تقليدية ذات صلة قد تروق لذوقكم
                </h3>
                <span className="text-xs text-stone-500">
                  تشكيلة مختارة من الأزياء والجلابيب المصنوعة بنفس درجات الإتقان
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map(rel => (
                <div
                  key={rel.id}
                  onClick={() => onNavigateToProduct(rel.slug)}
                  className="group cursor-pointer rounded-2xl border border-[#E5DAC6] bg-white overflow-hidden shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative aspect-3/4 w-full overflow-hidden bg-stone-100">
                    <img
                      src={rel.main_image}
                      alt={rel.name_ar}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3.5 text-right">
                    <h4 className="font-amiri font-bold text-sm text-[var(--brand-primary)] group-hover:text-[var(--brand-accent)] line-clamp-1 transition-colors">
                      {rel.name_ar}
                    </h4>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="font-mono font-bold text-sm text-[#B35432]">
                        {formatMAD(rel.discounted_price ?? rel.regular_price)}
                      </span>
                      <span className="text-[10px] text-stone-400">معاينة</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          6. LIGHTBOX MODAL FOR FULL SCREEN IMAGE INSPECTION
          ======================================================== */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 z-50 rounded-full bg-white/20 p-2 text-white hover:bg-white/40"
          >
            <X className="h-6 w-6" />
          </button>

          {allImages.length > 1 && (
            <>
              <button
                onClick={() =>
                  setLightboxIndex((lightboxIndex - 1 + allImages.length) % allImages.length)
                }
                className="absolute left-6 z-50 rounded-full bg-white/20 p-3 text-white hover:bg-white/40"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={() => setLightboxIndex((lightboxIndex + 1) % allImages.length)}
                className="absolute right-6 z-50 rounded-full bg-white/20 p-3 text-white hover:bg-white/40"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <div className="max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl">
            <img
              src={allImages[lightboxIndex]}
              alt={product.name_ar}
              className="max-h-[85vh] w-auto max-w-full object-contain mx-auto"
            />
            <div className="mt-3 text-center text-xs text-white/80">
              صورة {lightboxIndex + 1} من {allImages.length} — {product.name_ar}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          7. MOROCCAN SIZE GUIDE MODAL
          ======================================================== */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl border border-[#E5DAC6] bg-[var(--brand-bg)] p-6 text-right shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5DAC6] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Ruler className="h-5 w-5 text-[var(--brand-primary)]" />
                <h3 className="font-amiri text-lg font-bold text-[var(--brand-primary)]">
                  جدول قياسات الأزياء المغربية التقليدية (بالسنتمتر)
                </h3>
              </div>
              <button
                onClick={() => setIsSizeGuideOpen(false)}
                className="rounded-full p-1 text-stone-400 hover:bg-stone-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
              <table className="w-full text-center text-xs">
                <thead>
                  <tr className="bg-[var(--brand-primary)] text-white">
                    <th className="p-2.5">المقاس</th>
                    <th className="p-2.5">عرض الكتفين (cm)</th>
                    <th className="p-2.5">محيط الصدر (cm)</th>
                    <th className="p-2.5">طول القامة التقريبي (cm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  <tr>
                    <td className="p-2.5 font-bold">M</td>
                    <td className="p-2.5">44 - 46</td>
                    <td className="p-2.5">102 - 106</td>
                    <td className="p-2.5">165 - 172</td>
                  </tr>
                  <tr className="bg-stone-50">
                    <td className="p-2.5 font-bold">L</td>
                    <td className="p-2.5">46 - 48</td>
                    <td className="p-2.5">108 - 114</td>
                    <td className="p-2.5">173 - 180</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">XL</td>
                    <td className="p-2.5">48 - 50</td>
                    <td className="p-2.5">116 - 122</td>
                    <td className="p-2.5">180 - 187</td>
                  </tr>
                  <tr className="bg-stone-50">
                    <td className="p-2.5 font-bold">XXL</td>
                    <td className="p-2.5">50 - 54</td>
                    <td className="p-2.5">124 - 132</td>
                    <td className="p-2.5">185 - 195</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-[11px] text-stone-500">
              * ملاحظة: جلابيب وفياش الدار المغربية تفصل بقصة مخزنية تقليدية مريحة ورحبة. إذا كنتم
              مترددين بين قياسين، ننصح باختيار القياس الأكبر أو التواصل معنا عبر الواتساب لتحديد
              القياس المناسب بدقة.
            </p>

            <button
              onClick={() => setIsSizeGuideOpen(false)}
              className="mt-4 w-full rounded-xl bg-[var(--brand-primary)] py-2 text-xs font-bold text-white hover:bg-[var(--brand-primary-hover)]"
            >
              فهمت، إغلاق الدليل
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          8. ADD REVIEW MODAL
          ======================================================== */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-[#E5DAC6] bg-[var(--brand-bg)] p-6 text-right shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E5DAC6] pb-3 mb-4">
              <h3 className="font-amiri text-lg font-bold text-[var(--brand-primary)]">
                شاركنا رأيك في: {product.name_ar}
              </h3>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="rounded-full p-1 text-stone-400 hover:bg-stone-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {reviewSuccess ? (
              <div className="py-8 text-center text-emerald-800">
                <Check className="h-10 w-10 mx-auto text-emerald-600 mb-2" />
                <h4 className="font-bold text-sm">شكراً جزيلاً لتقييمكم النبيل!</h4>
                <p className="text-xs text-stone-600 mt-1">
                  ستتم مراجعة التقييم ونشره في صفحة المنتج فوراً.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">الاسم الكامل</label>
                  <input
                    type="text"
                    required
                    value={reviewForm.name}
                    onChange={e => setReviewForm({ ...reviewForm, name: e.target.value })}
                    placeholder="مثال: عبد الرحيم التازي"
                    className="w-full rounded-xl border border-stone-300 p-2.5 bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">المدينة المغربية</label>
                  <input
                    type="text"
                    required
                    value={reviewForm.city}
                    onChange={e => setReviewForm({ ...reviewForm, city: e.target.value })}
                    placeholder="مثال: الدار البيضاء"
                    className="w-full rounded-xl border border-stone-300 p-2.5 bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">التقييم العام</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="p-1"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= reviewForm.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-stone-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    تعليقك وتجربتك مع الخياطة والقماش
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={reviewForm.comment}
                    onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="اكتب ملاحظاتك بصدق حول جودة الثوب وسفيفة المعلم وسرعة التوصيل..."
                    className="w-full rounded-xl border border-stone-300 p-2.5 bg-white text-xs"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-[var(--brand-primary)] py-2.5 font-bold text-white hover:bg-[var(--brand-primary-hover)]"
                  >
                    إرسال التقييم
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="rounded-xl border border-stone-300 px-4 py-2.5 text-stone-600"
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
  );
};
