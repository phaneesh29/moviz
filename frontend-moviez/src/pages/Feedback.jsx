import React, { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Seo from '../components/Seo'
import { useToast } from '../components/Toast'
import axiosInstance from '../utils/axios'

const Feedback = () => {
  const toast = useToast()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill in all required fields.')
      return
    }

    setSending(true)
    try {
      const { data } = await axiosInstance.post('/feedback', form)
      toast.success(data.message || 'Feedback sent!')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Try again later.')
    } finally {
      setSending(false)
    }
  }

  const inputClass =
    'w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all duration-200'

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen flex flex-col">
      <Navbar />
      <Seo title="Feedback — Vidoza" description="Send us your feedback, suggestions or bug reports." />

      <main className="flex-1 flex items-center justify-center px-4 md:px-8 py-16">
        <div className="max-w-lg w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Send Feedback
            </h1>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Got a suggestion, found a bug, or just want to say hi? We'd love to hear from you.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-gray-400 mb-1.5">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Your name"
                value={form.name}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-400 mb-1.5">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-xs font-medium text-gray-400 mb-1.5">
                Subject
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                placeholder="Optional subject"
                value={form.subject}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-xs font-medium text-gray-400 mb-1.5">
                Message <span className="text-red-400">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                placeholder="What's on your mind?"
                value={form.message}
                onChange={handleChange}
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send size={18} />
                  Send Feedback
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Feedback
