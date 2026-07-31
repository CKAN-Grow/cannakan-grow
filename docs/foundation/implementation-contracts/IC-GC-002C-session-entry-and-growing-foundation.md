# IC-GC-002C — Session Entry & Growing Foundation

**Status:** Approved — Architecture Audit Passed; Implementation Contract Governance Complete; Implementation Not Authorized

**Scope:** Session Entry / Seed Session / Grow Session / Growing initialization / Growing evidence ownership / Growing Summary / Growing workspace

## 1. Purpose

This draft assembles bounded implementation-contract meaning for entering one user-owned Session and initializing its Growing phase. It does not itself establish Product Composition or Presentation authority.

If approved, it would carry forward the two authorized Session entry paths and the bounded upstream meanings for Growing evidence ownership and Plant Group containment. Detailed condition and Plant Group field sets, entry Presentation, Summary composition, and workspace placement recorded below are non-governing proposals retained for traceability; each requires separate Product authority before it may become an implementation requirement.

This is an implementation contract only. It does not implement application behavior, approve a database representation, or authorize later lifecycle capabilities.

## 2. Foundation Authority

This draft contract inherits only authority established upstream. The controlling authority is:

1. [FN-001 — Growing Conditions](../foundation-notes/FN-001-growing-conditions.md), for the future Growing-conditions concept only; it does not approve a detailed vocabulary or implementation definition;
2. [FN-003 — Canonical Entities & Representation](../foundation-notes/FN-003-canonical-entities-and-representation.md), for canonical ownership, durable provenance, and prohibition of parallel identity or evidence models;
3. [FN-004 — Session Context, Operational Intelligence & Evidence Readiness](../foundation-notes/FN-004-session-lifecycle-and-grow-companion.md), for one continuous Session, canonical lifecycle phases, completed-phase durability, Session Context, and evidence ownership;
4. [FN-005 — Canonical Session Conditions](../foundation-notes/FN-005-canonical-session-conditions.md), for canonical Session Conditions truth and the non-authority of Product and Presentation;
5. [FN-006 — Canonical Phase Commencement and Lifecycle Chronology](../foundation-notes/FN-006-canonical-phase-commencement-and-lifecycle-chronology.md), for one durable canonical commencement instant owned by Session Lifecycle;
6. [FN-007 — Intentional Transition from Germination to Growing](../foundation-notes/FN-007-intentional-transition-from-germination-to-growing.md), for the distinct authorized Begin Growing transition and the bounded correction to FN-004's former automatic-transition rule;
7. the Architecture-Reviewed and founder-approved **Product Authority Addendum — Growing Phase and Plant Group Security Boundaries**, as controlling approved Product authority only for its bounded Product meanings, ownership, containment, operation, and security boundaries; and
8. applicable approved Session Conditions authority, including the bounded approved current-conditions authority, for canonical Current Conditions and valid authority-switch behavior.

The following repository documents are cited dependencies, not approved controlling authority for this contract:

- [Grow Companion Composition Specification](../../product/grow-sessions/grow-companion-composition-specification.md) remains **Draft — Requires Architecture Approval**;
- [IC-GC-002A — Session Context Foundation](./IC-GC-002A-session-context-foundation.md) remains **Draft — Requires Architecture Approval**; and
- [IC-GC-002B — Grow Companion Structural Foundation](./IC-GC-002B-grow-companion-structural-foundation.md) remains **Draft — Requires Architecture Approval**.

Higher-order approved Foundation authority prevails over approved bounded Product authority, which prevails over an approved Implementation Contract, which prevails over implementation. Draft or unapproved dependencies may provide traceable context but cannot supply missing authority.

This contract does not independently establish Product meaning, approve a cited draft, or convert historical implementation evidence into authority. Repository presence, technical operation, migrations, policies, grants, or committed code do not cure an authority gap. Normative Product requirements retained here are limited to approved upstream authority. Detailed taxonomy, entry Presentation, Summary composition, and workspace placement are individually classified below as non-governing proposals and remain deferred pending separate Product authority.

## 3. Repository Baseline

At contract creation:

- the canonical repository architecture recognizes Germination, Growing, and Reflection as phases of one Session;
- Germination is the protected reference composition;
- the persistent Grow Companion shell and phase-state foundation are described by draft IC-GC-002B and are not governing authority for this contract;
- the existing Growing workspace partially composes Capability 1 Tasks, Events, Upcoming Tasks, and Recent Activity;
- this draft preserves approved bounded Growing lifecycle, evidence-ownership, containment, and security meanings while retaining proposed Grow Context vocabularies, Plant Group field detail, phase-summary content, and workspace placement only as non-governing traceability; those proposed details cannot enter an implementation slice without separate Product authority, and scheduling, notes, observations, images, hero content, and timeline behavior remain deferred; and
- the working tree contains pre-existing changes outside this deliverable.

Existing implementation is a compatibility baseline, not architecture authority. This documentation task authorizes no application, schema, migration, test, asset, or runtime change. A later ICE may implement only normative meanings that have complete upstream authority and are approved through this contract; the non-governing Product and Presentation proposals identified here remain excluded until separately authorized.

P1 exists in repository history through commit 24ca7895fe1dc840135aa8234ac41d2204822ec7 and migration supabase/migrations/20260723120000_growing_phase_and_plant_groups.sql. P1 was committed without established execution authority. Its repository presence and technical operation do not create architectural, Product, approval, acceptance, correction, or execution authority. The historical authority gap remains explicit and is neither cured nor rewritten by this targeted correction. P1 remains without established present-day acceptance.

## 4. Scope

This contract defines only:

