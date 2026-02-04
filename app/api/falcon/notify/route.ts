import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { FalconBrain } from '@/lib/falcon-brain';

// Initialize Supabase Admin Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: NextRequest) {
    // 1. Check for specific user (e.g. "Juan") or iterate all?
    // The user asked to "send a test message of Juan's account".
    // I need to find the user ID for Juan. I'll search by email or phone if provided,
    // or just take the first user if it's a dev env.
    // Ideally I should pass ?userId=... or ?phone=...

    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone'); // e.g. 554199999999

    if (!phone) {
        return NextResponse.json({ error: "Phone parameter required" }, { status: 400 });
    }

    // Find user
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('whatsapp', phone) // or 'whatsapp' column
        .single();

    if (!profile) {
        // Try strict match without CC if needed, similar to webhook
        const { data: profileNoCC } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('whatsapp', phone.replace(/^55/, ''))
            .single();

        if (!profileNoCC) {
            return NextResponse.json({ error: "User not found for this phone" }, { status: 404 });
        }

        // Use the one found
        const brain = new FalconBrain(profileNoCC.id, supabaseAdmin);
        await brain.notifyUpcomingBills();
        return NextResponse.json({ status: "Notification Sent to " + profileNoCC.email });
    }

    const brain = new FalconBrain(profile.id, supabaseAdmin);
    await brain.notifyUpcomingBills();

    return NextResponse.json({ status: "Notification Sent", profile: profile.email });
}
