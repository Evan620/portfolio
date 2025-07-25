// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tcrlqwbsqvbujtmqishp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcmxxd2JzcXZidWp0bXFpc2hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMDY2NDIsImV4cCI6MjA2ODc4MjY0Mn0.1_HT7kENo4LIiNItDFv8_pFMRp7plZNB4sqb-O30lMY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});