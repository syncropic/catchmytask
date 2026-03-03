# First Principles of Work Management

_A philosophical and architectural foundation for building a timeless work management system._

---

## Preamble: Why First Principles?

Most work management tools begin with features: boards, lists, timers, charts. They copy what
exists and add incremental improvements. The result is a landscape of thousands of tools that
all feel the same, lock you into their paradigm, and become obsolete within a decade.

To build something that endures, we must reason from first principles. We must ask not "what
features should a project management tool have?" but rather: **What is work? What does it mean
to manage it? And what are the fundamental structures that any system of work management must
respect?**

First-principles thinking, as articulated by thinkers from Aristotle to Elon Musk, means
decomposing a problem into its most basic, self-evident truths and reasoning upward from there.
We strip away assumptions inherited from existing tools --- assumptions about databases, GUIs,
SaaS platforms, proprietary formats --- and ask what remains.

What remains is surprisingly simple: **actors** performing **work** across **time**, requiring
**context**, producing **artifacts**, and coordinating through **communication**. Everything
else is implementation detail.

---

## I. What IS Work?

### The Philosophical Foundation

Hannah Arendt, in _The Human Condition_ (1958), distinguished three fundamental categories of
human activity:

- **Labor**: Cyclical, biological, never-ending. The work of maintenance, of keeping systems
  alive. In software terms: monitoring, incident response, dependency updates. Labor has no
  final product; it is consumed as fast as it is produced.

- **Work**: Goal-directed, producing durable artifacts. Building a feature, writing a document,
  creating infrastructure. Work produces objects that persist beyond the act of creation. It
  involves strategy, calculation, and planning. Time becomes linear rather than circular.

- **Action**: The initiation of something genuinely new. Strategic decisions, creative leaps,
  founding a company. Action discloses the actor to the world and is irreducibly unpredictable.

This tripartite distinction matters because **most work management systems treat all work as
"Work" (the middle category)** --- discrete tasks with clear outcomes. But real work includes
all three categories, and a system that cannot represent labor (ongoing) or action (emergent)
is fundamentally incomplete.

### A Taxonomy of Work Types

From first principles, work can be classified along several orthogonal dimensions:

**By Determinism:**
- **Defined work**: The outcome and path are known. "Deploy version 2.3.1 to production."
- **Discovered work**: The outcome is known but the path is not. "Fix the memory leak."
- **Exploratory work**: Neither outcome nor path is known. "Investigate why users churn."
- **Emergent work**: Work that arises from doing other work. Side effects, insights, blockers.

**By Temporality:**
- **Atomic**: Can be completed in a single session. A task.
- **Compound**: Requires multiple sessions. A project.
- **Continuous**: Has no natural end. A process, a responsibility.
- **Periodic**: Recurs on a schedule. A ritual, a review.

**By Scope:**
- **Individual**: One actor, one unit of work.
- **Collaborative**: Multiple actors, one unit of work.
- **Orchestrated**: Multiple actors, multiple units of work, coordinated toward a goal.

**By Nature:**
- **Creative**: Producing something new. Design, writing, coding.
- **Analytical**: Understanding something existing. Research, debugging, auditing.
- **Operational**: Maintaining something running. Monitoring, responding, updating.
- **Communicative**: Sharing information. Meetings, documents, reviews.

### The Fundamental Unit: The Work Item

Despite this rich taxonomy, we need a fundamental unit. In the same way that the atom is
chemistry's fundamental unit (while acknowledging subatomic particles), the **work item** is
our fundamental unit.

A work item, at its most reduced, is:

```
A description of a desired state change in the world,
assigned to one or more actors,
existing in some state of progress.
```

That is it. Everything else --- priority, due date, labels, attachments, comments --- is
metadata layered on top of this irreducible core. A system that respects this minimalism at
its foundation can grow to accommodate any complexity, while a system that bakes in too much
structure at the core becomes rigid.

---

## II. What IS Management?

Management is not a thing; it is a set of **verbs** --- actions performed on work and the
systems that contain it. From first principles, these verbs cluster into distinct activities:

### The Verbs of Work Management

**Capture**: Getting work out of heads and into a system. David Allen's GTD methodology
begins here: "Your mind is for having ideas, not holding them." The act of capture
transforms vague intention into concrete commitment. Allen's insight --- that productivity
is proportional to the ability to relax, and relaxation requires trusting your system ---
is foundational. If actors cannot trust that captured work will not be lost, the system fails.

