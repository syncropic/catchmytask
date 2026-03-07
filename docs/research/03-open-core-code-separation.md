# Open-Core Code Separation: Industry Research

**Date:** 2026-03-06
**Status:** Research Complete
**Purpose:** Understand how successful open-core companies separate community and enterprise code, to inform CatchMyTask's architecture if/when an enterprise edition is considered.

---

## Executive Summary

After researching 9+ companies and their open-core strategies, clear patterns emerge:

1. **Mono-repo with `ee/` directory** is the dominant pattern (GitLab, Cal.com, PostHog)
2. **AGPL is the most popular "protective" open-source license** (Grafana, MinIO, Elasticsearch)
3. **BSL/FSL (source-available) is gaining traction** but triggers community forks (HashiCorp -> OpenTofu, Elasticsearch -> OpenSearch)
4. **Compile-time feature gates** (Rust `#[cfg(feature)]`, Go build tags) are the cleanest technical mechanism for same-binary separation
5. **Plugin architectures** provide the cleanest separation but require upfront design investment (Grafana)
6. **License changes after community adoption are extremely risky** -- every major relicensing has caused backlash

---

## Company-by-Company Analysis

### 1. GitLab

**License:** MIT (CE) / Proprietary (EE) -- single repo since 2019
**Repo structure:** Mono-repo with `ee/` top-level directory

#### How Code Separation Works

GitLab is the gold standard for in-repo enterprise separation. After years of maintaining two separate repositories (gitlab-ce and gitlab-ee), they merged into a single repo in late 2018, citing unsustainable merge complexity.

**Directory mirroring pattern:**
```
app/models/project.rb           # CE code
ee/app/models/ee/project.rb     # EE extensions to the same class
lib/gitlab/ldap/               # CE LDAP
ee/lib/ee/gitlab/ldap/         # EE LDAP extensions
```

**Module injection mechanism:**
- CE classes include a single line at the bottom: `Project.prepend_mod` (or `extend_mod`, `include_mod`)
- This auto-discovers and prepends the matching `::EE::Project` module
- EE modules use Ruby's `prepend` to override CE methods while retaining `super` access
- Only one line changes in CE files, minimizing merge conflicts

**Build approach:** Same application; EE features are runtime-gated by license key. The `ee/` directory is simply not loaded in CE installations.

**What went well:**
- Eliminated the nightmare of keeping two repos in sync
- Single CI pipeline, single review process
- Clear convention: if it's in `ee/`, it's enterprise
- Module injection pattern keeps CE code clean

**What caused problems:**
- The migration itself was extremely painful (years of accumulated divergence)
- Developers must understand the `prepend_mod` pattern
- Risk of "EE creep" where CE features accidentally depend on EE code
- Requires discipline to keep separation clean over time

**Developer experience:** Contributors work in one repo. CE contributions don't touch `ee/`. EE developers see the full picture. Testing requires both CE and EE test suites.

---

### 2. PostHog

**License:** MIT (core) / EE License (enterprise features)
**Repo structure:** Mono-repo with `ee/` directory at root

#### How Code Separation Works

PostHog follows a similar pattern to GitLab but in a Python/Django + React/TypeScript stack:

```
posthog/              # Django backend (MIT)
frontend/             # React frontend (MIT)
ee/                   # Enterprise features (separate license)
plugin-server/        # Node.js ingestion service (MIT)
common/               # Shared code (MIT)
```

The `ee/` directory contains enterprise-licensed features. The entire repository is MIT **except** the `ee/` directory, which requires a PostHog license for commercial use.

**Gating mechanism:** License key validation at runtime. Enterprise features check for a valid license before activating.

**What went well:**
- Simple, easy-to-understand separation
- 90%+ of users use PostHog for free (good community funnel)
- Open development process builds trust

**What caused problems:**
- Tried multiple monetization models (paid self-hosted, enterprise plans) before settling on cloud-first
- The `ee/` boundary can be fuzzy -- what belongs in core vs enterprise is a constant judgment call

