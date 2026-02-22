"use client";

import { useMutation } from "convex/react";
import { useEffect, useRef } from "react";
import { api } from "@convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export const usePresence = () => {
    const { user } = useUser();
    const updatePresence = useMutation(api.users.updatePresence);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isOnlineRef = useRef<boolean>(false);

    useEffect(() => {
        if (!user) return;

        const setOnline = () => {
            if (!isOnlineRef.current) {
                isOnlineRef.current = true;
                updatePresence({ isOnline: true }).catch(console.error);
            }
        };

        const setOffline = () => {
            if (isOnlineRef.current) {
                isOnlineRef.current = false;
                updatePresence({ isOnline: false }).catch(console.error);
            }
        };

        const resetIdleTimer = () => {
            if (document.visibilityState === "hidden") return;
            setOnline();
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            // 2 minutes of no input = offline
            timeoutRef.current = setTimeout(setOffline, 2 * 60 * 1000);
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") resetIdleTimer();
            else setOffline();
        };

        resetIdleTimer();

        window.addEventListener("mousemove", resetIdleTimer);
        window.addEventListener("keydown", resetIdleTimer);
        window.addEventListener("touchstart", resetIdleTimer);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        // Heartbeat interval to keep `lastSeen` updated on backend natively while active
        const intervalId = setInterval(() => {
            if (isOnlineRef.current) {
                updatePresence({ isOnline: true }).catch(console.error);
            }
        }, 30000); // 30 seconds

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            clearInterval(intervalId);
            setOffline();
            window.removeEventListener("mousemove", resetIdleTimer);
            window.removeEventListener("keydown", resetIdleTimer);
            window.removeEventListener("touchstart", resetIdleTimer);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [user, updatePresence]);
};