1. Session Entry lifecycle meaning, excluding any precise Product or Presentation mechanism;
2. Seed Session entry;
3. Grow Session entry;
4. Growing initialization;
5. Growing evidence ownership, canonical persistence, and the Plant Group model;
6. timing Product and Presentation deferral boundaries;
7. non-governing proposed Growing Summary material retained for traceability and deferred to separate Product authority; and
8. non-governing proposed Growing workspace placement and composition retained for traceability and deferred to separate Product authority.

Any later authorized implementation must reuse one canonical Session, canonical information owners, and existing security and compatibility boundaries. Use of the Grow Companion shell or phase model described by draft IC-GC-002B requires that dependency to obtain its own applicable approval; this contract does not elevate it.

## 5. Canonical Session Entry Model

A Session begins through exactly one approved entry path selected deliberately by the user:

- **Seed Session** — begins with Germination;
- **Grow Session** — begins with Growing.

“Seed Session” and “Grow Session” describe Session entry paths. They do not create separate top-level Session systems, persistence authorities, ownership models, or incompatible Session objects. After entry, both remain one canonical user-owned Session governed by the same platform architecture.

The selected entry path determines the first included phase and initial canonical current phase. It does not change the meaning or ownership of any included phase.

A Session records only evidence generated or deliberately recorded within that Session. Grow must not fabricate, backfill, infer, rename, or synthesize evidence for a phase that the Session did not include.

### 5.1 Seed Session

A Seed Session:

- includes Germination as its entry phase;
- begins with Germination as the canonical current phase;
- recognizes IC-GC-002B only as non-governing draft composition evidence;
- may end as a complete canonical Session after Germination;
- may instead continue into Growing within the same Session through an explicit lifecycle decision; and
- preserves completed Germination in full whether the Session ends or Growing becomes current.

Seed Session entry must not create a second Session when the lifecycle advances to Growing.

#### Germination Completion Decision

Completing Germination does not automatically activate Growing. After Germination is completed, the user makes one explicit lifecycle decision. Neither outcome is preselected.

**Complete Session** ends the canonical Session after Germination:

- Session lifecycle state is Completed;
- Germination lifecycle state is Completed;
- Growing is Not included;
- no Growing Phase Record exists;
- no Plant Group exists; and
- no Growing evidence is fabricated.

**Continue to Growing** continues the same canonical Session:

- Session lifecycle state remains Current;
- Germination lifecycle state is Completed;
- a distinct authorized Begin Growing transition makes Growing the canonical current phase;
- that transition establishes exactly one canonical Growing commencement instant;
- current-phase state and canonical commencement become durable as one indivisible lifecycle outcome;
- no Plant Group is created automatically; and
- Growing evidence exists only after an intentional valid save.

Growing is optional for a Seed Session. Germination completion, Session completion, and Growing activation are separate actions. The system must not:

- activate Growing automatically;
- require Growing before Session completion;
- preselect continuation;
- create Growing persistence from Germination completion;
- infer Plant Groups or plant counts from Germination evidence; or
- reinterpret a completed Germination-only Session as an active Growing Session.

A completed Germination-only Session is complete and valid. It retains all Germination history and evidence, remains available for full historical review, remains eligible for existing Germination evidence and analytics behavior, and requires no downstream phase record.

Completed Germination remains durable, reviewable, and non-reactivated whether Growing begins immediately, later, or not at all where another outcome is authorized. Opening or viewing Growing, presenting or entering draft Product state, or creating evidence does not perform the Begin Growing transition or establish canonical commencement.

### 5.2 Grow Session

A Grow Session:

- includes Growing as its entry phase;
- begins with Growing as the canonical current phase through the authorized direct-Growing Session-entry action;
- establishes exactly one canonical Growing commencement instant when canonical Session creation and direct Growing entry succeed as one domain action;
- makes lifecycle state and canonical commencement durable as one indivisible outcome;
- does not fabricate a Germination phase record, result, duration, completion event, or Germination evidence;
- does not represent Germination as completed when Germination was not included; and
- initializes only lifecycle state and Growing evidence authorized by this contract.

For a Grow Session, Germination is omitted. The phase navigator may present Germination as **Not included**, and Germination navigation is disabled. Omitted is distinct from completed. An omitted Germination phase cannot become current or viewed, cannot be activated or completed, and cannot create records, evidence, timestamps, milestones, results, summaries, or workspace content. This omitted-phase presentation is a deterministic projection of the Session entry path, not an evidence record.

Canonical Growing commencement must not be inferred from Session or phase record creation or update times, Growing evidence, Tasks, Events, Notes, Photos, Documents, migrations, or any other proxy. Where legacy evidence does not establish Foundation-authoritative commencement, chronology remains honestly unresolved; this contract authorizes no estimation, reconstruction, backdating, or substitute timestamp.

### 5.3 Entry Selection Boundary

Session Entry must remain an intentional lifecycle decision between the authorized Seed entry and direct-Growing entry paths. Neither path may be inferred, defaulted, or established by merely opening, viewing, or presenting an interface.

The precise Product flow and Presentation mechanism—including labels, control type, selector or modal use, ordering, visual emphasis, repetition, and routing into phase-specific setup—are not established by this IC. Any such mechanism requires separate Product and Presentation authority before it may become an implementation requirement.

Only a successful authorized lifecycle action establishes canonical Session Entry. Draft or Presentation state cannot create evidence, mutate an existing Session's entry meaning, or clear, replace, reinterpret, or fabricate phase evidence. This IC establishes no entry-path conversion or correction workflow; any future conversion or correction requires separate authority.

The authorized lifecycle decision establishes the Session's starting phase only. It must not:

