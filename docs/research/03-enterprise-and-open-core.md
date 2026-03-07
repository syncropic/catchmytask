# Enterprise Requirements & Open-Core Business Models Research

**Date**: 2026-03-06
**Status**: Research Complete
**Purpose**: Inform CatchMyTask's potential enterprise offering and commercialization strategy

---

## 1. Enterprise Requirements for Work Management Tools

### 1.1 Authentication & Identity

| Requirement | Priority | Notes |
|---|---|---|
| SSO (SAML 2.0) | Must-have | Integration with Okta, Azure AD, Google Workspace. Non-negotiable for any enterprise deal. |
| OIDC Support | Must-have | Modern alternative to SAML, increasingly preferred by cloud-native orgs. |
| SCIM Provisioning | Must-have | Automated user lifecycle management. IT admins expect Okta/Entra ID sync for onboarding/offboarding. |
| MFA Enforcement | Must-have | Policy to require multi-factor authentication org-wide. |
| Directory Sync | Should-have | Real-time sync with corporate directories beyond SCIM. |

### 1.2 Access Control

| Requirement | Priority | Notes |
|---|---|---|
| Role-Based Access Control (RBAC) | Must-have | Define roles (admin, manager, member, viewer, agent) with granular permissions per project/workspace. |
| Custom Roles | Should-have | Enterprises want to define their own role hierarchies beyond defaults. |
| Project-Level Permissions | Must-have | Different access levels per project/workspace. |
| IP Allowlisting | Should-have | Restrict access to corporate networks or VPNs. |
| Session Management | Should-have | Enforce session timeouts, concurrent session limits. |

### 1.3 Compliance & Audit

| Requirement | Priority | Notes |
|---|---|---|
| Audit Logging | Must-have | Immutable record of every action: who did what, when, from where. |
| SOC 2 Type II | Must-have | Table-stakes certification for selling to US enterprises. |
| GDPR Compliance | Must-have | Data subject rights, DPA, right to erasure, consent management. |
| HIPAA Readiness | Should-have | Required for healthcare customers. BAA agreements. |
| ISO 27001 | Should-have | Expected by European enterprises and government orgs. |
| Data Retention Policies | Must-have | Configurable retention periods, automatic purging. |
| Export/Portability | Must-have | Full data export in standard formats. CatchMyTask's plain-text foundation is a major advantage here. |

### 1.4 Data Residency & Sovereignty

| Requirement | Priority | Notes |
|---|---|---|
| Region Selection | Must-have | Choose where data is stored (US, EU, APAC). |
| Data Sovereignty | Should-have | Guarantee data never leaves specified jurisdiction. |
| Self-Hosted Option | Differentiator | Some enterprises (finance, defense, government) will only use self-hosted. CatchMyTask's file-first architecture makes this trivial. |
| Dedicated Infrastructure | Should-have | Single-tenant deployment option for large customers. |

### 1.5 Support & Operations

| Requirement | Priority | Notes |
|---|---|---|
| SLA Guarantees | Must-have | 99.9%+ uptime SLA with financial penalties for breach. |
| Priority Support | Must-have | Dedicated account manager, <1hr response time for critical issues. |
| Custom Integrations | Should-have | Professional services for bespoke integrations. |
| Training & Onboarding | Should-have | Dedicated onboarding for large deployments. |

### 1.6 Reporting & Analytics

| Requirement | Priority | Notes |
|---|---|---|
| Advanced Dashboards | Must-have | Customizable views of team productivity, velocity, cycle time. |
| Usage Analytics | Should-have | Admin visibility into who is using what, adoption metrics. |
| Custom Reports | Should-have | Build reports on arbitrary dimensions. |
| Data Warehouse Export | Should-have | Push analytics data to Snowflake, BigQuery, etc. |

---

## 2. Open-Core Business Models in Developer Tools

### 2.1 Company-by-Company Analysis

#### GitLab (The Open-Core Pioneer)

- **Model**: Open core with buyer-based tiering
- **Free Tier**: Core DevOps features, 5-user group limit, 400 CI/CD minutes, 10 GiB storage. Unlimited private repos, basic CI/CD.
- **Premium ($29/user/month)**: Aimed at team leads, directors. Parent-child pipelines, epics, roadmaps, release controls, priority support.
- **Ultimate ($99/user/month)**: Aimed at executives and security teams. SAST, DAST, container scanning, compliance frameworks, portfolio management. 77+ features above Premium.
- **Revenue**: $759M total revenue FY2025 (31% YoY growth). Crossed $1B ARR in FY2026. $220M free cash flow in FY2026.
- **Key Metrics**: 1,405 customers with >$100K ARR (23% YoY growth). 123 customers with >$1M ARR (28% growth). 119% dollar-based net retention rate. 80% of expansion from seat growth.
- **Anti-Trap Strategy**: "Buyer-based open core" -- features are tiered by who buys them, not by crippling the free tier. Developers get a genuinely useful free product; security/compliance features that executives buy go in Ultimate. This drives bottom-up adoption that converts at the team/org level.