---

### 3. Grafana

**License:** AGPLv3 (core) / Proprietary (enterprise plugins)
**Repo structure:** Mono-repo for core; enterprise plugins in separate closed-source repos

#### How Code Separation Works

Grafana uses a fundamentally different approach from GitLab/PostHog: **plugin architecture**.

```
grafana/grafana           # AGPL v3 core (public GitHub repo)
grafana-enterprise/       # Closed-source enterprise extensions (private repo)
```

**Key architectural decisions:**
- Core Grafana is AGPL v3 (relicensed from Apache 2.0 in April 2021)
- Client SDKs and plugins remain Apache 2.0 licensed
- Enterprise plugins are **separate binaries** that communicate with Grafana core via gRPC
- The plugin SDK (`grafana-plugin-sdk-go`) is Apache 2.0, allowing anyone to build plugins
- Enterprise plugins are distributed as separate packages (RPM/DEB conflict with OSS packages)

**AGPL as a moat:** The AGPL license means anyone embedding Grafana in a SaaS product must open-source their entire application -- this effectively prevents cloud providers from offering "Grafana-as-a-service" without a commercial license.

**Plugin separation benefits:**
- Clean architectural boundary (gRPC interface)
- Plugins can be developed, versioned, and distributed independently
- No risk of enterprise code leaking into the open-source core
- Third parties can build their own plugins using the same SDK

**What went well:**
- Plugin architecture provides the cleanest possible separation
- AGPL protects against cloud provider competition without being proprietary
- Enterprise features feel like natural extensions, not hidden capabilities
- Relicensing to AGPL was relatively smooth (no fork resulted)

**What caused problems:**
- Plugin development is more complex than in-process code
- gRPC overhead for plugin communication
- Must maintain backward compatibility in the plugin SDK
- Some community confusion about AGPL implications for users (not redistributors)

---

### 4. Supabase

**License:** Apache 2.0 (core) / Proprietary (platform features)
**Repo structure:** Mono-repo of multiple services; enterprise separation is primarily at the service/platform level

#### How Code Separation Works

Supabase is a composition of open-source tools, each with their own repo:
- **PostgreSQL** -- the database itself (PostgreSQL License)
- **PostgREST** -- auto-generated REST API (MIT)
- **GoTrue** -- auth service (MIT)
- **Realtime** -- Elixir server (Apache 2.0)
- **Storage** -- S3-compatible file storage (Apache 2.0)
- **Edge Functions** -- Deno-based functions runtime (Apache 2.0)
- **Studio** -- Dashboard UI (Apache 2.0)

**Enterprise differentiation is primarily through the managed platform:**
- Enterprise SSO (SAML)
- SLA guarantees
- SOC2 compliance
- Custom domains
- Priority support

The open-source self-hosted version includes all core functionality. Enterprise features are mostly operational/compliance features that only make sense in a managed context.

**What went well:**
- Composing existing open-source tools reduces the surface area of proprietary code
- Apache 2.0 is maximally permissive, encouraging adoption
- Enterprise value is in operations, not features -- hard to commoditize

**What caused problems:**
- Self-hosted experience is complex (many services to orchestrate)
- Some features (like Supabase-specific integrations) are harder to replicate self-hosted
- The line between "platform feature" and "product feature" can blur

---

### 5. Cal.com

**License:** AGPLv3 (core, 99%) / Commercial License (EE, ~1%)
**Repo structure:** Mono-repo with `/packages/features/ee` directory

#### How Code Separation Works

Cal.com uses the clearest philosophical framework for separation:
- **"Singleplayer" features** -- open source (AGPLv3)
- **"Multiplayer" features** -- commercial license (team/org management, SSO, etc.)

```
packages/
  features/
    ee/           # Commercial license -- enterprise features
    ...           # AGPLv3 -- everything else
```

**Gating mechanism:** License key checked at runtime. The `ee/` folder code requires a valid Cal.com license key to function.

