"use client";

import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Loader2, MessageCircle, ChevronLeft, Users, Sparkles, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ChatView } from "./views/chat-view";
import { VideoCallView } from "./views/video-call-view";
import { VoiceCallView } from "./views/voice-call-view";
import { TypingIndicator } from "./typing-indicator";
import { MarkdownRenderer } from "./markdown-renderer";
import { motion, AnimatePresence } from "framer-motion";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

import { SmartReplies } from "./smart-replies";
import { Phone, Video, MoreVertical, LogOut, Trash } from "lucide-react";
import { useConversationStore } from "@/store/use-conversation-store";

export const ChatArea = () => {
    const { selectedConversationId, setSelectedConversationId } = useConversationStore();
    const conversationId = selectedConversationId as Id<"conversations">;
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [summary, setSummary] = useState<string | null>(null);
    const summarizeAction = useAction(api.ai.summarize);
    const sendMessage = useMutation(api.messages.send);
    const clearChat = useMutation(api.conversations.clearChat);
    const leaveGroup = useMutation(api.conversations.leaveGroup);
    const startCall = useMutation(api.conversations.startCall);
    const acceptCall = useMutation(api.conversations.acceptCall);
    const declineCall = useMutation(api.conversations.declineCall);

    const conversation = useQuery(
        api.conversations.getConversation,
        conversationId ? { id: conversationId } : "skip"
    );
    const messagesData = useQuery(
        api.messages.list,
        conversationId ? { conversationId, paginationOpts: { numItems: 1, cursor: null } } : "skip"
    );
    const messages = messagesData?.page || [];
    const me = useQuery(api.users.getMe);
    const lastMessage = messages?.[0];

    const handleSummarize = async () => {
        setIsSummarizing(true);
        try {
            const result = await summarizeAction({ conversationId });
            setSummary(result);
        } catch (error) {
            console.error(error);
            setSummary("Failed to generate summary. Make sure the API key is configured properly in Convex.");
        } finally {
            setIsSummarizing(false);
        }
    };

    const handleSmartReply = async (reply: string) => {
        await sendMessage({
            content: reply,
            conversationId,
        });
    };

    const handleClearChat = async () => {
        if (confirm("Are you sure you want to clear this chat for yourself?")) {
            await clearChat({ conversationId });
        }
    }

    const handleLeaveGroup = async () => {
        if (conversationId && confirm("Are you sure you want to leave this group?")) {
            await leaveGroup({ conversationId });
            setSelectedConversationId(undefined);
        }
    }

    if (!conversationId || conversation === undefined) {
        return (
            <div className="flex-1 flex items-center justify-center bg-bg-primary">
                <Loader2 className="h-8 w-8 animate-spin text-accent-emerald" />
            </div>
        );
    }

    if (!conversation) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 bg-background">
                <div className="p-6 rounded-3xl bg-secondary/40 border border-border shadow-inner">
                    <MessageCircle className="h-12 w-12 text-muted-foreground opacity-40" />
                </div>
                <p className="text-muted-foreground font-medium">Conversation not found</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full md:h-[calc(100vh-1rem)] md:m-2 bg-background md:rounded-3xl border-x-0 md:border border-border md:shadow-2xl relative overflow-hidden z-20">
            {/* Header */}
            <header className="h-[72px] shrink-0 border-b border-border flex items-center px-4 md:px-6 justify-between bg-secondary/80 backdrop-blur-3xl z-50 relative md:rounded-t-3xl">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSelectedConversationId(undefined)}
                        className="md:hidden p-2 -ml-2 hover:bg-secondary/80 rounded-full text-muted-foreground transition-all active:scale-95"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>

                    <div className="relative">
                        <Avatar className={cn(
                            "h-11 w-11 border-2 border-background shadow-sm transition-all duration-300",
                            !conversation.isGroup && conversation.otherUser?.isOnline && "ring-2 ring-accent-mint ring-offset-2 ring-offset-background"
                        )}>
                            <AvatarImage src={conversation.isGroup ? "" : conversation.otherUser?.imageUrl} className="object-cover" />
                            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                                {conversation.isGroup ? <Users className="h-5 w-5 text-accent-mint" /> : conversation.otherUser?.name[0]}
                            </AvatarFallback>
                        </Avatar>
                        {!conversation.isGroup && conversation.otherUser?.isOnline && (
                            <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-status-online border-2 border-background shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                        )}
                    </div>

                    <div className="flex flex-col justify-center translate-y-[1px]">
                        <div className="font-bold text-[15px] text-text-primary tracking-tight">
                            {conversation.isGroup ? conversation.name : conversation.otherUser?.name}
                        </div>
                        {conversation.isGroup ? (
                            <div className="text-xs text-text-muted font-medium">
                                {conversation.groupMembers?.length || 0} members
                            </div>
                        ) : (
                            <TypingIndicator
                                conversationId={conversationId}
                                isOnline={conversation.otherUser?.isOnline}
                            />
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleSummarize}
                        disabled={isSummarizing}
                        variant="outline"
                        size="sm"
                        className="hidden sm:flex items-center gap-2 h-9 px-4 rounded-xl text-accent-mint border-accent-emerald/30 bg-accent-emerald/10 hover:bg-accent-emerald/20 transition-all shadow-sm group hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isSummarizing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="h-4 w-4 text-accent-mint group-hover:animate-pulse" />
                        )}
                        <span className="text-xs font-bold tracking-wide">Catch me up</span>
                    </Button>

                    <button
                        onClick={async () => await startCall({ conversationId, type: "audio" })}
                        disabled={!!conversation.ongoingCall}
                        className={cn(
                            "p-2 rounded-full transition-all active:scale-95",
                            conversation.ongoingCall
                                ? "text-muted-foreground/50 cursor-not-allowed"
                                : "hover:bg-secondary/80 text-muted-foreground hover:text-accent-emerald"
                        )}
                    >
                        <Phone className="h-5 w-5" />
                    </button>
                    <button
                        onClick={async () => await startCall({ conversationId, type: "video" })}
                        disabled={!!conversation.ongoingCall}
                        className={cn(
                            "p-2 rounded-full transition-all active:scale-95",
                            conversation.ongoingCall
                                ? "text-muted-foreground/50 cursor-not-allowed"
                                : "hover:bg-secondary/80 text-muted-foreground hover:text-accent-emerald"
                        )}
                    >
                        <Video className="h-5 w-5" />
                    </button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-2 hover:bg-secondary/80 rounded-full text-muted-foreground transition-all active:scale-95 focus:outline-none">
                                <MoreVertical className="h-5 w-5" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-secondary/90 backdrop-blur-xl border-border rounded-xl shadow-2xl">
                            <DropdownMenuItem onClick={handleClearChat} className="cursor-pointer text-foreground hover:bg-secondary rounded-lg m-1 gap-2">
                                <Trash className="h-4 w-4" />
                                <span>Clear Chat</span>
                            </DropdownMenuItem>
                            {conversation.isGroup && (
                                <>
                                    <DropdownMenuSeparator className="bg-border" />
                                    <DropdownMenuItem onClick={handleLeaveGroup} className="cursor-pointer text-destructive hover:bg-destructive/10 rounded-lg m-1 gap-2 focus:text-destructive focus:bg-destructive/10">
                                        <LogOut className="h-4 w-4" />
                                        <span>Leave Group</span>
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                </div>
            </header>

            {/* AI Summary Modal Overlay */}
            <AnimatePresence>
                {summary && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSummary(null)}
                            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative w-full max-w-md bg-secondary/95 backdrop-blur-xl border border-border rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-secondary/30">
                                <h3 className="font-bold text-[15px] flex items-center gap-2 text-primary">
                                    <Sparkles className="h-4 w-4" />
                                    AI Summary
                                </h3>
                                <button onClick={() => setSummary(null)} className="p-1.5 hover:bg-secondary rounded-full text-muted-foreground hover:text-foreground transition-colors">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="p-5 md:p-6 text-sm text-foreground/90 leading-relaxed max-h-[70vh] md:max-h-[60vh] overflow-y-auto custom-scrollbar">
                                <MarkdownRenderer content={summary} isMe={false} />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Central Switchboard Layer */}
            <div className="flex-1 min-h-0 relative w-full flex flex-col bg-background">
                <AnimatePresence mode="wait">
                    {conversation.ongoingCall?.status === "accepted" ? (
                        conversation.ongoingCall.type === "video" ? (
                            <motion.div
                                key="video-call"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-40 bg-black flex flex-col"
                            >
                                <VideoCallView
                                    chatId={conversationId}
                                    user={{ id: me?._id || "", name: me?.name || "Unknown" }}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="voice-call"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-40 bg-background/95 backdrop-blur-xl flex flex-col"
                            >
                                <VoiceCallView
                                    chatId={conversationId}
                                    user={{ id: me?._id || "", name: me?.name || "Unknown" }}
                                />
                            </motion.div>
                        )
                    ) : (
                        <motion.div
                            key="chat-view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-0 flex flex-col"
                        >
                            <ChatView
                                conversationId={conversationId}
                                lastMessageId={lastMessage?._id}
                                onSelectSmartReply={handleSmartReply}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
