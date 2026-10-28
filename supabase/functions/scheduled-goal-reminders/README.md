# Daily savings-goal reminders
Deploy with `supabase functions deploy scheduled-goal-reminders --no-verify-jwt`.
Set the existing VAPID secrets and a random scheduler secret. Store only its SHA-256 hash in `push_scheduler_config` with id `savings-goals`. Call this function every 15–60 minutes with header `x-scheduler-secret`. Never put the raw secret in the repository or browser code.
