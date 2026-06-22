import { createClient } from '@supabase/supabase-js';

// Clean the provided URL to exclude '/rest/v1/' if it's there
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://vjbubpzqljxlczyaedgg.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqYnVicHpxbGp4bGN6eWFlZGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwOTIzODEsImV4cCI6MjA5NzY2ODM4MX0.FmL3wEm8RbkvCGRruYtvbnFH8NHvbiZ2L7yj3lZdhAs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