- choose a future Reflection path;
- create evidence;
- infer earlier-phase outcomes;
- select Growing environment or method values;
- pre-populate observed timing as fact;
- bypass owner authorization, Preview Studio restrictions, or demo safeguards; or
- create a parallel Session-entry persistence system.

### 5.4 Entry Persistence, Legacy Compatibility, and Route State

Session Entry is persisted on the canonical Session as one nullable discriminator:

- `seed` — the Session begins with Germination;
- `grow` — the Session begins with Growing;
- `null` — the legacy Session was created before Session Entry metadata existed.

The discriminator is not a second lifecycle authority. Entry path, canonical current phase, viewed phase, phase lifecycle state, and Session lifecycle state remain independent.

A legacy Session with `null` entry metadata retains its existing historical behavior and is not rewritten, backfilled, or semantically labeled as a Seed Session. Compatibility logic may preserve its existing Germination-first experience only through an explicit legacy compatibility boundary; it must not normalize `null` to `seed` or assert Germination entry as a new architectural fact.

A direct internal route may carry the selected entry path into Session creation as presentation state only. Route state cannot create a Session by itself, bypass canonical validation or authorization, or change an existing Session's entry path. Malformed or absent route state must fail safely. Exact URL naming is an implementation detail.

## 6. Growing Initialization

Growing is an independent operational phase within the same Session and persistent Grow Companion.

When Growing is included, this IC establishes no particular setup step, chart, table, row or entry model, collection interaction, calculation, or Presentation mechanism for capturing Growing evidence. The precise Product composition and interaction model remain deferred to separately approved Product composition authority for both authorized Growing entry paths:

- a Grow Session begins directly in Growing; or
- a Seed Session explicitly continues into Growing after Germination.

Growing initialization must establish:

- the included Growing lifecycle phase without creating a competing lifecycle identity;
- Growing as the canonical current phase when entered directly or activated through lifecycle transition;
- exactly one canonical Growing commencement instant owned by Session Lifecycle as part of the same indivisible lifecycle outcome;
- independent Growing timing, progress, and completion state;
- canonical Session Conditions consumption and any retained legacy Growing compatibility fields without creating competing conditions truth;
- the rule that Growing evidence is created only through authorized owner action and is never fabricated.

For a Seed Session, Growing initialization must preserve completed Germination in full and must not rename or copy Germination evidence into Growing. For a Grow Session, initialization must not create a placeholder Germination record.

Growing initialization must never infer values from Germination. Initialization distinguishes user-entered or observed evidence from optional reference knowledge, plans, estimates, deterministic context, and system state. Missing Growing evidence remains missing; it must not be filled from Germination or Seed Vault reference values.

### 6.1 Grow Context

The Session owns two canonical Session Conditions dimensions used during Growing:

- **Environment Type** — where the plants are grown;
- **Grow Method** — the cultivation medium or system.

Canonical Session Conditions truth is owned by the Session and Canonical Platform. Growing Product composition and Presentation are consumers; they do not own, duplicate, override, or redefine that truth. Both dimensions remain independent from Germination Method and must not reuse or rename Germination evidence.

Retained Growing Phase fields for Environment Type, Grow Method, and permitted Other text are legacy or compatibility representations only within their separately authorized authority-switch boundary. Before a valid per-Session authority switch, they retain only the legacy authority expressly preserved by Session Conditions governance. After a valid switch, canonical Session Conditions are solely authoritative and the retained fields cannot compete with, override, or duplicate them. Unrelated canonical Growing evidence remains Growing-owned and must be preserved.

The following Environment Type vocabulary is a non-governing draft retained for traceability and compatibility analysis. It is not approved, canonical, or implementation-required and cannot govern implementation without separate Product authority:

- Indoor;
- Outdoor;
- Greenhouse;
- Protected Outdoor;
- Mixed;
- Other.

The following Grow Method vocabulary is a non-governing draft retained for traceability and compatibility analysis. It is not approved, canonical, or implementation-required and cannot govern implementation without separate Product authority:

- Soil;
- Living Soil;
- Coco;
- Hydro;
- DWC;
- RDWC;
- Rockwool;
- NFT;
- Aeroponic;
- Raised Bed;
- Container;
- Other.

The accompanying **Other** handling is likewise a non-governing proposal: if separately authorized, user-authored text would remain attributable Session Conditions text rather than automatically creating a global canonical term. This IC does not approve that detailed behavior.

## 7. Growing Evidence Model

Growing owns evidence produced through Growing activity. Its evidence remains part of the canonical Session and retains authorship, timestamps, provenance, privacy, correction history where approved, and relationships to canonical People, Entities, and knowledge references.

Growing evidence must never be inferred from Germination. Germination source, variety, result, timing, partition, or method data may be displayed as preserved prior-phase context only where authorized; it must not silently become Growing evidence.

Growing maintains its own:

- evidence records;
- observed timing;
- progress state;
- completion state; and
- complete historical phase record.

No later phase may infer, rename, overwrite, or recalculate Growing evidence. Deterministic projections may be recalculated from canonical evidence without mutating that evidence.

### 7.1 Canonical Growing Persistence

Approved Growing evidence uses one canonical relationship:

```text
Canonical Session
→ zero or one Growing Phase Record
→ zero or more Plant Group Records
```

A Growing Phase Record:

- belongs to exactly one canonical Session and is unique per Session;
- owns canonical Growing evidence unrelated to Session Conditions;
- may retain separately governed legacy or compatibility condition fields but does not own or override canonical Session Conditions truth;
- contains no Germination evidence; and
- contains no deferred timing, harvest-event, workspace, Reflection, or GEE data.

