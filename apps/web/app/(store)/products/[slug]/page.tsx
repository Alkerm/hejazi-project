'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Star, ShieldCheck, Heart, Send, ShoppingBag, Check, ArrowRight } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { api } from '@/lib/api';
import { Product, ProductReviewsSummaryResponse } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatMoney } from '@/lib/format';
import { getStockStatus } from '@/lib/stock';
import { useLanguage } from '@/lib/language-context';
import { useCart } from '@/lib/cart-context';

export default function ProductDetailsPage() {
  const { t, lang, formatProductName, formatProductDescription, formatCategoryName } = useLanguage();
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviewsData, setReviewsData] = useState<ProductReviewsSummaryResponse | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const { incrementCart } = useCart();

  // Review Form state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const hasHint = document.cookie
        .split(';')
        .map((cookie) => cookie.trim())
        .some((cookie) => cookie.startsWith('cosmetics_sid_hint='));
      setIsSignedIn(hasHint);
    }
  }, []);

  useEffect(() => {
    if (!params.slug) return;
    setLoading(true);

    api
      .productDetails(params.slug)
      .then(async (prod) => {
        setProduct(prod);
        // Fetch reviews
        try {
          const revs = await api.productReviews(prod.id);
          setReviewsData(revs);
        } catch {}
      })
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [params.slug]);

  const addToCart = async () => {
    if (!product || addingToCart) return;
    const displayName = formatProductName(product);
    setAddingToCart(true);
    try {
      await api.addCartItem({ productId: product.id, quantity });
      incrementCart(quantity);
      setAddedToCart(true);
      toast.success(t(`Added ${quantity} x "${displayName}" to cart!`, `تمت إضافة ${quantity} من "${displayName}" إلى السلة!`));
      // Reset back to "Add to Cart" after 4 seconds
      setTimeout(() => setAddedToCart(false), 4000);
    } catch (e: any) {
      toast.error(e.message || t('Failed to add item to cart', 'فشل إضافة المنتج إلى السلة'));
    } finally {
      setAddingToCart(false);
    }
  };

  const toggleWishlist = async () => {
    if (!product) return;
    try {
      const res = await api.toggleWishlist(product.id);
      setIsWishlisted(res.isWishlisted);
      toast.success(res.isWishlisted ? t('Saved to Wishlist!', 'تم الحفظ في المفضلة!') : t('Removed from Wishlist', 'تم الحذف من المفضلة'));
    } catch (e: any) {
      toast.error(t('Please log in or create an account to save items to your wishlist', 'يرجى تسجيل الدخول أو إنشاء حساب لحفظ المنتجات في المفضلة'));
      setTimeout(() => {
        router.push('/login');
      }, 1000);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setSubmittingReview(true);

    try {
      await api.submitReview({
        productId: product.id,
        rating: newRating,
        comment: newComment.trim() || undefined,
      });

      toast.success(t('Thank you for your feedback! Review published.', 'شكراً لك على تقييمك! تم نشر التقييم بنجاح.'));
      setNewComment('');
      // Reload reviews
      const updatedRevs = await api.productReviews(product.id);
      setReviewsData(updatedRevs);
    } catch (err: any) {
      toast.error(t('Please log in or create an account to submit a review', 'يرجى تسجيل الدخول أو إنشاء حساب لإضافة تقييم'));
      setTimeout(() => {
        router.push('/login');
      }, 1000);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Toaster position="top-right" richColors />
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-amber-600"></div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest animate-pulse">
          {t('Loading product details...', 'جاري تحميل تفاصيل المنتج...')}
        </p>
      </div>
    );
  }

  if (!product) return <p className="text-red-600 text-center py-20">{t('Product not found', 'المنتج غير موجود')}</p>;

  const stockStatus = getStockStatus(product.stockQuantity, lang);
  const ratingSummary = reviewsData?.summary || { totalReviews: 0, averageRating: 0, breakdown: {} };
  const displayName = formatProductName(product);

  return (
    <div className="space-y-12 animate-fade-in max-w-5xl mx-auto pb-16">
      <Toaster position="top-right" richColors />

      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <span className="cursor-pointer hover:text-amber-600 transition" onClick={() => router.push('/products')}>
          {t('Catalog', 'المنتجات')}
        </span>
        <span>/</span>
        <span className="text-amber-600 font-bold">{formatCategoryName(product.category)}</span>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="relative h-[480px] overflow-hidden rounded-2xl bg-slate-50 border border-slate-200/40 shadow-md">
          <Image src={product.imageUrl} alt={displayName} fill className="object-cover" />
          
          {/* Wishlist Heart Button (Shown ONLY when signed in) */}
          {isSignedIn && (
            <button
              onClick={toggleWishlist}
              className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md shadow-md transition-all ${
                isWishlisted ? 'bg-rose-500 text-white' : 'bg-white/80 text-slate-700 hover:text-rose-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        <div className="space-y-6 flex flex-col justify-between py-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
                {formatCategoryName(product.category)}
              </span>
              <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
            </div>

            <h1 className="serif-font text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
              {displayName}
            </h1>

            {/* Rating Stars Header */}
            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(ratingSummary.averageRating) ? 'fill-amber-400' : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-700">{ratingSummary.averageRating}</span>
              <span className="text-xs text-slate-400">({ratingSummary.totalReviews} {t('customer reviews', 'تقييمات العملاء')})</span>
            </div>

            <p className="text-3xl font-bold text-amber-700">{formatMoney(product.price)}</p>

            <div className="border-t border-b border-slate-200/50 py-4 my-2">
              <h2 className="text-xs uppercase tracking-widest font-bold text-slate-700 mb-2">{t('Product Overview', 'نظرة عامة عن المنتج')}</h2>
              <p className="text-sm text-slate-600 leading-relaxed font-light">{formatProductDescription(product)}</p>
            </div>

            {/* Quality & Warranty Badge */}
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-900 border border-amber-200/60 text-xs px-3 py-1.5 rounded-xl font-medium">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>{t('Half Link 2-Year KSA Official Warranty', 'ضمان هالف لينـك الرسمي لمدة سنتين بالمملكة')}</span>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
                <button
                  className="px-3.5 py-2 text-slate-500 hover:bg-slate-50 transition active:scale-95"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <span className="px-4 py-2 text-xs font-bold text-slate-700 min-w-[32px] text-center">{quantity}</span>
                <button
                  className="px-3.5 py-2 text-slate-500 hover:bg-slate-50 transition active:scale-95"
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                >
                  +
                </button>
              </div>

              {addedToCart ? (
                <Link href="/cart" className="flex-1">
                  <Button
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cart-added-btn"
                  >
                    <Check className="w-4 h-4" />
                    {t('Go to Cart', 'الذهاب للسلة')}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <Button
                  disabled={product.stockQuantity < 1 || addingToCart}
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-slate-950 font-bold shadow-md shadow-amber-600/20 flex items-center justify-center gap-2"
                  onClick={addToCart}
                >
                  {addingToCart ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                      {t('Adding...', 'جاري الإضافة...')}
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      {t('Add to Cart', 'إضافة إلى السلة')} ({formatMoney(product.price * quantity)})
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details & Specifications Section */}
      <div className="glass-card rounded-2xl p-6 border border-slate-200/40 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">{t('Technical Specifications', 'المواصفات التقنية والدليل')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
          <div>
            <span className="font-bold text-slate-700 block mb-1">{t('Technical Features:', 'المواصفات الفنية:')}</span>
            <p className="leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/50">
              {product.ingredients || t('High-efficiency solar cells, smart BMS lithium protection, and weather resistant casing.', 'خلايا طاقة شمسية عالية الكفاءة، حماية ذكية لبطاريات الليثيوم، وهيكل مقاوم للظروف الجوية.')}
            </p>
          </div>
          <div>
            <span className="font-bold text-slate-700 block mb-1">{t('Installation & Warranty:', 'التثبيت والضمان:')}</span>
            <p className="leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/50">
              {product.usageInstructions || t('Easy plug and play setup. Includes mounting accessories and user manual.', 'تركيب سهل ومباشر. يتضمن ملحقات التثبيت ودليل المستخدم.')}{' '}
              {product.warnings ? `[${t('Note:', 'ملاحظة:')} ${product.warnings}]` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Feedback Section */}
      <div className="glass-card rounded-2xl p-6 border border-slate-200/40 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/50 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">{t('Customer Ratings & Reviews', 'تقييمات وآراء العملاء')}</h3>
            <p className="text-xs text-slate-500">{t('Verified buyer feedback for', 'آراء موثوقة من المشترين لمنتج')} {displayName}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-extrabold text-slate-800">{ratingSummary.averageRating}</span>
            <div className="text-left">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      star <= Math.round(ratingSummary.averageRating) ? 'fill-amber-400' : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-slate-400">{ratingSummary.totalReviews} {t('total reviews', 'إجمالي التقييمات')}</span>
            </div>
          </div>
        </div>

        {/* Submit Review Form */}
        <form onSubmit={handleReviewSubmit} className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/60 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">{t('Write a Customer Review', 'أضف تقييمك للمنتج')}</h4>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-600 font-medium">{t('Your Score:', 'تقييمك:')}</span>
            <div className="flex gap-1 cursor-pointer">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  type="button"
                  key={score}
                  onClick={() => setNewRating(score)}
                  className="p-1 transition transform active:scale-90"
                >
                  <Star
                    className={`w-5 h-5 ${score <= newRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-700 ml-2">{newRating} {t('Stars', 'نجوم')}</span>
          </div>

          <div>
            <textarea
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={t('Share your experience with this energy or camera system', 'شاركنا تجربتك ورأيك عن هذا المنتج والكفاءة')}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-white"
            />
          </div>

          <Button type="submit" disabled={submittingReview} className="bg-slate-900 text-amber-400 hover:bg-amber-500 hover:text-slate-950 font-bold text-xs px-5 py-2 flex items-center gap-2">
            <Send className="w-3.5 h-3.5" />
            {submittingReview ? t('Submitting...', 'جاري النشر...') : t('Post Review', 'نشر التقييم')}
          </Button>
        </form>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviewsData?.reviews.length === 0 ? (
            <p className="text-xs text-slate-500 italic text-center py-6">{t('Be the first to review this product!', 'كن أول من يضيف تقييماً لهذا المنتج!')}</p>
          ) : (
            reviewsData?.reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-xl border border-slate-200/40 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-800">
                      {rev.user.firstName} {rev.user.lastName}
                    </span>
                    <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-medium">
                      {t('Verified Buyer', 'مشتري موثق')}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${star <= rev.rating ? 'fill-amber-400' : 'text-slate-200'}`}
                    />
                  ))}
                </div>

                {rev.comment && <p className="text-xs text-slate-600 leading-relaxed pt-1">{rev.comment}</p>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
