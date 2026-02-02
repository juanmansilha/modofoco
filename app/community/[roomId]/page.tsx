import { ChatInterface } from "@/components/community/ChatInterface";

interface PageProps {
    params: Promise<{ roomId: string }>;
}

export default async function RoomPage({ params }: PageProps) {
    const { roomId } = await params;

    return (
        <div className="h-full">
            <ChatInterface roomId={roomId} />
        </div>
    );
}
