import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wklhqwvolymqjqqpcjkc.supabase.co';
const supabaseAnonKey = 'sb_publishable_3v0ocAwCCTpHhmgq5et82Q_wkjcOXrR';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
