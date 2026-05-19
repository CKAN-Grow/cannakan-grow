-- Safe mock/demo grow-data cleanup helper.
--
-- Preview only, default-safe:
--   select * from public.cleanup_mock_grow_data(true);
--
-- Execute cleanup after reviewing the preview:
--   select * from public.cleanup_mock_grow_data(false);
--
-- The cleanup function is admin-only and only deletes records marked is_mock
-- plus child rows that belong to mock sessions/snapshots. It never deletes
-- real users, real sessions, real snapshots, real sources, or CSTP/admin rows.

select * from public.cleanup_mock_grow_data(true);
