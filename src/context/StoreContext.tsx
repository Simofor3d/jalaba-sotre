import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, Category, Review, HomepageSettings } from '../types/store.ts';
import { applyThemePaletteToRoot, buildThemePalette } from '../utils/theme.ts';
import { mergeWithDefaultSiteContent } from '../utils/siteContent.ts';

interface StoreContextType {
  products: Product[];
  categories: Category[];
  reviews: Review[];
  settings: HomepageSettings;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  addReview: (reviewData: {
    product_id: string;
    customer_name: string;
    customer_city?: string;
    rating: number;
    comment: string;
  }) => Promise<{ success: boolean; message?: string }>;
  selectedCategory: string;
  setSelectedCategory: (catId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState<HomepageSettings>(() =>
    mergeWithDefaultSiteContent(undefined)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      const [prodsRes, catsRes, revsRes, settingsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/reviews'),
        fetch('/api/settings'),
      ]);

      if (prodsRes.ok) {
        const prods = await prodsRes.json();
        setProducts(prods);
      }
      if (catsRes.ok) {
        const cats = await catsRes.json();
        setCategories(cats);
      }
      if (revsRes.ok) {
        const revs = await revsRes.json();
        setReviews(revs);
      }
      if (settingsRes.ok) {
        const sett = await settingsRes.json();
        setSettings(mergeWithDefaultSiteContent(sett));
      }
      setError(null);
    } catch (err: any) {
      console.error('Failed to load store data', err);
      setError('تعذر تحميل بيانات المتجر، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    applyThemePaletteToRoot(buildThemePalette(settings));
  }, [
    settings.theme_primary_color,
    settings.theme_accent_color,
    settings.theme_bg_color,
    settings.theme_dark_color,
  ]);

  const addReview = async (reviewData: {
    product_id: string;
    customer_name: string;
    customer_city?: string;
    rating: number;
    comment: string;
  }) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });
      const data = await res.json();
      await refreshData();
      return { success: res.ok, message: data.message };
    } catch (err: any) {
      console.error('Failed to submit review', err);
      return { success: false, message: 'تعذر إرسال التقييم' };
    }
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        reviews,
        settings,
        loading,
        error,
        refreshData,
        addReview,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
