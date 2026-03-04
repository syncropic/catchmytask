export function Footer() {
  return (
    <footer className="py-10 px-6 border-t border-border-default">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-xs text-text-muted">
          &copy; {new Date().getFullYear()} <a href="https://syncropic.com" className="hover:text-text-secondary transition-colors">Syncropic Inc. Public Benefit Corporation</a>
        </span>

        <div className="flex items-center gap-4 text-xs text-text-muted">
          <a href="/docs" className="hover:text-text-secondary transition-colors">Docs</a>
          <span>&middot;</span>
          <a href="https://github.com/syncropic/catchmytask" className="hover:text-text-secondary transition-colors">MIT License</a>
        </div>
      </div>
    </footer>
  )
}
