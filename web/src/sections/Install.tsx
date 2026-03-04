export function Install() {
  return (
    <section id="install" className="py-20 px-6">
      <div className="max-w-3xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Install</h2>
          <p className="text-sm text-text-secondary">
            One binary. No dependencies. Under 10ms cold start.
          </p>
        </div>

        <div className="space-y-4">
          {/* Quick install */}
          <div className="bg-bg-secondary border border-border-default rounded-lg p-4 space-y-2">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Quick install (Linux / macOS)
            </h3>
            <pre className="text-xs font-mono text-green-400 bg-bg-primary rounded p-3 overflow-x-auto">
              curl -fsSL https://get.syncropic.com/cmt | sh
            </pre>
          </div>

          {/* From source */}
          <div className="bg-bg-secondary border border-border-default rounded-lg p-4 space-y-2">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              From source
            </h3>
            <pre className="text-xs font-mono text-green-400 bg-bg-primary rounded p-3 overflow-x-auto">
              cargo install --git https://github.com/syncropic/catchmytask.git
            </pre>
          </div>

          {/* Quick start */}
          <div className="bg-bg-secondary border border-border-default rounded-lg p-4 space-y-2">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Quick start
            </h3>
            <pre className="text-xs font-mono text-green-400 bg-bg-primary rounded p-3 overflow-x-auto leading-relaxed">
{`$ cmt init
$ cmt add "My first task" --priority high
$ cmt list
$ cmt serve  # Launch web UI`}
            </pre>
          </div>

          {/* Browser */}
          <div className="bg-blue-950/50 border border-blue-800/50 rounded-lg p-4 space-y-2">
            <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Or just use the browser
            </h3>
            <p className="text-xs text-text-secondary">
              No installation needed. The web app runs entirely in your browser with IndexedDB
              for persistence. Export to .cmt/ zips when you're ready to switch to the CLI.
            </p>
            <a
              href="/app"
              className="inline-block mt-2 px-4 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-500 transition-colors"
            >
              Open App
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
