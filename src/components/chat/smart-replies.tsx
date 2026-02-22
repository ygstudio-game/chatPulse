"use client";

import { useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SmartRepliesProps {
    conversationId: Id<"conversations">;
    lastMessageId?: string;
    onSelect: (reply: string) => void;
}

export const SmartReplies = ({ conversationId, lastMessageId, onSelect }: SmartRepliesProps) => {
    const [replies, setReplies] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const getSmartReplies = useAction(api.ai.getSmartReplies);

    const handleGenerate = async () => {
        if (!lastMessageId || isLoading) return;
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

    // Auto-clear replies if the message context changes (new message sent/received)
    useEffect(() => {
        setReplies([]);
    }, [lastMessageId]);

    const hasReplies = replies.length > 0;

    return (
        <div className="px-4 pb-2 w-full max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
                {!hasReplies && !isLoading ? (
                    <motion.div
                        key="trigger"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex justify-start"
                    >
                        <button
                            onClick={handleGenerate}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-accent-mint/10 border border-border text-[11px] font-bold text-muted-foreground hover:text-accent-mint transition-all active:scale-95 group shadow-sm backdrop-blur-md"
                        >
                            <Sparkles className="h-3 w-3 text-accent-mint group-hover:animate-pulse" />
                            Smart Replies
                        </button>
                    </motion.div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {isLoading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-2 text-[10px] text-accent-mint/80 font-bold tracking-wider uppercase ml-2"
                            >
                                <Loader2 className="h-3 w-3 animate-spin" />
                                AI is thinking...
                            </motion.div>
                        ) : (
                            <motion.div
                                key="replies"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-2 px-2 no-scrollbar"
                            >
                                {replies.map((reply, index) => (
                                    <motion.button
                                        key={reply}
                                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        transition={{ delay: index * 0.05, type: "spring", stiffness: 400, damping: 25 }}
                                        onClick={() => {
                                            onSelect(reply);
                                            setReplies([]);
                                        }}
                                        className={cn(
                                            "px-4 py-2 rounded-full text-xs font-semibold border bg-accent-mint/5 backdrop-blur-md border-accent-mint/20 text-accent-emerald hover:bg-accent-mint hover:text-white hover:border-accent-mint active:scale-95 transition-all flex items-center gap-2 group whitespace-nowrap shadow-sm"
                                        )}
                                    >
                                        <Sparkles className="h-3 w-3 text-accent-mint/60 group-hover:text-white transition-colors" />
                                        {reply}
                                    </motion.button>
                                ))}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setReplies([])}
                                    className="h-8 w-8 rounded-full shrink-0 text-muted-foreground hover:text-destructive"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </motion.div>
                        )}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
