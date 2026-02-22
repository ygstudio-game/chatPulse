"use client";

import { VideoRoom } from "../video-room";
import { Id } from "@convex/_generated/dataModel";

interface VideoCallViewProps {
    chatId: Id<"conversations">;
    user: { name: string; id: string };
}

export const VideoCallView = ({ chatId, user }: VideoCallViewProps) => {
    return (
        <div className="flex-1 flex flex-col min-h-0 relative w-full bg-black overflow-hidden z-40">
            <VideoRoom
                chatId={chatId}
                user={user}
                activeCallId={`call_${chatId}`} // the room name
                video={true}
            />
        </div>
    );
};
