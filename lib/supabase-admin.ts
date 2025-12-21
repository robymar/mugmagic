import { createClient } from '@supabase/supabase-js';

// Note: This client should ONLY be used in server-side API routes
// protected by the service role key.
// NEVER expose NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY to the client if you have one.
// Here we assume standard Env Vars.
// If you don't have a service role key yet, this won't work for admin tasks.
// Using ANON key for now if Service Role is missing, but with RLS policies allowing insert.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        persistSession: false,
    },
});