Opening, activating, or viewing Growing must not create a Growing Phase Record or Plant Group automatically. The Growing Phase Record is created only after the owner intentionally saves valid Growing evidence.

Each Plant Group Record:

- belongs to exactly one Growing Phase Record;
- owns one approved Plant Group;
- uses one immutable internal identifier independent from any separately authorized label or ordering representation; and
- contains only the Plant Group evidence approved by this contract.

Any separately authorized label or ordering change must not replace Plant Group identity. Deleting one Plant Group must not alter another Plant Group's identity.

Each Plant Group belongs to exactly one Growing Phase context and therefore exactly one owning Grow Session. An authorized owner may delete a Plant Group only within that owning Session. A Plant Group cannot cross Session, owner, or containment boundaries. Deleting a Plant Group must not delete, invalidate, replace, or alter the identity of the canonical Growing Phase, must not delete or invalidate Session lifecycle evidence, and must not alter any other Plant Group's identity.

Growing evidence must not be stored in Germination Partitions, snapshot state, Session notes, Session images, Tasks, Events, Seed Vault records, an unrelated or miscellaneous Session field, or a local-only evidence store.

Local, demo, scenario, and cloud representations must map losslessly to this same logical model, ownership, stable identity, and validation boundary. Their technical representation may differ, but no separate local evidence contract is authorized.

## 8. Plant Groups and Deferred Product Composition

Precise Product composition, interaction model, and Presentation for capturing or managing Growing evidence are not established by approved controlling authority and are not implementation requirements of this IC.

This IC requires no setup step, chart, table, row or entry model; no add, edit, or remove interaction; and no aggregation, summation, deterministic total, calculated count, or equivalent collection-management or calculation behavior. All such details remain deferred to separately approved Product composition authority.

Any later separately authorized composition must not fabricate Plant Group records, reuse, rename, or mutate Germination records, Germination Partitions, or Germination-specific evidence semantics, or create a duplicate Growing evidence-entry surface.

A Plant Group represents one or more plants within the Session that share the recorded characteristics of the group at that time. Grouping organizes attributable Growing evidence; it does not assert that the plants are biologically identical.

Plant Group deletion is owner-scoped CRUD, not deletion of canonical Growing-phase evidence. Deleting a Plant Group must preserve the canonical Growing Phase identity, durable Session lifecycle evidence, completed-phase history, and every other Plant Group identity.

### 8.1 Plant Group Fields

The following user-facing field set is a non-governing draft retained for traceability and compatibility analysis. It is not approved, canonical, or implementation-required; every field and its Product or Presentation behavior require separate authority:

- **Plant**;
- **Source**;
- **Variety**;
- **Type**;
- **Sex**;
- **Number of Plants**;
- **Harvested**.

#### Plant

This draft proposes **Plant** as a user-facing Plant Group label distinct from the stable internal Plant Group identity required by approved containment authority. The label, representation, and persistence detail are non-governing and remain deferred.

#### Source

This draft proposes that a future **Source** field reference the existing canonical Source identity system without creating duplicate Source records. Unknown-value handling, attribution, and promotion behavior are non-governing proposals and require separate Product authority.

#### Variety

This draft proposes that a future **Variety** field reference the existing canonical Variety and Seed Vault identity systems without creating duplicate Variety records. Unknown-value handling, attribution, and promotion behavior are non-governing proposals and require separate Product authority.

#### Type

This draft proposes **Type** to describe how plants entered the Growing phase. The following vocabulary is non-governing, not approved, and not implementation-required:

- Seed;
- Seedling;
- Clone;
- Cutting;
- Established Plant;
- Other.

If a Type field is separately authorized later, it cannot fabricate or imply Germination evidence. This IC does not authorize the field or vocabulary.

#### Sex

The following **Sex** vocabulary is a non-governing draft, not approved, and not implementation-required:

- Unknown;
- Feminized;
- Female;
- Male;
- Regular;
- Other.

The proposed Unknown handling and prohibition on inference are retained only as non-governing draft detail pending separate Product authority.

#### Number of Plants

This draft proposes **Number of Plants** as a positive whole-number count attributable to a Plant Group and explicitly entered or confirmed as Growing evidence rather than inferred from Germination. The field, validation rule, orientation behavior, and entry interaction are non-governing and require separate Product authority.

#### Harvested

This draft proposes **Harvested** as a checkbox representing full harvest of the entire current Plant Group rather than partial harvest or a Harvest workflow. The field and its Presentation behavior are non-governing and require separate Product authority.

Partial-harvest interaction, Plant Group splitting or merging, lineage presentation, count-correction behavior, harvest dates, harvest events, yield capture, and post-harvest processing remain deferred. This IC establishes no implementation requirement for them.

## 9. Timing Product and Presentation Boundary

This IC establishes no **Expected Vegetative Time**, **Expected Flowering Time**, or semantically equivalent expected-duration field. It establishes no units, precision, defaults, validation, correction, calculation, storage, or Presentation behavior for such fields. Precise timing Product composition and Presentation remain deferred to separately approved Product composition authority.

This IC establishes no Seed Vault initialization, copying, reuse, inheritance, prepopulation, synchronization, adjustment, or correction behavior for any expected-time or expected-duration value, and it establishes no replacement relationship between Grow Session evidence and Seed Vault records. Any such relationship requires separate Product authority.

Independently of those deferred details, attributable observed Growing evidence must remain distinct from plans, estimates, reference knowledge, deterministic context, and system state. This boundary does not define an observed-timing field contract, duration calculation, comparison, or correction model.

## 10. Growing Summary

