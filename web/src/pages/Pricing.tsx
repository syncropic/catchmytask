import { useState } from 'react'
import { Navigation } from '@/sections/Navigation'
import { Footer } from '@/sections/Footer'

type Interval = 'monthly' | 'annual'

const TIERS = [
  {
    name: 'Community',
    tagline: 'For individuals and open-source projects',
    price: { monthly: 0, annual: 0 },
    cta: 'Get Started Free',
    ctaHref: '/app',
    highlight: false,
    features: [
      { name: '21 CLI commands', available: true },
      { name: 'Unlimited work items', available: true },
      { name: 'Configurable state machines', available: true },
      { name: 'SQLite full-text search', available: true },
      { name: 'Git-native audit trail', available: true },
      { name: 'Web UI (all 7 views)', available: true },
      { name: 'Command Bar & Terminal', available: true },
      { name: 'Artifact system & previews', available: true },
      { name: 'Dark/light mode', available: true },
      { name: 'JSON output for scripting', available: true },
      { name: 'Agent discovery system', available: true },
      { name: 'Multi-project registry', available: true },
      { name: 'Shell completions', available: true },
      { name: 'Self-hosted (it\'s just files)', available: true },
      { name: 'Community support', available: true },
    ],
  },
  {
    name: 'Team',
    tagline: 'For teams with humans and AI agents working together',
    price: null,
    cta: 'Coming Soon',
    ctaHref: null,
    highlight: true,
    features: [
      { name: 'Everything in Community, plus:', available: true, isHeader: true },
      { name: 'API authentication (JWT + API keys)', available: true, comingSoon: true },
      { name: 'Comments & discussions on items', available: true, comingSoon: true },
      { name: 'Webhooks (outbound events)', available: true, comingSoon: true },
      { name: 'GitHub / GitLab integration', available: true, comingSoon: true },
      { name: 'MCP server for AI agents', available: true, comingSoon: true },
      { name: 'Team dashboards & shared views', available: true, comingSoon: true },
      { name: 'Saved views & filters', available: true, comingSoon: true },
      { name: 'Notifications & reminders', available: true, comingSoon: true },
      { name: 'Bulk operations', available: true, comingSoon: true },
      { name: 'Work item templates', available: true, comingSoon: true },
      { name: 'Slack integration', available: true, comingSoon: true },
      { name: 'Import from Jira / Linear', available: true, comingSoon: true },
      { name: 'Email support', available: true, comingSoon: true },
    ],
  },
  {
    name: 'Enterprise',
    tagline: 'For organizations governing AI agents at scale',
    price: null,
    cta: 'Contact Sales',
    ctaHref: 'mailto:sales@syncropic.com',
    highlight: false,
    features: [
      { name: 'Everything in Team, plus:', available: true, isHeader: true },
      { name: 'SSO (SAML 2.0, OIDC)', available: true, comingSoon: true },
      { name: 'SCIM user provisioning', available: true, comingSoon: true },
      { name: 'Role-based access control (RBAC)', available: true, comingSoon: true },
      { name: 'Agent Registry & governance', available: true, comingSoon: true },
      { name: 'Agent approval workflows', available: true, comingSoon: true },
      { name: 'Agent kill switch', available: true, comingSoon: true },
      { name: 'Structured audit logging', available: true, comingSoon: true },
      { name: 'Advanced analytics & reporting', available: true, comingSoon: true },
      { name: 'Data residency controls', available: true, comingSoon: true },
      { name: 'Custom fields', available: true, comingSoon: true },
      { name: 'SOC 2 Type II compliance', available: true, comingSoon: true },
      { name: 'Priority support & SLA', available: true, comingSoon: true },
      { name: 'Dedicated account manager', available: true, comingSoon: true },
    ],
  },
]

interface Feature {
  name: string
  available: boolean
  comingSoon?: boolean
  isHeader?: boolean
}

type CellVal = boolean | 'soon'

interface ComparisonFeature {
  name: string
  community: CellVal
  team: CellVal
  enterprise: CellVal
}

