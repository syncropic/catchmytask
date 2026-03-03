const PROPS = [
  {
    icon: '\u{1F4C4}',
    title: 'Plain Text Files',
    description:
      'Work items are Markdown files with YAML frontmatter. Read and edit them in any text editor. No proprietary format, no database server.',
  },
  {
    icon: '\u{1F500}',
    title: 'Git-Native',
    description:
      'Git is your history layer. Every change is a commit. Branch, merge, and diff your work items like code.',
  },
  {
    icon: '\u{1F916}',
    title: 'Agent-First',
    description:
      'Humans, AI agents, scripts, and CI systems are all first-class actors. No assumption about what kind of entity does the work.',
  },
  {
    icon: '\u{26A1}',
    title: 'Single Binary',
    description:
      'Written in Rust. One binary, cold start under 10ms, cross-platform. Zero dependencies to install.',
  },
]

export function ValueProps() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PROPS.map((prop) => (
            <div
              key={prop.title}
              className="bg-bg-secondary border border-border-default rounded-lg p-5 space-y-3 hover:border-border-subtle transition-colors"
            >
              <div className="text-2xl">{prop.icon}</div>
              <h3 className="text-sm font-semibold text-text-primary">{prop.title}</h3>
              <p className="text-xs text-text-muted leading-relaxed">{prop.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
