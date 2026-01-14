import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tlyvietozabrwuvidkdw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRseXZpZXRvemFicnd1dmlka2R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4MjMxMDQsImV4cCI6MjA4MjM5OTEwNH0.4YmVG5y5d0wXe3agTTaxwNu1EWq0n1jF794GDWcI3Tc';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export {
    customSupabaseClient,
    customSupabaseClient as supabase,
};
