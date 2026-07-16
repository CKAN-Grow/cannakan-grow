# Security verification

`npm run security:fingerprint` calculates a SHA-256 fingerprint from normalized, sorted local-database security metadata and compares it with `approved-security-fingerprint.json`. The snapshot covers public relation RLS, role privileges, policies, function execution/security-definer/search-path state, and Storage buckets/object policies.

There is intentionally no CI “accept” option. To approve a legitimate change, review the printed resource-level diff, verify the corresponding additive migration and regression coverage, regenerate the snapshot from a clean `npx supabase db reset`, and update the approved JSON in the same reviewed change.

Run the complete local gate with `npm run security:verify` after local Supabase is started.