Growing Summary composition, placement, fields, calculations, empty states, and Presentation behavior are not established by approved controlling Product authority. Prior draft or implementation detail is non-governing evidence only. No Summary is an implementation requirement of this IC; separate Product authority is required before any Summary composition may be implemented.

Any later separately authorized Summary must preserve existing canonical truth boundaries: it cannot become an evidence-entry surface or authoritative record, create a duplicate evidence or Session Conditions model, mutate canonical evidence, fabricate missing evidence, import Germination evidence as Growing evidence, or perform GEE interpretation, diagnosis, prediction, recommendation, or knowledge distillation. Environment Type and Grow Method, if later authorized for display, remain projections of canonical Session Conditions or explicitly identified legacy compatibility state rather than a second conditions authority.

## 11. Growing Workspace

Growing workspace placement and Presentation composition are not established by approved controlling Product authority. The previously described below-chart placement and possible Tasks, Events, Calendar, Notes, Photos, and Documents composition are non-governing draft detail retained for traceability only. No placement or module composition is an implementation requirement of this IC; separate Product authority is required first.

Any later separately authorized composition must reuse each capability's canonical information owner, preserve applicable ownership, privacy, attribution, security, and evidence boundaries, and avoid a parallel utility, calendar, Task, Event, Grow Companion, or evidence system. This truth-preservation boundary does not approve a workspace, placement, module list, form, storage behavior, scheduling behavior, reminder, attachment, document behavior, limit, sharing behavior, or notification.

## 12. Reflection and Downstream Boundary

Reflection is outside this contract.

For purposes of responsibility separation, Reflection owns the future structured subjective evidence produced during intentional final Session review. It does not automatically own trusted or canonical knowledge and must not rewrite Growing evidence.
Completing Germination must not automatically create or activate Reflection evidence. This contract does not decide Reflection eligibility, requirement, or activation.


This contract does not define or authorize:

- Reflection composition or fields;
- Session Reports;
- GEE eligibility, confidence, interpretation, or output;
- knowledge distillation;
- Seed Vault synchronization or automatic updates;
- final knowledge-writing behavior; or
- AI interpretation.

Any future movement from observed Session evidence toward interpreted or preserved knowledge must retain lineage and proceed through separately approved GEE, Reflection, knowledge-distillation, and Seed Vault boundaries.

## 13. Canonical Rules

- Growing owns Growing evidence.
- Germination owns Germination evidence.
- A Plant Group is a Growing evidence record and must not be implemented as, renamed from, or inferred from a Germination Partition.
- Seed Vault owns reference knowledge presented to the Session.
- Sessions own observed evidence.
- Reflection owns future structured subjective final-review evidence, not automatic trusted knowledge.
- GEE owns evidence interpretation and knowledge-distillation authority.
- Each capability retains one canonical information owner.
- No capability may duplicate or replace another capability's responsibility.
- No parallel Session, phase, chart, Source, Variety, or evidence system is authorized.
- Evidence belonging to one phase must never be inferred, renamed, overwritten, or recalculated as evidence by another phase.
- Growing evidence has dedicated canonical persistence: each Session has at most one Growing Phase Record, and Plant Groups are its child evidence records.
- Plant Group identity is stable and independent from its label, display order, and the identity of every other Plant Group.
- A Plant Group belongs to one Session and Growing context; owner-scoped deletion preserves the canonical Growing Phase, Session lifecycle evidence, and all other Plant Group identities.
- Opening or viewing Growing does not create evidence.
- Local and cloud behavior represent the same canonical Growing model without a parallel evidence contract.
- Any separately authorized deterministic summary remains a projection from canonical evidence and must not mutate, replace, or become a second entry surface for that evidence.
- A phase omitted by the selected Session entry path has no fabricated evidence or completed phase record.
- One Session and one Grow Companion persist across all included phases.

- Germination completion does not automatically activate Growing.
- A Seed Session may complete after Germination with Growing not included and no downstream evidence.
- Continuing to Growing requires the authorized Begin Growing transition, preserves the same canonical Session and completed Germination, establishes one durable canonical commencement instant with current-phase state, and creates no Growing evidence until intentional valid save.
- Direct-Growing Session creation and Growing entry are one authorized domain action that establishes the same state-and-chronology integrity.
- Canonical commencement is never inferred from evidence, record timestamps, activity timestamps, migrations, or other proxies; unresolved legacy chronology remains unresolved.
- Canonical Session Conditions own Grow Method and Environment Type truth; legacy Growing fields, Product composition, Presentation, and unrelated Growing evidence cannot compete with that authority.
- Current phase, viewed phase, phase lifecycle state, and Session lifecycle state remain independent.
## 14. Security, Privacy, and Compatibility

This draft records a prospective Product boundary. It changes no current authorization, ownership, RLS, privacy, sharing, Preview Studio, demo, QA, scenario, or production-data state; accepts no current implementation state; and authorizes no correction.

- Canonical Growing-phase evidence belongs to exactly one Grow Session, and access derives from canonical Session ownership.
- Ordinary owner-facing Product behavior may create, read, and update canonical Growing-phase evidence but may not delete it.
- Lifecycle transitions and later lifecycle states must preserve durable Growing-phase evidence.
- Plant Groups are owner-scoped to one Session and may be created, read, updated, and deleted only within that containment boundary.
- Knowledge of a row identifier does not confer access, and client-supplied ownership claims are not authority.
- Anonymous users receive no Product-authorized access to private Growing-phase or Plant-Group evidence.
- Cross-owner and cross-Session access are not authorized.
- Session Entry and Growing remain owner-authorized.
- Entry selection and viewed-phase state introduce no new write path outside approved Session operations.
- Preview Studio continues blocking writes.
- Demo and scenario state remains non-persistent unless governed by an approved local-only fixture system.
- Demo, QA, and scenario contexts must not spill into production or public data.
- Structural or workspace navigation must not create unauthorized backend mutations.
- Plant Group, timing, summary, and workspace information must not expose another owner's private evidence.
- Existing Tasks and Events retain Capability 1 ownership and authenticated-owner-only access.
- No public visibility, sharing, grant, RLS, service-credential, or anonymous-access change is executed by this contract.

