import React, { useState, useEffect } from 'react'
import { X, Send, Loader2, MessageSquare } from 'lucide-react'
import { useToast } from './Toast'
import axiosInstance from '../utils/axios'

const FeedbackModal = () => {
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)

  // Show modal on page load (once per session)
  useEffect(() => {
    const alreadyShown = sessionStorage.getItem('feedbackModalShown')
    if (!alreadyShown) {
      const timer = setTimeout(() => {
        setOpen(true)
        sessionStorage.setItem('feedbackModalShown', 'true')
      }, 1500) // slight delay so the page loads first
      return () => clearTimeout(timer)
    }
  }, [])

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
      setOpen(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Try again later.')
    } finally {
      setSending(false)
    }
  }

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const inputClass =
    'w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all duration-200'

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={() => setOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-[#111111] border border-white/10 rounded-2xl shadow-2xl shadow-purple-500/10 animate-[fadeInUp_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="mx-auto w-10 h-10 flex items-center justify-center rounded-full bg-purple-500/10 mb-2">
              <MessageSquare size={20} className="text-purple-400" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              We'd love your feedback!
            </h2>
            <p className="text-gray-400 text-xs">
              Help us improve Vidoza — share a suggestion, report a bug, or just say hi.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="modal-name" className="block text-xs font-medium text-gray-400 mb-1">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="modal-name"
                  name="name"
                  type="text"
                  required
                  placeholder="Your name"
                  value={form.name}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="modal-email" className="block text-xs font-medium text-gray-400 mb-1">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  id="modal-email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="modal-subject" className="block text-xs font-medium text-gray-400 mb-1">
                Subject
              </label>
              <input
                id="modal-subject"
                name="subject"
                type="text"
                placeholder="Optional subject"
                value={form.subject}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="modal-message" className="block text-xs font-medium text-gray-400 mb-1">
                Message <span className="text-red-400">*</span>
              </label>
              <textarea
                id="modal-message"
                name="message"
                rows={3}
                required
                placeholder="What's on your mind?"
                value={form.message}
                onChange={handleChange}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 rounded-lg border border-white/10 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                Maybe later
              </button>
              <button
                type="submit"
                disabled={sending}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {sending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Keyframe animation */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}

export default FeedbackModal
