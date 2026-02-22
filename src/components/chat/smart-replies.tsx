"use client";

import { useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SmartRepliesProps {
    conversationId: Id<"conversations">;
    lastMessageId?: string;
    onSelect: (reply: string) => void;
}

export const SmartReplies = ({ conversationId, lastMessageId, onSelect }: SmartRepliesProps) => {
    const [replies, setReplies] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const getSmartReplies = useAction(api.ai.getSmartReplies);

    useEffect(() => {
        const fetchReplies = async () => {
            if (!lastMessageId) return;
            setIsLoading(true);
            try {
                const results = await getSmartReplies({ conversationId });
                setReplies(results);
            } catch (error) {
                console.error("Smart replies error:", error);
                setReplies([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReplies();
    }, [conversationId, lastMessageId, getSmartReplies]);

    if (!isLoading && replies.length === 0) return null;

    return (
        <div className="px-4 pb-2">
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2 text-[10px] text-muted-foreground ml-2"
                    >
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Analyzing context...
                    </motion.div>
                ) : (
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-2 px-2 no-scrollbar">
                        {replies.map((reply, index) => (
                            <motion.button
                                key={reply}
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: index * 0.1, type: "spring", stiffness: 400, damping: 25 }}
                                onClick={() => {
                                    onSelect(reply);
                                    setReplies([]); // Clear after selection
                                }}
                                className={cn(
                                    "px-4 py-2 rounded-full text-xs font-semibold border bg-background/50 backdrop-blur-sm border-border hover:bg-primary hover:text-primary-foreground hover:border-primary active:scale-95 transition-all flex items-center gap-2 group whitespace-nowrap shadow-sm"
                                )}
                            >
                                <Sparkles className="h-3 w-3 text-accent-mint group-hover:text-primary-foreground transition-colors" />
                                {reply}
                            </motion.button>
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
