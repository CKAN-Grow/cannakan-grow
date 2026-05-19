# Founder Real Data Protection

Founder/admin grow sessions are treated as real production data during demo resets. Real logged-in user writes default to `is_mock = false` on Grow sessions, Community Grow snapshots, community activity, and Source Directory records.

Seeded, demo, and dev-generated grow data must be marked `is_mock = true`. Demo resets should use the admin-only `public.cleanup_mock_grow_data()` function or `scripts/cleanup-mock-grow-data.sql`; the function defaults to dry-run mode and only deletes mock grow data plus child rows attached to mock sessions or snapshots.

The cleanup path must not delete user accounts, non-mock grow sessions, non-mock Community Grow snapshots, non-mock Source Directory records, or any admin/CSTP records. Public CSTP scope remains unchanged.
