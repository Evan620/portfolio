import { supabase } from '@/integrations/supabase/client';

export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
};

export const testSupabaseAuth = async () => {
  try {
    console.log('Testing Supabase auth...');
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Supabase auth error:', error);
      return false;
    }
    
    console.log('Supabase auth test successful, user:', user);
    return true;
  } catch (error) {
    console.error('Supabase auth test failed:', error);
    return false;
  }
};