**Clarify**: Transforming captured input into actionable work items. "Fix the thing" becomes
"Resolve null pointer exception in PaymentService.processRefund when order has no shipping
address." Clarification is the bridge between human intent and executable specification.

**Organize**: Placing work items into structures --- projects, categories, priorities,
timelines. Organization creates navigability. Without it, a system with a thousand work items
is no better than a system with none.

**Prioritize**: Determining the order in which work should be done. This is fundamentally
a decision-making act and often the hardest part of management. Priority is always relative
and always contextual --- what is urgent today may be irrelevant tomorrow.

**Delegate**: Assigning work to actors. Delegation requires matching work to capability,
availability, and authority. In a world with AI agents, delegation becomes programmatic and
continuous rather than occasional and manual.

**Execute**: The actual doing of work. Management systems do not execute work directly, but
they must support execution by providing context, removing blockers, and staying out of the
way.

**Monitor**: Observing the state and progress of work. Monitoring answers the questions:
What is happening? Is it on track? Where are the bottlenecks?

**Review**: Reflecting on completed work and the system itself. Reviews produce learning.
Without review, a system cannot improve. Allen's "Weekly Review" is the practice that holds
GTD together.

**Adapt**: Changing plans based on new information. The ability to adapt is the difference
between a living system and a dead plan.

### The Meta-Insight

These verbs operate at multiple levels simultaneously. You capture a task, but you also
capture a project, a goal, a strategic objective. You prioritize within a sprint, within a
quarter, within a career. **Management is fractal** --- the same operations recur at every
scale, from a personal to-do list to an enterprise portfolio.

A well-designed system makes these verbs effortless at every scale.

---

## III. The Actor Model

### Who (or What) Does Work?

Work does not exist in isolation. It is performed by **actors**. From first principles, an
actor is any entity capable of:

1. **Perceiving** a work item (reading, understanding its requirements)
2. **Deciding** whether and how to act on it
3. **Acting** to change the state of the world
4. **Reporting** on what was done

Historically, actors were always humans. This is no longer true. The actor landscape now
includes:

**Individual Humans**: The traditional worker. Has limited attention, needs sleep, brings
judgment, creativity, empathy, and contextual understanding. Communicates in natural language.
Works best with clear context and minimal interruption.

**AI Agents**: Software entities that can perceive, decide, act, and report. Tireless,
fast, consistent, but lacking judgment in novel situations. Can work 24/7. Communicate
through APIs and file I/O. Work best with clear specifications and structured context.

**Teams**: Groups of actors (human, AI, or mixed) that share responsibility for a body of
work. Teams have emergent properties that individuals lack: collective knowledge, parallel
execution, diverse perspectives. But teams also have coordination costs.

**Organizations**: Teams of teams. Organizations add layers of hierarchy, policy, and
governance. They have institutional memory (or should) that outlives individual members.

**Automated Systems**: CI/CD pipelines, cron jobs, monitoring systems. Not "intelligent" in
the way AI agents are, but they are actors in the sense that they perform work in response
to triggers.

### Actor Properties

Each actor type has different properties that affect how they interact with work:

| Property | Human | AI Agent | Team | Automated System |
|---|---|---|---|---|
| Availability | Limited hours | 24/7 | Overlapping hours | 24/7 |
| Latency | Minutes to days | Seconds to minutes | Hours to days | Milliseconds |
| Context window | Large but lossy | Large but bounded | Distributed | None |
| Judgment | Strong | Improving | Collective | None |
| Creativity | High | Emerging | Synergistic | None |
| Consistency | Variable | High | Variable | Perfect |
| Cost per unit | High | Low and falling | High | Very low |
| Communication | Natural language | Structured + NL | Mixed | APIs |
| Learning | Slow, deep | Fast, shallow | Slow, broad | None |

### The Multi-Actor Design Principle

**A work management system must be actor-agnostic at its core.** The data model should not
assume that the actor is a human sitting at a screen. It should not assume a GUI. It should
not assume synchronous interaction.

This principle has profound implications:

1. **Work items must be machine-readable**: If an AI agent cannot parse a work item, the
   system excludes an entire class of actors. This argues for structured, plain-text formats
   over rich-text blobs or proprietary databases.

2. **Interfaces must be plural**: A human needs a visual interface. An AI agent needs a
   file or API interface. A CI system needs a programmatic interface. The system must support
   all of these as first-class citizens, not afterthoughts.

