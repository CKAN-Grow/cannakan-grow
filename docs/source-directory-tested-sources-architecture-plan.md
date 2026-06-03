# Source Directory and Tested Sources Architecture Review

Date: 2026-06-03

## Scope

This document is architecture review and implementation planning only. It does not implement UI rewrites, backend changes, database migrations, report generation, certification publishing, source claim processing, or contact workflow automation.

The immediate context is that CSTP now has a dedicated `/cstp` hub. Source Directory should therefore narrow its product role to source discovery, source profiles, community observations, and lightweight CSTP visibility signals.

## 1. Current State

### Route Surfaces

The app currently has two Source Directory route families:

- `/source-directory` and `#source-directory`
  - Rendered by `renderSourceDirectoryPublicPage()`.
  - Public-safe, Community Grow based directory.
  - Has public source cards, metrics, search, sort, and source detail pages via `#source-directory/:sourceKey`.

- `#sources` and `#sources/:sourceId`
  - Rendered by `renderSourcesLandingPage()` and `renderSourceProfilePage()`.
  - Older richer Source Directory / Source Profile experience.
  - Uses mock source records plus derived Community Grow source aggregates.
  - Includes source profile, CSTP verification card, CSTP track record, and source action CTAs.

There is also `#sources/:sourceId/cstp-report`, rendered by `renderSourceCstpReportPage()`. That route currently embeds a public CSTP report-style page directly under the Source Profile route family. This should be treated as legacy/preview report rendering until the new CSTP route hierarchy is defined.

### Home Tested Sources Preview

The Home page has a Tested Sources / Source Directory preview rendered by `renderHomeTestedSourcesPreviewSectionMarkup()`.

Current behavior:

- Shows up to five source preview cards.
- Pulls records from `getSourceDirectoryMockRecords()`.
- Shows sessions logged, varieties logged, last logged.
- Shows published CSTP certified seals when available.
- Links to source profiles using `#sources/:id`.
- Links to `#source-directory` for the broader directory.

This remains useful as a discovery teaser, but its routing and terminology should be aligned with the canonical Source Directory route.

### Source Directory Landing

The older `#sources` landing includes:

- Hero with Source Directory description.
- Request Testing CTA that opens the contact page with `cstp-request`.
- Submit a Correction CTA that opens the contact page with `source-correction`.
- Summary metrics:
  - Total Sources Logged
  - Total Breeders Germinated
  - Total Varieties Logged
  - Report Available
- Card controls:
  - Search.
  - Sort by Most Logged, Recently Logged, A-Z.
  - Filter pills for All Sources, CSTP Tested, Gold Certified, Silver Certified, Report Available.
- Source cards:
  - Logo/name/type.
  - Reported germination.
  - Sessions logged.
  - Varieties logged.
  - Last activity.
  - CSTP chip/seal.
  - View Source Profile.
  - View Report when a report is available.
- List controls:
  - Search.
  - Sort by Germination Rate, Source Name, Total Sessions, Most Recent.
  - Order options.
  - Filters including All Sources, CSTP Tested, Gold Certified, Silver Certified, Report Available, Community Reported, Has Germination Data, No Germination Data.
- Paginated source list.

This is the strongest foundation for a full Source Directory product surface, but it still mixes CSTP program intake language with source discovery.

### Public Source Directory

The newer `/source-directory` route includes:

- Public Transparency Directory hero.
- Metrics based on approved public Community Grow data.
- Search by source name.
- Sort by average germination, seeds tested, latest activity, public entries.
- Public source cards.
- Source detail pages with:
  - Average germination.
  - Seeds tested.
  - Public entries.
  - Latest activity.
  - Community performance.
  - Varieties / genetics.
  - Age bucket performance.
  - Public trend summary.
  - Approved public snapshots.
  - Public CSTP testing/certification placeholder panel.

This route has the right privacy posture and should become the canonical public Source Directory route. It currently lacks richer source profile information, claim/contact actions, and polished tested-source filtering.

### Source Profiles

The older Source Profile page currently includes:

- Back to Sources link.
- Source identity card:
  - Logo.
  - Name.
  - Type.
  - Established badge.
  - Follow preview button.
- Community Performance section:
  - Average germination rate.
  - Total sessions.
  - Popularity rank.
  - Seeds tracked.
- CSTP Verification section:
  - Status heading.
  - CSTP badge/text visual.
  - Status pills.
  - Test date.
  - Valid until.
  - Total seeds tested.
  - Observation window.
  - View Report or Report Unavailable.
- CSTP Track Record section:
  - Certifications earned.
  - Gold.
  - Silver.
  - Qualification rate.
  - Last test.