**What went well:**
- The "singleplayer vs multiplayer" distinction is intuitive and defensible
- AGPL prevents SaaS competition without being proprietary
- 99% open source builds massive community trust
- Have moved features from commercial to open source, further building trust

**What caused problems:**
- Some community members question whether AGPL + commercial EE is "really open source"
- The boundary decisions still require judgment calls
- License key management adds complexity for self-hosters

---

### 6. Keycloak

**License:** Apache 2.0 (fully open source)
**Repo structure:** Single public repo; enterprise = Red Hat downstream product

#### How Code Separation Works

Keycloak is a pure open-source project (now CNCF incubating, donated by Red Hat in April 2023). There is **no enterprise edition in the codebase**.

Instead, Red Hat builds **Red Hat SSO** (now "Red Hat build of Keycloak") as a downstream product:
- Takes the Keycloak source
- Applies Red Hat's hardening, testing, and certification
- Packages it for Red Hat's supported platforms
- Provides long-term support, security patches, and SLAs

**This is the "Red Hat model":** the code is 100% open source; the enterprise value is in support, certification, and long-term maintenance.

**What went well:**
- Zero ambiguity about licensing
- Maximum community contribution (no "off-limits" code)
- CNCF governance adds neutrality and trust

**What caused problems:**
- Harder to monetize features directly
- Red Hat's downstream product competes with self-deployment of the same code
- Enterprise customers sometimes choose the free version anyway

---

### 7. MinIO

**License:** AGPLv3 (unified) / Commercial license available
**Repo structure:** Single repo; enterprise = commercial license + SUBNET support

#### How Code Separation Works

MinIO takes a unique approach: **the code is identical**. There is no separate enterprise codebase.

- Core MinIO server is fully AGPLv3
- The commercial license is a **license exception** -- it removes AGPL obligations
- Enterprise customers get access to **SUBNET** (support portal with direct-to-engineer access)
- Commercial builds may include certified binaries, but the source is the same

**AGPL as the business model:** The AGPL's copyleft requirements mean any company building a product on MinIO must either:
1. Open-source their entire application, or
2. Purchase a commercial license

This is the "AGPL forcing function" model -- the license itself creates the sales pipeline.

**What went well:**
- Extremely clean architecture -- no code separation headaches
- AGPL is a strong forcing function for enterprise sales
- Single codebase means enterprise customers get exactly what the community tests
- Simplified engineering (one build, one test suite)

**What caused problems:**
- A controversial UI removal decision damaged community trust
- AGPL scares away some potential adopters/contributors
- No feature differentiation means enterprise value is purely support/compliance
- Cannot offer "premium features" without creating a fork of your own code

---

### 8. HashiCorp (Terraform, Vault, etc.)

**License:** BSL 1.1 (changed from MPL 2.0 in August 2023)
**Repo structure:** Single repos per product; BSL applies to everything

#### What Happened

In August 2023, HashiCorp changed all products from the permissive Mozilla Public License (MPL 2.0) to the Business Source License 1.1 (BSL). The BSL:
- Allows reading, modifying, and using the code
- **Prohibits** offering a competing commercial product/service
- Converts to MPL 2.0 after 4 years

**What drove the change:**
- Cloud providers (primarily AWS, but also others) were offering HashiCorp-compatible services without contributing back
- HashiCorp was struggling to compete with these managed offerings despite being the upstream developers

**Community reaction:**
- Massive backlash from the open-source community
- OpenTofu fork launched within days (now a Linux Foundation project)
- OpenBao forked from Vault
- Critics called it "open washing" and "hostile to the community"
- Some supporters acknowledged the difficult business reality

**Consequences:**
- IBM acquired HashiCorp for $6.4B in February 2025
- OpenTofu maintains 95%+ feature parity with Terraform as of 2026
- OpenTofu has decent adoption in smaller, tech-focused organizations
- IBM's engineering resources make Terraform the "safe corporate choice"
- The fork validated that BSL changes can trigger viable alternatives

