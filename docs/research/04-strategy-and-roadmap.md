# CatchMyTask: Strategic Assessment, Roadmap, and Business Case

**Date**: 2026-03-06
**Status**: Research Complete
**References**:
  - `docs/research/competitive-landscape-2026.md`
  - `docs/research/03-enterprise-and-open-core.md`
  - `docs/research/01-industry-landscape.md`
  - `docs/research/02-first-principles.md`

---

## Executive Summary

CatchMyTask is a production-ready, single-user work management CLI with a polished web UI. It occupies an **uncontested position** at the intersection of three powerful trends: local-first/file-based architecture, developer-first UX, and AI agents as first-class actors. No existing tool combines all three.

The project management software market is $11.27B (2026) growing to $23.09B by 2031 at 15.4% CAGR. The agentic AI market is ~$10B (2026) growing at 43.8% CAGR. CatchMyTask's unique positioning in agent-native work management targets the intersection of these two markets.

This document assesses where CatchMyTask is today, identifies the gaps between current state and market opportunity, defines the essential features needed to reach the next level, outlines an enterprise strategy, and makes the business case for a sustainable open-core company.

---

## Part 1: Where CatchMyTask Is Today

### 1.1 Current Strengths

**Architecture (Genuinely Differentiated)**
- Plain text Markdown + YAML frontmatter -- no vendor lock-in, future-proof, editable in any text editor
- Git as the history layer -- every change is a trackable, auditable commit
- Single Rust binary -- <10ms cold start, zero dependencies, cross-platform
- File-first design means self-hosting is trivial (it's just files in a directory)
- Configurable state machines defined in YAML, validated at runtime

**CLI (Production-Ready)**
- 21 well-designed commands covering all essential workflows
- Full JSON output (`--json`) on every command for agent/script consumption
- SQLite FTS5 indexing for fast full-text search
- Progressive agent discoverability system (4 tiers)
- Shell completions (bash, zsh, fish)
- 162 tests (70 unit + 92 integration)

**Web UI (Polished)**
- 7 views: board, list, dashboard, activity, artifact browser, terminal, settings
- Dual-mode: local-only (IndexedDB, zero install) or connected (`cmt serve`)
- Command Bar (Ctrl+J) -- embedded CLI with autocomplete, history, rich output
- Artifact system -- contained files (evidence, queries, screenshots) with rich inline previews (Markdown, syntax-highlighted code for 20+ languages, data tables, images, PDF)
- Dark/light mode, ARIA accessibility, mobile-responsive layout
- Real-time updates via WebSocket file watcher
- Drag-and-drop Kanban board

**Agent Integration (Novel)**
- Actor-agnostic design -- no distinction between human and AI in the data model
- `CMT_ACTOR` environment variable for identity tracking
- Structured JSON help system for progressive capability discovery
- Platform-specific setup (`cmt setup --claude-code`)
- File-based interface means any agent that can read/write files can participate

### 1.2 What Works Exceptionally Well

| Strength | Why It Matters |
|---|---|
| Zero-to-productive in seconds | `cmt add "Fix the bug"` -- no config, no server, no account |
| Plain text portability | Read items in vim, grep them, pipe to jq, version in git |
| Artifact system | Complex items with contained evidence/queries/handover files -- unique among CLI tools |
| Command Bar + Terminal | Full CLI power in the browser -- copy-paste parity with terminal |
| Agent-first thinking | Every design decision considers "how would an agent interact with this?" |
| Embedded binary | Frontend assets compiled into the Rust binary -- single file deployment |

### 1.3 Honest Assessment: Single-Player Excellence, Multi-Player Gap

CatchMyTask is **best-in-class for a single developer or small team doing independent work with AI agents**. It is not yet equipped for team collaboration, enterprise use, or scale beyond ~500 items per project.

---

## Part 2: The Gaps

### 2.1 Essential Missing Features (Must-Have for Next Level)

These are features whose absence limits CatchMyTask from serving its core audience effectively. They don't require enterprise infrastructure -- they make the open-source product genuinely complete.

| Feature | Why Essential | Effort |
|---|---|---|
| **Comments/discussions on items** | Work items need conversation context. Agents need to leave notes. Humans need to discuss. Without comments, work items are static documents. | 2-3 weeks |
| **Notifications & reminders** | Due dates exist but nothing warns you. No way to know when an item you care about changes. Critical for any workflow beyond solo use. | 2-3 weeks |
| **Webhooks (outbound)** | No way to trigger external actions on item changes. Blocks all integrations (Slack, GitHub, CI/CD, custom). This is the integration foundation. | 1-2 weeks |
| **API pagination** | All items returned in one response. Breaks at ~500 items. Blocks scaling. | 1 week |
| **GitHub/GitLab integration** | Link PRs to items, auto-transition on merge, sync status. This is table-stakes for a developer tool. | 2-3 weeks |
| **Templates (activated)** | `.cmt/templates/` directory exists but isn't wired up. Templates are essential for repeatable work patterns (bug reports, feature specs, investigations). | 1 week |
| **Bulk operations** | No batch status change, no `done CMT-3..CMT-9`, no filter-based bulk edit. Power users and agents need this. | 1-2 weeks |
| **API authentication** | Zero auth on `cmt serve`. Anyone on the network can read/write all items. Blocks any multi-user or exposed deployment. | 1-2 weeks |
| **MCP server** | Currently deferred. But MCP is now the standard for AI agent tool integration (donated to Linux Foundation, backed by Google/Microsoft/AWS). Not having MCP means agents must use the CLI -- higher friction than competitors like Linear that have MCP servers. | 2-3 weeks |
| **Saved views/filters** | No way to save "show me all active high-priority items assigned to agent-1". Essential for dashboard workflows. | 1 week |

**Total estimated effort for essentials: ~15-22 weeks of focused work.**

### 2.2 Good-to-Have Features (Valuable but Not Blocking)

| Feature | Why Valuable | Effort |
|---|---|---|
| Time tracking | Hours/duration logging on items, timesheets. Common request but not core to CatchMyTask's identity. | 2-3 weeks |
| Recurring tasks | Periodic tasks (daily standups, weekly reviews). Useful but can be scripted externally. | 1-2 weeks |
| Custom fields | Extensible metadata beyond the standard schema. Enterprises want this; individuals rarely need it. | 2-3 weeks |
| Gantt/timeline view | Visual timeline of items by due date. Nice for planning but not essential. | 2-3 weeks |
| Sprint/iteration planning | Sprint dates, velocity tracking, burn-down charts. Useful for Scrum teams but CatchMyTask is workflow-agnostic. | 3-4 weeks |
| Undo/redo | Revert last action in web UI. Nice UX but git provides history. | 1-2 weeks |
| Offline PWA | Service worker for offline web UI access. Valuable for mobile. | 2-3 weeks |
| Slack integration | Post updates to channels, create items from Slack. High demand but depends on webhooks first. | 2-3 weeks |
| Import from Jira/Linear | Migration tools to bring existing items into CatchMyTask. Critical for adoption but can be community-driven. | 2-4 weeks |
| Plugin/extension system | Hook scripts or WASM plugins for custom behavior. Powerful but complex to design well. | 4-6 weeks |

### 2.3 The Critical Path

The features that unlock the most value in sequence:

```
1. API auth + pagination          (foundation for everything)
        |
2. Webhooks                       (integration foundation)
        |
3. Comments + notifications       (collaboration foundation)
        |
   +----+----+
   |         |
4a. GitHub   4b. MCP server       (agent & dev integration)
   integration
        |
5. Templates + bulk ops           (power user & agent efficiency)
        |
6. Saved views                    (workflow efficiency)
```

---

## Part 3: Enterprise & Collaborative Features

### 3.1 What Enterprise Means for CatchMyTask

Enterprise features fall into categories that map cleanly to an open-core model:

**Governance & Compliance (Enterprise-Only)**
- SSO (SAML 2.0, OIDC) with Okta/Azure AD/Google integration
- SCIM user provisioning (automated onboarding/offboarding)
- Structured audit logging beyond git (queryable, retention policies, export)
- SOC 2 Type II, ISO 27001, GDPR compliance
- Data residency controls (region-specific storage)
- IP allowlisting and session management

**Access Control (Enterprise-Only)**
- Role-based access control (admin, manager, member, viewer, agent roles)
- Custom role definitions
- Project-level permissions
- Agent-specific permission boundaries

**AI Agent Governance (Enterprise-Only -- CatchMyTask's Unique Differentiator)**
- Agent Registry: central catalog of all agents, capabilities, permissions, owners
- Agent Policies: runtime rules for what agents can/cannot do
- Approval Workflows: configurable human-in-the-loop for agent actions
- Kill Switch: immediately halt any agent's operations
- Agent Analytics: productivity metrics, error rates, cost tracking per agent
- Scope Boundaries: which projects/items an agent can access
- Rate Limiting: prevent agents from overwhelming the system

**Advanced Analytics (Enterprise-Only)**
- Team velocity, cycle time, lead time tracking
- Agent vs human contribution analytics
- Custom dashboards and reports
- Data warehouse export (Snowflake, BigQuery)

**Operations (Enterprise-Only)**
- Priority support with SLA guarantees (<1hr critical response)
- Dedicated account management
- Professional services for custom integrations
- Training and onboarding programs
- High availability deployment options

### 3.2 What Must Change Architecturally

| Current State | Required Change | Approach |
|---|---|---|
| No authentication | Add JWT + API key auth layer | Axum middleware, optional (off by default for OSS) |
| No user model | Add user/team entities | New tables in SQLite, user identified by token |
| Single-writer | Multi-writer coordination | File-level locking + merge on conflict, not OT/CRDT |
| No permissions | RBAC middleware | Check permissions on every API call, deny by default |
| Git-only audit | Structured audit log | Append-only SQLite table alongside git commits |
| No agent registry | Agent entity model | Agents are a type of user with capability declarations |
| WebSocket broadcast | Scoped broadcasts | Only send events the user has permission to see |

**Key architectural principle: All enterprise features are additive, not modifications to the core.**

The open-source core continues to work exactly as it does today -- files, git, SQLite, no auth required. Enterprise features are an optional layer that wraps the core with governance, auth, and analytics. This is the GitLab/Grafana pattern.

### 3.3 How to Implement While Maintaining the Open Core

```
catchmytask/                    # Open source (MIT)
  src/                          # Core CLI + serve
  web/                          # Web UI
  docs/                         # Documentation

catchmytask-enterprise/         # Proprietary (separate repo)
  src/
    auth/                       # SSO, SAML, OIDC, JWT
    rbac/                       # Role-based access control
    audit/                      # Structured audit logging
    agent-governance/           # Registry, policies, kill switch
    analytics/                  # Advanced reporting
    scim/                       # User provisioning
  web/
    enterprise-components/      # Admin panels, governance UI
```

**Build approach:**
- Enterprise binary wraps the core binary (compiles in the OSS crate as a dependency)
- Enterprise features are behind a license key check
- `cmt serve` without a license key = open source behavior
- `cmt serve --license=<key>` = enterprise features activated
- Web UI conditionally renders enterprise components based on API capability detection

---

## Part 4: The Business Case

### 4.1 Is There a Job to Be Done?

**Yes. Three distinct jobs:**

**Job 1: "I need work management that respects my workflow"**
- Target: Individual developers, small teams, open-source maintainers
- Pain: Jira is too heavy, Linear requires cloud, GitHub Issues is too basic
- CatchMyTask advantage: Plain text files, CLI-first, git-native, zero vendor lock-in
- Revenue: $0 (free/open source -- this is the adoption engine)

**Job 2: "I need to manage work across humans and AI agents"**
- Target: Teams using AI coding agents (Claude Code, Cursor, Copilot Workspace, Devin)
- Pain: No existing tool treats agents as first-class workers. Current workarounds are ad-hoc
- CatchMyTask advantage: Actor-agnostic design, agent discoverability, `CMT_ACTOR` tracking
- Revenue: Team tier ($10-15/user/month) -- this is where conversion happens

**Job 3: "I need to govern AI agent work at enterprise scale"**
- Target: Enterprise engineering orgs deploying AI agents (25-500+ developers)
- Pain: No compliance framework for AI agent work. EU AI Act effective Aug 2026. Only 23% of orgs have agent identity strategies. Zero tools offer agent governance built into work management
- CatchMyTask advantage: Git audit trail, state machine enforcement, agent registry, file-based observability
- Revenue: Enterprise tier ($25-40/user/month) -- this is where the business scales

### 4.2 Why Enterprises Will Choose CatchMyTask Over Alternatives

| Alternative | Why CatchMyTask Wins |
|---|---|
| **Jira + AI plugins** | Jira was never designed for agents. Agent governance is bolted on, not built in. CatchMyTask's file-first architecture makes every agent action a git commit -- audit by design, not by plugin. |
| **Linear + MCP** | Linear treats agents as API callers, not team members. No agent registry, no governance, no approval workflows. Linear is cloud-only -- no self-hosting for regulated industries. |
| **GitHub Issues** | GitHub Issues is cloud-dependent, lacks configurable state machines, has no artifact system, and GitHub's Enterprise AI Controls are CI/CD-focused, not work-management-focused. |
| **Build in-house** | Many enterprises will try. Most will fail (only 11% of agentic pilots reach production). CatchMyTask provides a proven foundation they can deploy in hours, not months. |
| **Do nothing** | EU AI Act compliance deadline is August 2026. "Do nothing" becomes illegal for high-risk AI applications. |

### 4.3 Market Sizing

**Bottom-up TAM calculation:**

| Segment | Size | Penetration | Price | Annual Revenue |
|---|---|---|---|---|
| AI-forward dev teams (5-25 people) | ~50,000 teams globally | 0.5% capture (250 teams) | $12/user/month x 15 avg | $5.4M ARR |
| Enterprise engineering orgs (100-500+) | ~10,000 orgs globally | 0.2% capture (20 orgs) | $30/user/month x 200 avg | $14.4M ARR |
| **Total addressable (Year 3)** | | | | **~$20M ARR** |

**Top-down validation:**
- Linear: $100M ARR at $1.25B valuation (12.5x revenue multiple)
- Plane: $700K ARR, early stage, proving open-source PM has market
- PostHog: $20M+ ARR with zero feature gating, pure compliance/support enterprise
- Grafana: $400M+ ARR with 25M free users converting at enterprise level
- Developer tools market growing at 16.12% CAGR

**Revenue milestones:**

| Timeline | Target | How |
|---|---|---|
| Year 1 | 1,000+ OSS users, 10 paying teams | Ship essentials (comments, webhooks, GitHub, MCP). Build community. |
| Year 2 | 5,000+ OSS users, 50 teams, 5 enterprises | Ship enterprise tier (SSO, RBAC, agent governance). First enterprise sales. |
| Year 3 | 15,000+ OSS users, 250 teams, 20 enterprises | ~$20M ARR. Agent governance becomes the category. |

### 4.4 Why This Business Is Sustainable

1. **Structural moat**: Agent-native architecture is hard to retrofit. Jira/Linear would need fundamental redesigns to match CatchMyTask's actor-agnostic data model. The git-as-audit-trail advantage is architectural, not a feature toggle.

2. **Regulatory tailwind**: EU AI Act (Aug 2026), Colorado AI Act (Jun 2026), NIST AI Agent Standards (2026). Compliance requirements create mandatory demand for agent governance tools. This is not optional.

3. **Expanding market**: Agentic AI market growing at 43.8% CAGR. More agents = more governance demand = more CatchMyTask enterprise seats.

4. **Open-source flywheel**: Free OSS product drives adoption (like Grafana's 25M users). Conversion to paid happens at team/enterprise level when governance needs emerge. The product sells itself bottom-up.

5. **Low cost structure**: Rust binary means minimal infrastructure costs. File-first means customers self-host (no cloud to operate). Margins should be 80-90% (comparable to Grafana).

6. **Network effects in agent governance**: Once an enterprise standardizes on CatchMyTask for agent governance, switching costs are high (audit history, agent policies, compliance configurations). This creates retention.

---

## Part 5: Competitive Positioning

### 5.1 Positioning Matrix

```
                           Agent-Agnostic          Agent-Native
                           (humans only)      (agents = first-class)
                                |                       |
Enterprise         Jira -------+                       +------- [CatchMyTask Enterprise]
(25-500+)          Linear      |                       |
                   Asana       |                       |
                   Monday      |                       |
                               |                       |
Team               Shortcut ---+                       +------- [CatchMyTask Team]
(5-25)             Plane       |                       |
                   Huly        |                       |
                   GitHub      |                       |
                               |                       |
Individual         Taskwarrior-+                       +------- [CatchMyTask OSS]
(solo dev)         todo.txt    |                       |
                   Org-mode    |                       |
```

CatchMyTask is the **only tool in the right column** at any scale.

### 5.2 Target Customers (In Order)

**Beachhead (Year 1): AI-Forward Solo Developers**
- Who: Developers using Claude Code, Cursor, Copilot, or similar AI coding agents daily
- Why us: Only tool where their AI agent is a first-class participant in work management
- How to reach: Developer content (blog posts, demos), open-source community, Claude Code integration
- Revenue: $0 (free tier -- building the adoption base)

**Early Majority (Year 1-2): Small AI-Forward Teams**
- Who: 5-25 person engineering teams with 2-5 AI agents running alongside humans
- Why us: Need to track what agents are doing, coordinate human + agent work, maintain accountability
- How to reach: Bottom-up from individual adoption, team-oriented features (shared dashboards, webhooks, GitHub integration)
- Revenue: Team tier ($10-15/user/month)

**Enterprise (Year 2-3): Regulated Engineering Organizations**
- Who: Financial services, healthcare, government contractors deploying AI agents at scale
- Why us: EU AI Act compliance, SOC 2, agent governance with audit trails. No competitor offers this.
- How to reach: Compliance-oriented sales, security team buy-in, SOC 2 certification
- Revenue: Enterprise tier ($25-40/user/month)

### 5.3 Why They Choose Us Over Alternatives

**vs Jira**: "We tried adding AI agent tracking to Jira. It required 4 plugins, a custom field scheme, and still couldn't tell us which agent made which change. CatchMyTask tracks agents by design -- every action is a git commit with the agent's identity."

**vs Linear**: "Linear is great for humans but treats our AI agents as API callers. We needed agents to be team members with their own work queues, WIP limits, and audit trails. CatchMyTask is the only tool that gets this right."

**vs GitHub Issues**: "GitHub Issues works for simple task tracking, but we have 8 AI agents working across 3 repos. We needed configurable state machines, artifact management, and real-time dashboards for agent activity. GitHub Issues can't do this."

**vs building in-house**: "We spent 3 months building internal agent governance tooling. Then CatchMyTask shipped everything we needed in an open-source CLI we could deploy in 5 minutes. We switched our enterprise license and got SSO + compliance for less than our engineer's monthly salary."

---

## Part 6: Implementation Roadmap

### Phase 1: Complete the Core (Months 1-4)

Focus: Make the open-source product genuinely complete for individual developers and small teams.

| Feature | Priority | Weeks |
|---|---|---|
| API authentication (JWT + API keys) | P0 | 2 |
| API pagination | P0 | 1 |
| Comments/discussions on items | P0 | 3 |
| Webhooks (outbound events) | P0 | 2 |
| Templates (activate existing system) | P1 | 1 |
| Bulk operations (batch status, done range) | P1 | 2 |
| Saved views/filters | P1 | 1 |
| MCP server | P1 | 3 |

### Phase 2: Integration & Collaboration (Months 4-7)

Focus: Make CatchMyTask work with the developer ecosystem and small teams.

| Feature | Priority | Weeks |
|---|---|---|
| GitHub integration (PR linking, auto-status) | P0 | 3 |
| Notifications (in-app + optional email) | P0 | 2 |
| Team dashboards (shared views, team analytics) | P1 | 2 |
| Import from Jira/Linear | P1 | 3 |
| Slack integration (via webhooks) | P2 | 2 |

### Phase 3: Enterprise Foundation (Months 7-10)

Focus: Build the enterprise features that generate revenue.

| Feature | Priority | Weeks |
|---|---|---|
| SSO (SAML 2.0, OIDC) | P0 | 3 |
| RBAC (roles, project permissions) | P0 | 3 |
| Structured audit logging | P0 | 2 |
| Agent Registry & governance controls | P0 | 3 |
| SCIM provisioning | P1 | 2 |
| Advanced analytics (velocity, cycle time) | P1 | 3 |

### Phase 4: Scale & Compliance (Months 10-14)

Focus: Enterprise sales readiness and compliance.

| Feature | Priority | Weeks |
|---|---|---|
| SOC 2 Type II certification | P0 | Ongoing |
| Data residency controls | P1 | 2 |
| Agent approval workflows | P1 | 2 |
| Agent analytics dashboard | P1 | 2 |
| Custom fields | P2 | 3 |
| Plugin/extension system | P2 | 4 |

---

## Part 7: How to Show and Sell Enterprise Value

### 7.1 Messaging Framework

**For developers (adoption):**
> CatchMyTask: Work management in plain text. Files you own, tracked by git, understood by AI agents. Zero vendor lock-in.

**For team leads (conversion):**
> Your AI agents are doing real work. CatchMyTask is the only tool that tracks human and agent contributions equally -- with the audit trail enterprises require.

**For enterprise buyers (revenue):**
> AI agent governance built into work management. Every agent action is a git commit. Configurable policies, approval workflows, and kill switches. SOC 2 compliant. Self-hosted or cloud. EU AI Act ready.

### 7.2 Go-to-Market

**Bottom-up (primary):**
1. Developer discovers CatchMyTask through content/community
2. Uses free CLI for personal projects with AI agents
3. Introduces it to team for shared agent-tracked work
4. Team needs shared dashboards, webhooks, GitHub integration -> Team tier
5. Enterprise needs SSO, RBAC, agent governance, compliance -> Enterprise tier

**Compliance-driven (secondary):**
1. EU AI Act deadline approaches (Aug 2026)
2. Enterprise legal/compliance team identifies need for AI agent governance
3. Evaluates CatchMyTask's agent registry, audit trail, approval workflows
4. Purchases enterprise license for engineering org

### 7.3 Pricing Strategy

| Tier | Price | Justification |
|---|---|---|
| **Community** | Free forever | Adoption engine. Must be genuinely useful, not crippled. All 21 CLI commands, full web UI, basic agent support. |
| **Team** | $12/user/month | Below Linear ($14) and Jira Premium ($14.54). Webhooks, GitHub integration, team dashboards, basic RBAC. |
| **Enterprise** | $32/user/month | Below Asana Enterprise ($35) and Jira Enterprise. SSO, SCIM, audit logging, agent governance, compliance, priority support. |

**Why this pricing works:**
- Community is genuinely free (PostHog model) -- builds trust and adoption
- Team undercuts Linear/Jira for price-sensitive teams
- Enterprise delivers unique value (agent governance) that no competitor offers at any price
- Per-seat model scales predictably (GitLab model)

---

## Conclusion

CatchMyTask is positioned at the intersection of three massive trends: developer-first tools, local-first architecture, and AI agent proliferation. No existing tool occupies this intersection.

The business case rests on a simple thesis: **as AI agents become standard members of engineering teams, enterprises will need governance, audit, and compliance tools designed for agent-native work management.** CatchMyTask is the only tool built from the ground up for this reality.

The open-core model (PostHog/GitLab pattern) provides a sustainable path: free product drives adoption, team tier generates initial revenue, enterprise tier captures the governance premium. With the EU AI Act deadline in August 2026, the compliance tailwind creates urgency.

**The question is not whether agent governance tools will exist. The question is whether CatchMyTask moves fast enough to define the category.**