3. **Communication must be protocol-based**: Actors communicate through shared protocols,
   not shared assumptions. A protocol-based approach (like the Model Context Protocol) allows
   heterogeneous actors to collaborate without tight coupling.

4. **Delegation must be capability-aware**: Assigning work to an actor requires knowing what
   the actor can do. The system should model actor capabilities, not just actor identity.

---

## IV. State and Transitions

### Work as a State Machine

Every work item exists in a **state**. At the most fundamental level:

```
[Not Yet Conceived] --> [Captured] --> [Active] --> [Done]
```

But real work is more nuanced. From first principles, the minimal useful state machine is:

```
                    +----------+
                    |  INBOX   |  (Captured but unclarified)
                    +----+-----+
                         |
                    clarify / triage
                         |
                    +----v-----+
               +--->|  READY   |  (Clarified, waiting to be started)
               |    +----+-----+
               |         |
               |    start work
               |         |
               |    +----v-----+
               |    |  ACTIVE  |  (Being worked on)
               |    +----+-----+
               |         |
               |    +----+----+--------+
               |    |         |        |
               | block    complete   abandon
               |    |         |        |
               | +--v---+  +-v----+ +-v--------+
               | |BLOCKED|  | DONE | | CANCELLED |
               | +--+---+  +------+ +----------+
               |    |
               | unblock
               |    |
               +----+
```

### State is Not Enough: Events Matter

A state machine tells you **where** work is. But understanding **how** it got there is equally
important. This is the insight behind event sourcing: the current state of a work item is a
projection of all the events that have happened to it.

```
Events:                              State:
  created(desc="Fix login bug")      -> INBOX
  clarified(priority=high)           -> READY
  assigned(actor=alice)              -> READY
  started(actor=alice)               -> ACTIVE
  commented(actor=bob, "try X")      -> ACTIVE
  blocked(reason="waiting on API")   -> BLOCKED
  unblocked()                        -> ACTIVE
  completed(resolution="fixed")      -> DONE
```

The event log provides:
- **Complete audit trail**: Every change is recorded, with who, when, and why.
- **State reconstruction**: You can derive the state at any point in time.
- **Debugging**: When something goes wrong, you can replay history.
- **Learning**: Patterns in events reveal process bottlenecks.

### Side Effects and State

State transitions often trigger **side effects**: notifications, automation, cascading updates.
A work item moving to BLOCKED might notify the assignee's manager. A work item moving to DONE
might trigger deployment.

The key design principle is: **side effects should be decoupled from state transitions**.
The state machine defines what transitions are valid. Side effects are reactions to transitions,
configured separately. This separation keeps the core model clean and makes side effects
composable and customizable.

### Custom State Machines

Different types of work need different state machines. A bug report has different states than a
design review, which has different states than a hiring process. Rather than hardcoding one
state machine, **the system should allow state machines to be defined per work type**, while
providing sensible defaults.

The universal constraint: every state machine must have at least one **terminal state** (a
state with no outgoing transitions) and at least one **initial state** (a state reachable
from the creation event).

---

## V. Context and Knowledge

### The Context Problem

Work does not exist in a vacuum. Every work item exists within a web of context:

- **Why** does this work exist? (Motivation, origin, business case)
- **What** has been tried before? (History, prior art, failed approaches)
- **Who** knows about this? (Expertise, stakeholders, dependencies)
- **Where** does this fit? (Architecture, roadmap, strategy)
- **When** does this matter? (Deadlines, dependencies, market timing)

Most work management tools treat context as an afterthought --- a description field, maybe
some comments. But **context is the single most important factor in work quality and
efficiency**. A task without context is a task that will be done wrong.

### The Zettelkasten Insight

Niklas Luhmann's Zettelkasten method offers a profound insight: knowledge is not hierarchical
but **networked**. Individual notes (atomic, self-contained) gain their power from the
**links** between them. As the network grows, new patterns and insights emerge that were not
present in any individual note.

Applied to work management:

1. **Work items should be atomic**: Each work item captures one unit of work, self-contained
   enough to be understood on its own.

2. **Work items should be linked**: Relationships between work items --- dependencies,
   related work, parent-child --- create a knowledge graph.

3. **Context should be emergent**: The context for any work item is the subgraph of related
   items, documents, discussions, and decisions reachable from it. Context is not written
   once; it accumulates and evolves.

### Knowledge Layers

Context exists in layers, from most specific to most general:

