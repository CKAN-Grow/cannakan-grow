# Founder Real Data Protection

Founder/admin grow sessions are treated as real production data during demo resets. Real logged-in user writes default to `is_mock = false` on Grow sessions, Community Grow snapshots, community activity, and Source Directory records.

Seeded, demo, and dev-generated grow data must be marked `is_mock = true`. Demo resets should use the admin-only `public.cleanup_mock_grow_data()` function or `scripts/cleanup-mock-grow-data.sql`; the function defaults to dry-run mode and only deletes mock grow data plus child rows attached to mock sessions or snapshots.

The cleanup path must not delete user accounts, non-mock grow sessions, non-mock Community Grow snapshots, non-mock Source Directory records, or any admin/CSTP records. Public CSTP scope remains unchanged.

For founder account test-session resets, use the Admin System Tools cleanup action, `public.cleanup_founder_test_grow_sessions()`, or `scripts/cleanup-founder-test-grow-sessions.sql`. It is admin-only, previews by default, requires the exact confirmation phrase `DELETE OLD FOUNDER TEST SESSIONS` before deletion, skips CSTP-linked sessions, marks candidates as `archived_test`, `is_test = true`, `is_mock = true`, and `excluded_from_analytics = true` before removal, caps explicit unmarked cleanup to the founder personal reset cutoff timestamp, and writes every preview/execution to `public.grow_session_cleanup_audit`.

Analytics must only count completed sessions where `is_deleted = false`, `is_test = false`, `excluded_from_analytics = false`, and `is_mock = false`. Deleted, archived test, abandoned, mock, or otherwise excluded sessions must not affect germination rates, timing averages, source rankings, leaderboards, Community Grow analytics, or CSTP-related calculations.
