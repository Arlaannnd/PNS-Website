// supabaseClient.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://aqrbqoaicqzwehzuxckf.supabase.co'  // ganti dengan URL kamu
const SUPABASE_KEY = 'sb_publishable_HZfl7aJTc5Ex1fmV-ktN8Q_7XRwxnx5'      // jangan hardcode di file ini idealnya

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)