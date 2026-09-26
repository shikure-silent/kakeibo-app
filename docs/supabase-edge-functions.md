# Supabase Edge Functions

## Account deletion

The static web app calls the `delete-account` Edge Function to delete a
signed-in user's cloud data and Supabase Auth account. Deploy it before
releasing a build that includes this client change:

```sh
npx supabase login
npx supabase functions deploy delete-account --project-ref <project-ref>
```

Supabase provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to deployed
functions. Do not expose the service-role key in browser code or in any
`NEXT_PUBLIC_*` variable.
