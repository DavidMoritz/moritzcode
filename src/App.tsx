import { Link, Outlet, useLocation } from '@tanstack/react-router'
import { useState } from 'react'
import Footer from './components/Footer'
import ParticleConstellation from './components/ParticleConstellation'

const navLinks = [
  { to: '/' as const, label: 'Home' },
  { to: '/about' as const, label: 'About' },
  { to: '/contact' as const, label: 'Contact' },
]

function AppLayout() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <ParticleConstellation />
      <header className="relative z-10 border-b border-white/5 bg-white/5 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="group inline-flex items-center gap-2 text-lg font-semibold">
            <span className="h-2 w-2 rounded-full bg-blue-400 transition group-hover:scale-125" />
            moritzcode
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-md p-2 text-slate-300 hover:bg-white/10 sm:hidden"
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <nav className="hidden items-center gap-1 text-sm font-medium text-slate-200 sm:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-full px-3 py-1.5 transition hover:bg-white/10 hover:text-white ${
                  location.pathname === link.to ? 'bg-white/10 text-white' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {menuOpen && (
          <nav className="border-t border-white/5 px-4 py-3 sm:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`block rounded-md px-3 py-2 text-sm font-medium transition hover:bg-white/10 ${
                  location.pathname === link.to ? 'bg-white/10 text-white' : 'text-slate-200'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default AppLayout