- Source Actions section:
  - Request CSTP Testing.
  - Claim or Correct This Source.

This is close to the desired source-profile architecture, but CSTP educational copy and report rendering need to move out of Source Directory and into CSTP-owned routes.

### Source Leaderboards and Rankings

Source performance appears in several discovery contexts:

- Home gallery rankings teaser links to Source Directory.
- Community Insights includes source performance rollups and "Most Tested Sources" style rankings.
- Source Directory list view ranks sources by germination rate, total sessions, source name, or recency.
- Gallery certification filters include CSTP Tested.

The current ranking logic is useful, but the language needs to clarify that these are community observations, not universal source performance guarantees.

### Search and Filtering

Current search/filtering is split:

- Public `/source-directory`:
  - Search by source name.
  - Sort only.
  - No certification filter UI yet.

- Older `#sources`:
  - Search.
  - Sort.
  - Certification filters.
  - Community/germination data filters.
  - Paginated list.

The final architecture should merge these into one canonical source discovery surface.

### Source Claim Workflow

Current implementation is not a true claim workflow.

What exists:

- "Claim or Correct This Source" CTA on source profiles.
- "Submit a Correction" CTA on the older Source Directory landing.
- Contact prefill for `source-correction`.
- Contact form fields:
  - Source name shown.
  - Correct source name.
  - Website / proof link.
  - Explanation.
- Submissions are routed into the contact/admin message system as `source-corrections`.
- Admin message board can review, mark reviewed, and mark resolved.
- `public.sources` table exists and has admin-only create/update/delete policies.

What is missing:

- Dedicated claim request entity.
- Authenticated claimant identity.
- Source ownership verification.
- Admin assignment/approval workflow.
- Claim status lifecycle.
- Source owner role or permissions.
- Editable owner-facing source profile controls.
- Verified-source badge rules.
- Audit log tying claim decisions to source changes.
- Email or notification loop.

### Contact Source Workflow

Current implementation is also not a true contact-source workflow.

What exists:

- General Contact page.
- Typed contact forms.
- Source correction and CSTP request categories.
- Admin message board / communications surfaces.
- Routed buckets such as `support`, `cstp`, and `source-corrections`.

What is missing:

- Source-specific contact buttons on canonical public source profiles.
- Moderated relay so users do not see private source emails.
- Spam prevention.
- Rate limits.
- CAPTCHA or abuse guard.
- Consent and privacy language.
- Source-owner inbox or forwarding preferences.
- Admin moderation queue for outbound messages.
- Message status visible to requester/source owner.

### Certification References

Current Source Directory/Profile code displays CSTP states in several ways:

- CSTP Gold Certified.
- CSTP Silver Certified.
- CSTP Tested / Tested-only.
- Expired or previously tested states.
- Report Available / Report Unavailable.
- Placeholder public CSTP presence panel.

The display layer is valuable. The program explanation layer should move to `/cstp`.

## 2. Source Directory Mission

Source Directory should be the platform section for:

- Seed source discovery.
- Breeder discovery.
- Brand discovery.
- Source performance insights.
- Community observations.
- CSTP certification visibility.

It should answer:

- Which seed sources, breeders, and brands appear in Cannakan Grow data?
- What has the community observed from those sources?
- Which sources have tested batches or active certification signals?
- Where can a user inspect a source profile?
- How can a source owner claim or correct a listing?
- How can a user browse tested/certified sources?

It should not answer:

- What is CSTP?
- How does CSTP work as a program?
- How does a certification methodology operate in detail?
- How are reports generated?
- How are certification decisions made internally?

Those answers belong on `/cstp` and future CSTP-owned report/certification routes.

## 3. Source Profile Architecture

### Final Profile Route

Recommended canonical route:

- `/source-directory/:sourceSlug`

Legacy aliases:

- `#source-directory/:sourceKey`
- `#sources/:sourceId`

Implementation should gradually route old links to the canonical profile surface while preserving backward compatibility.

### Final Source Profile Layout

#### Hero

Purpose:

- Establish source identity quickly.

Recommended content:

- Source logo.
- Source name.
- Source type: breeder, seed bank, marketplace, brand, collective, etc.
- Website link when public.
- Claimed/verified state when available.
- Primary actions:
  - Contact Source, if available and moderated.
  - Claim Source, if not claimed.
  - Suggest Correction.
- Secondary navigation back to Source Directory.

Notes:

- Do not include CSTP program explanation in the hero.
- CSTP status can appear as a small trust badge or pill only.

#### Overview

Purpose:

- Explain what this source is.

Recommended content:

