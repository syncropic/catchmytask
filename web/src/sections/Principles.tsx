const PRINCIPLES = [
  {
    number: 1,
    name: 'Atoms and Composition',
    description: 'Work items are the fundamental unit. Everything composes from them.',
  },
  {
    number: 2,
    name: 'Actor Agnosticism',
    description: 'No assumption about what kind of entity does the work.',
  },
  {
    number: 3,
    name: 'Events Over State',
    description: 'State derived from events. The event log is source of truth.',
  },
  {
    number: 4,
    name: 'Context is King',
    description: 'Work without context is work done wrong. Link everything.',
  },
  {
    number: 5,
    name: 'Async by Default',
    description: 'Synchronous is the exception. Self-describing state.',
  },
  {
    number: 6,
    name: 'Pull Over Push',
    description: 'Actors pull work by capability/capacity. WIP limits prevent overload.',
  },
  {
    number: 7,
    name: 'Progressive Capability',
    description: 'Zero friction to start. Power features are opt-in.',
  },
  {
    number: 8,
    name: 'Files as Foundation',
    description: 'Plain text Markdown+YAML files. Git is history. Everything else is a view.',
  },
  {
    number: 9,
    name: 'Convention Over Configuration',
    description: 'Sensible defaults. Override when needed.',
  },
  {
    number: 10,
    name: 'Timelessness Over Trendiness',
    description: 'Will this still make sense in 20 years?',
  },
]

export function Principles() {
  return (
    <section id="principles" className="py-20 px-6">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">10 Design Principles</h2>
          <p className="text-sm text-text-secondary max-w-2xl mx-auto">
            Distilled from first-principles research into what work management should look like
            in an era of human-AI collaboration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRINCIPLES.map((p) => (
            <div
              key={p.number}
              className="flex gap-4 p-4 bg-bg-secondary border border-border-default rounded-lg hover:border-border-subtle transition-colors"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-bg-tertiary border border-border-default flex items-center justify-center text-xs font-mono text-text-muted">
                {p.number}
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-text-primary">{p.name}</h3>
                <p className="text-xs text-text-muted leading-relaxed">{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
