import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireEnv } from '@/lib/env';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        
        // Minimal telemetry backend
        // This will allow us to answer questions about usage, latency, and features
        const supabase = createClient(
            requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
            requireEnv('SUPABASE_SERVICE_ROLE_KEY')
        );

        // Expects { eventName: string, properties: any, timestamp: number, userId: string | null }
        const { eventName, properties, userId } = body;

        if (!eventName) {
            return NextResponse.json({ error: 'Missing eventName' }, { status: 400 });
        }

        const { error } = await supabase.from('telemetry_events').insert({
            event_name: eventName,
            properties,
            user_id: userId,
            created_at: new Date().toISOString()
        });

        // If the table does not exist yet (requires a migration), log to console for now
        if (error && error.code === '42P01') {
            console.log('[Telemetry Fallback Log]', { eventName, properties, userId });
        } else if (error) {
            console.error('[Telemetry Error]', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
