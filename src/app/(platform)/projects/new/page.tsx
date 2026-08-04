import React from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import NewProjectForm from '@/components/NewProjectForm';

export const metadata = {
  title: 'New Project | Vichith Platform',
  description: 'Create and publish a new video project timeline.',
};

export default async function NewProjectPage() {
  const supabase = createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // Get current creator profile
  const { data: creator } = await supabase
    .from('creators')
    .select('username')
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
      <NewProjectForm username={creator.username} />
    </div>
  );
}