```
Layer 0: The work item itself (description, acceptance criteria)
Layer 1: Directly linked items (parent task, blocking issues, related PRs)
Layer 2: Project context (goals, architecture decisions, team norms)
Layer 3: Organizational context (strategy, values, institutional knowledge)
Layer 4: Domain context (industry standards, regulatory requirements, best practices)
```

A well-designed system makes it easy to navigate these layers. When an actor picks up a work
item, they should be able to pull in exactly as much context as they need --- no more, no less.
For AI agents, this layered context becomes the prompt engineering challenge: what context to
include to enable good autonomous work.

### Context Decay and Refresh

Context is not static. It decays as the world changes. A decision made six months ago may no
longer be valid. A technical constraint may have been removed. People leave, priorities shift.

The system should support:
- **Timestamped context**: When was this context created? When was it last validated?
- **Context ownership**: Who is the source of truth for this context?
- **Context challenges**: A mechanism for questioning whether context is still valid.
- **Context inheritance**: Child work items inherit context from parents, but can override it.

---

## VI. Time and Asynchrony

### Time as a First-Class Concept

Work unfolds across time. This seems obvious, but most work management tools treat time
simplistically --- as a due date field and maybe a time tracker. From first principles, time
interacts with work in several fundamental ways:

**Sequencing**: Some work must happen before other work. Dependencies create temporal ordering.
The critical path through a dependency graph determines the minimum time to completion.

**Deadlines**: External constraints impose time boundaries. Deadlines are not properties of
work itself but of the relationship between work and its environment (market windows,
regulatory requirements, commitments to others).

**Duration and Estimation**: How long will work take? This is one of the hardest problems in
work management and one that humans are notoriously bad at. AI agents may improve estimation
by analyzing historical patterns.

**Rhythm and Cadence**: Work happens in rhythms --- daily standups, weekly reviews, quarterly
planning, annual strategy. These rhythms create the temporal structure within which work flows.

**Interruption and Resumption**: Work is rarely continuous. It is started, interrupted, and
resumed. Each interruption has a context-switching cost. A system should minimize unnecessary
interruptions and reduce the cost of resumption by preserving context.

### The Async Revolution

The traditional model of work assumes synchronous collaboration: people in the same room, at
the same time, working together. This model is breaking down:

- **Distributed teams** span time zones. There is no "same time."
- **AI agents** work 24/7. They do not attend meetings.
- **Deep work** requires uninterrupted focus, which synchronous communication destroys.
- **Global coordination** requires handoffs across time zones.

The future of work management is fundamentally **asynchronous**. This means:

1. **Communication should default to async**: Written over spoken. Documented over discussed.
   This creates artifacts that AI agents can consume and that humans in other time zones can
   read.

2. **State should be self-describing**: An actor picking up work at 3 AM should be able to
   understand its state without asking anyone. The work item itself, plus its event history
   and linked context, should tell the full story.

3. **Handoffs should be explicit**: When one actor stops working and another starts, the
   handoff should be a first-class event with context transfer. "I got this far. Here is what
   I tried. Here is what I think should happen next."

4. **Progress should be observable**: In an async world, you cannot tap someone on the shoulder
   and ask "how is it going?" The system must make progress visible without requiring
   synchronous check-ins.

### The 24/7 Agent Loop

AI agents introduce a new temporal pattern: the continuous work loop. An agent can:

```
while true:
    items = query(state=READY, assignee=self, priority=desc)
    if items.empty():
        items = query(state=READY, assignee=none, capabilities match self)
    for item in items:
        context = gather_context(item)
        result = execute(item, context)
        update_state(item, result)
        if result.needs_human_review:
            request_review(item, result)
    sleep(interval)
```

This loop raises new questions for work management:
- How do you throttle agent work to avoid overwhelming human reviewers?
- How do you prioritize agent work vs. human work?
- How do you handle agent errors without human supervision?
- How do you prevent agents from working at cross-purposes?

These are not hypothetical questions. They are the design challenges of the next five years.

---

## VII. Composability

### Work Composes

Simple work items combine into complex structures. This composition happens along several
dimensions:

**Hierarchical Composition (Parent-Child)**:
```
Epic: "Redesign checkout flow"
  Story: "New payment form"
    Task: "Design payment form UI"
    Task: "Implement Stripe integration"
    Task: "Write payment form tests"
  Story: "New order summary"
    Task: "Design order summary component"
    Task: "Implement real-time price updates"
```

Hierarchical composition answers the question: "What smaller pieces make up this larger piece
of work?"

**Sequential Composition (Dependencies)**:
```
"Design payment form UI" --> "Implement payment form" --> "Write payment form tests"
```