const COMPARISON_CATEGORIES: { category: string; features: ComparisonFeature[] }[] = [
  {
    category: 'Core Work Management',
    features: [
      { name: 'Work item creation & editing', community: true, team: true, enterprise: true },
      { name: 'Configurable state machines', community: true, team: true, enterprise: true },
      { name: 'Full-text search (SQLite FTS5)', community: true, team: true, enterprise: true },
      { name: 'Multi-project support', community: true, team: true, enterprise: true },
      { name: 'Artifact system & previews', community: true, team: true, enterprise: true },
      { name: 'Work item templates', community: true, team: 'soon', enterprise: 'soon' },
      { name: 'Custom fields', community: false, team: false, enterprise: 'soon' },
      { name: 'Bulk operations', community: false, team: 'soon', enterprise: 'soon' },
    ],
  },
  {
    category: 'Interface',
    features: [
      { name: 'CLI (21 commands)', community: true, team: true, enterprise: true },
      { name: 'Web UI (7 views)', community: true, team: true, enterprise: true },
      { name: 'Command Bar & Terminal', community: true, team: true, enterprise: true },
      { name: 'Dark/light mode', community: true, team: true, enterprise: true },
      { name: 'Keyboard shortcuts', community: true, team: true, enterprise: true },
      { name: 'ARIA accessibility', community: true, team: true, enterprise: true },
      { name: 'Mobile responsive', community: true, team: true, enterprise: true },
    ],
  },
  {
    category: 'AI Agent Support',
    features: [
      { name: 'Actor-agnostic data model', community: true, team: true, enterprise: true },
      { name: 'CMT_ACTOR identity tracking', community: true, team: true, enterprise: true },
      { name: 'Agent discovery system (4 tiers)', community: true, team: true, enterprise: true },
      { name: 'JSON output on all commands', community: true, team: true, enterprise: true },
      { name: 'MCP server', community: false, team: 'soon', enterprise: 'soon' },
      { name: 'Agent Registry', community: false, team: false, enterprise: 'soon' },
      { name: 'Agent policies & guardrails', community: false, team: false, enterprise: 'soon' },
      { name: 'Agent approval workflows', community: false, team: false, enterprise: 'soon' },
      { name: 'Agent kill switch', community: false, team: false, enterprise: 'soon' },
      { name: 'Agent analytics & metrics', community: false, team: false, enterprise: 'soon' },
    ],
  },
  {
    category: 'Collaboration',
    features: [
      { name: 'Git-native history', community: true, team: true, enterprise: true },
      { name: 'Comments & discussions', community: false, team: 'soon', enterprise: 'soon' },
      { name: 'Notifications & reminders', community: false, team: 'soon', enterprise: 'soon' },
      { name: 'Team dashboards', community: false, team: 'soon', enterprise: 'soon' },
      { name: 'Saved views & filters', community: false, team: 'soon', enterprise: 'soon' },
      { name: 'Webhooks', community: false, team: 'soon', enterprise: 'soon' },
    ],
  },
  {
    category: 'Integrations',
    features: [
      { name: 'Shell completions (bash/zsh/fish)', community: true, team: true, enterprise: true },
      { name: 'Claude Code skill', community: true, team: true, enterprise: true },
      { name: 'GitHub / GitLab integration', community: false, team: 'soon', enterprise: 'soon' },
      { name: 'Slack integration', community: false, team: 'soon', enterprise: 'soon' },
      { name: 'Import from Jira / Linear', community: false, team: 'soon', enterprise: 'soon' },
      { name: 'Data warehouse export', community: false, team: false, enterprise: 'soon' },
    ],
  },
  {
    category: 'Security & Compliance',
    features: [
      { name: 'Self-hosted deployment', community: true, team: true, enterprise: true },
      { name: 'Git audit trail', community: true, team: true, enterprise: true },
      { name: 'API authentication', community: false, team: 'soon', enterprise: 'soon' },
      { name: 'SSO (SAML 2.0, OIDC)', community: false, team: false, enterprise: 'soon' },
      { name: 'SCIM provisioning', community: false, team: false, enterprise: 'soon' },
      { name: 'RBAC (custom roles)', community: false, team: false, enterprise: 'soon' },
      { name: 'Structured audit logging', community: false, team: false, enterprise: 'soon' },
      { name: 'Data residency controls', community: false, team: false, enterprise: 'soon' },
      { name: 'SOC 2 Type II', community: false, team: false, enterprise: 'soon' },
      { name: 'IP allowlisting', community: false, team: false, enterprise: 'soon' },
    ],
  },
  {
    category: 'Support',
    features: [
      { name: 'Community support (GitHub)', community: true, team: true, enterprise: true },
      { name: 'Email support', community: false, team: 'soon', enterprise: 'soon' },
      { name: 'Priority support & SLA', community: false, team: false, enterprise: 'soon' },
      { name: 'Dedicated account manager', community: false, team: false, enterprise: 'soon' },
      { name: 'Custom integrations', community: false, team: false, enterprise: 'soon' },
    ],
  },
]

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-green-400 flex-shrink-0">
      <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DashIcon() {
  return <span className="text-text-muted/40 text-sm">--</span>
}