**Lessons:**
- **Timing matters:** Changing licenses after massive community adoption is extremely risky
- **Be specific about restrictions:** HashiCorp's vague "competitive" definition created FUD
- **Forks are real:** Well-funded communities can and will fork
- **Business vs community:** The BSL may protect revenue but it costs community goodwill
- **Acquisition endgame:** BSL may signal a company positioning for acquisition rather than community growth

---

### 9. Elasticsearch / OpenSearch

**License journey:** Apache 2.0 -> SSPL + ELv2 (2021) -> SSPL + ELv2 + AGPLv3 (2024)
**Fork:** AWS forked to create OpenSearch (Apache 2.0) in 2021

#### The Story

1. **2021:** Elastic changed Elasticsearch from Apache 2.0 to dual SSPL/ELv2 to block AWS from offering managed Elasticsearch
2. **2021:** AWS forked Elasticsearch 7.10.2 (last Apache-licensed version) to create OpenSearch
3. **2021-2024:** Both projects evolved independently
4. **September 2024:** Elastic added AGPLv3 as a third license option, making Elasticsearch "open source again"

**What happened to OpenSearch:**
- Initially a "clone" -- now 1,400+ unique contributors, 350+ active
- Governance transferred to Linux Foundation (September 2024)
- Has diverged significantly, especially in AI/vector search and observability
- Still Apache 2.0 licensed

**Why Elastic returned to open source:**
- OpenSearch proved that community forks are viable and lasting
- The SSPL/ELv2 licensing confused and alienated users
- AGPL provides similar protections to SSPL but is OSI-approved

**Lessons:**
- **Forks can succeed:** OpenSearch is now a thriving independent project, not just an Elasticsearch clone
- **License changes are (mostly) permanent:** Even after Elastic returned to open source, many users stayed with OpenSearch ("trust, once broken, is hard to rebuild")
- **AGPL as a middle ground:** Elastic's eventual AGPL choice suggests AGPL is the "right" protective open-source license
- **Technical debt in forks:** Forking a large project carries hidden technical debt that takes years to resolve
- **Governance matters:** OpenSearch gained credibility by moving to the Linux Foundation

---

### 10. Sentry

**License:** FSL 1.1 (Functional Source License) -> converts to Apache 2.0 after 2 years
**Repo structure:** Main repo (`getsentry/sentry`) is public; internal `getsentry` org has additional private repos

#### How Code Separation Works

Sentry pioneered the Functional Source License (FSL) as an improvement over BSL:

**FSL vs BSL:**
- BSL has too many variable parameters (each company sets different restrictions)
- FSL makes opinionated choices: 2-year conversion (not 4), converts to Apache 2.0 or MIT
- Simple restriction: you cannot use it to compete with Sentry commercially

**Code organization:**
- The main `getsentry/sentry` repo contains the full self-hosted application
- Client SDKs (sentry-python, sentry-javascript, etc.) remain under permissive licenses (MIT/Apache)
- Internal tooling and SaaS-specific code lives in private repos under the `getsentry` organization
- When Sentry moved to BSL (then FSL), they explicitly separated client libraries and reusable libraries to retain original licenses

**What went well:**
- FSL is clearer and more developer-friendly than BSL
- 2-year conversion builds trust (code becomes fully open source relatively quickly)
- Client SDK separation means users are never locked in
- Self-hosted version is fully functional

**What caused problems:**
- FSL is not OSI-approved, so it's not "open source" by strict definition
- Some community members view any non-OSI license as unacceptable
- The private `getsentry` repos create an asymmetry between employees and community

---

## Patterns and Best Practices

### Pattern 1: The `ee/` Directory (GitLab, PostHog, Cal.com)

```
project/
  src/              # Open-source code (MIT/Apache/AGPL)
  ee/               # Enterprise code (proprietary/commercial license)
  LICENSE           # Open-source license
  ee/LICENSE        # Enterprise/commercial license
```

**Pros:**
- Simple to understand and implement
- Single repo, single CI, single review process
- Clear visual separation
- Community contributors know what's open

