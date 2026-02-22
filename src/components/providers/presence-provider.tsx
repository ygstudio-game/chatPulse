"use client";

import { usePresence } from "@/hooks/use-presence";

export function PresenceProvider({ children }: { children: React.ReactNode }) {
    usePresence();
    return <>{children}</>;
}
