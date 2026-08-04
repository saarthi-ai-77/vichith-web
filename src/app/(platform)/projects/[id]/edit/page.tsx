import React from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import EditProjectForm from '@/components/EditProjectForm';

interface EditProjectPageProps {
  params: {
    id: string;
  };
}

export const metadata = {
  title: 'Edit Project | Vichith Platform',
  description: 'Update project settings or delete project timeline.',
};

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const supabase = createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // Get current project details
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (projectError || !project) {
    redirect('/dashboard');
  }

  // Verify ownership
  if (project.creator_id !== session.user.id) {
    redirect('/dashboard');
  }

  // Get creator profile to extract username
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
      <EditProjectForm project={project} username={creator.username} />
    </div>
  );
}
