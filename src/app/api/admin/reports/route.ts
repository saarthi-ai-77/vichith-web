import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET(req: Request) {
  try {
    // 1. Enforce Server-Side Passcode Authorization
    const passcode = req.headers.get('x-admin-passcode');
    const expectedPasscode = process.env.ADMIN_PASSCODE || 'vichith@2026!';

    if (!passcode || passcode !== expectedPasscode) {
      return NextResponse.json(
        { error: 'Unauthorized. Incorrect passcode.' },
        { status: 401 }
      );
    }

    // 2. Validate Supabase Configurations (No Mock Data Fallbacks)
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Server configuration error: Supabase URL or Key environment variables are missing.' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. Fetch live records from database
    const { data: reports, error: reportsError } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (reportsError) {
      console.error('Supabase DB error:', reportsError);
      return NextResponse.json(
        { error: `Database error: ${reportsError.message}` },
        { status: 500 }
      );
    }

    // 4. Fetch downloads count and surveys count defensively
    let totalDownloads = 0;
    let downloadsError = null;
    try {
      const { count, error } = await supabase
        .from('downloads')
        .select('*', { count: 'exact', head: true });
      if (error) {
        downloadsError = error.message;
      } else if (count !== null) {
        totalDownloads = count;
      }
    } catch (e: any) {
      downloadsError = e.message || String(e);
    }

    let totalSurveys = 0;
    let surveysError = null;
    try {
      const { count, error } = await supabase
        .from('surveys')
        .select('*', { count: 'exact', head: true });
      if (error) {
        surveysError = error.message;
      } else if (count !== null) {
        totalSurveys = count;
      }
    } catch (e: any) {
      surveysError = e.message || String(e);
    }

    return NextResponse.json({
      success: true,
      reports: reports || [],
      analytics: {
        totalDownloads,
        totalSurveys,
        totalReports: reports?.length || 0,
        downloadsError,
        surveysError
      }
    });
  } catch (err: any) {
    console.error('Admin API error:', err);
    return NextResponse.json(
      { error: `Server error: ${err.message}` },
      { status: 500 }
    );
  }
}
