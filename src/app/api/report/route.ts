import { NextResponse } from 'next/server';
import { requireText, LIMITS } from '@/lib/validate';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const category = formData.get('category') as string;
    const action_attempted = formData.get('action_attempted') as string;
    const what_happened = formData.get('what_happened') as string;
    const expected_behavior = formData.get('expected_behavior') as string;
    const severity = formData.get('severity') as string;
    const app_version = formData.get('app_version') as string;
    const operating_system = formData.get('operating_system') as string;
    const email = formData.get('email') as string;

    const screenshot = formData.get('screenshot') as File | null;
    const recording = formData.get('recording') as File | null;
    const crashLog = formData.get('crashLog') as File | null;

    // SECURITY S-5: unauthenticated endpoint. `as string` casts a FormDataEntryValue
    // without checking anything, so an unbounded field went straight to Postgres.
    // Each field is now length-bounded; a bug report body gets the long cap, the
    // rest get short ones.
    for (const [name, value, cap] of [
      ['category', category, LIMITS.shortText],
      ['what_happened', what_happened, LIMITS.longText],
      ['severity', severity, LIMITS.shortText],
      ['action_attempted', action_attempted, LIMITS.longText],
      ['expected_behavior', expected_behavior, LIMITS.longText],
      ['app_version', app_version, LIMITS.shortText],
      ['operating_system', operating_system, LIMITS.shortText],
      ['email', email, LIMITS.email],
    ] as const) {
      const required = name === 'category' || name === 'what_happened' || name === 'severity';
      const checked = requireText(value, name, cap, { optional: !required });
      if (!checked.ok) {
        return NextResponse.json({ error: checked.error }, { status: 400 });
      }
    }

    const attachment_urls: string[] = [];

    // Setup Supabase Client if credentials are present
    const hasSupabase = supabaseUrl && supabaseKey;
    let supabase: any = null;
    if (hasSupabase) {
      supabase = createClient(supabaseUrl, supabaseKey);
    }

    // SECURITY S-5: cap attachment size. This endpoint is UNAUTHENTICATED and writes
    // to Supabase Storage, so without a ceiling anyone can fill the bucket — and we
    // pay for it. Files were only checked for `size > 0`. A screen recording of a bug
    // fits comfortably in 25 MB; anything larger is not a bug report.
    const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;

    // Helper function to upload files to Supabase Storage
    const uploadFile = async (file: File, typeLabel: string): Promise<string | null> => {
      if (file.size > MAX_ATTACHMENT_BYTES) {
        console.warn(`Rejected oversized ${typeLabel}: ${file.size} bytes`);
        return null;
      }
      try {
        if (!supabase) return null;
        const buffer = Buffer.from(await file.arrayBuffer());
        const timestamp = Date.now();
        const sanitizeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const uploadPath = `${timestamp}_${typeLabel}_${sanitizeName}`;

        const { data, error } = await supabase.storage
          .from('attachments')
          .upload(uploadPath, buffer, {
            contentType: file.type || 'application/octet-stream',
            upsert: true
          });

        if (error) {
          console.error(`Failed to upload ${typeLabel} to Supabase:`, error);
          return null;
        }

        const { data: publicUrlData } = supabase.storage
          .from('attachments')
          .getPublicUrl(uploadPath);

        return publicUrlData.publicUrl;
      } catch (err) {
        console.error(`Error uploading ${typeLabel}:`, err);
        return null;
      }
    };

    // Upload files if present
    if (screenshot && screenshot.size > 0) {
      const url = await uploadFile(screenshot, 'screenshot');
      if (url) attachment_urls.push(url);
      else attachment_urls.push(`simulated://screenshot_${screenshot.name}`);
    }
    if (recording && recording.size > 0) {
      const url = await uploadFile(recording, 'recording');
      if (url) attachment_urls.push(url);
      else attachment_urls.push(`simulated://recording_${recording.name}`);
    }
    if (crashLog && crashLog.size > 0) {
      const url = await uploadFile(crashLog, 'crashLog');
      if (url) attachment_urls.push(url);
      else attachment_urls.push(`simulated://log_${crashLog.name}`);
    }

    if (!hasSupabase) {
      console.warn('Supabase credentials missing. Simulating report storage with attachments:', attachment_urls);
      return NextResponse.json({ success: true, message: 'Simulated feedback submission successful.' });
    }

    const { data, error } = await supabase
      .from('reports')
      .insert([
        {
          category,
          action_attempted,
          what_happened,
          expected_behavior,
          severity,
          app_version,
          operating_system,
          email,
          attachment_urls,
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ success: true, simulated: true, error: error.message });
    }

    return NextResponse.json({ success: true, message: 'Feedback stored successfully.' });
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ success: true, simulated: true, message: 'Graceful fallback on error' });
  }
}
