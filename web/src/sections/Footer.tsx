export function Footer() {
  return (
    <footer className="py-10 px-6 border-t border-border-default">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
            C
          </div>
          <span className="text-xs text-text-secondary">CatchMyTask</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-text-muted">
          <span>&copy; {new Date().getFullYear()} <a href="https://syncropic.com" className="hover:text-text-secondary transition-colors">Syncropic</a></span>
          <span>&middot;</span>
          <span>Open Source</span>
        </div>
      </div>
    </footer>
  )
}
