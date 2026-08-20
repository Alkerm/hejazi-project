'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Star, ShieldCheck, Heart, Send, ShoppingBag, Check, ArrowRight, Lock, CheckCircle2, Award, Zap } from 'lucide-react';
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
          if (revs.userReview) {
            setNewRating(revs.userReview.rating);
            setNewComment(revs.userReview.comment || '');
          }
        } catch {}
      })
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [params.slug]);

  const addToCart = async () => {
    if (!isSignedIn) {
      toast.info(t('Store opening soon! Register for early access.', 'المتجر يفتح قريباً! سجّل اهتمامك لتصلك رسالة فور الإطلاق.'));
      router.push('/interest');
      return;
    }
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
    if (!isSignedIn) {
      toast.info(t('Store opening soon! Register for early access.', 'المتجر يفتح قريباً! سجّل اهتمامك لتصلك رسالة فور الإطلاق.'));
      router.push('/interest');
      return;
    }
    if (!product) return;
    try {
      const res = await api.toggleWishlist(product.id);
      setIsWishlisted(res.isWishlisted);
      toast.success(res.isWishlisted ? t('Saved to Wishlist!', 'تم الحفظ في المفضلة!') : t('Removed from Wishlist', 'تم الحذف من المفضلة'));
    } catch (e: any) {
      toast.error(t('Please log in or create an account to save items to your wishlist', 'يرجى تسجيل الدخول أو إنشاء حساب لحفظ المنتجات في المفضلة'));
      setTimeout(() => {
        router.push('/interest');
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

      toast.success(t('Thank you! Your verified review has been published.', 'شكراً لك! تم حفظ ونشر تقييمك الموثق بنجاح.'));
      // Reload reviews
      const updatedRevs = await api.productReviews(product.id);
      setReviewsData(updatedRevs);
    } catch (err: any) {
      toast.error(err.message || t('Failed to submit review', 'تعذر إرسال التقييم'));
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Toaster position="top-right" richColors />
        <div className="w-10 h-10 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{t('Loading Product...', 'جاري تحميل تفاصيل المنتج...')}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 space-y-4">
        <Toaster position="top-right" richColors />
        <h2 className="text-xl font-bold text-slate-800">{t('Product Not Found', 'المنتج غير موجود')}</h2>
        <p className="text-xs text-slate-500">{t('The product you are looking for might have been removed.', 'قد يكون المنتج غير متوفر أو تم نقله.')}</p>
        <Link href="/products">
          <Button variant="secondary" className="text-xs">
            {t('Back to Catalog', 'العودة لجميع المنتجات')}
          </Button>
        </Link>
      </div>
    );
  }

  const stockInfo = getStockStatus(product.stockQuantity);
  const displayName = formatProductName(product);
  const displayDescription = formatProductDescription(product);
  const ratingSummary = reviewsData?.summary || { averageRating: 5.0, totalReviews: 1 };
  const hasPurchased = Boolean(reviewsData?.hasPurchased);

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-fade-in pb-12">
      <Toaster position="top-right" richColors />

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link href="/products" className="hover:text-slate-800 transition">
          {t('Home', 'الرئيسية')}
        </Link>
        <span>/</span>
        <Link href={`/products?category=${product.categoryId}`} className="hover:text-slate-800 transition">
          {formatCategoryName(product.category || { name: 'Cameras & Energy' })}
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-bold truncate">{displayName}</span>
      </nav>

      {/* Product Main Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Left Column: Product Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/60 shadow-sm group">
            <Image
              src={product.imageUrl}
              alt={displayName}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              priority
            />
            {product.stockQuantity < 5 && product.stockQuantity > 0 && (
              <div className="absolute top-4 left-4 z-10">
                <Badge variant="warning" className="text-[11px] font-bold shadow-xs">
                  {t(`Only ${product.stockQuantity} Left!`, `متبقي ${product.stockQuantity} قطع فقط!`)}
                </Badge>
              </div>
            )}
            <button
              onClick={toggleWishlist}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/80 backdrop-blur-md text-slate-600 hover:text-rose-500 hover:bg-white transition shadow-sm cursor-pointer"
              title={isWishlisted ? t('Remove from Wishlist', 'إزالة من المفضلة') : t('Save to Wishlist', 'حفظ في المفضلة')}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Right Column: Info & Purchase Card */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-md">
                {product.brand || 'Half Link Pro'}
              </span>
              <Badge variant={stockInfo.variant} className="text-[11px] font-bold">
                {stockInfo.label}
              </Badge>
            </div>

            <h1 className="serif-font text-2xl sm:text-3xl font-bold text-slate-800 leading-tight">
              {displayName}
            </h1>

            {/* Rating Stars Quick Summary */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex text-amber-400">
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
              <span className="text-xs text-slate-400">({ratingSummary.totalReviews} {t('verified reviews', 'تقييم موثق')})</span>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                {formatMoney(product.price)}
              </span>
              <span className="text-xs font-bold text-slate-500">{t('Includes 15% VAT', 'شامل ضريبة القيمة المضافة 15%')}</span>
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t('2-Year Commercial Warranty & Fast SASO Delivery in KSA', 'ضمان سنتين رسمي معتمد وتوصيل سريع لكافة مناطق المملكة')}
            </p>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            {displayDescription}
          </p>

          {/* Quantity and Actions */}
          <div className="space-y-4 pt-4 border-t border-slate-200/60">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700">{t('Quantity:', 'الكمية:')}</span>
              <div className="flex items-center border border-slate-200 rounded-xl bg-white p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-30 cursor-pointer"
                >
                  -
                </button>
                <span className="w-10 text-center text-xs font-bold text-slate-800">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  disabled={quantity >= product.stockQuantity}
                  className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-30 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {addedToCart ? (
                <Link href="/cart" className="flex-1">
                  <Button className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" />
                    {t('Go to Cart', 'الذهاب للسلة')}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <Button
                  disabled={product.stockQuantity < 1 || addingToCart}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
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
            <p className="text-xs text-slate-500 mt-0.5">{t('Customer feedback for', 'آراء وتجارب العملاء لمنتج')} {displayName}</p>
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

        {/* REVIEW ELIGIBILITY & SUBMIT SECTION */}
        {!isSignedIn ? (
          /* Case 1: Visitor NOT logged in */
          <div className="bg-slate-50/90 rounded-2xl p-6 border border-slate-200/80 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mx-auto shadow-2xs">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800">
                {t('Sign in to leave a verified review', 'سجّل الدخول لكتابة تقييم موثق')}
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                {t(
                  'To ensure complete transparency and prevent fake reviews, only verified customers who purchased this item can submit feedback.',
                  'لضمان مصداقية التقييمات ومكافحة المراجعات غير الحقيقية، يقتصر التقييم على العملاء الذين أتموا شراء هذا المنتج من المتجر.'
                )}
              </p>
            </div>
            <Link href="/login">
              <Button variant="dark" className="text-xs px-6 py-2 mt-1 cursor-pointer">
                {t('Sign In to Account', 'تسجيل الدخول')}
              </Button>
            </Link>
          </div>
        ) : !hasPurchased ? (
          /* Case 2: User logged in but HAS NOT purchased this product */
          <div className="bg-gradient-to-br from-amber-50/70 via-slate-50 to-slate-100/60 rounded-2xl p-6 border border-amber-200/80 space-y-3">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center flex-none mt-0.5 shadow-2xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider bg-amber-200/70 px-2.5 py-0.5 rounded-md">
                    {t('Verified Purchases Only 🛡️', 'تقييمات المشترين المعتمدين فقط 🛡️')}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  {t('Have you purchased this product?', 'هل قمت بشراء هذا المنتج؟')}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {t(
                    'In accordance with Saudi Ministry of Commerce consumer protection standards, only customers with a completed order for this item are eligible to submit reviews.',
                    'تطبيقاً لأنظمة وزارة التجارة وحماية المستهلك ومكافحة التقييمات المضللة، يتاح نشر التقييم فقط للعملاء الذين يملكون طلباً مؤكداً لهذا المنتج.'
                  )}
                </p>
                <div className="pt-2">
                  <Button
                    onClick={addToCart}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{t('Buy Now to Review', 'اشترِ المنتج الآن لتتمكن من تقييمه')}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Case 3: Verified Buyer - Show Review Form */
          <form onSubmit={handleReviewSubmit} className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800">
                {reviewsData?.userReview ? t('Update Your Review', 'تعديل تقييمك للمنتج') : t('Write a Review', 'أضف تقييمك وتجربتك')}
              </h4>
            </div>
            
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
              <span className="text-xs font-bold text-slate-700 ml-2">{newRating} {t('Stars', 'نجوم')}</span>
            </div>

            <div>
              <textarea
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={t('Share your experience with this energy or camera system', 'شاركنا تجربتك ورأيك عن كفاءة المنتج وأدائه')}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-white"
              />
            </div>

            <Button
              type="submit"
              disabled={submittingReview}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-slate-950" />
              <span>
                {submittingReview
                  ? t('Submitting...', 'جاري النشر...')
                  : reviewsData?.userReview
                  ? t('Update Review', 'تحديث التقييم')
                  : t('Post Verified Review', 'نشر التقييم الموثق')}
              </span>
            </Button>
          </form>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviewsData?.reviews.length === 0 ? (
            <p className="text-xs text-slate-500 italic text-center py-6">{t('No reviews yet. Be the first verified buyer to review!', 'لا توجد تقييمات سابقة. كن أول مشتري موثق يشارك تجربته!')}</p>
          ) : (
            reviewsData?.reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-xl border border-slate-200/50 bg-white space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">
                    {rev.user.firstName} {rev.user.lastName}
                  </span>
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

                {rev.comment && <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