**Cons:**
- Requires discipline to maintain the boundary
- Runtime license checking adds complexity
- "What goes in ee/" is a constant judgment call
- Can feel like "open core theater" if too much goes into ee/

**Best for:** Products where enterprise features are extensions of core features (more permissions, SSO, audit logs, team management).

### Pattern 2: Plugin Architecture (Grafana)

```
project-core/         # Open-source core (AGPL/Apache)
project-plugins/      # Enterprise plugins (proprietary, separate repo)
plugin-sdk/          # Plugin development kit (Apache/MIT)
```

**Pros:**
- Cleanest architectural separation
- Plugins can be developed and versioned independently
- Third parties can build plugins too
- No risk of code leakage between editions

**Cons:**
- Higher upfront design cost
- IPC overhead (gRPC, HTTP, etc.)
- Plugin SDK maintenance burden
- More complex development experience

**Best for:** Products where enterprise features are naturally separable (data sources, integrations, specialized analyzers).

### Pattern 3: Same Code, License as Moat (MinIO)

```
project/              # Single codebase, AGPLv3
```

**Pros:**
- Zero code separation complexity
- Enterprise customers get exactly what community tests
- AGPL creates natural sales pipeline
- Simplest engineering model

**Cons:**
- Cannot offer premium features
- AGPL can scare away contributors and adopters
- Enterprise value is limited to support/compliance
- No feature differentiation with competitors

**Best for:** Infrastructure software where the code itself is commodity but operations/support are valuable.

### Pattern 4: Source-Available (HashiCorp BSL, Sentry FSL)

```
project/              # Single codebase, BSL/FSL
```

**Pros:**
- Full source visibility for users
- Prevents competitive commercial use
- Converts to open source after time period
- Can still accept community contributions

**Cons:**
- Not "open source" by OSI definition
- Community backlash risk (HashiCorp proved this)
- Forks are a real risk if community is large enough
- Can signal acquisition intent rather than community commitment

**Best for:** Companies that have already built a product with significant adoption and need to protect revenue, accepting the trade-off in community goodwill.

### Pattern 5: Downstream Product (Keycloak/Red Hat)

```
upstream-project/     # Fully open source (Apache 2.0)
downstream-product/   # Enterprise packaging, support, certification (proprietary process, not code)
```

**Pros:**
- Maximum community trust and contribution
- No licensing complexity
- Neutral governance possible (CNCF, Linux Foundation)

**Cons:**
- Hardest to monetize
- Enterprise customers can self-serve
- Requires massive brand/ecosystem to make support valuable
- Really only works at Red Hat/IBM scale

**Best for:** Platform-level infrastructure where the value is in the ecosystem, not the features.

---

## Rust-Specific Implementation Strategies

For a Rust project like CatchMyTask, there are specific mechanisms available:

### Cargo Feature Flags (Compile-Time Separation)

```toml
# Cargo.toml
[features]
default = []
enterprise = ["ee-auth", "ee-audit", "ee-workflows"]
ee-auth = []
ee-audit = []
ee-workflows = []
```

```rust
// In source code
#[cfg(feature = "enterprise")]
mod ee_auth;

#[cfg(feature = "enterprise")]
pub fn enterprise_sso_login() -> Result<(), Error> {
    ee_auth::sso_login()
}

#[cfg(not(feature = "enterprise"))]
pub fn enterprise_sso_login() -> Result<(), Error> {
    Err(Error::EnterpriseRequired("SSO requires an enterprise license"))
}
```

**Advantages:**
- Enterprise code is literally not compiled into the community binary
- Zero runtime overhead
- Binary size is smaller for community edition
- Compiler enforces the boundary -- no accidental EE dependencies in CE

**Disadvantages:**
- Must maintain two build targets
- `#[cfg]` annotations scattered through codebase can be noisy
- Feature unification in workspaces can cause unexpected behavior
- Testing requires building and testing both configurations

### Cargo Workspace Separation

