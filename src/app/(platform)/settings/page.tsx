import React from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import SettingsForm from '@/components/SettingsForm';

export const metadata = {
  title: 'Settings | Vichith Platform',
  description: 'Manage and update your creator profile information.',
};

export default async function SettingsPage() {
  const supabase = createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // Get current creator profile
  const { data: creator } = await supabase
    .from('creators')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle();

  if (!creator) {
    redirect('/onboarding');
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem 0'
    }}>
      <SettingsForm initialCreator={creator} />
    </div>
  );
}
