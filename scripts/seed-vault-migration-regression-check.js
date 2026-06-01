const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const migrationPath = path.join(
  repoRoot,
  "supabase",
  "migrations",
  "20260521103000_ensure_seed_vault_entries_api.sql",
);
const sql = fs.readFileSync(migrationPath, "utf8");
const partitionFieldsMigrationPath = path.join(
  repoRoot,
  "supabase",
  "migrations",
  "20260521154500_add_seed_vault_partition_fields.sql",
);
const partitionFieldsSql = fs.readFileSync(partitionFieldsMigrationPath, "utf8");
const restContractMigrationPath = path.join(
  repoRoot,
  "supabase",
  "migrations",
  "20260526113000_ensure_seed_vault_entries_rest_contract.sql",
);
const restContractSql = fs.readFileSync(restContractMigrationPath, "utf8");
const privacyInventoryMigrationPath = path.join(
  repoRoot,
  "supabase",
  "migrations",
  "20260601102000_seed_vault_privacy_inventory_foundation.sql",
);
const privacyInventorySql = fs.readFileSync(privacyInventoryMigrationPath, "utf8");

for (const needle of [
  "create table if not exists public.seed_vault_entries",
  "id uuid primary key default gen_random_uuid()",
  "user_id uuid not null references auth.users(id) on delete cascade",
  "seed_name text not null",
  "seed_type text",
  "source text",
  "quantity integer",
  "year_acquired integer",
  "seed_age_years numeric",
  "storage_location text",
  "notes text",
  "is_favorite boolean default false",
  "is_archived boolean default false",
  "created_at timestamptz default timezone('utc', now())",
  "updated_at timestamptz default timezone('utc', now())",
  "alter table public.seed_vault_entries enable row level security",
  "create policy \"Users can view their own seed vault entries\"",
  "for select",
  "using (auth.uid() = user_id)",
  "create policy \"Users can insert their own seed vault entries\"",
  "for insert",
  "with check (auth.uid() = user_id)",
  "create policy \"Users can update their own seed vault entries\"",
  "for update",
  "create policy \"Users can delete their own seed vault entries\"",
  "for delete",
  "create trigger seed_vault_entries_set_updated_at",
  "grant usage on schema public to authenticated",
  "grant select, insert, update, delete on public.seed_vault_entries to authenticated",
  "notify pgrst, 'reload schema'",
]) {
  if (!sql.includes(needle)) {
    throw new Error(`Missing Seed Vault migration contract: ${needle}`);
  }
}

if (/drop\s+table|truncate\s+table|delete\s+from\s+public\.seed_vault_entries/i.test(sql)) {
  throw new Error("Seed Vault migration must stay additive and non-destructive.");
}

for (const needle of [
  "alter table public.seed_vault_entries",
  "add column if not exists seed_variety text",
  "add column if not exists seed_sex text",
  "set seed_variety = seed_name",
  "notify pgrst, 'reload schema'",
]) {
  if (!partitionFieldsSql.includes(needle)) {
    throw new Error(`Missing Seed Vault partition field migration contract: ${needle}`);
  }
}

if (/drop\s+table|truncate\s+table|delete\s+from\s+public\.seed_vault_entries/i.test(partitionFieldsSql)) {
  throw new Error("Seed Vault partition field migration must stay additive and non-destructive.");
}

for (const needle of [
  "create table if not exists public.seed_vault_entries",
  "user_id uuid not null references auth.users(id) on delete cascade",
  "source text",
  "seed_variety text",
  "seed_type text",
  "sex text",
  "seed_age_years numeric",
  "seed_count integer",
  "remaining_count integer",
  "notes text",
  "created_at timestamptz default timezone('utc', now())",
  "updated_at timestamptz default timezone('utc', now())",
  "alter table public.seed_vault_entries enable row level security",
  "create policy \"Users can view their own seed vault entries\"",
  "for select",
  "using (auth.uid() = user_id)",
  "create policy \"Users can insert their own seed vault entries\"",
  "for insert",
  "with check (auth.uid() = user_id)",
  "create policy \"Users can update their own seed vault entries\"",
  "for update",
  "create policy \"Users can delete their own seed vault entries\"",
  "for delete",
  "create trigger seed_vault_entries_set_updated_at",
  "grant select, insert, update, delete on public.seed_vault_entries to authenticated",
  "notify pgrst, 'reload schema'",
]) {
  if (!restContractSql.includes(needle)) {
    throw new Error(`Missing Seed Vault REST contract migration safeguard: ${needle}`);
  }
}

if (/drop\s+table|truncate\s+table|delete\s+from\s+public\.seed_vault_entries/i.test(restContractSql)) {
  throw new Error("Seed Vault REST contract migration must stay additive and non-destructive.");
}

for (const needle of [
  "alter table public.seed_vault_entries",
  "add column if not exists visibility text not null default 'private'",
  "add column if not exists acquired_at date",
  "add column if not exists storage_notes text",
  "add column if not exists archived_at timestamptz",
  "add column if not exists is_deleted boolean not null default false",
  "seed_vault_entries_visibility_check",
  "alter table public.seed_vault_entries enable row level security",
  "using (auth.uid() = user_id)",
  "with check (auth.uid() = user_id)",
  "revoke all on public.seed_vault_entries from anon",
  "grant select, insert, update, delete on public.seed_vault_entries to authenticated",
  "notify pgrst, 'reload schema'",
]) {
  if (!privacyInventorySql.includes(needle)) {
    throw new Error(`Missing Seed Vault privacy/inventory migration safeguard: ${needle}`);
  }
}

if (/drop\s+table|truncate\s+table|delete\s+from\s+public\.seed_vault_entries/i.test(privacyInventorySql)) {
  throw new Error("Seed Vault privacy/inventory migration must stay additive and non-destructive.");
}

console.log("Seed Vault migration regression check passed.");
