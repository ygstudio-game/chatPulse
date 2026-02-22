"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TypingIndicatorProps {
    conversationId: Id<"conversations">;
    isOnline?: boolean;
}

export const TypingIndicator = ({ conversationId, isOnline }: TypingIndicatorProps) => {
    const typers = useQuery(api.typing.getTyping, { conversationId });

    if (typers && typers.length > 0) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-xs text-accent-mint font-semibold tracking-wide bg-accent-emerald/10 px-2 py-0.5 rounded-full border border-accent-emerald/30 shadow-sm transition-all duration-300">
                    {typers[0]} is typing
                </span>
                <div className="flex gap-1 items-center bg-black/20 px-2 py-1 rounded-full border border-white/5">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-1.5 h-1.5 bg-accent-mint rounded-full shadow-[0_0_5px_rgba(201,248,229,0.5)]"
                            animate={{ y: [0, -3, 0], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="text-[11px] font-medium text-text-muted/80 flex items-center gap-1.5 transition-colors duration-300">
            {isOnline ? (
                <span className="text-status-online drop-shadow-[0_0_2px_rgba(34,197,94,0.4)]">Online</span>
            ) : (
                <span>Offline</span>
            )}
        </div>
    );
};
