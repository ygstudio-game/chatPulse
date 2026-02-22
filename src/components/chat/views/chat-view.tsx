"use client";

import { MessageList } from "../message-list";
import { MessageInput } from "../message-input";
import { SmartReplies } from "../smart-replies";
import { Id } from "@convex/_generated/dataModel";

interface ChatViewProps {
    conversationId: Id<"conversations">;
    lastMessageId?: string;
    onSelectSmartReply: (reply: string) => void;
}

export const ChatView = ({ conversationId, lastMessageId, onSelectSmartReply }: ChatViewProps) => {
    return (
        <div className="flex-1 flex flex-col min-h-0 relative w-full">
            <MessageList conversationId={conversationId} />

            <div className="absolute bottom-2 left-2 right-2 md:bottom-6 md:left-6 md:right-6 z-40 flex flex-col gap-2 pointer-events-none">
                <div className="pointer-events-auto">
                    <SmartReplies
                        conversationId={conversationId}
                        lastMessageId={lastMessageId}
                        onSelect={onSelectSmartReply}
                    />
                </div>
                <div className="pointer-events-auto">
                    <MessageInput conversationId={conversationId} />
                </div>
            </div>
        </div>
    );
};
