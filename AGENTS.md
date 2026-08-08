# Repository Instructions

## Grow Roadmap Alignment Gate

Before beginning any action that may create, modify, stage, commit, execute, migrate, verify, deploy, or otherwise change repository or connected state:

1. Identify the current repository-adopted roadmap checkpoint.
2. Identify the current authorized gate and the single next gate from applicable governing authority.
3. Classify the proposed action using exactly one of the following classifications:

- `DIRECT ADVANCEMENT`: The action exactly performs or closes the current authorized roadmap gate without entering later, held, or separate work.
- `REQUIRED RECOVERY`: A blocker-driven action that must occur before advancement and requires separate explicit founder authorization.
- `DEFERRED WORK`: Known work outside the current gate; it remains unauthorized.
- `DRIFT`: Work departing from the current gate’s scope or boundaries.
- `BYPASS`: Work attempting to evade a gate, hold, stop condition, or separate-authorization requirement.
- `SEQUENCING VIOLATION`: Work beginning a later gate before its predecessor is completed and repository-adopted.

Enforce these rules:

1. Classification does not itself grant authority.
2. Only explicitly founder-authorized `DIRECT ADVANCEMENT` may proceed through the current gate.
3. `REQUIRED RECOVERY` may proceed only under separate, explicit, bounded founder authorization.
4. `DEFERRED WORK` and separately controlled branches remain held and unauthorized.
5. `DRIFT`, `BYPASS`, and `SEQUENCING VIOLATION` require an immediate stop before mutation.
6. A later gate must not begin until its predecessor is complete and repository-adopted.
7. Separate branches and predecessor holds remain effective unless explicit founder authority permits otherwise.
8. Missing, ambiguous, conflicting, or non-authoritative identification of the current gate or single next gate requires an immediate stop for separate governance.
9. Founder authorization must be explicit and bounded to the action being performed.
10. An action must remain within both its roadmap gate and its founder-authorization boundary.
11. Newly discovered work must be classified as `REQUIRED RECOVERY` or `DEFERRED WORK`; discovering it does not authorize it.
12. This gate does not itself authorize corrective design, recovery execution, connected qualification or access, implementation, migration, verification, acceptance, security or fingerprint work, deployment, production activity, or any other substantive action.
13. If an action’s classification changes while work is in progress, stop before further mutation and obtain the authority required by the new classification.

The bounded Position 1 corrective-or-recovery design for invariants 6, 12, 13,
17, 18, 20, 28, 31, 34, 36, 46, and 47 is complete and repository-adopted in
`ICE-GI-001-1B`. Repository adoption of `ICE-GI-001-1C` is PASS and closed at
historical adoption commit `c659605e35195738a70dbff72b98e6654e6daa4a`.
Neither completed workstream may be reopened. Existing holds and operational-
authorization boundaries remain unchanged.

Gate 1, `Repository-align the successful 20260807100000 restoration`, is
complete and closed. The exact successful restoration is represented by
`supabase/migrations/20260807100000_session_conditions_canonical_restoration.sql`
at SHA-256
`2821e5da9f2a014927ac7f03bf598caed47c61c79a25cbb608c74217e7c0fc65`.
The Grow Production Ledger records the restoration as `IMPLEMENTED`, with
production stable after restoration and `Next Action` set to `None`.

Gate 2, disposition of
`supabase/migrations/20260806100000_growing_session_base_prerequisite_recovery.sql`,
is founder-authorized, complete, and closed. The migration is classified as
obsolete, abandoned, and permanently non-executable and was deleted from the
active Supabase migration directory. Its SQL must never be executed, repaired,
rewritten, relocated, archived, reused, or replaced, and timestamp
`20260806100000` must never be reused. Git history preserves its prior identity.
The successful `20260807100000` restoration remains unchanged.

At this checkpoint:

`Next action: None.`

Recording Gate 1 and Gate 2 closure does not authorize connected access, SQL
or migration execution, restoration work, implementation, verification,
deployment, or production activity; remove a hold; or make any later action
eligible.
