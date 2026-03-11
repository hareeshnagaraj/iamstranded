-- iamstranded — pg_cron setup (DEPRECATED)
-- Feed generation is now on-demand via /api/feed/generate (triggered when users visit the page).
-- This eliminates the ~$13/day cost from 30-second cron invocations.

-- Unschedule the old cron job if it exists:
select cron.unschedule('generate-intel-feed');

-- The previous cron schedule is preserved below for reference only.
-- DO NOT re-enable — use the on-demand approach instead.

/*
-- OLD: Store project URL and anon key in Vault for cron access
select vault.create_secret('https://lfljoxhdtndnfybfowor.supabase.co', 'project_url');
select vault.create_secret('YOUR_ANON_KEY_HERE', 'anon_key');

-- OLD: Schedule invoke Edge Function every 30 seconds (~2,880 calls/day)
select cron.schedule(
  'generate-intel-feed',
  '30 seconds',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
           || '/functions/v1/generate-intel',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'anon_key')
    ),
    body := jsonb_build_object('time', now())::jsonb,
    timeout_milliseconds := 25000
  ) as request_id;
  $$
);
*/

-- To check cron execution history:
-- select * from cron.job_run_details order by start_time desc limit 20;
