import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@async.com',
    password: 'Admin@123',
  });
  if (error) {
    console.error('Login error:', error.message);
  } else {
    console.log('Login success, user id:', data.user?.id);
    console.log('Role:', data.user?.user_metadata?.role);
  }
}

testLogin();
