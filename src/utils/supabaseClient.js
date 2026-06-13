import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wslfavrdhmnqigkbxmuu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_fIRJHcgyXy0WgSWkOHR8Fg_xc7oLIvC';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