#### Supabase

- **Model**: Open source (MIT-licensed Postgres tooling) + hosted cloud with usage-based pricing
- **Free Tier**: 50K MAUs, 500MB database, 1GB storage, 2GB bandwidth. Generous enough for MVPs and personal projects.
- **Pro ($25/month base)**: 100K MAUs, 8GB database, 100GB storage. Usage-based overages.
- **Team ($599/month base)**: SSO, audit logs, priority support, SOC 2 report access.
- **Enterprise (Custom)**: Dedicated infrastructure, SLA, HIPAA compliance, custom contracts.
- **Revenue**: $70M ARR in 2025 (250% YoY growth). $5B valuation (Oct 2025).
- **Anti-Trap Strategy**: Self-hosting is genuinely viable (full MIT-licensed stack). Cloud value proposition is operational ease, not feature gating. Enterprise features (SSO, audit, compliance) are cloud-only add-ons.

#### PostHog

- **Model**: Open source (MIT) + usage-based cloud pricing
- **Free Tier**: 1M events, 5K session recordings, 1M feature flag requests, 100K error events/month. No feature restrictions -- same product for free and paid.
- **Paid**: Pure usage-based pricing with volume discounts up to 82%. No contracts required.
- **Enterprise**: SOC 2 Type II, HIPAA readiness, extended retention, dedicated support, advanced permissions.
- **Revenue**: $20M+ ARR with triple-digit YoY growth, cash-flow positive.
- **Anti-Trap Strategy**: 98% of customers use PostHog for free. Zero feature gating -- only usage limits. Transparent pricing. Grows organically through developer-led adoption. Enterprise is about compliance/support, not feature unlocking.

#### Cal.com

- **Model**: Open source (AGPLv3) + hosted platform + enterprise
- **Free Tier**: Self-hosted, full-featured scheduling for individuals.
- **Teams ($15/user/month)**: Team scheduling, group events, round-robin.
- **Organizations ($37/user/month)**: Multi-team management, admin controls.
- **Enterprise ($30+/seat/month, custom)**: Dedicated database, SSO, SLA, custom development, data residency, engineering support.
- **Platform API ($299/month+)**: For developers building on top of Cal.com.
- **Anti-Trap Strategy**: AGPLv3 means self-hosting requires open-sourcing modifications, which pushes commercial users toward the hosted product. Enterprise value is in dedicated infrastructure and data isolation, not feature lockout.

#### Appsmith

- **Model**: Open source + cloud + enterprise
- **Free Tier**: Up to 5 users, self-hosted.
- **Business ($15/user/month)**: Up to 99 users.
- **Enterprise ($25/user/month, $2,500/month min for 100 users)**: SSO, audit logs, granular access control, priority support.
- **Revenue**: ~$4M ARR (FY2025). $49M total funding.
- **Anti-Trap Strategy**: Core low-code platform is open source. Enterprise features are governance/compliance focused.

#### Mattermost

- **Model**: Open source (MIT/AGPLv3) + self-hosted enterprise + cloud
- **Free (Entry)**: Up to 50 users, 10K message history, community support. All Enterprise Advanced features with limits.
- **Professional ($10/user/month)**: Full message history, integrations, guest accounts.
- **Enterprise (Custom)**: Advanced compliance (eDiscovery, custom retention), LDAP group sync, high availability, custom terms of service.
- **Enterprise Advanced (Custom)**: Strictest security/compliance: custom mobile apps, advanced security controls.
- **Revenue**: $33.1M ARR (2024). $73.6M total funding.
- **Anti-Trap Strategy**: Self-hosted by default, which appeals to security-conscious enterprises. Enterprise value is compliance, HA, and advanced security -- not basic messaging features.

#### Grafana Labs

- **Model**: Open source (AGPLv3) + cloud (usage-based) + enterprise on-prem
- **Free Cloud Tier**: 10K metrics series, 50GB logs/traces, 3 users. Generous for getting started.
- **Cloud Pro ($8-55/user/month)**: Usage-based pricing across metrics, logs, traces. Volume scaling.
- **Enterprise On-Prem ($55/user/month)**: Enterprise plugins, RBAC, enhanced security, SAML, audit logs.
- **Revenue**: $400M+ ARR (entering 2026). 70% of Fortune 50 as customers. 7,000+ organizations. 80-90% gross margins.
- **Anti-Trap Strategy**: Open source products (Grafana, Mimir, Loki, Tempo) have 25M+ users. Cloud is the convenience play. Enterprise is the compliance/governance play. Revenue comes from usage-based cloud consumption, not feature-gating the OSS tools.

