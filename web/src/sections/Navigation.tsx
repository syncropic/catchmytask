import { useThemeStore } from '@/stores/theme'

function ThemeToggle() {
  const { resolved, toggle } = useThemeStore()

  function handleToggle() {
    document.documentElement.classList.add('transitioning')
    toggle()
    setTimeout(() => document.documentElement.classList.remove('transitioning'), 300)
  }

  return (
    <button
      onClick={handleToggle}
      className="w-8 h-8 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
      title={`Switch to ${resolved === 'dark' ? 'light' : 'dark'} mode`}
    >
      {resolved === 'dark' ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="8" r="3.5" />
          <path d="M8 1.5v1M8 13.5v1M2.87 2.87l.7.7M12.43 12.43l.7.7M1.5 8h1M13.5 8h1M2.87 13.13l.7-.7M12.43 3.57l.7-.7" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13.5 8.5a5.5 5.5 0 1 1-6-6 4.5 4.5 0 0 0 6 6z" />
        </svg>
      )}
    </button>
  )
}

export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-primary border-b border-border-subtle">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
        <a href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-accent flex items-center justify-center text-white text-xs font-bold">
            C
          </div>
          <span className="font-semibold text-text-primary text-sm">CatchMyTask</span>
        </a>

        <div className="hidden md:flex items-center gap-6 text-xs text-text-secondary">
          <a href="/#features" className="hover:text-text-primary transition-colors">Features</a>
          <a href="/#how-it-works" className="hover:text-text-primary transition-colors">How It Works</a>
          <a href="/#principles" className="hover:text-text-primary transition-colors">Principles</a>
          <a href="/#install" className="hover:text-text-primary transition-colors">Install</a>
          <a href="/docs" className="hover:text-text-primary transition-colors">Docs</a>
          <a href="https://github.com/syncropic/catchmytask" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors">GitHub</a>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href="/app"
            className="px-4 py-1.5 bg-accent text-white rounded text-xs font-medium hover:bg-accent-hover transition-colors"
          >
            Launch App
          </a>
        </div>
      </div>
    </nav>
  )
}