```
catchmytask/
  Cargo.toml          # Virtual workspace
  crates/
    cmt-core/         # Core library (MIT/Apache)
    cmt-cli/          # CLI binary (MIT/Apache)
    cmt-ee/           # Enterprise extensions (commercial license)
    cmt-ee-auth/      # Enterprise auth (commercial)
    cmt-ee-audit/     # Enterprise audit (commercial)
```

```toml
# cmt-cli/Cargo.toml
[dependencies]
cmt-core = { path = "../cmt-core" }

[dependencies.cmt-ee]
path = "../cmt-ee"
optional = true

[features]
enterprise = ["cmt-ee"]
```

**Advantages:**
- Cleanest separation -- enterprise code is in separate crates
- Each crate can have its own license file
- Dependencies flow one way (ee depends on core, never the reverse)
- Can publish core crates independently to crates.io
- Workspace ensures consistent dependency versions

**Disadvantages:**
- More complex project structure
- Must be careful about feature unification across workspace members
- Enterprise crate needs access to core internals (may need `pub(crate)` considerations)
- Building from workspace root may unify features unexpectedly

### Recommended Hybrid Approach for Rust

Combine workspace separation with feature flags:

```
catchmytask/
  Cargo.toml              # Virtual workspace
  crates/
    cmt-core/             # Core domain types, state machine, file ops
      src/
        lib.rs
        traits.rs         # Extension points (trait definitions)
    cmt-cli/              # CLI binary
      Cargo.toml          # optional dep on cmt-ee
      src/
        main.rs           # cfg(feature = "enterprise") for EE commands
    cmt-index/            # SQLite indexing
    cmt-ee/               # Enterprise implementations of core traits
      LICENSE             # Commercial license
      src/
        lib.rs
        sso.rs
        audit.rs
        rbac.rs
  ee/                     # Enterprise-only non-Rust assets
    LICENSE
    templates/
    docs/
```

**Extension point pattern (trait-based):**

```rust
// cmt-core/src/traits.rs
pub trait AuthProvider: Send + Sync {
    fn authenticate(&self, credentials: &Credentials) -> Result<Actor>;
}

pub trait AuditSink: Send + Sync {
    fn record(&self, event: &AuditEvent) -> Result<()>;
}

// cmt-core/src/auth.rs -- default implementation
pub struct LocalAuth;
impl AuthProvider for LocalAuth {
    fn authenticate(&self, credentials: &Credentials) -> Result<Actor> {
        // File-based local authentication
    }
}

// cmt-ee/src/sso.rs -- enterprise implementation
pub struct SamlAuth { /* ... */ }
impl AuthProvider for SamlAuth {
    fn authenticate(&self, credentials: &Credentials) -> Result<Actor> {
        // SAML SSO authentication
    }
}
```

This pattern:
- Keeps core code clean (no `#[cfg]` noise)
- Enterprise code provides alternative trait implementations
- The CLI binary selects implementations based on feature flag
- Enterprise crate has its own license
- Core crate defines extension points without knowing about enterprise

---

## License Strategy Recommendations

Based on the research, here is a ranked assessment of license strategies:

### Tier 1: Low Risk, High Trust

| License | Example | Trade-off |
|---------|---------|-----------|
| Apache 2.0 + EE directory | PostHog, Supabase | Maximum adoption; enterprise value must come from features, not license |
| MIT + EE directory | PostHog (core) | Even more permissive; same trade-off |

### Tier 2: Moderate Protection, Moderate Trust

| License | Example | Trade-off |
|---------|---------|-----------|
| AGPLv3 + commercial license | Cal.com, MinIO | Prevents SaaS competition; scares some contributors |
| AGPLv3 + proprietary plugins | Grafana | Clean separation; requires plugin architecture |

### Tier 3: Maximum Protection, Trust Trade-off

| License | Example | Trade-off |
|---------|---------|-----------|
| FSL -> Apache 2.0 (2yr) | Sentry | Not OSI-approved but converts; good middle ground |
| BSL -> MPL/Apache (4yr) | HashiCorp | Triggered major fork; IBM acquisition followed |