- Short description.
- Known aliases.
- Website/domain.
- Source category.
- Region if public and verified.
- Public profile completeness state.

Missing today:

- Structured public description in the public route.
- Alias handling.
- Claimed/verified ownership state.

#### Performance

Purpose:

- Present aggregate source metrics from public/approved data.

Recommended content:

- Average observed germination.
- Seeds represented.
- Sessions represented.
- Public entries.
- Latest activity.
- Most tested varieties/genetics.

Rules:

- Label as community observed.
- Never imply guaranteed future performance.
- Exclude private sessions and unapproved snapshots.

#### Community Results

Purpose:

- Show the evidence base behind the summary.

Recommended content:

- Public snapshot list.
- Top varieties/genetics.
- Age bucket performance where available.
- Trend summary.
- Links to approved Community Grow snapshots.

Missing today:

- A unified design between public source detail and older source profile.
- Cross-links from profile-level summary to the underlying public entries.

#### CSTP Status

Purpose:

- Display certification/test state, not teach CSTP.

Recommended content:

- CSTP Gold Certified.
- CSTP Silver Certified.
- Tested Batch.
- Expired certification.
- No public CSTP record.
- Certification expiration date when published.
- Public report link when published.
- Learn About CSTP link to `/cstp`.

Rules:

- Do not infer certification from community data.
- Do not show internal request/test states.
- Do not show draft, failed, private, or admin-only CSTP records.
- Do not embed report rendering inside the source page.

#### Contact Information

Purpose:

- Provide safe, moderated ways to reach or inspect a source.

Recommended content:

- Public website.
- Public social links if verified.
- Moderated Contact Source CTA.
- Support note if source is unclaimed.

Rules:

- Do not expose private contact email by default.
- Admin-only fields in `public.sources.contact_email` should stay out of public profiles unless explicitly approved.

#### Claim Source

Purpose:

- Let real source owners start verification.

Recommended content:

- Claim Source CTA.
- Verification expectations.
- Current claim status for signed-in claimant.

Rules:

- Claiming should create a separate request record.
- Claiming should never directly mutate `public.sources`.
- Admin approval required before public claimed/verified badges appear.

#### Related Sources

Purpose:

- Keep discovery moving.

Recommended content:

- Similar source type.
- Sources with overlapping varieties/genetics.
- Sources with similar community observation volume.
- Certified/tested sources in same category.

Missing today:

- Related-source logic.
- Similarity model.
- Profile-level discovery footer.

## 4. CSTP Integration Rules

### Source Directory Should Not Contain CSTP Program Explanations

Remove or reduce:

- Long CSTP methodology text inside source pages.
- "What CSTP means" style paragraphs.
- Program process explanations.
- Report generation or certification decision copy.

Keep:

- Certification state.
- Tested state.
- Expiration state.
- Report availability.
- Link to CSTP education.

### Allowed CSTP Display States

Source Directory can display:

- CSTP Gold Certified.
- CSTP Silver Certified.
- Tested Batch.
- Expired Certification.
- No Public CSTP Record.

### Allowed CSTP Actions

Source Directory can provide:

- View Certification.
  - Future route: `/cstp/certifications/:certificationId` or `/cstp/reports/:reportId`.
  - Until final report routes exist, keep disabled or route to a controlled placeholder.

- Learn About CSTP.
  - Route: `/cstp`.

### Data Rules

Source Directory CSTP status should derive only from approved public certification/report records.

It should not derive from:

- Admin request queue status.
- Internal CSTP test status.
- Internal session link state.
- Mock status unless explicitly in demo/mock mode.
- Community performance alone.

### Route Ownership Rule

Source pages may link to CSTP reports, but CSTP report pages should be owned by CSTP route architecture.

Recommended ownership:

- Source Directory owns source identity and source discovery.
- CSTP owns certification/report rendering.
- Source Directory receives a public-safe summary object from CSTP.

## 5. Tested Sources Experience

### Current State

There is not yet a dedicated Tested Sources landing page. The experience is split across:

- Home tested-source preview.
- Source Directory certification filters.
- Source Directory cards/chips.
- Source profile CSTP sections.
- Community/Gallery CSTP filter hooks.

### Recommended Tested Sources Landing Page

Canonical route options:

- `/source-directory/tested`
- or `/source-directory?filter=tested`

Recommendation:

- Use `/source-directory/tested` as a shareable landing route.
- Keep query/hash filters for internal UI state.

Purpose:

- Show sources with public CSTP status or tested batch records.
- Keep this as a filtered Source Directory experience, not a separate source system.

### Filters

Recommended filters:

