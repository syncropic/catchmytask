export function Hero() {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bg-tertiary border border-border-default text-xs text-text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-status-active animate-pulse" />
          Open source &middot; Local-first &middot; v0.1.1
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary leading-tight tracking-tight">
          Work management for
          <br />
          <span className="text-accent-text">
            humans and AI agents
          </span>
        </h1>

        <p className="text-base md:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
          A ground-up rethinking of how work is captured, organized, and executed
          when your team includes autonomous AI agents working alongside humans.
          Plain text files. Git-native. Zero vendor lock-in.
        </p>

        <div className="flex items-center justify-center gap-3 pt-4">
          <a
            href="/app"
            className="px-6 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            Try in Browser
          </a>
          <a
            href="#install"
            className="px-6 py-2.5 bg-bg-tertiary border border-border-default text-text-secondary rounded-lg text-sm hover:bg-bg-hover transition-colors"
          >
            Install CLI
          </a>
        </div>

        <p className="text-xs text-text-muted pt-2">
          No account needed. Runs entirely in your browser with IndexedDB.
        </p>
      </div>
    </section>
  )
}
