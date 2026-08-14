const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!key) {
  console.log('No Supabase key found in environment.');
  process.exit(1);
}

const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase.from('users').select('id, email, auth_user_id');
  if (error) {
    console.error('Error fetching users:', error);
    process.exit(1);
  }
  
  const total = data.length;
  const mapped = data.filter(u => u.auth_user_id !== null).length;
  
  console.log(`Total users: ${total}`);
  console.log(`Mapped users (auth_user_id is not null): ${mapped}`);
  console.log(data);
}

check();