Sequential composition answers the question: "What must happen before this can start?"

**Parallel Composition (Concurrent Work)**:
```
"New payment form" || "New order summary"
```

Parallel composition answers the question: "What can happen simultaneously?"

**Cross-cutting Composition (Relations)**:
```
"Implement Stripe integration" --related-to--> "Update Stripe API version"
"New checkout flow" --blocks--> "Marketing launch campaign"
```

Cross-cutting composition captures relationships that do not fit neatly into hierarchies
or sequences.

### The Kanban Insight: Flow Over Structure

Kanban, originating from Toyota's manufacturing system, offers a crucial insight: **the flow
of work matters more than the structure of work**. WIP (Work In Progress) limits prevent
overloading. Pull-based systems (where actors pull work when they have capacity) are more
efficient than push-based systems (where work is assigned to actors).

Key Kanban principles applied to work management:

1. **Visualize work**: Make all work visible, including its state and relationships.
2. **Limit WIP**: An actor (human or AI) should not have more active work items than they
   can effectively handle.
3. **Manage flow**: Optimize for throughput (completed items per unit time), not busyness.
4. **Make policies explicit**: The rules governing how work moves through the system should
   be visible and agreed upon.
5. **Improve collaboratively**: The system should evolve based on observed flow patterns.

### Composability as Architecture

The Unix philosophy provides the architectural principle: **small, sharp tools that compose**.
Applied to work management:

- A work item is a file. It has content and metadata.
- A project is a directory of work items.
- A view (board, list, timeline) is a query over work items.
- A workflow is a state machine applied to work items.
- A report is an aggregation over work items.

Each of these can be implemented independently and composed freely. The power comes from
composition, not from any individual component. This is the antithesis of the monolithic
project management tool where everything is tightly coupled and nothing can be used
independently.

---

## VIII. Portability and Interoperability

### The Lock-in Problem

Every proprietary work management tool creates a walled garden. Your data lives in their
database, accessible through their API (if they have one), in their format. When you switch
tools --- and you will switch tools, because tools come and go --- you lose context, history,
and relationships. This loss is not merely inconvenient; it is destructive. The institutional
knowledge embedded in years of work items, comments, and decisions is gone.

### The Plain Text Accounting Analogy

The plain text accounting movement (Ledger, hledger, Beancount) provides an instructive
analogy. Financial data is arguably more critical than work management data, yet the plain
text accounting community has shown that:

1. **Plain text files are sufficient** for even complex accounting needs.
2. **Human readability and machine parsability are not in conflict** --- a well-designed
   format achieves both.
3. **The format is the API** --- any tool that can read the format can participate in the
   ecosystem.
4. **Version control (git) provides history** --- better than any application-level audit
   log because it captures the full context of changes.
5. **Longevity is guaranteed** --- a plain text file from 1970 is still readable today.
   Can you say the same about any proprietary database format?

### Design Principles for Portability

**1. Human-Readable, Machine-Parsable Format**

Work items should be stored in a format that a human can read in any text editor and a machine
can parse reliably. Markdown with YAML frontmatter is a strong candidate:

```markdown
---
id: CMT-0042
title: Implement user authentication
type: task
status: active
priority: high
assignee: alice
created: 2026-02-15T10:30:00Z
parent: CMT-0010
depends_on: [CMT-0039, CMT-0040]
tags: [security, backend, auth]
---

## Description

Implement JWT-based authentication for the API, including:
- Login endpoint
- Token refresh
- Role-based access control

## Acceptance Criteria

- [ ] Users can log in with email and password
- [ ] Tokens expire after 24 hours
- [ ] Refresh tokens work correctly
- [ ] Admin and user roles are enforced

## Context

See the auth architecture decision in `docs/decisions/003-auth-architecture.md`.
The Stripe integration (CMT-0039) must be complete first because payment
endpoints need auth.

## Log

- 2026-02-15: Created by @alice during sprint planning
- 2026-02-17: Started implementation
- 2026-02-18: Blocked on CMT-0039, switching to documentation
```

This format is:
- Readable by any human with a text editor
- Parsable by any YAML/Markdown parser
- Diffable in git (every change is tracked with full context)
- Editable by AI agents (structured enough to modify programmatically)
- Portable to any system (no proprietary format)

**2. Convention Over Configuration**

The file system provides natural organization:

```
.cmt/
  config.yml          # Project-level configuration
  states.yml          # State machine definitions
  templates/          # Work item templates
  items/
    CMT-0001.md
    CMT-0002.md
    ...
  archive/            # Completed/cancelled items
    CMT-0003.md
```

