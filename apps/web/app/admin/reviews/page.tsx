'use client';

import { useEffect, useState } from 'react';
import { Star, CheckCircle, XCircle, Shield } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { api } from '@/lib/api';
import { Review } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language-context';

export default function AdminReviewsPage() {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await api.adminReviews();
      setReviews(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load reviews queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleModerate = async (reviewId: string, isApproved: boolean) => {
    try {
      await api.adminModerateReview(reviewId, isApproved);
      toast.success(isApproved ? 'Review approved' : 'Review hidden');
      await loadReviews();
    } catch (err: any) {
      toast.error(err.message || 'Moderation failed');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Toaster position="top-right" richColors />
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800"></div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest animate-pulse">
          {t('Loading moderation queue...', 'جاري تحميل قائمة التقييمات...')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <Toaster position="top-right" richColors />

      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/50 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-slate-800" />
            <h1 className="serif-font text-3xl font-bold text-slate-800">
              {t('Reviews & Ratings Moderation', 'إدارة مراجعات وتقييمات العملاء')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-widest">
            {t('Approve or hide customer cosmetic reviews', 'اعتماد أو إخفاء التقييمات وآراء العملاء على المنتجات')}
          </p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 p-12 text-center text-slate-500 text-xs font-medium">
          {t('No customer reviews submitted yet.', 'لا توجد تقييمات منشورة من العملاء حالياً.')}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="glass-card rounded-2xl p-5 border border-slate-200/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs bg-white">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-slate-800">
                    {rev.user.firstName} {rev.user.lastName} ({rev.user.email})
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    rev.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {rev.isApproved ? t('Approved', 'معتمد ومقبول') : t('Pending Review', 'قيد النظر')}
                  </span>
                </div>

                {rev.product && (
                  <p className="text-xs font-semibold text-amber-600">{t('Product:', 'المنتج:')} {rev.product.name}</p>
                )}

                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= rev.rating ? 'fill-amber-400' : 'text-slate-200'}`}
                    />
                  ))}
                </div>

                {rev.comment && <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>}
              </div>

              <div className="flex items-center gap-2">
                {rev.isApproved ? (
                  <Button
                    onClick={() => handleModerate(rev.id, false)}
                    variant="secondary"
                    className="text-xs border-amber-200 text-amber-700 hover:bg-amber-50 flex items-center gap-1.5 font-bold"
                  >
                    <XCircle className="w-3.5 h-3.5" /> {t('Hide Review', 'إخفاء التقييم')}
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleModerate(rev.id, true)}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 font-bold"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> {t('Approve Review', 'اعتماد التقييم')}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
