import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wslfavrdhmnqigkbxmuu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzbGZhdnJkaG1ucWlna2J4bXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMTU0MjYsImV4cCI6MjA5NTY5MTQyNn0.VSSkeVBW1HTLDI29pbY8_VIsMsMtMcqIlmxLFOJYp2U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
