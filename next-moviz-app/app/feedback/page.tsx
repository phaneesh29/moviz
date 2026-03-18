'use client';

import { useState } from 'react';
import { MessageSquareText, Send } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { apiClient } from '@/lib/api-client';

interface FeedbackResponse {
  message: string;
}

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiClient.post<FeedbackResponse>('/feedback', formData);
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSuccess(false), 4000);
    } catch (submissionError) {
      console.error('Feedback submission failed:', submissionError);
      setError('We could not send your feedback right now. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell min-h-screen text-white">
      <Navbar />

      <main className="page-container pb-20">
        <div className="page-hero mb-8 p-6 md:p-8">
          <div className="relative z-10 max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-[#ff6a3d]/25 bg-[#230807]/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#ffb088]">
              <MessageSquareText size={14} />
              Feedback channel
            </div>
            <h1 className="text-4xl md:text-5xl">Help shape Vidoza</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-300 md:text-base">
              Share bugs, UI issues, playback problems, or ideas. We kept this page in the same premium theme so it feels like part of the app, not an afterthought.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <form onSubmit={handleSubmit} className="cinema-panel rounded-[28px] p-6 md:p-8">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-white">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="surface-card w-full rounded-xl px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-[#e50914]"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-white">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="surface-card w-full rounded-xl px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-[#e50914]"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-white">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="surface-card w-full rounded-xl px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-[#e50914]"
                placeholder="What is this about?"
              />
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-white">Message *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={8}
                className="surface-card w-full resize-none rounded-xl px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-[#e50914]"
                placeholder="Tell us what happened, what felt off, or what you would like improved."
              />
            </div>

            {success && (
              <div className="mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/12 px-4 py-3 text-sm text-emerald-300">
                Thank you. Your feedback has been sent successfully.
              </div>
            )}

            {error && (
              <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/12 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="accent-button mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Send size={18} />
              )}
              {loading ? 'Sending...' : 'Send feedback'}
            </button>
          </form>

          <aside className="cinema-panel rounded-[28px] p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-white/40">Best feedback</p>
            <h2 className="mt-3 text-2xl text-white">What helps most</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-neutral-300">
              <div className="surface-card rounded-2xl p-4">
                Include the page where the issue happened.
              </div>
              <div className="surface-card rounded-2xl p-4">
                Mention what you expected and what actually happened.
              </div>
              <div className="surface-card rounded-2xl p-4">
                UI feedback is welcome too, especially around clutter or layout shifts.
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