Directory structure is the database. File names are identifiers. Git history is the event log.
No server required. No database to maintain. No API to keep running.

**3. Protocol-Based Interoperability**

For systems that need real-time interaction (dashboards, notifications, agent integration),
define protocols rather than implementations:

- **Read protocol**: How to query work items (file glob, frontmatter query)
- **Write protocol**: How to create/update work items (file write with validation)
- **Event protocol**: How to subscribe to changes (file system watching, git hooks)
- **Context protocol**: How to gather context for a work item (link resolution)

Any tool that implements these protocols can participate in the ecosystem, regardless of
implementation language, platform, or UI paradigm.

---

## IX. Simplicity vs. Power: Progressive Disclosure

### The Tension

Work management has a fundamental tension: simple workflows need simple tools, but complex
workflows need powerful tools. Most tools resolve this tension by choosing a side ---
sticky notes for simplicity, enterprise PM tools for power. Both choices fail: sticky notes
cannot scale, and enterprise tools are unusable for simple needs.

### Progressive Disclosure as Resolution

Progressive disclosure, as articulated in UX research by Jakob Nielsen and the Interaction
Design Foundation, resolves this tension: **initially show only the most important options;
reveal complexity on demand**. The interface progresses naturally from simple to complex,
mirroring how the brain processes information.

Applied to work management:

**Level 0 --- Capture**:
```
wm add "Fix the login bug"
```
One command. One argument. A work item exists. No project, no priority, no assignee. Just
captured. GTD's first step, accomplished with zero friction.

**Level 1 --- Organize**:
```
wm add "Fix the login bug" --priority high --assignee alice
```
Add metadata when you know it. Skip it when you do not.

**Level 2 --- Structure**:
```
wm add "Fix the login bug" --parent CMT-0010 --depends-on CMT-0039
```
Place work within hierarchies and dependencies. Only when the work is complex enough to
warrant structure.

**Level 3 --- Automate**:
```yaml
# .cmt/workflows/bug-fix.yml
trigger: item.type == "bug" && item.status == "done"
actions:
  - create_item:
      title: "Verify fix for ${item.title}"
      type: verification
      assignee: qa-team
```
Define workflows, automations, and policies. Only when the team and process are mature
enough to benefit.

**Level 4 --- Orchestrate**:
```yaml
# .cmt/agents/triage-agent.yml
name: triage-bot
capabilities: [classify, prioritize, assign]
trigger: item.status == "inbox"
policy: |
  Classify by type (bug, feature, chore).
  Set priority based on severity and customer impact.
  Assign to the team member with the most relevant expertise
  and the lowest current WIP count.
```
AI agent integration. Only when the team is ready for autonomous work management.

### The Principle

At every level, the system is **complete**. Level 0 is a fully functional work management
system --- you can add items and mark them done, and that may be all you ever need. Each
subsequent level adds capability without invalidating what came before. The file format is
the same at every level. The data model is the same. The tools grow, but the foundation
remains.

This is the principle of **progressive capability**: the system should be useful on day one
with zero configuration and powerful on day one thousand with full configuration, and the
path between them should be gradual and reversible.

---

## X. The File as Universal Interface

### Why Files?

In a world of databases, APIs, and cloud services, the humble file might seem like a
regression. It is not. The file is the most universal, durable, and interoperable interface
in computing:

1. **Every actor can use files**: Humans read and write files. AI agents read and write files.
   Scripts read and write files. CI systems read and write files. No other interface is this
   universal.

2. **Git tracks files**: Version control, branching, merging, history, collaboration, code
   review --- all the tooling that software engineers have built over decades --- works on
   files. Put your work items in files, and you get all of this for free.

3. **Files are durable**: A plain text file written in 1970 is still readable today. A
   database from a SaaS tool that shut down in 2019 is not.

4. **Files are portable**: Copy them, email them, put them on a USB drive, sync them to any
   cloud. No migration tool needed. No export/import dance.

5. **Files are inspectable**: `cat`, `grep`, `diff`, `wc` --- the entire Unix toolkit works
   on files. No special client needed.

6. **Files compose**: Directories provide hierarchy. Symlinks provide cross-references. File
   naming conventions provide identification. The file system is a database with a universal
   query language (the shell).

### The File-First Architecture

A file-first work management system has this architecture:

