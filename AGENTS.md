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

At the checkpoint created by repository adoption of this gate, the exact single next gate is:

`Separate founder authorization for bounded Position 1 corrective-or-recovery design, limited exclusively to invariants 6, 12, 13, 17, 18, 20, 28, 31, 34, 36, 46, and 47.`

Recording that next gate does not grant the authorization, begin the design, select a correction, authorize execution, remove a hold, or make any later gate eligible.
