import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kceiwwmtywpbbncrqufd.supabase.co';
const supabaseAnonKey = 'sb_publishable_zLv6zef4n-qZIGlVq8nlsw_KvA6xOi2';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);