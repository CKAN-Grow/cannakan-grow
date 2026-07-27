# Implementation Contract Executions

## Repository Location

This directory is the canonical repository location for approved Implementation Contract Execution (ICE) artifacts.

## Responsibility

An Implementation Contract Execution records approved authority to execute one bounded Implementation Contract.

ICE artifacts:

- derive all authority from approved Implementation Contracts;
- record approved execution authority only;
- introduce no architectural authority;
- introduce no repository-governance authority; and
- do not contain implementation code.

## Relationship to Implementation Contracts

Implementation Contracts define bounded implementation authority and obligations.

Implementation Contract Executions authorize execution of those approved obligations without establishing, reinterpreting, extending, or replacing them.

Each approved Implementation Contract normally has one corresponding Implementation Contract Execution artifact. Alternative execution structures require explicit future repository authority.

## Relationship to Implementation

Implementation realizes the approved contract within the boundary recorded by its ICE artifact.

Production code, schemas, migrations, configuration, tests, assets, and other implementation outputs are not part of the ICE artifact family.

## Naming Convention

Each artifact filename uses:

`ICE-<authorized-capability-identifier>-<descriptive-slug>.md`

The ICE identifier must be the identifier explicitly authorized by the governing Implementation Contract. The descriptive slug uses lowercase kebab case and identifies the approved execution.
