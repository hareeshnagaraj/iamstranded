-- iamstranded — pg_cron setup for AI feed generation
-- Run this SQL in the Supabase SQL Editor (Dashboard > SQL Editor)
-- Requires: pg_cron, pg_net, and Vault extensions (enabled by default on Supabase hosted)

-- 1. Store project URL and anon key in Vault for cron access
-- Replace YOUR_ANON_KEY_HERE with your actual anon key from Supabase dashboard
select vault.create_secret('https://lfljoxhdtndnfybfowor.supabase.co', 'project_url');
select vault.create_secret('YOUR_ANON_KEY_HERE', 'anon_key');

-- 2. Schedule: invoke Edge Function every 30 seconds
-- Requires Postgres >= 15.1.1.61 for sub-minute scheduling (Supabase hosted supports this)
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

-- To check cron execution history:
-- select * from cron.job_run_details order by start_time desc limit 20;

-- To unschedule:
-- select cron.unschedule('generate-intel-feed');
