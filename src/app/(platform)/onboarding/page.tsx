import React from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import OnboardingForm from '@/components/OnboardingForm';

export const metadata = {
  title: 'Onboarding | Vichith Platform',
  description: 'Claim your creator username and set up your profile.',
};

export default async function OnboardingPage() {
  const supabase = createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // Check if creator profile already exists
  const { data: creator } = await supabase
    .from('creators')
    .select('username')
    .eq('id', session.user.id)
    .maybeSingle();

  if (creator) {
    redirect('/dashboard');
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh',
    }}>
      <OnboardingForm />
    </div>
  );
}