function SoonBadge() {
  return (
    <span className="text-[9px] font-medium uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded-full">
      Soon
    </span>
  )
}

function CellValue({ value }: { value: boolean | 'soon' }) {
  if (value === true) return <CheckIcon />
  if (value === 'soon') return <SoonBadge />
  return <DashIcon />
}

function FeatureRow({ feature, isLast }: { feature: Feature; isLast: boolean }) {
  if (feature.isHeader) {
    return (
      <li className="text-xs font-semibold text-text-primary pt-1">
        {feature.name}
      </li>
    )
  }

  return (
    <li className={`flex items-start gap-2.5 text-xs ${!isLast ? '' : ''}`}>
      {feature.comingSoon ? (
        <SoonBadge />
      ) : (
        <CheckIcon />
      )}
      <span className={feature.comingSoon ? 'text-text-muted' : 'text-text-secondary'}>
        {feature.name}
      </span>
    </li>
  )
}

function TierCard({ tier, interval }: { tier: typeof TIERS[number]; interval: Interval }) {
  const price = tier.price ? (interval === 'annual' ? tier.price.annual : tier.price.monthly) : null
  const isFree = price === 0

  return (
    <div
      className={`flex flex-col rounded-xl border p-6 transition-colors ${
        tier.highlight
          ? 'border-accent bg-accent/5 ring-1 ring-accent/20'
          : 'border-border-default bg-bg-secondary'
      }`}
    >
      {/* Header */}
      <div className="space-y-2 mb-6">
        {tier.highlight && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-accent-text bg-accent/10 px-2 py-0.5 rounded-full">
            Most Popular
          </span>
        )}
        <h3 className="text-lg font-bold text-text-primary">{tier.name}</h3>
        <p className="text-xs text-text-muted leading-relaxed">{tier.tagline}</p>
      </div>

      {/* Price */}
      <div className="mb-6">
        {isFree ? (
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-text-primary">Free</span>
            <span className="text-xs text-text-muted">forever</span>
          </div>
        ) : price != null ? (
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-text-primary">${price}</span>
            <span className="text-xs text-text-muted">/ user / month</span>
          </div>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-text-muted">Coming Soon</span>
          </div>
        )}
        {price != null && !isFree && interval === 'annual' && (
          <p className="text-[10px] text-text-muted mt-1">
            Billed annually (${price * 12}/user/year)
          </p>
        )}
      </div>

      {/* CTA */}
      {tier.ctaHref ? (
        <a
          href={tier.ctaHref}
          className={`block text-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors mb-6 ${
            tier.highlight
              ? 'bg-accent text-white hover:bg-accent-hover'
              : 'bg-bg-tertiary border border-border-default text-text-secondary hover:bg-bg-hover'
          }`}
        >
          {tier.cta}
        </a>
      ) : (
        <button
          disabled
          className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-medium bg-bg-tertiary border border-border-default text-text-muted cursor-not-allowed mb-6"
        >
          {tier.cta}
        </button>
      )}

      {/* Features */}
      <ul className="space-y-2.5 flex-1">
        {tier.features.map((f, i) => (
          <FeatureRow key={f.name} feature={f} isLast={i === tier.features.length - 1} />
        ))}
      </ul>
    </div>
  )
}