- All Tested Sources.
- Gold Certified.
- Silver Certified.
- Tested Batch.
- Expired Certifications.
- Report Available.
- Certification Active.
- Certification Expiring Soon, when expiration dates exist.

### Sorting

Recommended sorting:

- Certification level priority: Gold, Silver, Tested, Expired.
- Most recent certification/test.
- Highest observed community germination.
- Most community entries.
- Source name.
- Latest community activity.

### Cards

Recommended tested-source card content:

- Source name and logo.
- Source type.
- CSTP state.
- Certification/report date.
- Expiration date.
- Public observed germination summary.
- View Source.
- View Certification, if active report route exists.
- Learn About CSTP.

### Empty States

Recommended empty states:

- "No public tested sources yet."
- "No Gold Certified sources match these filters."
- "Certification data appears only after approved public CSTP publication."

## 6. Source Claim Workflow

### Current Implementation Audit

Current source claim capability is a contact-prefill path:

- `Claim or Correct This Source` opens contact with `source-correction`.
- The submitted message enters an admin/contact queue.
- Admin can review or resolve messages.
- There is no source-owner account model.
- There is no claim request lifecycle.
- There is no proof validation workflow.

### Missing Pieces

Data model:

- `source_claim_requests`
- `source_claim_evidence`
- `source_owner_memberships`
- `source_claim_events`

Claim request fields:

- Source ID.
- Claimed source name.
- Claimant user ID.
- Claimant email.
- Claimant role/title.
- Company/source website.
- Proof links.
- Business email domain.
- Message.
- Status.
- Admin reviewer.
- Review notes.

Lifecycle:

- Draft or submitted.
- Needs evidence.
- Under review.
- Approved.
- Rejected.
- Revoked.

Admin requirements:

- Admin queue by status.
- Source matching/merge tools.
- Evidence review.
- Domain verification helper.
- Manual approve/reject.
- Audit log.
- Notifications.

Verification requirements:

- Signed-in claimant preferred.
- Email verification required.
- Domain match or proof link.
- Optional DNS/meta verification later.
- Manual admin approval for launch.

Public display:

- "Claimed" should not mean "CSTP certified".
- "Verified source owner" should be separate from "CSTP Gold/Silver".
- Claim state should not alter historical community observations.

## 7. Contact Source Workflow

### Current Implementation Audit

Current contact functionality supports general support, source correction, CSTP requests, and admin communication review.

It does not yet support direct or moderated source contact.

### Missing Pieces

Public UI:

- Contact Source button on source profile.
- Contact reason selection.
- Message form scoped to one source.
- Consent note.
- Anti-spam field/honeypot or CAPTCHA.

Data model:

- `source_contact_messages`
- `source_contact_recipients`
- `source_contact_events`
- Optional `source_contact_preferences`

Moderation:

- Admin queue for outbound source messages.
- Spam review.
- Abuse reporting.
- Rate limit visibility.
- Blocklist.
- Source-owner opt-in before forwarding.

Privacy:

- Do not expose source contact email.
- Do not expose user email to source unless user consents.
- Support anonymous inquiries only if moderation is active.

Future enhancements:

- Source-owner dashboard inbox.
- Reply relay.
- Templates for wholesale, availability, correction, partnership, and CSTP questions.
- Delivery status.
- User-visible message history.

## 8. Public Report Integration Planning

### Principle

Future CSTP reports should connect into Source Directory through public-safe links and summarized certification state. Source pages should not render reports or own report logic.

### Recommended Integration Contract

Source Directory receives:

- `sourceId`
- `publicCstpStatus`
- `certificationLevel`
- `certificationId`
- `reportId`
- `reportUrl`
- `certifiedAt`
- `expiresAt`
- `testedBatchLabel`
- `statusLabel`
- `badgeAssetKey`
- `isExpired`
- `isPublic`

Source Directory does not receive:

- Internal request details.
- Internal test status transitions.
- Admin notes.
- Draft report data.
- Validation failures.
- Private session links.
- Raw immutable snapshot internals.

### Route Ownership

Recommended future routes:

- `/cstp`
  - Program hub and education.

- `/cstp/reports/:reportId`
  - Public report rendering.

- `/cstp/certifications/:certificationId`
  - Certification-focused public proof page, if separate from reports.

- `/source-directory/:sourceSlug`
  - Source profile with summary badges and links out to CSTP-owned routes.

### Fallback States

If a report is missing, private, expired, or superseded:

- Source Directory should show the source profile.
- CSTP route should render the report/certification fallback.
- Source Directory should not duplicate CSTP fallback logic.

## 9. Implementation Roadmap

### Phase 1 - Source Directory Polish

Goal:

- Make Source Directory the canonical source discovery surface after `/cstp` separation.

