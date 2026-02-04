import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { FalconBrain } from '@/lib/falcon-brain';

export const dynamic = 'force-dynamic'; // Ensure it's not cached

export async function GET(request: Request) {
    // Basic security to allow Vercel Cron to call this
    // Vercel sends an authorization header for crons usually, or we can just keep it open but obscure 
    // For now, allow public trigger or check header if CRON_SECRET is set (recommended practice)

    // 1. Fetch all users with Falcon enabled
    // Only fetch necessary fields: id
    const { data: users, error } = await supabaseAdmin
        .from('profiles')
        .select('id, email, whatsapp')
        .eq('falcon_enabled', true);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!users || users.length === 0) {
        return NextResponse.json({ message: "No active Falcon users found." });
    }

    console.log(`🦅 Daily Cron: Checking ${users.length} users...`);

    const results = [];

    // 2. Iterate and check each user
    // We run sequentially or parallel depending on load. 
    // Parallel is fine for small numbers.
    for (const user of users) {
        try {
            const brain = new FalconBrain(user.id, supabaseAdmin);

            // Run checks
            // We can determine WHAT to check based on day/time if we want specific schedules
            // For now, daily morning check:

            // A. Check Pending Tasks (Due Today/Overdue)
            const tasksRes = await brain.checkPendingTasks();

            // B. Check Finance (Pending Bills)
            const financeRes = await brain.notifyUpcomingBills();

            // C. Check Inactivity
            const activityRes = await brain.checkInactivity();

            results.push({
                user: user.email,
                status: 'checked',
                details: {
                    tasks: tasksRes.text,
                    finance: financeRes.text,
                    activity: activityRes.text
                }
            });

        } catch (e) {
            console.error(`Error checking user ${user.id}:`, e);
            results.push({ user: user.id, status: 'error', error: String(e) });
        }
    }

    return NextResponse.json({
        success: true,
        checked: users.length,
        results
    });
}
