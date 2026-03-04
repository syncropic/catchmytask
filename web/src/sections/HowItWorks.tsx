export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-6 bg-bg-secondary">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">How It Works</h2>
          <p className="text-sm text-text-secondary max-w-2xl mx-auto">
            Work items are Markdown files with YAML frontmatter. The CLI indexes them in SQLite
            for fast queries. Git tracks every change.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* File format example */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-text-primary">Work Item Format</h3>
            <pre className="bg-bg-primary border border-border-default rounded-lg p-4 text-xs text-text-secondary font-mono overflow-x-auto leading-relaxed">
{`---
id: CMT-0042
title: Implement user authentication
type: task
status: active
priority: high
assignee: alice
tags: [security, backend]
created: 2026-02-15T10:30:00Z
---

## Description
Implement JWT-based authentication.

## Acceptance Criteria
- [ ] Users can log in with email/password
- [ ] Tokens expire after 24 hours`}
            </pre>
          </div>

          {/* CLI examples */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-text-primary">CLI Usage</h3>
            <div className="bg-bg-primary border border-border-default rounded-lg p-4 space-y-4 text-xs font-mono">
              <div>
                <div className="text-text-muted"># Initialize a project</div>
                <div className="text-code">$ cmt init</div>
              </div>
              <div>
                <div className="text-text-muted"># Add a work item</div>
                <div className="text-code">$ cmt add "Fix login timeout bug" -p high -t bug</div>
              </div>
              <div>
                <div className="text-text-muted"># List items by status</div>
                <div className="text-code">$ cmt list --status active</div>
              </div>
              <div>
                <div className="text-text-muted"># Transition status</div>
                <div className="text-code">$ cmt done CMT-0042</div>
              </div>
              <div>
                <div className="text-text-muted"># Search across items</div>
                <div className="text-code">$ cmt search "authentication"</div>
              </div>
              <div>
                <div className="text-text-muted"># Launch web UI</div>
                <div className="text-code">$ cmt serve</div>
              </div>
            </div>
          </div>
        </div>

        {/* Architecture diagram */}
        <div className="bg-bg-primary border border-border-default rounded-lg p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-4 text-center">Architecture</h3>
          <pre className="text-xs text-text-secondary font-mono text-center leading-loose">
{`┌─────────────────────────────────────────────┐
│   Interfaces: CLI · Web · MCP · API         │
├─────────────────────────────────────────────┤
│        File System (.cmt/)                 │
│        Source of truth: Markdown + YAML     │
├─────────────────────────────────────────────┤
│        Git Repository                       │
│        Event history & collaboration        │
├─────────────────────────────────────────────┤
│        SQLite Index (optional)              │
│        Fast queries & search                │
└─────────────────────────────────────────────┘`}
          </pre>
        </div>
      </div>
    </section>
  )
}
