# Gray Area Probes by Domain Type

Use these probes in Phase 2 of the khuym:exploring skill to generate phase-specific gray areas.
Select 2–4 probes per domain type that apply to the feature at hand.
Do NOT use all probes — pick the ones that are genuinely undecided for this feature.

Source: GSD discuss-phase (primary), Superpowers brainstorming (secondary).

---

## SEE — Something users look at
*(UI, dashboards, visualizations, layouts, forms)*

**Layout & Density**
- What is the primary layout container — list, card grid, table, timeline, or canvas?
- How dense should this be? Information-rich (power user) or spacious (casual user)?
- What happens at mobile/small viewports — same layout, stacked, hidden, or a different view?
- Is there a fixed header/footer/sidebar, or does everything scroll?

**Visual States**
- What does the empty state look like when there is no data yet?
- What does the loading state look like — skeleton, spinner, or optimistic render?
- How are errors surfaced — inline, toast, banner, or modal?
- Are there hover states, focus states, or selection states to design?

**Interactions**
- Is this read-only, or can users interact (click, drag, edit inline)?
- If interactive: are changes immediate (optimistic) or do they require explicit save?
- Are there destructive actions? What is the confirmation pattern?
- What triggers navigation — explicit button, row click, or both?

**Content Presentation**
- How much text is shown before truncation? Is there expand/collapse?
- How are long lists paginated — page numbers, load-more, or infinite scroll?
- Are images, avatars, or icons included? What is the fallback?
- How is sorting and filtering exposed — dropdowns, tabs, or search?

---

## CALL — Something callers invoke
*(REST APIs, GraphQL, CLIs, webhooks, SDKs, internal service interfaces)*

**Interface Contract**
- What is the primary input shape — URL params, request body, flags, or event payload?
- What does a successful response contain — the created/updated resource, an ID, or just a status?
- Does this operation return a synchronous result or kick off an async job?
- What is the versioning strategy — path version (`/v2/`), header, or query param?

**Authentication & Authorization**
- Who is the expected caller — internal service, authenticated user, or anonymous client?
- What authentication mechanism is expected — API key, JWT, OAuth token, or session cookie?
- Are there permission tiers? Can some callers do more than others?

**Error Handling**
- What HTTP status codes or error codes map to which failure modes?
- What does the error response body look like — code + message, or structured details?
- How should callers handle rate limits — 429 with Retry-After, or a different signal?
- Are there partial-success responses (some items succeeded, some failed)?

**Behavior Modes**
- Is idempotency required? Can the same call be safely repeated?
- What are the timeout/retry expectations for callers?
- Does this operation have side effects (emails sent, jobs queued)? Should they be suppressible?
- Is there a dry-run or preview mode?

---

## RUN — Something that executes
*(Background jobs, cron tasks, scripts, CLI tools, services, pipelines)*

**Invocation**
- How is this triggered — cron schedule, event/message, explicit user command, or webhook?
- Is it single-instance or can multiple instances run in parallel?
- What is the expected runtime duration — seconds, minutes, or hours?

**Output & Reporting**
- Where does output go — stdout, log file, database, or notification?
- What verbosity levels are needed — silent, normal, verbose?
- How does progress get reported for long-running work — percentage, count, no reporting?
- What does the final summary contain?

**Error Recovery**
- What happens on partial failure — abort everything, continue with failures logged, or retry?
- Are failures retryable? What is the backoff/retry strategy?
- Who gets notified on failure — operations team, caller, nobody?
- Is there a dead-letter queue or error archive?

**Behavior Modes**
- Is there a dry-run mode that shows what would happen without side effects?
- Is there a force/override flag for cases that normally abort?
- What is the concurrency model — one job at a time, bounded pool, or unlimited?
- Are there resource limits (memory, CPU, API rate limits) to respect?

---

## READ — Something users read
*(Documentation, emails, reports, notifications, changelogs, READMEs)*

**Structure & Navigation**
- What is the top-level structure — sections with anchors, step-by-step, reference tables, or narrative?
- How long should this be — one page, multi-page, or expandable sections?
- Is there a table of contents? Auto-generated or hand-crafted?
- How are related documents linked — inline, sidebar, or "see also" section?

**Tone & Depth**
- Who is the primary audience — beginners, intermediate practitioners, or experts?
- What tone — formal/technical, conversational, or neutral reference?
- How much context/background is included — assume knowledge or explain from scratch?
- Are there examples or code snippets, and if so, in what language/format?

**Content Shape**
- What sections are required vs optional?
- Are there warnings, notes, or callout boxes for important information?
- Is there versioned content (different instructions for v1 vs v2)?
- What is the update/maintenance cadence — evergreen, release-gated, or ad-hoc?

---

## ORGANIZE — Something being structured
*(Data models, file layouts, taxonomies, naming conventions, configuration schemas)*

**Grouping Criteria**
- What is the primary grouping dimension — by type, by domain, by date, by owner, by status?
- Are there sub-groupings? How many levels of nesting are appropriate?
- What determines membership in a group — hard rules, soft conventions, or manual tagging?

**Naming Conventions**
- What naming pattern applies — camelCase, snake_case, kebab-case, PascalCase?
- Are there prefixes/suffixes that signal type or purpose?
- How are conflicts resolved when two things could have the same name?
- Are names required to be stable (referenced by ID) or can they be renamed freely?

**Edge Cases & Exceptions**
- How are items that don't fit the primary grouping handled — default bucket, ungrouped, or flagged?
- What happens to orphaned items (parent deleted, foreign key broken)?
- Are there items that belong in multiple groups (multi-tag vs single-category)?
- How is the order within a group determined — alphabetical, manual, date, priority?

**Migration & Evolution**
- Does existing data need to be restructured into this new organization?
- Can the structure evolve over time, or does it need to be stable from day one?
- What is the process for adding a new group/category — self-serve or gated approval?

---

## Cross-Cutting Probes
*(Apply to any domain type when relevant)*

**Scope Boundary**
- What is explicitly OUT of scope for this feature (to prevent scope creep in planning)?
- Are there adjacent features this touches but does NOT own?

**Prior Decisions**
- Is there an existing pattern in the codebase that this should follow or deliberately diverge from?
- Have any of these decisions been made in a prior exploring session for a related feature?

**Downstream Consumer**
- Who/what consumes the output of this feature — end users, other services, internal tools?
- Does the output need to be machine-readable, human-readable, or both?