function FAQ() {
  const faqs = [
    {
      q: 'Is the Community edition really free forever?',
      a: 'Yes. The Community edition is open source (MIT license) and will always be free. All 21 CLI commands, the full web UI with 7 views, configurable state machines, the artifact system, and basic AI agent support are included. We believe the core product should be genuinely useful, not crippled.',
    },
    {
      q: 'What\'s the difference between CMT_ACTOR and Agent Registry?',
      a: 'CMT_ACTOR is a free, open-source feature that lets any agent identify itself in event logs. The Agent Registry (Enterprise) is a centralized catalog with permissions, capability declarations, policies, approval workflows, and kill switches -- the governance layer enterprises need for compliance.',
    },
    {
      q: 'Can I self-host the Team or Enterprise tiers?',
      a: 'Yes. CatchMyTask is file-first by design. All tiers run on your infrastructure -- there is no cloud dependency. The Team and Enterprise tiers add features (authentication, RBAC, governance) on top of the same self-hosted architecture.',
    },
    {
      q: 'How does CatchMyTask compare to Jira or Linear?',
      a: 'Jira and Linear are cloud-first tools designed for human teams. CatchMyTask is file-first and agent-native -- built from the ground up for teams where AI agents and humans work side by side. Your work items are plain text files tracked by git, not rows in someone else\'s database.',
    },
    {
      q: 'Why should I care about AI agent governance?',
      a: 'The EU AI Act takes effect August 2026. Organizations deploying AI agents in work processes need audit trails, approval workflows, and compliance documentation. CatchMyTask\'s git-backed architecture provides agent traceability by design, and the Enterprise tier adds the governance controls enterprises require.',
    },
    {
      q: 'When will Team and Enterprise features be available?',
      a: 'We\'re building in public. The essential features (API auth, comments, webhooks, GitHub integration, MCP server) are actively in development. Enterprise features (SSO, RBAC, agent governance) follow. Star the GitHub repo and watch for updates.',
    },
  ]

  return (
    <section className="py-20 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <h2 className="text-2xl md:text-3xl font-bold text-text-primary text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map(({ q, a }) => (
            <details
              key={q}
              className="group border border-border-default rounded-lg bg-bg-secondary"
            >
              <summary className="px-4 py-3 text-sm font-medium text-text-primary cursor-pointer select-none hover:bg-bg-hover transition-colors rounded-lg list-none flex items-center justify-between">
                {q}
                <span className="text-text-muted text-xs ml-2 group-open:rotate-180 transition-transform">&#9662;</span>
              </summary>
              <div className="px-4 pb-3 text-xs text-text-secondary leading-relaxed">
                {a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

export function PricingPage() {
  const [interval, setInterval] = useState<Interval>('annual')

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-12 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
            Simple, transparent pricing
          </h1>
          <p className="text-sm text-text-secondary max-w-xl mx-auto leading-relaxed">
            Start free with the full open-source CLI and web UI.
            Upgrade when your team needs collaboration, integrations, or enterprise governance.
          </p>

          {/* Interval toggle */}
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setInterval('monthly')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                interval === 'monthly'
                  ? 'bg-bg-tertiary text-text-primary border border-border-default'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setInterval('annual')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                interval === 'annual'
                  ? 'bg-bg-tertiary text-text-primary border border-border-default'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Annual
              <span className="ml-1.5 text-green-400 text-[10px]">Save 15%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Tier cards */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIERS.map((tier) => (
            <TierCard key={tier.name} tier={tier} interval={interval} />
          ))}
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-20 px-6 bg-bg-secondary">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
              Compare plans in detail
            </h2>
            <p className="text-sm text-text-secondary">
              See exactly what's included in each tier.
            </p>
          </div>

          <div className="overflow-x-auto border border-border-default rounded-xl bg-bg-primary">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border-default bg-bg-tertiary">
                  <th className="text-left px-4 py-3 font-semibold text-text-secondary w-[40%]">Feature</th>
                  <th className="text-center px-4 py-3 font-semibold text-text-secondary">Community</th>
                  <th className="text-center px-4 py-3 font-semibold text-accent-text">Team</th>
                  <th className="text-center px-4 py-3 font-semibold text-text-secondary">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_CATEGORIES.map((cat) => (
                  <>
                    <tr key={cat.category}>
                      <td
                        colSpan={4}
                        className="px-4 py-2.5 font-semibold text-text-primary bg-bg-secondary border-t border-border-default text-[11px] uppercase tracking-wider"
                      >
                        {cat.category}
                      </td>
                    </tr>
                    {cat.features.map((f) => (
                      <tr key={f.name} className="border-t border-border-subtle hover:bg-bg-hover transition-colors">
                        <td className="px-4 py-2 text-text-secondary">{f.name}</td>
                        <td className="px-4 py-2 text-center"><CellValue value={f.community} /></td>
                        <td className="px-4 py-2 text-center"><CellValue value={f.team} /></td>
                        <td className="px-4 py-2 text-center"><CellValue value={f.enterprise} /></td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
            Start building with CatchMyTask today
          </h2>
          <p className="text-sm text-text-secondary max-w-xl mx-auto">
            The Community edition is free forever. Install the CLI, launch the web UI,
            or try it right in your browser -- no account needed.
          </p>
          <div className="flex items-center justify-center gap-3">
            <a
              href="/app"
              className="px-6 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
            >
              Try in Browser
            </a>
            <a
              href="/#install"
              className="px-6 py-2.5 bg-bg-tertiary border border-border-default text-text-secondary rounded-lg text-sm hover:bg-bg-hover transition-colors"
            >
              Install CLI
            </a>
          </div>
        </div>
      </section>

      <FAQ />
      <Footer />
    </div>
  )
}
