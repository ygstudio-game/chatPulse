"use client";

import { use } from "react";
import { ChatArea } from "@/components/chat/chat-area";
import { motion } from "framer-motion";
import { Id } from "@convex/_generated/dataModel";

interface ChatPageProps {
    params: Promise<{
        conversationId: string;
    }>;
}

export default function ChatPage({ params }: ChatPageProps) {
    const { conversationId } = use(params);

    return (
        <motion.div
            key={conversationId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="h-full w-full"
        >
            <ChatArea conversationId={conversationId as Id<"conversations">} />
        </motion.div>
    );
}