```
+------------------+     +------------------+     +------------------+
|  Human Interface |     |  Agent Interface  |     |  Tool Interface  |
|  (CLI, TUI, GUI) |     |  (MCP, file I/O)  |     |  (CI, scripts)   |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
         v                        v                        v
+--------------------------------------------------------------+
|                    File System (The Truth)                     |
|                                                               |
|  .cmt/items/*.md    --- work items as markdown files         |
|  .cmt/config.yml    --- configuration and state machines     |
|  .cmt/templates/    --- templates for new work items         |
|  .cmt/views/        --- saved queries and views              |
|  .cmt/agents/       --- agent configurations                 |
+--------------------------------------------------------------+
         |
         v
+--------------------------------------------------------------+
|                    Git (The History)                           |
|                                                               |
|  Every change is a commit. Every commit has context.          |
|  Branches enable parallel work. Merges resolve conflicts.     |
|  Tags mark milestones. Blame shows authorship.                |
+--------------------------------------------------------------+
```

The file system is the source of truth. Git is the event store. Everything else is a view.

### What This Enables

**For humans**: Edit work items in your favorite editor. Use the CLI for quick operations.
Use a TUI for visual management. Use a web GUI if you prefer. All interfaces read from and
write to the same files.

**For AI agents**: Read work items as structured markdown. Parse frontmatter for metadata.
Follow links for context. Write updates directly to files. Create new work items by writing
new files. The agent does not need a special API --- the file system _is_ the API.

**For teams**: Share work through git. Branch for experiments. Pull requests for work item
changes (just like code review, but for work management). Merge conflicts are resolved the
same way as code conflicts.

**For automation**: Git hooks trigger on changes. CI pipelines can validate work items
(correct format, required fields, valid state transitions). Scripts can generate reports by
parsing files.

**For portability**: Switch tools by keeping the same files. Build your own tools that read
the format. Export is trivial --- the files are the export. Import from other tools by
converting to the file format.

---

## XI. Synthesis: Design Principles

From the ten explorations above, we can distill a set of design principles for a timeless
work management system:

### Principle 1: Atoms and Composition

The fundamental unit is the work item. Everything else is composed from work items:
projects are collections, workflows are state machines over collections, views are queries
over collections. Keep the atom simple; let complexity emerge from composition.

_Inspired by: Unix philosophy, Zettelkasten atomicity, chemical elements._

### Principle 2: Actor Agnosticism

The system makes no assumption about what kind of entity interacts with it. Humans, AI agents,
scripts, and services are all first-class actors. The interface is the file, the protocol is
read/write, and the format is human-readable and machine-parsable.

_Inspired by: Actor model, MCP protocol, multi-agent systems research._

### Principle 3: Events Over State

State is derived from events. The event log is the source of truth. Current state is a
convenient projection. This provides history, auditability, debuggability, and the ability to
build multiple views from the same event stream.

_Inspired by: Event sourcing, CQRS, git's commit log, plain text accounting._

### Principle 4: Context is King

A work item without context is a work item done wrong. The system should make it trivially
easy to attach, link, inherit, and navigate context. Context should be layered (item, project,
organization, domain) and time-aware (when was this context last validated?).

_Inspired by: Zettelkasten linking, GTD context lists, knowledge management research._

### Principle 5: Async by Default

Synchronous interaction is the exception, not the rule. Work items, comments, state
transitions, and handoffs are all asynchronous operations on shared state. The system must
be self-describing enough that any actor can pick up any work item at any time without needing
to ask anyone for context.

_Inspired by: Distributed systems, async-first remote work, Temporal's durable execution._

### Principle 6: Pull Over Push

Actors pull work when they have capacity, rather than having work pushed to them. WIP limits
prevent overloading. The system makes available work visible and lets actors (human or AI)
choose based on their capabilities and current load.

_Inspired by: Kanban, lean manufacturing, pull-based scheduling._

### Principle 7: Progressive Capability

The system is useful with zero configuration. Each layer of complexity is opt-in. Simple use
requires simple interaction. Power features are available but never required. The learning
curve is a gentle slope, not a cliff.

_Inspired by: Progressive disclosure UX, GTD's levels of perspective, Unix's "do one thing
well."_

### Principle 8: Files as Foundation

Plain text files are the storage layer. Git is the history layer. Everything else is a view.
This ensures durability, portability, inspectability, and compatibility with every tool,
editor, and workflow that exists or will exist.

_Inspired by: Plain text accounting, todo.txt, Unix file philosophy, git._

### Principle 9: Convention Over Configuration

