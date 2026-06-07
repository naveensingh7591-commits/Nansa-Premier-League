import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://frrbqfznovmoxeuegvof.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_8e8Ehw6wsk9PJn07PWsYmQ_WG1DOIQr';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
