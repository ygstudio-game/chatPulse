"use client";

import { MessageList } from "../message-list";
import { MessageInput } from "../message-input";
import { Id } from "@convex/_generated/dataModel";

interface ChatViewProps {
    conversationId: Id<"conversations">;
}

export const ChatView = ({ conversationId }: ChatViewProps) => {
    return (
        <div className="flex-1 flex flex-col min-h-0 relative w-full">
            <MessageList conversationId={conversationId} />
            <MessageInput conversationId={conversationId} />
        </div>
    );
};
