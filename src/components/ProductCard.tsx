import React from 'react';
import { Product } from '../types/store.ts';
import { formatMAD } from '../utils/pricing.ts';
import { Eye, ShoppingBag, Zap } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
  onQuickBuy: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetails,
  onQuickBuy,
}) => {
  const currentPrice = product.discounted_price ?? product.regular_price;
  const hasDiscount = Boolean(
    product.discounted_price && product.discounted_price < product.regular_price
  );
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock_quantity, 0);

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--brand-border)] bg-white text-right shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[var(--brand-primary)]">
      {/* Image Container */}
      <div
        onClick={() => onOpenDetails(product)}
        className="relative aspect-3/4 w-full overflow-hidden bg-[var(--brand-surface)] cursor-pointer"
      >
        <img
          src={product.main_image}
          alt={product.name_ar}
          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />

        {/* Single Restrained Corner Badge */}
        {product.is_new_arrival ? (
          <span className="absolute top-3 right-3 z-10 rounded-md bg-[var(--brand-primary)] px-2.5 py-1 text-[11px] font-bold text-[var(--brand-accent-light)] shadow-xs">
            جديد
          </span>
        ) : hasDiscount ? (
          <span className="absolute top-3 right-3 z-10 rounded-md bg-[#B35432] px-2.5 py-1 text-[11px] font-bold text-white shadow-xs">
            خصم {Math.round(((product.regular_price - product.discounted_price!) / product.regular_price) * 100)}%
          </span>
        ) : null}

        {/* Subtle Hover Inspection Trigger */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button
            onClick={e => {
              e.stopPropagation();
              onOpenDetails(product);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-white/95 px-4 py-2 text-xs font-bold text-[var(--brand-primary)] shadow-lg backdrop-blur-xs hover:bg-[var(--brand-primary)] hover:text-[var(--brand-primary-contrast)] transition-all"
          >
            <Eye className="h-4 w-4" />
            <span>معاينة وتفاصيل القياس</span>
          </button>
        </div>
      </div>

      {/* Clean Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3
            onClick={() => onOpenDetails(product)}
            className="font-amiri text-lg font-bold text-[var(--brand-primary)] leading-snug cursor-pointer hover:text-[var(--brand-accent)] transition-colors line-clamp-1"
          >
            {product.name_ar}
          </h3>

          {/* Pricing Row */}
          <div className="mt-1.5 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-[#B35432] font-mono tabular-nums">
                {formatMAD(currentPrice)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-stone-400 line-through font-mono tabular-nums">
                  {formatMAD(product.regular_price)}
                </span>
              )}
            </div>

            <span className="text-[11px] font-medium">
              {totalStock > 0 ? (
                <span className="text-emerald-700">متوفر</span>
              ) : (
                <span className="text-red-600">نفد</span>
              )}
            </span>
          </div>
        </div>

        {/* Clean Action Row */}
        <div className="border-t border-[var(--brand-surface)] pt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => onQuickBuy(product)}
            disabled={totalStock <= 0}
            className="flex items-center justify-center gap-1 rounded-xl bg-[var(--brand-primary)] py-2 text-xs font-bold text-[var(--brand-primary-contrast)] shadow-xs hover:bg-[var(--brand-primary-hover)] disabled:opacity-40 cursor-pointer"
          >
            <Zap className="h-3.5 w-3.5 text-[var(--brand-accent)]" />
            <span>شراء الآن</span>
          </button>

          <button
            onClick={() => onOpenDetails(product)}
            className="flex items-center justify-center gap-1 rounded-xl border border-[var(--brand-primary)] bg-white py-2 text-xs font-bold text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5 cursor-pointer"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>التفاصيل</span>
          </button>
        </div>
      </div>
    </div>
  );
};
