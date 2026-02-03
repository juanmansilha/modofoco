import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { phone, message } = await request.json();

        if (!phone || !message) {
            return NextResponse.json({ error: 'Phone and message are required' }, { status: 400 });
        }

        const baseUrl = process.env.EVO_API_URL;
        const apiKey = process.env.EVO_API_KEY;
        const instance = process.env.EVO_INSTANCE_NAME;

        if (!baseUrl || !apiKey || !instance) {
            console.error("Evolution API credentials missing in .env.local");
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        // Evolution API endpoint for sending text
        const url = `${baseUrl}/message/sendText/${instance}`;

        // Format phone: Ensure it has country code (55) if missing, and remove formatting
        let formattedPhone = phone.replace(/\D/g, '');
        if (formattedPhone.length <= 11) { // e.g. 11999999999
            formattedPhone = '55' + formattedPhone;
        }

        const payload = {
            number: formattedPhone,
            text: message,
            options: {
                delay: 1200,
                presence: "composing",
                linkPreview: false
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': apiKey
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Evolution API Error:", data);
            return NextResponse.json({ error: data.message || 'Failed to send message' }, { status: response.status });
        }

        return NextResponse.json({ success: true, data });

    } catch (error) {
        console.error("Internal Server Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
