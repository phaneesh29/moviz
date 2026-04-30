'use client';

import { useState } from 'react';
import { CheckCircle2, MessageSquareText, Send, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-black via-slate-950 to-black text-white">
      <Navbar />

      <main className="flex-1 px-4 pb-16 pt-28 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <div className="mx-auto flex w-full max-w-[100rem] flex-col gap-8">
          <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-2">
              <Badge variant="outline" className="w-fit border-white/12 bg-white/[0.06] text-white/70">
                <MessageSquareText data-icon="inline-start" />
                Feedback
              </Badge>
              <h1 className="font-display text-4xl font-black tracking-normal text-white sm:text-5xl">
                Tell us what to improve
              </h1>
            </div>
            <p className="max-w-md text-sm leading-6 text-white/45">
              Bugs, playback issues, layout problems, and cleanup ideas are all useful.
            </p>
          </section>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <Card className="border-white/10 bg-black/45 shadow-[0_16px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-black text-white">Send feedback</CardTitle>
                <CardDescription className="text-white/55">
                  Include enough detail to reproduce the issue when possible.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-2 text-sm font-semibold text-white/80">
                      Name *
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="h-12 rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm font-medium text-white shadow-inner shadow-white/[0.03] outline-none transition-all placeholder:text-white/32 focus:border-white/22 focus:bg-white/[0.08]"
                        placeholder="Your name"
                      />
                    </label>

                    <label className="flex flex-col gap-2 text-sm font-semibold text-white/80">
                      Email *
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="h-12 rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm font-medium text-white shadow-inner shadow-white/[0.03] outline-none transition-all placeholder:text-white/32 focus:border-white/22 focus:bg-white/[0.08]"
                        placeholder="you@example.com"
                      />
                    </label>
                  </div>

                  <label className="flex flex-col gap-2 text-sm font-semibold text-white/80">
                    Subject
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="h-12 rounded-2xl border border-white/10 bg-white/[0.055] px-4 text-sm font-medium text-white shadow-inner shadow-white/[0.03] outline-none transition-all placeholder:text-white/32 focus:border-white/22 focus:bg-white/[0.08]"
                      placeholder="What is this about?"
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-sm font-semibold text-white/80">
                    Message *
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={8}
                      className="resize-none rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm font-medium leading-6 text-white shadow-inner shadow-white/[0.03] outline-none transition-all placeholder:text-white/32 focus:border-white/22 focus:bg-white/[0.08]"
                      placeholder="Tell us what happened, what felt off, or what you would like improved."
                    />
                  </label>

                  {success ? (
                    <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-200">
                      <CheckCircle2 className="shrink-0" />
                      Thank you. Your feedback has been sent.
                    </div>
                  ) : null}

                  {error ? (
                    <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200">
                      {error}
                    </div>
                  ) : null}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-12 rounded-2xl bg-white font-semibold text-black hover:bg-white/90 disabled:bg-white/[0.08] disabled:text-white/30"
                  >
                    {loading ? (
                      <Skeleton className="h-4 w-12 bg-black/20" />
                    ) : (
                      <Send data-icon="inline-start" />
                    )}
                    {loading ? 'Sending...' : 'Send feedback'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/[0.035] shadow-[0_12px_34px_rgba(0,0,0,0.24)] backdrop-blur-xl">
              <CardHeader>
                <Badge className="mb-2 w-fit bg-white/[0.07] text-white/68">
                  <Sparkles data-icon="inline-start" />
                  Helpful details
                </Badge>
                <CardTitle className="text-2xl font-black text-white">What helps most</CardTitle>
                <CardDescription className="leading-6 text-white/55">
                  Short, specific reports are easiest to fix.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {[
                  'The page or title where it happened.',
                  'What you expected to happen.',
                  'What actually happened.',
                  'Device or browser if it seems layout-related.',
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm leading-6 text-white/62">
                    {item}
                  </div>
                ))}
                <Separator className="bg-white/10" />
                <p className="text-xs leading-5 text-white/38">
                  Your message is sent through the Vidoza feedback endpoint.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