### For CatchMyTask Specifically

Given CatchMyTask's design principles (timelessness, file-first, local-first):

1. **Start with Apache 2.0 or MIT** for maximum adoption
2. **Use Cargo workspace separation** with a clear `cmt-ee` crate from day one (even if empty)
3. **Define trait-based extension points** in core for future enterprise implementations
4. **If/when enterprise features are needed**, add them to the `cmt-ee` crate under a separate license
5. **Never change the core license** -- the research overwhelmingly shows this destroys trust

---

## Key Takeaways

1. **Design for separation early.** GitLab's painful migration from two repos to one repo proves that retrofitting separation is expensive. Cal.com and PostHog show that starting with `ee/` from the beginning is cheap.

2. **The `ee/` directory pattern is proven.** It's simple, understandable, and works at scale (GitLab has thousands of developers).

3. **AGPL is the "Goldilocks" protective license.** It's OSI-approved (unlike BSL/FSL), prevents SaaS competition (unlike MIT/Apache), and doesn't trigger forks (unlike BSL). Grafana, MinIO, and eventually Elasticsearch all converged on AGPL.

4. **Never relicense after community adoption.** HashiCorp and Elasticsearch both suffered major consequences. Even Elastic's return to open source (via AGPL) hasn't fully restored trust.

5. **Trait-based extension points are ideal for Rust.** They provide clean compile-time separation without the runtime overhead of plugins, and they align with Rust's type system philosophy.

6. **Enterprise value should be in "multiplayer" features.** Cal.com's framework is the clearest: individual developer features are open source; team/org/compliance features are enterprise.

7. **Support and operations can be the entire enterprise offering.** MinIO and Keycloak prove you don't need feature separation at all if your product is complex enough to warrant paid support.

---

## Sources

