-- Store generated Grow ID QR data on the profile record when available.
-- The app can still regenerate QR codes from the public profile URL if these fields are absent.

alter table if exists public.public_member_profiles
  add column if not exists grow_id_qr_data_url text;

alter table if exists public.public_member_profiles
  add column if not exists grow_id_qr_profile_url text;

alter table if exists public.public_member_profiles
  add column if not exists grow_id_qr_updated_at timestamptz;

comment on column public.public_member_profiles.grow_id_qr_data_url is
  'Cached PNG data URL for the user Grow ID QR code. Regenerated from grow_id_qr_profile_url when stale.';

comment on column public.public_member_profiles.grow_id_qr_profile_url is
  'Public Grow Profile URL encoded by the cached Grow ID QR code.';

comment on column public.public_member_profiles.grow_id_qr_updated_at is
  'Timestamp for the most recent Grow ID QR cache update.';