Tasks:

- Choose `/source-directory` as canonical.
- Decide redirect/alias strategy for `#sources` and `#sources/:id`.
- Merge the best parts of `#sources` into `/source-directory`.
- Add certification filters to the public Source Directory route.
- Add `Learn About CSTP` links to `/cstp`.
- Replace "Request Testing" primary Source Directory CTAs with source-discovery CTAs.
- Keep request testing CTAs only where contextually appropriate and marked as CSTP-owned.
- Reduce CSTP program explanation copy on source pages.
- Normalize "Source Directory", "Tested Sources", and "Source Profile" terminology.
- Update Home tested-source preview links to canonical routes.

Acceptance criteria:

- `/source-directory` is the primary destination for source discovery.
- Home Source Directory preview stays intact.
- Source cards show source identity, community observations, and compact CSTP state.
- No source page explains CSTP methodology in detail.
- All CSTP education links point to `/cstp`.

### Phase 2 - Claim Workflow Completion

Goal:

- Convert "Claim or Correct This Source" from a contact message into a real source claim workflow.

Tasks:

- Design and migrate claim request tables.
- Add signed-in claim submission.
- Add proof/evidence fields.
- Add admin claim review UI.
- Add status lifecycle.
- Add audit events.
- Add claimed/verified display rules.
- Keep public source mutations admin-approved.

Acceptance criteria:

- Users can submit a source claim.
- Admins can approve/reject claims.
- Approved claim creates source owner membership.
- Claim status is visible to claimant.
- Source profile can show verified owner state without implying CSTP certification.

### Phase 3 - Contact Workflow Completion

Goal:

- Add moderated, source-specific contact without exposing private data.

Tasks:

- Add source contact message tables.
- Add source-scoped contact form.
- Add consent/privacy copy.
- Add rate limiting/spam prevention.
- Add admin moderation queue.
- Add source owner forwarding preferences.
- Add status lifecycle.

Acceptance criteria:

- Users can contact a source through a moderated workflow.
- Source emails remain private.
- Admins can review/block/forward messages.
- Spam prevention exists before public launch.

### Phase 4 - Tested Sources Experience

Goal:

- Create a focused discovery experience for public tested/certified source states.

Tasks:

- Add `/source-directory/tested`.
- Add filters for Gold, Silver, Tested Batch, Expired, Report Available.
- Add sorting by certification priority, recency, community observations, and source name.
- Add dedicated empty states.
- Add tested-source cards with compact certification state.
- Add links:
  - View Source.
  - View Certification when available.
  - Learn About CSTP.

Acceptance criteria:

- Tested Sources feels like a filtered Source Directory experience.
- No duplicate source identity model exists.
- Certification filters use approved public CSTP state only.
- Expired certifications are visible but clearly labeled.

### Phase 5 - CSTP Report Integration

Goal:

- Connect Source Directory to CSTP-owned report/certification routes without embedding report logic in source pages.

Tasks:

- Define public report route contract.
- Add public certification summary API/service.
- Map source IDs to active public certification state.
- Replace `#sources/:id/cstp-report` rendering with links to CSTP-owned routes.
- Add superseded/expired/private fallback behavior in CSTP route layer.
- Add regression tests for source page report links and privacy boundaries.

Acceptance criteria:

- Source pages show CSTP badges and links only.
- CSTP routes render report/certification details.
- Source Directory never exposes internal CSTP state.
- Missing or expired reports degrade cleanly.

## Priority Recommendations

1. Make `/source-directory` the canonical public route before adding more source profile UI.
2. Move CSTP explanation and report rendering out of Source Directory into CSTP-owned routes.
3. Treat claim workflow and contact-source workflow as separate systems.
4. Keep `public.sources` admin-owned; public users submit requests, not direct mutations.
5. Build Tested Sources as a filtered Source Directory experience, not a separate directory.
6. Preserve Community Grow privacy boundaries: source metrics should use approved public observations only.

## Open Questions

- Should canonical source profiles use `/source-directory/:slug` or `/sources/:slug` long term?
- Should Tested Sources be `/source-directory/tested`, query-filtered `/source-directory?filter=tested`, or both?
- Should public source contact require sign-in at launch?
- What proof is sufficient for source ownership verification?
- Should certification proof pages be distinct from report pages?
- Should expired certifications remain filterable forever or roll into a historical certification view?

## Non-Goals

- No backend implementation in this planning phase.
- No database migrations in this planning phase.
- No source profile UI rewrite in this planning phase.
- No CSTP report generation in this planning phase.
- No certification data integration in this planning phase.
- No public claim/contact workflow launch in this planning phase.
