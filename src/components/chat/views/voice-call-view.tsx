"use client";

import { VideoRoom } from "../video-room";
import { Id } from "@convex/_generated/dataModel";

interface VoiceCallViewProps {
    chatId: Id<"conversations">;
    user: { name: string; id: string };
}

export const VoiceCallView = ({ chatId, user }: VoiceCallViewProps) => {
    return (
        <div className="flex-1 flex flex-col min-h-0 relative w-full bg-black overflow-hidden z-40">
            <VideoRoom
                chatId={chatId}
                user={user}
                activeCallId={`call_${chatId}`} // the room name
                video={false}
            />
        </div>
    );
};