#### MinIO

- **Model**: Open source (AGPLv3) + commercial enterprise binary (AIStor)
- **Free Tier**: Community Edition, AGPLv3-licensed. Recently stripped of web UI, causing backlash.
- **Enterprise Lite (Custom)**: Introduced Dec 2025 to capture mid-market after losing deals.
- **Enterprise ($96K/year min for 400TB)**: Commercial AIStor binary. Scales to $244K/year for 1PB.
- **Revenue**: Claimed 149% ARR growth over 2 years (base undisclosed).
- **Cautionary Tale**: MinIO went from open-source darling to cautionary tale by stripping features from the community edition in 2025 (removing the web UI). This is the classic "bait-and-switch" failure mode. Enterprises lost trust. Community forked.

### 2.2 Patterns and Lessons

#### What Works (Feature Distribution)

| Free/OSS Tier | Paid/Enterprise Tier |
|---|---|
| Core product functionality | SSO / SAML / OIDC |
| Individual and small team use | SCIM provisioning |
| Basic integrations | Audit logging |
| Community support | Compliance certifications (SOC 2, HIPAA) |
| Self-hosted deployment | Role-based access control (granular) |
| Standard APIs | Advanced analytics/reporting |
| Single-player features | Priority/dedicated support |
| | SLA guarantees |
| | Data residency controls |
| | Custom integrations |
| | High availability / dedicated infrastructure |

#### Pricing Model Comparison

| Model | Used By | Pros | Cons |
|---|---|---|---|
| Per-seat | GitLab, Mattermost, Appsmith | Predictable revenue, scales with org size | Discourages broad adoption |
| Usage-based | PostHog, Grafana, Supabase | Aligns cost with value, low barrier | Revenue less predictable |
| Hybrid (base + usage) | Supabase, Grafana | Predictable base + growth upside | More complex to communicate |
| Flat enterprise license | MinIO | Large upfront contracts | Harder to land, high minimums lose mid-market |

#### Revenue Benchmarks

| Company | ARR | Funding | Valuation | Employees (approx) |
|---|---|---|---|---|
| GitLab | $1B+ (FY2026) | Public (IPO 2021) | ~$8B market cap | 2,000+ |
| Grafana Labs | $400M+ | $570M | $6B | 800+ |
| Supabase | $70M | $500M | $5B | 200-230 |
| Mattermost | $33M | $73.6M | ~$300M | 150+ |
| PostHog | $20M+ | $27M | ~$450M | 50+ |
| Appsmith | ~$4M | $49M | ~$200M | 100+ |
| Cal.com | Undisclosed | $32M | Undisclosed | 50+ |
| MinIO | Undisclosed | $103M | ~$1B | 100+ |

#### The Open-Core Trap: Lessons

1. **Give away too much**: If the free tier does everything, there is no reason to pay. The product competes with itself. Conversion rates collapse.
2. **Give away too little ("Crippled Core")**: If the free tier is crippled, developers never adopt it. No bottom-up growth engine. You are just selling proprietary software with extra steps.
3. **Bait and switch (MinIO pattern)**: Giving away features then removing them destroys trust irreparably. Community forks and enterprises flee.
4. **The sweet spot**: Core product open and genuinely useful. Enterprise features are things enterprises *want* to pay for: compliance, security, governance, support, SLAs. These are features that individual developers do not need but their security/legal/procurement teams require.

---

## 3. Jobs to Be Done Framework

### 3.1 What Enterprise Buyers Hire Work Management Tools to Do

| Job | Description | Current Dominant Solution |
|---|---|---|
| **Coordinate work across teams** | Ensure 50+ people/teams can see dependencies and avoid conflicts | Jira (dominant), Linear (growing) |
| **Enforce process compliance** | Mandate specific workflows, approvals, and audit trails | Jira (custom workflows + plugins) |
| **Provide executive visibility** | Dashboards showing project status, velocity, risk | Jira + plugins, custom BI |
| **Manage external accountability** | Track SLAs, customer commitments, regulatory deadlines | Jira, ServiceNow |
| **Onboard new team members** | Get new hires productive by showing them the work landscape | Whatever the org uses |
| **Audit and demonstrate compliance** | Prove to auditors that changes followed proper process | Jira + audit plugins |
| **Govern AI agent work** | NEW: Track, control, and audit work done by AI agents | No dominant solution exists |

