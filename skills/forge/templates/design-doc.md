# Design Doc Template

<!-- INSTRUCTIONS FOR FILLING AGENT
This is the Phase 1 (Brainstorm) output artifact.
- Save completed docs to: docs/plans/YYYY-MM-DD-<topic>-design.md
- Complete all required sections before submitting for spec review.
- Use <!-- TODO --> markers for any sections you are intentionally leaving for the spec reviewer.
- The spec-review loop may iterate this doc up to 3 times. Track changes in the Changelog section.
- HUMAN APPROVAL REQUIRED before this doc proceeds to Phase 2 (Breakdown).
- Sections marked "(if applicable)" may be removed if genuinely not relevant.
-->

---

# Design: <Feature Name>

**Date**: <!-- FILL: YYYY-MM-DD -->
**Author**: <!-- FILL: agent session ID or human name -->
**Status**: <!-- FILL: DRAFT / SPEC-REVIEW / HUMAN-APPROVED -->

---

## Problem Statement

<!-- FILL: What problem does this feature solve? Who experiences it? What is the cost of not solving it?
Write 2-4 sentences. Be concrete. Avoid vague statements like "improve the user experience."

Example:
Business clients currently receive invoices as HTML emails, which are not printable or archivable in a standard format. 23% of clients have requested PDF delivery in the past quarter. Without PDF support, we risk losing clients to competitors who already offer it.
-->

---

## Proposed Approach

<!-- FILL: Describe the recommended approach in 1-2 paragraphs. Then list 2-3 alternatives that were considered and rejected, with a brief reason for each rejection.

### Recommended: <Approach Name>
[Description of what will be built and how.]

### Alternatives Considered

| Alternative | Reason Rejected |
|-------------|----------------|
| [Alt 1] | [Why not] |
| [Alt 2] | [Why not] |

-->

---

## Architecture

<!-- FILL: How does this feature fit into the existing system architecture?
Include:
- Which existing components are affected
- What new components are introduced
- How components communicate (sync/async, protocol)
- A simple ASCII diagram if the interaction is non-trivial

If gkg is available, run `gkg repomap` first and reference relevant modules by name.
-->

---

## Data Model

<!-- FILL (if applicable): New tables, fields, or schema changes.
Include:
- Table/collection names and purpose
- Key fields with types and constraints
- Indexes (and why they are needed)
- Migration strategy (additive, destructive, requires backfill?)

Example:
### New Table: invoice_pdfs
| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| invoice_id | UUID | FK → invoices.id, NOT NULL | |
| storage_key | TEXT | NOT NULL | S3 key for the PDF file |
| generated_at | TIMESTAMPTZ | NOT NULL | |
| file_size_bytes | INTEGER | | For display and quotas |

Migration: additive (new table). No backfill needed for existing invoices (PDFs generated on next access).
-->

---

## API

<!-- FILL (if applicable): New or modified API endpoints.
For each endpoint:
- Method + path
- Request body / query params (with types)
- Response body (with types)
- Error cases
- Auth requirements

Example:
### POST /invoices/:id/pdf
Generates and returns a PDF for the specified invoice.

**Auth**: Bearer token required. Scope: invoices:read.

**Request**: No body. `id` is a UUID in the path.

**Response 200**:
```json
{ "url": "https://...", "expires_at": "2026-01-01T00:00:00Z" }
```

**Errors**:
- 404: Invoice not found or not owned by authenticated client.
- 422: Invoice is in DRAFT state and cannot be converted to PDF.
- 503: PDF generation service unavailable.
-->

---

## UI / UX

<!-- FILL (if applicable): User-facing changes.
Include:
- Which screens / components are affected
- New screens / flows introduced
- State changes and loading/error states
- Accessibility requirements
- Any wireframes or mockups (attach as linked files or inline ASCII)

If a visual companion was offered and accepted during the brainstorm session, reference the mockup file here.
-->

---

## Acceptance Criteria

<!-- FILL: The explicit, testable conditions that define "done."
Write as a numbered list. Each criterion must be binary (pass / fail).
These criteria are copied into each bead created in Phase 2.

Example:
1. A client can request PDF generation for any invoice in PAID or SENT status.
2. The generated PDF is accessible via a signed URL that expires after 24 hours.
3. PDF generation completes within 5 seconds for invoices with ≤ 50 line items.
4. Generating a PDF for the same invoice twice returns the cached version (no regeneration).
5. Attempting to generate a PDF for a DRAFT invoice returns a 422 error.
6. All acceptance criteria are covered by integration tests.
-->

---

## Locked Decisions

<!-- FILLED DURING PHASE 2 BREAKDOWN (discuss phase).
This section starts empty. Decisions are added here during the Phase 2 discuss phase
as ambiguities in the design are resolved. Each entry is a permanent record.

Format:
[YYYY-MM-DD] DECISION: <what was decided>. CONTEXT: <why this was the chosen option>. DECIDED BY: <human / agent / joint>.

Example:
[2026-01-18] DECISION: Use synchronous PDF generation (generate on request, not background job). CONTEXT: P99 latency of 5s is acceptable; async adds complexity for no user-facing benefit at current scale. DECIDED BY: human.
-->

---

## Risks and Unknowns

<!-- FILL: What could go wrong? What is not yet known?
For risks: describe the risk and a mitigation strategy.
For unknowns: describe the question and how it will be resolved (spike? research? ask human?).

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| [Risk description] | Low/Med/High | Low/Med/High | [What we do if it happens] |

### Unknowns

| Question | Resolution Method | Owner |
|----------|-----------------|-------|
| [What we don't know] | [Spike / research / ask human] | [Who resolves it] |

Unknowns with High impact should be resolved via a Phase 3 spike BEFORE Phase 4 execution begins.
-->

---

## Spec-Review Changelog

<!-- MAINTAINED BY SPEC REVIEWER AGENT.
This section records changes made during each spec-review iteration.
The human reviews this section to quickly evaluate the impact of reviewer findings.

Format per iteration:
### Review Round <N> — <YYYY-MM-DD>
Reviewer findings:
- [FINDING TYPE: completeness/ambiguity/scope-creep/yagni] <description>

Changes made:
- [Section name]: <what changed>

No changes (rationale):
- <finding>: <why it was not addressed>
-->
