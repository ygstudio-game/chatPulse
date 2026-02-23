"use client";

import { useEffect, useState } from "react";
import {
    LiveKitRoom,
    VideoConference,
    RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { createLiveKitToken } from "@/actions/livekit";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

interface VideoRoomProps {
    chatId: Id<"conversations">;
    user: { name: string; id: string };
    activeCallId: string;
    video: boolean;
}

export const VideoRoom = ({ chatId, user, activeCallId, video }: VideoRoomProps) => {
    const [token, setToken] = useState("");
    const declineCall = useMutation(api.conversations.declineCall);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const name = user.name || "Unknown";
                const jwt = await createLiveKitToken(activeCallId, name);
                if (mounted) setToken(jwt);
            } catch (e) {
                console.error(e);
            }
        })();
        return () => { mounted = false; };
    }, [activeCallId, user.name]);

    if (token === "") {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-background space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-emerald"></div>
                <p className="text-muted-foreground animate-pulse">Connecting to secure room...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-black h-full overflow-hidden relative">
            <LiveKitRoom
                video={video}
                audio={true}
                token={token}
                serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
                onDisconnected={() => {
                    declineCall({ conversationId: chatId });
                }}
                className="flex-1 flex flex-col"
                data-lk-theme="default"
            >
                <VideoConference />
                <RoomAudioRenderer />
            </LiveKitRoom>
        </div>
    );
};
