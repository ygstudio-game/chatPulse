"use client";

import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Send, Smile, Paperclip } from "lucide-react";

interface MessageInputProps {
    conversationId: Id<"conversations">;
}

export const MessageInput = ({ conversationId }: MessageInputProps) => {
    const [content, setContent] = useState("");
    const sendMessage = useMutation(api.messages.send);
    const startTyping = useMutation(api.typing.startTyping);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setContent(e.target.value);
        startTyping({ conversationId });
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!content.trim()) return;

        try {
            setContent("");
            await sendMessage({
                content: content.trim(),
                conversationId,
            });
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    return (
        <div className="p-4 bg-background border-t">
            <form onSubmit={handleSend} className="flex items-center gap-2 max-w-4xl mx-auto">
                <Button size="icon" variant="ghost" type="button" className="shrink-0 text-muted-foreground">
                    <Paperclip className="h-5 w-5" />
                </Button>
                <div className="relative flex-1">
                    <Input
                        value={content}
                        onChange={handleInputChange}
                        placeholder="Type a message..."
                        className="pr-12 bg-accent/30 border-none focus-visible:ring-1 focus-visible:ring-primary h-11 rounded-xl"
                    />
                    <Button
                        size="icon"
                        variant="ghost"
                        type="button"
                        className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                        <Smile className="h-5 w-5" />
                    </Button>
                </div>
                <Button
                    type="submit"
                    size="icon"
                    disabled={!content.trim()}
                    className="shrink-0 h-11 w-11 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                >
                    <Send className="h-5 w-5" />
                </Button>
            </form>
        </div>
    );
};