### 3.2 Switching Costs from Jira/Linear

| Switching Cost | Severity | Notes |
|---|---|---|
| Data migration | High | Years of history, custom fields, attachments. |
| Workflow reconfiguration | High | Custom workflows, automation rules, board configurations. |
| Integration rewiring | Medium-High | CI/CD, Slack, GitHub/GitLab hooks, custom integrations. |
| Team retraining | Medium | Muscle memory, learned patterns, tribal knowledge. |
| Plugin ecosystem | High (Jira) | Jira's marketplace has 1000s of plugins. Hard to replace. |
| Political capital | High | Someone's reputation is tied to the current tool choice. |
| Sunk cost psychology | High | "We spent 6 months setting up Jira." |

### 3.3 What Makes Someone Switch

| Trigger | Example |
|---|---|
| **Pain threshold exceeded** | Jira is so slow/complex that developers actively circumvent it. |
| **New team/greenfield** | Startup, new division, or reorg creates a clean-slate opportunity. |
| **Platform consolidation** | "We already use GitLab for code, why not use it for issues too?" |
| **Cost shock** | Jira enterprise pricing escalation (median buyer pays $85K/year). |
| **New capability gap** | Need AI agent integration that current tool cannot support. |
| **Developer revolt** | Bottom-up demand for a tool that respects developer workflows. |

### 3.4 Decision-Making Process

**Bottom-Up (Developer-Led) Adoption**:
- Individual developer or small team starts using the tool
- It proves its value through daily use
- Word spreads org-wide through Slack, demos, pair programming
- Management notices the team's productivity and asks about the tool
- Procurement evaluates for org-wide rollout
- **Timeline**: 3-18 months from first use to enterprise purchase
- **Used by**: Linear, PostHog, Grafana, Supabase
- **Key requirement**: Must be genuinely useful for free, with zero friction to start

**Top-Down (Procurement-Led) Adoption**:
- CTO/VP Engineering decides the org needs a new tool
- RFP process evaluates candidates against checklist
- Security review, legal review, procurement negotiation
- Mandatory rollout to all teams
- **Timeline**: 3-12 months from decision to deployment
- **Key requirement**: Must pass security/compliance checklist, have enterprise sales team
- **Used by**: Jira, ServiceNow, legacy tools

**CatchMyTask's Opportunity**: Bottom-up adoption is the only viable path for a new entrant. The CLI-first, file-based approach aligns perfectly with developer-led adoption. The AI-agent-first positioning creates a "new capability gap" trigger that existing tools cannot easily address.

---

## 4. AI Agent Enterprise Considerations

### 4.1 Current State of Enterprise AI Agent Governance

The market is nascent but rapidly forming:
- **Only 23% of organizations** have a formal enterprise-wide strategy for agent identity management
- **37% rely on informal practices** (shared credentials, ad-hoc policies)
- **100% of surveyed organizations** say agentic AI is on their roadmap (Kiteworks, 2026)
- Most orgs can monitor agent actions but **cannot stop agents** when something goes wrong

### 4.2 Agent Identity and Credentials

| Requirement | Current Practice | Best Practice |
|---|---|---|
| Agent Authentication | Teams share human credentials with agents | Dedicated machine identities with defined scopes |
| Permission Scoping | Agents inherit broad service credentials | Least-privilege service accounts with gateway-mediated access |
| Credential Storage | Embedded in agent configuration | Vault-managed, rotated, never stored in code |
| Token Management | Long-lived tokens | Short-lived OBO (on-behalf-of) token exchange |
| Identity Lifecycle | Manual, ad-hoc | SCIM-like automated provisioning/deprovisioning for agents |

### 4.3 Audit and Compliance for AI-Generated Work

| Requirement | Description |
|---|---|
| Full Traceability | Every agent action must be logged with: agent identity, timestamp, input context, output/decision, human who authorized the agent |
| Human-in-the-Loop | High-risk actions require human approval before execution. Configurable per action type and risk level. |
| Output Validation | AI-generated work items, code, or decisions must be reviewable and attributable |
| Bias/Quality Monitoring | Continuous monitoring for drift, bias, or degradation in agent outputs |
| Regulatory Compliance | EU AI Act (effective Aug 2026): risk-based classification, mandatory for high-risk AI. Colorado AI Act (effective Jun 2026). NIST AI Framework. ISO 42001. |

### 4.4 Enterprise Control Requirements

