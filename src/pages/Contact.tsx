import { useState } from 'react'
import type { FormEvent } from 'react'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const name = data.get('name') as string
    const email = data.get('email') as string
    const message = data.get('message') as string

    const subject = encodeURIComponent(`Contact from ${name}`)
    const body = encodeURIComponent(`From: ${name} (${email})\n\n${message}`)
    window.location.href = `mailto:david@moritzcode.com?subject=${subject}&body=${body}`
    setSubmitted(true)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white sm:text-4xl">Get in Touch</h1>
      <p className="mt-3 max-w-xl text-slate-400">
        Have a project idea or just want to say hello? Fill out the form below and I'll get back to you.
      </p>

      {submitted ? (
        <div className="mt-8 rounded-xl border border-green-400/20 bg-green-400/10 p-6 text-center">
          <p className="text-lg font-medium text-green-300">
            Your email client should have opened with the message. Thanks for reaching out!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 max-w-lg space-y-5">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-300">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-slate-300">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              placeholder="Tell me about your project or idea..."
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-blue-500 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-400"
          >
            Send Message
          </button>
        </form>
      )}
    </div>
  )
}
