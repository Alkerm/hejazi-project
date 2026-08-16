'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { api } from '@/lib/api';
import { storefrontSettings } from '@/lib/storefront';
import { Button } from '@/components/ui/button';

export default function ComplaintsContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      toast.error('All fields are required.');
      return;
    }

    setSubmitting(true);

    try {
      await api.submitContactTicket({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });

      toast.success('Your support inquiry has been submitted! Our team will respond shortly.');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit inquiry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in max-w-4xl mx-auto pb-16">
      <Toaster position="top-right" richColors />

      <div className="border-b border-slate-200/50 pb-6 space-y-2">
        <h1 className="serif-font text-3xl md:text-4xl font-bold text-slate-800">Complaints & Customer Support</h1>
        <p className="text-xs text-slate-500 uppercase tracking-widest">
          Report order issues, technical setup inquiries, or general warranty support
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Info Sidebar */}
        <div className="space-y-6 md:col-span-1">
          <div className="glass-card rounded-2xl p-5 border border-slate-200/40 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              Contact Channels
            </h3>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-slate-700 block">Email Support</span>
                  <a href={`mailto:${storefrontSettings.email}`} className="text-slate-800 hover:text-amber-600 underline">
                    {storefrontSettings.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-slate-700 block">Phone Hotline / WhatsApp</span>
                  <a href={`tel:${storefrontSettings.phoneClean}`} className="text-slate-800 hover:text-amber-600">
                    <span dir="ltr" className="inline-block font-mono font-bold">
                      {storefrontSettings.phone}
                    </span>
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-500 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-700 block">Headquarters</span>
                  <p>{storefrontSettings.address}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-200/40 space-y-2 text-xs text-slate-500">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider">Response SLA</h4>
            <p>We aim to respond to all customer tickets within 24 hours on business days.</p>
          </div>
        </div>

        {/* Contact / Ticket Submission Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 border border-slate-200/40 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <MessageSquare className="w-5 h-5 text-amber-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Submit Support Ticket</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Your Full Name:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sara Al-Otaibi"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address:</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. sara@example.com"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="font-bold text-slate-700 block mb-1">Subject / Inquiry Topic:</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Order #1042 Shipment Delay or Battery Installation Inquiry"
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-xs"
              />
            </div>

            <div className="text-xs">
              <label className="font-bold text-slate-700 block mb-1">Message Details:</label>
              <textarea
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe your question or issue in detail..."
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-xs"
              />
            </div>

            <Button type="submit" disabled={submitting} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2.5 text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20">
              <Send className="w-4 h-4" />
              {submitting ? 'Submitting Ticket...' : 'Send Support Message'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
