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

console.log("Seed Vault migration regression check passed.");
