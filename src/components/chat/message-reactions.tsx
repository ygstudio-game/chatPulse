"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface MessageReactionsProps {
    messageId: Id<"messages">;
    senderId: Id<"users">;
}

export const MessageReactions = ({ messageId, senderId }: MessageReactionsProps) => {
    const reactions = useQuery(api.messages.getReactions, { messageId });
    const addReaction = useMutation(api.messages.addReaction);
    const me = useQuery(api.users.getMe);
    const isMe = me?._id === senderId;

    if (!reactions || reactions.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-1 mt-1 px-1">
            {reactions.map((data) => {
                const hasReacted = me ? data.userIds.includes(me._id) : false;

                return (
                    <button
                        key={data.emoji}
                        onClick={() => !isMe && addReaction({ messageId, emoji: data.emoji })}
                        disabled={isMe}
                        className={cn(
                            "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border transition-all",
                            !isMe && "hover:scale-105 active:scale-95 hover:border-muted",
                            hasReacted
                                ? "bg-primary/10 border-primary text-primary"
                                : "bg-muted/50 border-transparent text-muted-foreground",
                            isMe && "cursor-default"
                        )}
                    >
                        <span>{data.emoji}</span>
                        <span className="font-semibold">{data.count}</span>
                    </button>
                );
            })}
        </div>
    );
};
