'use client';

import React, { useEffect, useState } from 'react';
import { MessageSquare, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { api } from '@/lib/api';
import { SupportTicket } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language-context';

export default function AdminSupportPage() {
  const { t } = useLanguage();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const statusLabels: Record<string, { en: string; ar: string }> = {
    ALL: { en: 'All', ar: 'الكل' },
    OPEN: { en: 'Open', ar: 'مفتوحة' },
    IN_PROGRESS: { en: 'In Progress', ar: 'قيد المعالجة' },
    RESOLVED: { en: 'Resolved', ar: 'تم الحل' },
    CLOSED: { en: 'Closed', ar: 'مغلقة' },
  };

  const getStatusText = (st: string) => {
    if (statusLabels[st]) {
      return t(statusLabels[st].en, statusLabels[st].ar);
    }
    return st;
  };

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await api.adminTickets();
      setTickets(data);
    } catch (err: any) {
      toast.error(err.message || t('Failed to load support queue', 'فشل تحميل تذاكر الدعم الفني'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleUpdateStatus = async (ticketId: string, status: string) => {
    try {
      await api.adminUpdateTicketStatus(ticketId, status);
      toast.success(t(`Ticket status updated to ${getStatusText(status)}`, `تم تحديث حالة التذكرة إلى "${getStatusText(status)}"`));
      await loadTickets();
    } catch (err: any) {
      toast.error(err.message || t('Failed to update ticket status', 'فشل تحديث حالة التذكرة'));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <Toaster position="top-right" richColors />
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800"></div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest animate-pulse">
          {t('Loading support tickets...', 'جاري تحميل تذاكر الدعم الفني...')}
        </p>
      </div>
    );
  }

  const filteredTickets = filterStatus === 'ALL'
    ? tickets
    : tickets.filter((t) => t.status === filterStatus);

  return (
    <div className="space-y-8 animate-fade-in">
      <Toaster position="top-right" richColors />

      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/50 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-slate-800" />
            <h1 className="serif-font text-3xl font-bold text-slate-800">
              {t('Customer Support Queue', 'تذاكر الدعم الفني والبلاغات')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-widest">
            {t('Manage customer inquiries, complaints, and assistance requests', 'متابعة واستجابة استفسارات وبلاغات العملاء')}
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl border transition-all ${
                filterStatus === st
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs font-bold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {getStatusText(st)}
            </button>
          ))}
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 p-12 text-center text-slate-500 text-xs font-medium">
          {t('No customer support tickets found for this filter.', 'لا توجد تذاكر دعم فني تطابق هذا الفلتر.')}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <div key={ticket.id} className="glass-card rounded-2xl p-5 border border-slate-200/40 space-y-3 shadow-xs bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800">{ticket.subject}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      ticket.status === 'OPEN'
                        ? 'bg-amber-100 text-amber-800'
                        : ticket.status === 'IN_PROGRESS'
                        ? 'bg-blue-100 text-blue-800'
                        : ticket.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {getStatusText(ticket.status)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {t('From:', 'من:')} <strong>{ticket.name}</strong> ({ticket.email}) • {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={ticket.status}
                    onChange={(e) => handleUpdateStatus(ticket.id, e.target.value)}
                    className="text-xs p-2 rounded-xl border border-slate-200 bg-white font-semibold focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="OPEN">{t('Mark OPEN', 'تغيير إلى: مفتوحة')}</option>
                    <option value="IN_PROGRESS">{t('Mark IN_PROGRESS', 'تغيير إلى: قيد المعالجة')}</option>
                    <option value="RESOLVED">{t('Mark RESOLVED', 'تغيير إلى: تم الحل')}</option>
                    <option value="CLOSED">{t('Mark CLOSED', 'تغيير إلى: مغلقة')}</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 text-xs text-slate-700 leading-relaxed">
                {ticket.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
