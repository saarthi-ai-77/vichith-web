import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function PlatformIndex() {
  const supabase = createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // Check if user has completed onboarding profile
  const { data: creator } = await supabase
    .from('creators')
    .select('username')
    .eq('id', session.user.id)
    .maybeSingle();

  if (!creator) {
    redirect('/onboarding');
  }

  redirect('/dashboard');
}