| Control | Description |
|---|---|
| Agent Registry | Central catalog of all agents, their capabilities, permissions, and owners |
| Policy Engine | Runtime enforcement of what agents can/cannot do, with guardrails |
| Kill Switch | Ability to immediately halt any agent's actions |
| Scope Boundaries | Define which projects, work items, or data an agent can access |
| Rate Limiting | Prevent agents from overwhelming systems or creating excessive work items |
| Approval Workflows | Configurable approval chains for agent-initiated actions (e.g., agent creates a task -> human must approve before it enters the backlog) |
| Cost Controls | Budget limits on agent compute/API usage |

### 4.5 Emerging Standards and Frameworks

- **NIST AI Agent Standards Initiative** (launched Jan-Feb 2026): Developing standards for AI agent authentication, identity management, and security controls
- **NIST NCCoE**: Released concept paper on "Accelerating the Adoption of Software and AI Agent Identity and Authorization"
- **EU AI Act**: General application date August 2, 2026. High-risk AI systems face strict obligations. Fines up to 35M EUR or 7% of global turnover.
- **GitHub Enterprise AI Controls** (GA Feb 2026): Agent control plane for enterprise governance of AI agents -- sets market expectations.
- **Gartner Prediction**: Over 60% of enterprises will require formal AI governance frameworks by 2026.

### 4.6 CatchMyTask's Structural Advantages for AI Agent Governance

CatchMyTask's architecture provides unique advantages for enterprise AI agent governance:

1. **Git as Audit Log**: Every agent action that modifies a work item is a git commit. Immutable, timestamped, attributable. This satisfies audit requirements by design, not by bolt-on.

2. **File-Based Permissions**: Unix file permissions, directory-level access control, and git branch protections can enforce agent boundaries without building a custom permission system.

3. **Actor Field in Work Items**: The schema already supports `assignee` and event log entries with actor identity. Agent identity is a natural extension.

4. **Plain Text Observability**: Any monitoring tool can watch `.cmt/` for changes. No proprietary API needed to observe agent behavior.

5. **State Machine Enforcement**: Configurable state machines already prevent invalid transitions. Agent-specific transition policies (e.g., "agents cannot move items to `done` without human review") are a natural extension.

6. **Local-First = Self-Hosted by Default**: Enterprises that require on-premises AI governance get it for free. No cloud dependency to worry about.

---

## 5. Synthesis: Implications for CatchMyTask Commercialization

### 5.1 Recommended Tier Structure

| Tier | Target | Price | Key Features |
|---|---|---|---|
| **Community (OSS)** | Individual devs, small teams, OSS projects | Free forever | Full CLI, all work item features, git integration, basic agent support, self-hosted. Genuinely useful -- not crippled. |
| **Team** | Growing teams (5-25 people) | $10-15/user/month | Team dashboards, shared views, basic RBAC, integrations, email support. |
| **Enterprise** | Organizations (25-500+) | $25-40/user/month | SSO/SAML/OIDC, SCIM, audit logging, advanced RBAC, compliance reports, agent governance controls, data residency, SLA, priority support. |

### 5.2 What Should Be Free (Based on Research)

- Core CLI and all 16 commands
- Work item creation, editing, state transitions
- Configurable state machines
- Git integration (the audit log for free)
- Basic agent support (assignee, CLI access)
- SQLite indexing
- Self-hosted deployment
- JSON output for scripting
- Templates and views

### 5.3 What Enterprises Will Pay For

Based on patterns across all 8 companies studied:

1. **SSO/SAML/SCIM** -- Every enterprise requires this. It is the #1 gate to enterprise sales.
2. **Audit logging beyond git** -- Structured, queryable audit logs with retention policies.
3. **Agent governance** -- Registry, policies, approval workflows, kill switches. This is CatchMyTask's unique differentiator.
4. **Advanced RBAC** -- Custom roles, project-level permissions, IP allowlisting.
5. **Compliance certifications** -- SOC 2, ISO 27001, HIPAA BAA.
6. **Priority support and SLAs** -- Guaranteed response times, dedicated account management.
7. **Advanced analytics** -- Team velocity, cycle time, agent productivity metrics.
8. **Data residency** -- Region-specific storage guarantees.

### 5.4 The Unique Positioning

No existing work management tool was built from the ground up for AI agents as first-class actors. CatchMyTask can own the narrative:

> "The work management system built for the age of AI agents. Enterprise-grade governance for human and AI work, with the simplicity of plain text files and the auditability of git."

This positioning avoids competing head-on with Jira (enterprise entrenchment) or Linear (developer experience for humans) and instead creates a new category where CatchMyTask is the default.