### 14.1 Prospective Resource Reconciliation

The founder-approved Product Authority Addendum classifies exactly 11 resources as supported within its prospective governing boundary:

1. policy|public.grow_session_growing_phases|Owners can insert Growing phase evidence
2. policy|public.grow_session_growing_phases|Owners can read Growing phase evidence
3. policy|public.grow_session_growing_phases|Owners can update Growing phase evidence
4. policy|public.grow_session_plant_groups|Owners can delete Plant Group evidence
5. policy|public.grow_session_plant_groups|Owners can insert Plant Group evidence
6. policy|public.grow_session_plant_groups|Owners can read Plant Group evidence
7. policy|public.grow_session_plant_groups|Owners can update Plant Group evidence
8. relation_privilege|public.grow_session_growing_phases|anon
9. relation_privilege|public.grow_session_plant_groups|anon
10. table|public.grow_session_growing_phases
11. table|public.grow_session_plant_groups

Exactly six resources remain correction resources outside the approved intended state:

1. function|public.set_growing_evidence_updated_at()
2. relation_privilege|public.grow_session_growing_phases|authenticated
3. relation_privilege|public.grow_session_plant_groups|authenticated
4. relation_privilege|public.grow_session_growing_phases|service_role
5. relation_privilege|public.grow_session_plant_groups|service_role
6. policy|public.grow_session_growing_phases|Owners can delete Growing phase evidence

The reconciliation is exactly 11 supported plus 6 correction resources, for 17 unique identifiers, with zero duplicates and zero out-of-scope identifiers. The supported subset is prospective Product authority only and is not acceptance of current implementation. No correction resource is approved in its current state. The Growing Phase delete policy remains the sixth required correction without becoming a seventh finding.

All five identified over-broad security outcomes remain **NARROW THROUGH SEPARATELY AUTHORIZED CORRECTION**: the trigger-function execution boundary, both authenticated relation-privilege outcomes, and both service-role relation-privilege outcomes.

### 14.2 Authenticated Direct-Privilege Boundary

| Relation | Maximum ordinary authenticated Product operations |
| --- | --- |
| public.grow_session_growing_phases | Owner-scoped SELECT, INSERT, UPDATE |
| public.grow_session_plant_groups | Owner-scoped SELECT, INSERT, UPDATE, DELETE |

Ordinary Product authorization excludes TRIGGER, TRUNCATE, REFERENCES, Growing Phase deletion, anonymous access to private evidence, cross-owner access, and identifier-only access. TRUNCATE is not constrained by RLS and is not authorized for ordinary authenticated Product use. If controlling authority is narrower, the narrower boundary controls.

### 14.3 Direct Grants, Effective Access, and Service Role

Direct grants and effective access are distinct. Effective capability may arise through inheritance, ownership, elevated role attributes, superuser behavior, or RLS bypass; absence of a direct privilege record does not prove absence of effective capability. Infrastructure capability is not owner-facing Product permission.

Existing service-role capability is not ordinary Product authority. Any retained service-role capability requires separate evidence-supported infrastructure or security authority. Database or Supabase defaults, ownership, elevation, and present technical behavior do not create Product approval.

### 14.4 Trigger-Function Boundary

The timestamp-maintenance function may maintain update metadata through legitimate attached-trigger behavior, and that attached-trigger behavior must remain available. Ordinary Product roles do not require direct invocation. Default PUBLIC execution is not Product approval, and the execution boundary must be no broader than separately justified authority.

Exact grants, revocations, SQL, migration mechanics, and correction execution belong to a later separately authorized security-correction artifact. This contract contains no corrective SQL, prepares no migration, authorizes no correction execution, calculates or approves no fingerprint, and does not replace the approved snapshot.

Existing Sessions remain compatible:

- existing Seed-origin Sessions retain their complete Germination records and lifecycle history;
- existing Sessions must not be relabeled destructively or assigned fabricated entry evidence;
- absent entry metadata must not be guessed from incomplete evidence;
- a legacy Session with absent entry metadata retains its existing behavior through an explicit compatibility boundary and remains unclassified;
- legacy compatibility must preserve Session identity, owner, privacy, phase evidence, routes, and current behavior; and
- compatibility must not create a duplicate Session, phase record, chart, evidence store, or workspace.

Existing Sessions without Growing evidence remain valid, receive no backfill or rewrite, are not treated as containing recorded zero values, and create no Growing Phase Record or Plant Group automatically. Seed Session, Grow Session, and legacy compatibility behavior remain unchanged.

Existing completed Germination-only Sessions remain valid and unchanged. They must not be backfilled, reactivated, marked incomplete, assigned a Growing Phase Record, or treated as containing fabricated downstream evidence. Existing Sessions already continuing into Growing also remain unchanged.

No destructive legacy classification or backfill is authorized. A later approved ICE may add only the minimum schema and migration needed for the nullable canonical Session entry discriminator in Section 5.4 and the dedicated Growing persistence model in Section 7.1. Growing evidence inherits ownership through its canonical Session and remains private. Required constraints and ownership-preserving security may be added for these records, but unrelated RLS, grants, policies, ownership, publication behavior, or credentials must not change.

## 15. Non-Goals

This contract does not define or authorize:

