import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { FalconBrain } from '@/lib/falcon-brain';

// Helper to send message back via Evolution API
async function sendWhatsAppMessage(phone: string, text: string) {
    const baseUrl = process.env.EVO_API_URL || "https://evolution.fyreoficial.com.br";
    const apiKey = process.env.EVO_API_KEY || "KS2rnpBe7QXyj0pnGOOPAqBDBjC0r0UM";
    const instance = process.env.EVO_INSTANCE_NAME || "Modofoco";

    const url = `${baseUrl}/message/sendText/${instance}`;
    const payload = {
        number: phone,
        text: text,
        options: { delay: 1200, presence: "composing", linkPreview: false }
    };

    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': apiKey },
            body: JSON.stringify(payload)
        });
    } catch (e) {
        console.error("Failed to reply to WhatsApp:", e);
    }
}

export async function POST(request: Request) {
    try {
        const payload = await request.json();

        // 1. Identify Message & Sender (Evolution API Structure)
        // Structure varies, usually data.message...
        const data = payload.data;
        if (!data) return NextResponse.json({ ignored: true });

        const remoteJid = data.key?.remoteJid; // e.g., "5511999999999@s.whatsapp.net"
        const messageContent = data.message?.conversation || data.message?.extendedTextMessage?.text;
        const fromMe = data.key?.fromMe;

        if (fromMe || !remoteJid || !messageContent) {
            return NextResponse.json({ ignored: true });
        }

        // Extract Phone (remove @s.whatsapp.net)
        const phone = remoteJid.split('@')[0];

        // 2. Find User by Phone
        // Need to fuzzy match or strip country code?
        // User stores as "11999999999" (no 55) usually in our modal logic
        // But webhook sends "5511999999999"

        // Try strict match first
        let { data: userProfile, error } = await supabaseAdmin
            .from('profiles')
            .select('id, whatsapp, falcon_enabled')
            .eq('whatsapp', phone)
            .single();

        // If not found, try removing country code (assuming BR '55')
        if (!userProfile && phone.startsWith('55')) {
            const phoneWithoutCC = phone.substring(2);
            const { data: userProfileNoCC } = await supabaseAdmin
                .from('profiles')
                .select('id, whatsapp, falcon_enabled')
                .eq('whatsapp', phoneWithoutCC)
                .single();
            userProfile = userProfileNoCC;
        }

        if (!userProfile) {
            // User not found - maybe auto onboarding?
            // For now, ignore non-users to save cost/spam
            console.log(`Falcon: Message from unknown phone ${phone}`);
            return NextResponse.json({ status: 'user_not_found' });
        }

        if (!userProfile.falcon_enabled) {
            // Optional: Reply asking to enable?
            return NextResponse.json({ status: 'falcon_disabled' });
        }

        // 3. Process with Brain
        const brain = new FalconBrain(userProfile.id, supabaseAdmin);
        const response = await brain.processMessage(messageContent);

        // 4. Send Reply
        await sendWhatsAppMessage(phone, response.text);

        // 5. Award Points Logic (Server-side)
        // FalconBrain executed the action, but updating Gamification "Context" on server is different.
        // We need to write to a 'gamification_history' or just update the profile's lifetime_fp column directly if we want points to persist.
        // The Context handles it on client. On server, we must write to DB.
        // Currently, we don't have a backend table for FP history in the code I saw (Context uses localStorage).
        // CRITICAL MISSING PIECE: The Gamification was storing data in LOCAL STORAGE in the Context!
        // "useEffect(() => { const storedFP = localStorage.getItem..."

        // IF THE USER IS ON WHATSAPP, WE CANNOT UPDATE THEIR LOCAL STORAGE.
        // WE MUST MIGRATE GAMIFICATION TO SUPABASE.

        // **Urgent Fix**: The user wants gamification via WhatsApp.
        // I must ensure points are stored in the DB so next time they open the app, it syncs.
        // I will check `profiles` table for `fp` or `lifetime_fp` columns.
        // If they don't exist, I should create them or just accept that points only work in-app for now (but that defeats the purpose).
        // Wait, the prompt implies "Falcon executes actions... updates system".

        // Let's check `profiles` schema.

        return NextResponse.json({ success: true, response: response.text });

    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
