# Scarlettabbott Parking + Desks MVP

Simple week view to request car spaces and hot desks. Manual approvals, quotas, and an 8-week booking window.

## Stack
- Frontend: Vite + React + TypeScript, static deploy
- Backend: Supabase Postgres + SQL functions (no server to run)
- Auth: Anonymous users. Admin actions require a passphrase checked in the database functions.

## Quick start
1. Create a new Supabase project.
2. In the Supabase SQL editor, run files in this order:
   - `supabase/schema.sql`
   - `supabase/policies.sql`
   - `supabase/functions/enforce_quota_and_create.sql`
   - `supabase/functions/approve_booking.sql`
   - `supabase/functions/reject_booking.sql`
   - `supabase/functions/free_slot.sql`
   - `supabase/functions/promote_next_waitlist.sql`
3. Load seed data:
   - `supabase/seed/resources.csv` via Table Editor import into `resources`
   - `supabase/seed/employees.csv` via Table Editor import into `employees`
   - Settings table already contains the admin hash.
4. Copy `.env.example` to `.env` and fill:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Install and run:
   ```bash
   cd web
   npm i
   npm run dev
   ```
6. Build for static hosting:
   ```bash
   npm run build
   npm run preview
   ```

## Admin mode
Click the lock icon, enter the passphrase. Admin actions call SQL functions with the passphrase server-side validation.
Passphrase set for this MVP: **parkyparker** (stored as SHA-256 in the DB; only the hash is persisted).

## Quotas and rules
- Car: 2 days per person per week
- Desk: 3 days per person per week
- Booking horizon: 8 weeks from today
- Mon to Fri only

## Repo layout
- `web/` Static frontend (Vite project)
- `supabase/` Database schema, policies, and functions