- Reflection;
- Session Reports;
- GEE behavior;
- knowledge distillation;
- Seed Vault synchronization or automatic knowledge updates;
- Harvest workflows;
- timeline behavior or a new timeline;
- notifications;
- scheduling or Calendar behavior;
- reminders;
- AI interpretation;
- a Growing hero;
- grow-stage inference or a canonical grow-stage model;
- public sharing or Community projection;
- present-day acceptance of P1 or any current correction resource;
- security-correction preparation or execution;
- fingerprint calculation, approval, or snapshot replacement;
- new Task, Event, Notes, Photos, Documents, Calendar, or attachment systems;
- database schemas, migrations, storage models, APIs, or exact UI controls beyond the nullable canonical Session entry discriminator and the minimum dedicated Growing persistence authorized by Section 7.1. Non-governing Product and Presentation detail in Sections 5.3, 6.1, 8.1, 9, 10, and 11 cannot become an implementation requirement without separate authority.

## 16. Acceptance Criteria

An approved implementation satisfies this contract only when:

- every Session enters only through one deliberate authorized lifecycle path;
- this IC authorizes no precise entry-selection Product or Presentation mechanism, and any later authorized mechanism preserves deliberate, non-inferred lifecycle intent;
- Seed Session begins with Germination and preserves independently approved Germination lifecycle truth;
- Grow Session begins with Growing without fabricating Germination evidence or a completed Germination record;
- both entry paths produce one canonical user-owned Session rather than separate Session systems;
- Session Entry is immutable after canonical Session creation;
- omitted Germination is presented as not included, remains non-navigable, and never becomes phase evidence or completion;
- the nullable entry discriminator preserves legacy Sessions without normalizing absent metadata to Seed entry;
- this IC requires no particular Growing setup step, chart, table, row or entry model, collection interaction, aggregation, calculated total, or Presentation mechanism; precise Product composition remains deferred to separately approved Product composition authority for both authorized Growing entry paths;
- each authorized Growing entry establishes exactly one canonical commencement instant with current-phase state as one indivisible lifecycle outcome;
- canonical commencement remains durable and is never inferred from record, evidence, activity, or migration timestamps;
- unresolved legacy chronology remains honestly unresolved;
- canonical Session Conditions remain authoritative for Environment Type and Grow Method, while Section 6.1's detailed vocabularies and `Other` behavior remain non-governing and cannot become implementation requirements without separate Product authority;
- retained Growing Phase condition fields remain legacy or compatibility representations and never compete with canonical Session Conditions after a valid authority switch;
- any later separately authorized Product composition preserves Plant Group identity and evidence ownership without fabricating records or importing Germination semantics;
- no detailed Plant Group field set or vocabulary in Section 8.1 becomes an implementation requirement without separate Product authority, while any separately authorized label remains distinct from stable Plant Group identity;
- owner-scoped Plant Group deletion preserves the canonical Growing Phase, Session lifecycle evidence, and every other Plant Group identity;
- a Seed Session may complete after Germination with Growing presented as not included;
- Growing is optional for a Seed Session;
- Germination completion does not activate Growing, create Growing persistence, or preselect continuation automatically;
- completing a Germination-only Session creates no Growing evidence or downstream phase record;
- continuing to Growing uses the same canonical Session and preserves completed Germination unchanged;
- continuing creates no Plant Group automatically, and Growing persistence begins only after intentional valid save;
- existing completed Germination-only Sessions remain valid, reviewable, and eligible for existing Germination evidence and analytics behavior; and
- Reflection eligibility, requirement, and activation remain deferred;
- Growing evidence is never inferred from Germination;
- this IC establishes no expected Vegetative or Flowering time or duration fields and no Seed Vault initialization, copying, reuse, inheritance, prepopulation, synchronization, adjustment, or correction behavior for such values; all such Product and Presentation composition remains deferred;
- attributable observed Growing evidence remains distinct from plans, estimates, reference knowledge, deterministic context, and system state without establishing a timing field or calculation model;
- intentional save of valid Growing evidence creates at most one canonical Growing Phase Record for the Session and zero or more stable child Plant Group Records;
- opening, activating, viewing, or reviewing Growing creates no Growing evidence automatically;
- Growing evidence is never stored in Germination Partitions, snapshot state, Session notes, Session images, Tasks, Events, Seed Vault records, miscellaneous Session fields, or a local-only evidence store;
- local, demo, scenario, and cloud representations map losslessly to the same canonical Growing model;
- no Growing Summary composition, placement, field list, calculation, or Presentation behavior becomes an implementation requirement without separate Product authority, and any later authorized Summary preserves canonical truth without duplicate entry or unsupported conclusions;
- no Growing workspace placement, module list, or Presentation composition becomes an implementation requirement without separate Product authority, and any later authorized composition preserves canonical capability ownership without duplication;
- Reflection and all downstream interpretation and knowledge-writing behavior remain outside scope;
- existing security, privacy, ownership, Preview Studio, demo, and compatibility boundaries remain unchanged; and
- the exact prospective security boundary reconciles 11 supported and 6 correction resources as 17 unique identifiers, preserves all five NARROW outcomes, prohibits ordinary Growing Phase deletion, and accepts no current correction resource; and
- no future capability or unresolved taxonomy, persistence, workflow, or calculation rule is silently implemented.

## 17. Verification Requirements

Before approval of an implementation, verification must demonstrate:

