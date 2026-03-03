export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-border-subtle">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            C
          </div>
          <span className="font-semibold text-text-primary text-sm">CatchMyTask</span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs text-text-secondary">
          <a href="#features" className="hover:text-text-primary transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-text-primary transition-colors">How It Works</a>
          <a href="#principles" className="hover:text-text-primary transition-colors">Principles</a>
          <a href="#install" className="hover:text-text-primary transition-colors">Install</a>
        </div>

        <a
          href="/app"
          className="px-4 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-500 transition-colors"
        >
          Launch App
        </a>
      </div>
    </nav>
  )
}
