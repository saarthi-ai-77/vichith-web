import React from 'react';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import PlatformHeader from '@/components/PlatformHeader';

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  let creator = null;
  if (session?.user) {
    const { data } = await supabase
      .from('creators')
      .select('username, display_name, avatar_url')
      .eq('id', session.user.id)
      .maybeSingle();
    creator = data;
  }

  return (
    <div className="platform-shell" style={{ background: 'var(--black)', minHeight: '100vh', color: 'var(--text)' }}>
      <PlatformHeader creator={creator} user={session?.user || null} />
      <main style={{ padding: '2.5rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  );
}