- `git diff --check` passes;
- only files authorized by a later approved implementation task changed;
- no unauthorized application code, schema, migration, test, runtime, or asset change exists;
- Seed Session and Grow Session use the same canonical Session authority;
- Grow Session creates no Germination evidence or false Germination completion;
- Seed Session retains complete Germination behavior and history;
- Growing timing, progress, completion, and evidence remain independent;
- each authorized Growing entry establishes one canonical commencement instant atomically with current-phase state, preserves completed phases, and never uses a proxy timestamp;
- unresolved legacy commencement remains unresolved;
- canonical Session Conditions remain authoritative for Grow Method and Environment Type after valid cutover, with legacy fields unable to compete and unrelated Growing evidence preserved;
- Plant Group evidence remains attributable and does not mutate Germination or Seed Vault records;
- Plant Group deletion is owner-scoped and preserves the canonical Growing Phase, Session lifecycle evidence, and other Plant Group identities;
- any separately authorized summary reproduces deterministically from eligible canonical inputs without becoming a second authority;
- any separately authorized workspace composition reuses canonical capability owners and creates no parallel systems;
- dedicated Growing persistence maintains at most one Growing Phase Record per Session and stable child Plant Group identity;
- existing Sessions without Growing evidence remain valid without backfill, fabricated zeros, or automatically created records;
- local, demo, scenario, and cloud representations preserve the same logical Growing evidence and validation boundaries;
- Preview Studio, demo, QA, scenario, authorization, RLS, privacy, and production-data protections remain intact;
- the authenticated direct-privilege matrix, anonymous boundary, identifier-independent ownership checks, direct-grant/effective-access distinction, service-role infrastructure boundary, trigger-function boundary, five NARROW outcomes, and sixth Growing Phase delete correction are present;
- the exact resource reconciliation remains 11 supported plus 6 correction resources, 17 unique identifiers, zero duplicates, and zero out-of-scope identifiers;
- no current correction resource, current implementation conformance, corrective SQL, migration, execution authority, fingerprint, or snapshot replacement is approved;
- existing Sessions remain compatible without fabricated classification or evidence; and
- no pre-existing unrelated working-tree change was modified.

For this documentation-only task, verification must confirm that only this contract was changed by the task and that application code, schema, migrations, tests, assets, runtime behavior, and unrelated working-tree changes were untouched.

## 18. Architecture Gaps

The following decisions remain unresolved:

- the Plant Group field set, required-field and validation rules, and detailed Type, Sex, count, harvest, or other vocabularies — **TBD — Requires Architecture Approval**;
- mixed-sex Plant Group representation — **TBD — Requires Architecture Approval**;
- Plant Group split, merge, and count-correction behavior — **TBD — Requires Architecture Approval**;
- Partial-harvest representation, Plant Group splitting, count effects, and evidence history — **TBD — Requires Architecture Approval**;
- harvest dates, harvest events, and Harvest workflows — **TBD — Requires Architecture Approval**;
- any expected Vegetative or Flowering time or duration fields and associated storage, units, defaults, validation, normalization, calculation, correction, or Presentation — **TBD — Requires Architecture Approval**;
- any Seed Vault initialization, copying, inheritance, reuse, synchronization, adjustment, or correction relationship for such values — **TBD — Requires Architecture Approval**;
Growing optionality, the explicit post-Germination lifecycle decision, and Germination-only Session completion are resolved by Section 5.1 and are not Architecture Gaps.

- observed-timing field contract and correction policy — **TBD — Requires Architecture Approval**;
- actual Vegetative and Flowering timing, milestones, and timeline behavior — **TBD — Requires Architecture Approval**;
- Growing Summary composition, placement, fields, calculations, empty states, and presentation — **TBD — Requires Architecture Approval**;
- Plant Group lineage and historical split or merge representation — **TBD — Requires Architecture Approval**;
- Growing workspace placement and any composition of Tasks, Events, Calendar, Notes, Photos, or Documents — **TBD — Requires Architecture Approval**;
- Growing Notes, Photos, and Documents evidence composition — **TBD — Requires Architecture Approval**;
- exact automated regression fixtures — **TBD — Requires Architecture Approval**.

Scheduling, Calendar behavior, reminders, notifications, timeline behavior, Growing hero content, grow-stage models, Harvest workflows, Reflection, Session Reports, GEE, knowledge distillation, Seed Vault synchronization, AI interpretation, Summary composition, and workspace composition require separate Product authority before any applicable implementation contract.

## 19. Governance Status and Next Stage

IC-GC-002C passed its strict read-only conformance review, which returned **PASS — IC-GC-002C CONFORMS TO CONTROLLING AUTHORITY** for the artifact at SHA-256 `f763bc490f64e15a69b4baad49f20e6fb1b550c85e8734c50b279945c4fec226`.

The founder subsequently approved that conformance-review result and authorized IC-GC-002C to proceed to the Architecture Approval stage. That founder decision did not itself grant Architecture Approval or authorize repository changes, P1 acceptance, correction, implementation, migration, deployment, or Git action.

The formal read-only Architecture Approval determination returned **APPROVED — IC-GC-002C ARCHITECTURE APPROVAL GRANTED** for the same artifact. The subsequent evidence normalization returned **CORRECTED — ARCHITECTURE APPROVAL REPORT EVIDENCE NORMALIZED** and corrected only the report's description of the founder decision; it changed no approval result, repository measurement, preservation result, boundary, exclusion, or authorized next action.

Repository adoption records this approval in this contract and its single central-registry entry. Implementation Contract governance for this exact artifact is complete. Repository adoption does not accept P1, perform present-day implementation disposition, accept any of the six correction resources, elevate a draft dependency, or authorize implementation, correction, migration, security-fingerprint action, deployment, staging, commit, or push.

The next separately governed stage is present-day implementation disposition. It remains pending and unauthorized. All six correction resources remain unaccepted and separately governed.