### GitLab
- [Why GitLab uses one codebase for Community & Enterprise](https://about.gitlab.com/blog/a-single-codebase-for-gitlab-community-and-enterprise-edition/)
- [Guidelines for implementing Enterprise Edition features](https://docs.gitlab.com/development/ee_features/)
- [Blueprint: Working in CE and EE codebases](https://handbook.gitlab.com/handbook/engineering/infrastructure/library/ce-ee-codebases/)
- [Organize all EE code in one directory](https://gitlab.com/gitlab-org/gitlab/-/issues/126)

### PostHog
- [PostHog GitHub Repository](https://github.com/PostHog/posthog)
- [How PostHog Grows: The Power of Being Open-Core](https://www.howtheygrow.co/p/how-posthog-grows-the-power-of-being)
- [The hidden benefits of being an open-source startup](https://posthog.com/newsletter/open-source-benefits)
- [How we monetized our open source devtool](https://posthog.com/blog/open-source-business-models)
- [PostHog Project Structure](https://posthog.com/handbook/engineering/project-structure)

### Grafana
- [Grafana Licensing](https://grafana.com/licensing/)
- [Grafana, Loki, and Tempo relicensed to AGPLv3](https://grafana.com/blog/2021/04/20/grafana-loki-tempo-relicensing-to-agplv3/)
- [Enterprise Plugin License](https://grafana.com/legal/enterprise-plugins/)
- [Grafana Plugin SDK for Go](https://grafana.com/developers/plugin-tools/key-concepts/backend-plugins/grafana-plugin-sdk-for-go)
- [Plugin System Architecture](https://deepwiki.com/grafana/grafana/11-plugin-system)
- [Grafana Enterprise](https://grafana.com/docs/grafana/latest/introduction/grafana-enterprise/)

### Supabase
- [Supabase GitHub Repository](https://github.com/supabase/supabase)
- [Supabase Architecture](https://supabase.com/docs/guides/getting-started/architecture)
- [Supabase Self-Hosting](https://supabase.com/docs/guides/self-hosting)
- [Supabase for Enterprise](https://supabase.com/solutions/enterprise)

### Cal.com
- [Changing to AGPLv3 and introducing the Enterprise Edition](https://cal.com/blog/changing-to-agplv3-and-introducing-enterprise-edition)
- [Cal.com GitHub Repository](https://github.com/calcom/cal.com)
- [Cal.com License](https://github.com/calcom/cal.com/blob/main/LICENSE)
- [Cal.com License Key Docs](https://cal.com/docs/self-hosting/license-key)

### Keycloak
- [Keycloak GitHub Repository](https://github.com/keycloak/keycloak)
- [Keycloak Wikipedia](https://en.wikipedia.org/wiki/Keycloak)
- [Keycloak vs RH-SSO Discussion](https://keycloak.discourse.group/t/keycloak-vs-rh-sso/11916)
- [Red Hat SSO vs Keycloak Comparison](https://sennovate.com/redhat-sso-v-s-keycloak-here-is-all-you-need-to-know/)

### MinIO
- [MinIO Commercial License](https://www.min.io/commercial-license)
- [MinIO GitHub Repository](https://github.com/minio/minio)
- [From Open Source to Free and Open Source](https://blog.min.io/from-open-source-to-free-and-open-source-minio-is-now-fully-licensed-under-gnu-agplv3/)
- [Understanding the MinIO Subscription Network](https://blog.min.io/subnet-series-communication/)

### HashiCorp
- [HashiCorp adopts Business Source License](https://www.hashicorp.com/en/blog/hashicorp-adopts-business-source-license)
- [Terraform License Change Impact](https://spacelift.io/blog/terraform-license-change)
- [Terraform in 2025: IBM, OpenTofu, and the Future](https://encore.cloud/resources/terraform-2025)
- [IBM closes $6.4B HashiCorp acquisition](https://techcrunch.com/2025/02/27/ibm-closes-6-4b-hashicorp-acquisition/)
- [HashiCorp BSL Analysis](https://www.itpro.com/software/open-source/analysis-hashicorp-prioritizes-its-business-with-bsl-license-switch-but-community-upset-cannot-be-ignored)

### Elasticsearch / OpenSearch
- [OpenSearch in 2025: Much more than an Elasticsearch fork](https://www.infoworld.com/article/3971473/opensearch-in-2025-much-more-than-an-elasticsearch-fork.html)
- [Elasticsearch vs OpenSearch in 2025](https://pureinsights.com/blog/2025/elasticsearch-vs-opensearch-in-2025-what-the-fork/)
- [Elasticsearch Is Open Source Again](https://www.elastic.co/blog/elasticsearch-is-open-source-again)
- [Elastic Returns to Open Source: Will the Community Follow?](https://www.infoq.com/news/2024/09/elastic-open-source-agpl/)
- [From Forks to Sporks: The Journey Behind Creating OpenSearch](https://25.foss-backstage.de/session/from-forks-to-sporks-the-journey-behind-creating-opensearch/)

### Sentry
- [Re-Licensing Sentry](https://blog.sentry.io/relicensing-sentry/)
- [Introducing the Functional Source License](https://blog.sentry.io/introducing-the-functional-source-license-freedom-without-free-riding/)
- [Sentry Licensing](https://open.sentry.io/licensing/)
- [Sentry GitHub Repository](https://github.com/getsentry/sentry)

### Rust / Cargo
- [Cargo Features Reference](https://doc.rust-lang.org/cargo/reference/features.html)
- [Cargo Workspaces Reference](https://doc.rust-lang.org/cargo/reference/workspaces.html)
- [Cargo Workspace Feature Unification Pitfall](https://nickb.dev/blog/cargo-workspace-and-the-feature-unification-pitfall/)
- [Conditional Compilation in Rust with Feature Flags](https://midnightprogrammer.net/post/conditional-compilation-in-rust-with-feature-flags/)

### General
- [Open Source Business Models That Work in 2026](https://technews180.com/blog/open-source-models-that-work/)
- [Business models for open-source software (Wikipedia)](https://en.wikipedia.org/wiki/Business_models_for_open-source_software)
