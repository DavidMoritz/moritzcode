export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/5 bg-white/5 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-3 text-sm text-slate-400 sm:flex-row">
          <span>&copy; {new Date().getFullYear()} David Moritz</span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/DavidMoritz"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-slate-200"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/davidmoritz"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-slate-200"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