Sensible defaults mean the system works immediately. Directory structure, file naming, default
state machines, and standard fields are all conventions that can be overridden but rarely need
to be. Configuration is for customization, not setup.

_Inspired by: Ruby on Rails, Go project structure, XDG conventions._

### Principle 10: Timelessness Over Trendiness

Every design decision should be evaluated against the question: "Will this still make sense in
20 years?" Plain text will. Git will. The concept of a state machine will. A dependency on a
specific cloud service will not. A proprietary binary format will not. An assumption that all
actors are humans will not.

_Inspired by: Lindy effect, Unix longevity, the endurance of fundamental data structures._

---

## XII. Open Questions and Future Exploration

This document establishes foundations, but several questions remain open for future
exploration:

### Conflict Resolution
When multiple actors modify the same work item concurrently (via git branches), how should
conflicts be resolved? Git's merge mechanics work for text, but semantic conflicts (two actors
both changing status) need higher-level resolution strategies.

### Access Control
Files are naturally permissioned by the file system and by git hosting platforms. But
fine-grained access control (this team can see these items but not those) is harder in a
file-based system. How do you balance openness with necessary privacy?

### Scale
A file-per-work-item approach works well up to thousands of items. At tens of thousands, file
system performance and git repository size become concerns. What indexing, archiving, and
partitioning strategies maintain performance at scale?

### Real-Time Collaboration
Files and git are inherently batch-oriented. How do you support real-time collaboration
(multiple people editing a board simultaneously) without abandoning the file-first principle?
CRDTs, operational transforms, or a sync layer over files?

### AI Agent Governance
As AI agents take on more work autonomously, how do you ensure quality, prevent errors from
cascading, and maintain human oversight? What guardrails, approval workflows, and rollback
mechanisms are needed?

### Metrics and Learning
How do you extract useful metrics (cycle time, throughput, estimation accuracy) from a
file-based event history? How do you feed these metrics back into the system to improve
prioritization and estimation?

### Social and Organizational Dynamics
Work management is not purely technical. It involves trust, motivation, politics, and culture.
How does a system design account for the human dynamics that no tool can fully automate?

---

## XIII. Conclusion

The work management tools of the past were built for a world of humans using graphical
interfaces to manage bounded projects with known outcomes. That world is fading. The future
is heterogeneous actors (human and AI), asynchronous collaboration across time zones and
schedules, work that is often exploratory and emergent rather than predetermined, and systems
that must last decades while tools come and go.

To build for this future, we must build on foundations that do not change: files, text, state
machines, events, composition, and protocols. We must resist the temptation to optimize for
today's technology at the expense of tomorrow's flexibility. We must make things simple enough
for a single person with a text editor and powerful enough for a thousand-agent organization.

The principles in this document are not a specification. They are a compass. As implementation
decisions arise, they should be tested against these principles. When principles conflict (and
they will --- simplicity vs. power, portability vs. performance, convention vs. flexibility),
the resolution should be documented as a design decision, becoming part of the living context
of the system itself.

The goal is not to build the best work management tool of 2026. The goal is to build a work
management **system** --- in the deepest sense of that word --- that remains useful, adaptable,
and true to its principles for as long as work itself endures.

---

## References and Inspirations

- Arendt, Hannah. _The Human Condition_. 1958. The philosophical foundation for
  understanding labor, work, and action as distinct categories of human activity.
- Allen, David. _Getting Things Done_. 2001. The methodology that formalized capture,
  clarify, organize, reflect, and engage as the fundamental workflow of personal productivity.
- Luhmann, Niklas. The Zettelkasten method. Atomic notes, linking, and emergent knowledge as
  a model for context management.
- Ohno, Taiichi. Kanban and the Toyota Production System. Pull-based work, WIP limits, and
  flow optimization as principles for managing work in progress.
- Thompson, Ken; McIlroy, Doug; Salus, Peter. The Unix Philosophy. Small tools, text streams,
  and composition as the architecture of enduring software systems.
- The Plain Text Accounting community (Ledger, hledger, Beancount). Proof that complex data
  management can be done with plain text files and command-line tools.
- The todo.txt project. A minimal, portable, human-readable format for task management.
- Temporal.io. Durable execution and workflow orchestration as patterns for reliable
  asynchronous agent coordination.
- Event Sourcing and CQRS patterns. State as a projection of events, enabling audit trails,
  temporal queries, and multiple read models.
- Nielsen Norman Group. Progressive disclosure as a UX principle for managing complexity.
