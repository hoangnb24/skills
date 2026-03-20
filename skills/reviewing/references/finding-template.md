# Finding File Template

Every finding produced by a review agent must follow this format exactly. The file goes in `.khuym/findings/`.

---

## Naming Convention

```
{id}-pending-{priority}-{slug}.md
```

| Part | Rules |
|------|-------|
| `{id}` | Zero-padded 3-digit integer. Start at 001 for each review session. |
| `pending` | Always `pending` when first written. Updated to `resolved` or `deferred` when addressed. |
| `{priority}` | `p1`, `p2`, or `p3` — lowercase. |
| `{slug}` | Kebab-case description, max 6 words. Describes the problem, not the file it's in. |

**Examples:**
```
001-pending-p1-sql-injection-in-search.md
002-pending-p2-missing-rate-limiting-on-auth.md
003-pending-p3-unused-import-cleanup.md
004-pending-p1-idor-on-user-profile-endpoint.md
005-pending-p2-n-plus-one-in-order-listing.md
```

**Anti-examples (don't do this):**
```
001-pending-p1-userService.ts.md        ← names the file, not the problem
002-pending-p2-issue.md                 ← not descriptive
003-pending-p1-fixThis.md              ← not kebab-case
```

---

## File Template

```markdown
---
status: pending
priority: p1
source_agent: code-quality
tags: [code-review, security]
created: YYYY-MM-DD
feature: <feature-slug>
---

# [One-line title: What is wrong]

## Problem Statement

<!-- 2–4 sentences. What is the issue, why does it matter, what could go wrong if not fixed. -->
<!-- For P1: include the credible attack/failure path. -->
<!-- For P2: explain the reliability or performance impact. -->
<!-- For P3: explain the maintenance or readability concern. -->

## Evidence

<!-- Be specific. Always include file path and line number(s). -->

**File:** `src/path/to/file.ts`  
**Line(s):** 42–47  

```code-snippet-here```

**Why this is a problem:**
<!-- One sentence connecting the code to the problem statement. -->

## Proposed Solutions

### Option A — [Recommended] [Short label]
<!-- Describe the fix. Include a code snippet if it clarifies. -->
**Pros:** ...  
**Cons:** ...  
**Effort:** Small | Medium | Large

### Option B — [Alternative label]
**Pros:** ...  
**Cons:** ...  
**Effort:** Small | Medium | Large

## Acceptance Criteria

<!-- How do we know this finding is resolved? Be testable. -->
- [ ] [Specific, verifiable condition 1]
- [ ] [Specific, verifiable condition 2]

## Resolution

<!-- Leave blank when creating. Fill in when resolving. -->
**Resolved by:** [who/what]  
**Resolution date:** YYYY-MM-DD  
**Resolution:** [description of what was done]  
**Status change:** pending → resolved | deferred
```

---

## Field Reference

### Frontmatter Fields

| Field | Type | Values | Required |
|-------|------|--------|----------|
| `status` | string | `pending`, `resolved`, `deferred` | Yes |
| `priority` | string | `p1`, `p2`, `p3` | Yes |
| `source_agent` | string | `code-quality`, `architecture`, `security`, `test-coverage`, `learnings-synthesizer` | Yes |
| `tags` | array | See tag vocabulary below | Yes (≥1) |
| `created` | date | `YYYY-MM-DD` | Yes |
| `feature` | string | Matches `history/<feature>/` directory name | Yes |

### Tag Vocabulary

Use consistent tags to enable cross-review querying.

**Domain tags** (pick all that apply):
```
security, performance, architecture, code-quality, test-coverage,
error-handling, type-safety, database, api-design, auth, data-integrity
```

**Modifier tags** (optional):
```
known-pattern, breaking-change, migration-risk, needs-human-review
```

**Example combinations:**
```yaml
tags: [security, auth, known-pattern]
tags: [performance, database, n-plus-one]
tags: [code-quality, error-handling]
tags: [test-coverage, integration-gap]
```

---

## Status Lifecycle

```
created → pending
           │
           ├── fix implemented → resolved
           │     (update status field, fill Resolution section)
           │
           └── accepted as tech debt → deferred
                 (update status, add reason in Resolution section)
```

When a finding moves to `resolved` or `deferred`, rename the file:
```
001-pending-p1-sql-injection-in-search.md
        →
001-resolved-p1-sql-injection-in-search.md
```

---

## Special Case: Known Pattern Annotation

When the `learnings-synthesizer` agent identifies a finding as a known recurring pattern, prepend this block to the finding body (after frontmatter):

```markdown
> **KNOWN PATTERN** — Matches [`YYYYMMDD-slug`](../../history/learnings/YYYYMMDD-slug.md)
> Previous occurrence: [brief description]
> Past resolution: [what was done, one sentence]
> **Severity escalated to P1** if this pattern was marked critical in `critical-patterns.md`.
```

---

## Learnings Candidates File

The `learnings-synthesizer` agent writes one additional file (not a finding):

**Path:** `.khuym/findings/learnings-candidates.md`

```markdown
# Learnings Candidates

Suggested additions to history/learnings/ after this review closes.
Invoke compounding skill to process these.

## Candidate: [slug]
Category: pattern | decision | failure
Tags: [list]
Summary: [One sentence — what should future agents know?]
Evidence: [finding ID or code location]
Recommended title: YYYYMMDD-[slug].md

---

## Candidate: [slug]
...
```

---

## Complete Example: P1 Security Finding

```markdown
---
status: pending
priority: p1
source_agent: security
tags: [security, auth, idor]
created: 2026-03-20
feature: user-profile-api
---

# IDOR: User Can Access Any Profile by Incrementing ID

## Problem Statement

The `GET /api/users/:id` endpoint returns a full user profile for any authenticated user,
regardless of whether the requesting user owns the profile. An attacker who knows their own
user ID (e.g., 42) can enumerate adjacent IDs to access other users' email, phone, and
billing information. No ownership check is performed.

## Evidence

**File:** `src/api/users/[id].ts`  
**Line(s):** 14–22  

```typescript
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const user = await db.users.findUnique({ where: { id: params.id } });
  if (!user) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json(user); // ← Returns full user record to any authenticated caller
}
```

**Why this is a problem:**  
No check verifies that `req.user.id === params.id`. Any authenticated session can access any user's data.

## Proposed Solutions

### Option A — [Recommended] Ownership check before response
Add `if (session.userId !== params.id) return Response.json({ error: 'Forbidden' }, { status: 403 });`

**Pros:** One line, minimal change, correct behavior  
**Cons:** None  
**Effort:** Small

### Option B — Row-level security in DB query
Add `AND id = session.userId` to the query itself so the DB enforces ownership.

**Pros:** Defense in depth — fails closed even if middleware is bypassed  
**Cons:** Requires query change; slightly more complex  
**Effort:** Small

## Acceptance Criteria

- [ ] Authenticated user A cannot retrieve profile for user B via `GET /api/users/:id`
- [ ] Returns 403 (not 404) when ownership fails — to distinguish from not-found
- [ ] Test covers the unauthorized access attempt case

## Resolution

<!-- Leave blank when creating -->
```

---

## Anti-Patterns in Finding Files

Do not do these:

- **Vague evidence:** "There's a security issue in the auth code" — no file, no line
- **No acceptance criteria:** How do reviewers know when it's fixed?
- **Multiple unrelated issues in one file:** One finding = one distinct problem
- **P1 for style issues:** P1 is for "would exploit in production right now"
- **Missing source_agent:** Required for synthesis deduplication
- **Flagging pipeline docs for deletion:** `history/`, `.khuym/`, `docs/plans/` are protected artifacts
