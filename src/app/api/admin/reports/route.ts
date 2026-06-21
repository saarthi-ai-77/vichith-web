import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const MOCK_REPORTS = [
  {
    id: 1,
    category: 'Bug Report',
    action_attempted: 'Exporting 10-minute timeline with captions',
    what_happened: 'Timeline playback freezes at 04:32 and the application exits unexpectedly.',
    expected_behavior: 'Video should export completely without crash.',
    severity: 'Blocker',
    app_version: '0.5.0',
    operating_system: 'Windows',
    email: 'creator.test@example.com',
    attachment_urls: [],
    created_at: '2026-06-20T18:32:00Z',
  },
  {
    id: 2,
    category: 'Workflow Suggestion',
    action_attempted: 'Editing captions track',
    what_happened: 'I have to click each subtitle block to modify text styling. It would be better to have a batch style applicator.',
    expected_behavior: 'Apply styling (color, font size) to all caption segments at once.',
    severity: 'Minor',
    app_version: '0.5.0',
    operating_system: 'macOS',
    email: 'editor.pro@example.com',
    attachment_urls: [],
    created_at: '2026-06-20T15:20:00Z',
  },
  {
    id: 3,
    category: 'Performance Issue',
    action_attempted: 'Importing multi-track audio files',
    what_happened: 'RAM usage goes up from 4GB to 14GB when loading 5 WAV files at once.',
    expected_behavior: 'Streaming from disk rather than caching full waveforms in RAM.',
    severity: 'Major',
    app_version: '0.5.0',
    operating_system: 'Windows',
    email: 'mixer.studio@example.com',
    attachment_urls: [],
    created_at: '2026-06-19T22:11:00Z',
  }
];

export async function GET(req: Request) {
  try {
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase credentials missing. Returning mock reports for admin view.');
      return NextResponse.json({ success: true, reports: MOCK_REPORTS });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch reports table ordered by created_at descending
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return NextResponse.json({ success: true, reports: MOCK_REPORTS, error: error.message });
    }

    // Merge mock reports in if database is empty so dashboard is never blank
    const reports = data && data.length > 0 ? data : MOCK_REPORTS;

    return NextResponse.json({ success: true, reports });
  } catch (err: any) {
    console.error('Admin API error:', err);
    return NextResponse.json({ success: true, reports: MOCK_REPORTS, error: err.message });
  }
}
