"use server";

import { AccessToken } from "livekit-server-sdk";

export async function createLiveKitToken(room: string, username: string) {
    if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
        throw new Error("LiveKit API credentials are not configured");
    }

    const at = new AccessToken(
        process.env.LIVEKIT_API_KEY,
        process.env.LIVEKIT_API_SECRET,
        {
            identity: username,
            name: username,
        }
    );

    at.addGrant({ roomJoin: true, room, canPublish: true, canSubscribe: true });

    return await at.toJwt();
}
