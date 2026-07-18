-- ============================================================================
-- Beta feedback capture (20260716000001)
--
-- In-app "Send feedback" writes here. Every founding-member bug report /
-- suggestion lands as a row with enough context to reproduce without a
-- back-and-forth: the app version, the view they were on, and their browser /
-- screen size — auto-attached client-side (see src/services/feedbackService.ts).
--
-- RLS: a signed-in user may INSERT their own rows and READ them back, nothing
-- else. Only the project owner (service role, which bypasses RLS) reads across
-- users. Anonymous (signed-out) feedback is intentionally NOT allowed — the
-- beta is invite-only and every tester is authenticated.
-- ============================================================================

create table if not exists public.feedback (
	id uuid primary key default gen_random_uuid(),
	created_at timestamptz not null default now(),
	user_id uuid not null references auth.users (id) on delete cascade,
	message text not null,
	-- Free-form client context (app_version, view, user_agent, screen, url).
	context jsonb not null default '{}'::jsonb
);

create index if not exists feedback_user_id_idx on public.feedback (user_id);
create index if not exists feedback_created_at_idx on public.feedback (created_at desc);

alter table public.feedback enable row level security;

-- Insert: only as yourself, and the message must be non-empty.
create policy "feedback_insert_own"
	on public.feedback for insert
	to authenticated
	with check (auth.uid() = user_id and length(trim(message)) > 0);

-- Read: only your own rows (owner reads all via service role, bypassing RLS).
create policy "feedback_select_own"
	on public.feedback for select
	to authenticated
	using (auth.uid() = user_id);
