"use client";

import { useQuery, useMutation, usePaginatedQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { formatMessageTimestamp, cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, Trash2, ArrowDown, Smile, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageReactions } from "./message-reactions";
import { motion, AnimatePresence } from "framer-motion";
import { MarkdownRenderer } from "./markdown-renderer";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useReplyStore } from "@/store/use-reply-store";

interface MessageListProps {
    conversationId: Id<"conversations">;
}

export const MessageList = ({ conversationId }: MessageListProps) => {
    const { results, status, loadMore } = usePaginatedQuery(
        api.messages.list,
        conversationId ? { conversationId } : "skip",
        { initialNumItems: 50 }
    );
    const messages = [...results].reverse();
    const me = useQuery(api.users.getMe);
    const deleteMessage = useMutation(api.messages.deleteMessage);
    const deleteForMe = useMutation(api.messages.deleteForMe);
    const addReaction = useMutation(api.messages.addReaction);
    const markRead = useMutation(api.conversations.markRead);
    const conversationDetails = useQuery(api.conversations.getConversation, conversationId ? { id: conversationId } : "skip");
    const scrollRef = useRef<HTMLDivElement>(null);
    const lastMessageIdRef = useRef<string | null>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const observer = useRef<IntersectionObserver | null>(null);
    const prevMessageCountRef = useRef<number>(0);
    const isFirstLoad = useRef<boolean>(true);
    // Track unread count clearing
    // useEffect(() => {
    //     console.log("messages", messages);
    //     if (messages && messages.length > 0) {
    //         const lastMsg = messages[messages.length - 1];
    //         if (lastMsg._id !== lastMessageIdRef.current) {
    //             lastMessageIdRef.current = lastMsg._id;
    //             markRead({ conversationId });
    //         }
    //     }
    // }, [messages, conversationId, markRead]);

    const loadMoreRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadMoreObserver = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && status === "CanLoadMore") {
                    loadMore(50);
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            loadMoreObserver.observe(loadMoreRef.current);
        }

        return () => loadMoreObserver.disconnect();
    }, [status, loadMore]);

    // Track scroll logic separately
    useEffect(() => {
        if (!messages || messages.length === 0) return;

        const currentMessageCount = messages.length;
        const lastMsg = messages[messages.length - 1];
        const isMyMessage = lastMsg.senderId === me?._id;
        if (isFirstLoad.current) {
            // Jump to bottom immediately on first render without animation for a snappy feel
            setTimeout(() => {
                scrollRef.current?.scrollTo({
                    top: scrollRef.current?.scrollHeight,
                    behavior: "auto"
                });
                setIsAtBottom(true);
                setShowScrollButton(false);
            }, 100);
            isFirstLoad.current = false;
        }
        else {
            if (isAtBottom) {
                // If they are at the bottom, always scroll to show the new message
                scrollRef.current?.scrollTo({
                    top: scrollRef.current.scrollHeight,
                    behavior: isMyMessage ? "smooth" : "auto"
                });
                setShowScrollButton(false);
            } else if (currentMessageCount > prevMessageCountRef.current) {
                setShowScrollButton(true);
            }

        }
        prevMessageCountRef.current = currentMessageCount;
    }, [messages, isAtBottom, me?._id, prevMessageCountRef]);

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const atBottom = scrollHeight - scrollTop - clientHeight < 100;
        setIsAtBottom(atBottom);
        if (atBottom) setShowScrollButton(false);
    };

    const lastMessageRef = useCallback((node: HTMLDivElement | null) => {
        if (!node || !me) return;

        // Disconnect previous observer
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                const msgData = JSON.parse(node.dataset.message || "{}");

                if (msgData.senderId !== me._id) {
                    markRead({ conversationId });
                }

                observer.current?.disconnect();
            }
        });

        observer.current.observe(node);
    }, [me, markRead, conversationId]);

    const scrollToBottom = () => {
        scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth"
        });
        setIsAtBottom(true);
        setShowScrollButton(false);
    };

    const scrollToMessage = (messageId: string) => {
        const element = document.getElementById(`message-${messageId}`);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            // Add a brief highlight effect
            element.classList.add("ring-2", "ring-accent-mint", "ring-offset-2");
            setTimeout(() => {
                element.classList.remove("ring-2", "ring-accent-mint", "ring-offset-2");
            }, 2000);
        }
    };

    if (!messages || me === undefined) return <div className="flex-1" />;

    if (messages.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center space-y-3 opacity-60"
            >
                <div className="p-5 rounded-[2rem] bg-secondary/40 border border-border shadow-inner">
                    <MessageCircle className="h-10 w-10 text-accent-mint opacity-50" />
                </div>
                <div className="text-center space-y-1">
                    <p className="text-sm font-bold text-text-primary">No messages yet</p>
                    <p className="text-xs text-text-muted">Say hello to start the conversation!</p>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="flex-1 relative overflow-hidden flex flex-col bg-background">
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className={cn("pb-48 md:pb-30 flex-1 overflow-y-auto overflow-x-hidden px-4 md:pl-6 md:pr-6 md:pt-6 space-y-6")}
            >
                <div ref={loadMoreRef} className="h-4 w-full" />
                {status === "LoadingMore" && (
                    <div className="flex justify-center py-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent-mint" />
                    </div>
                )}
                <AnimatePresence mode="popLayout">
                    {messages.map((message: any, index: number) => {
                        const isMe = message.senderId === me?._id;
                        const isLastMessage = index === messages.length - 1;
                        return (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                                ref={isLastMessage ? lastMessageRef : null}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ type: "spring", stiffness: 140, damping: 18 }}
                                data-message={JSON.stringify({
                                    senderId: message.senderId,
                                    receipt: message.receipt
                                })}
                                key={message._id}
                                id={`message-${message._id}`}
                                onDoubleClick={() => useReplyStore.getState().setReplyTo(message)}
                                className={cn(
                                    "flex flex-col group cursor-pointer lg:cursor-default",
                                    isMe ? "items-end" : "items-start"
                                )}
                            >
                                <div className={cn(
                                    "flex items-end gap-2 max-w-[85%] md:max-w-[75%]",
                                    isMe ? "flex-row-reverse" : "flex-row"
                                )}>
                                    <div className="flex flex-col gap-1.5 min-w-[80px]">

                                        {/* Reply Context Render */}
                                        {message.replyToMessage && (
                                            <div
                                                onClick={() => scrollToMessage(message.replyToId)}
                                                className={cn(
                                                    "text-xs p-2 rounded-lg mb-1 opacity-80 border-l-4 truncate cursor-pointer hover:opacity-100 transition-opacity whitespace-pre-wrap",
                                                    isMe ? "bg-white/10 border-accent-mint text-white" : "bg-black/5 border-accent-emerald text-text-secondary"
                                                )}
                                            >
                                                <span className="font-semibold block mb-0.5">Replied Message</span>
                                                {message.replyToMessage.content || "Media"}
                                            </div>
                                        )}

                                        <div
                                            className={cn(
                                                "relative px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-[15px] transition-all duration-300",
                                                isMe
                                                    ? "bg-gradient-to-tr from-accent-emerald to-accent-hover text-white rounded-xl rounded-tr-sm shadow-[0_4px_14px_rgba(15,111,84,0.3)] border border-transparent dark:border-white/10"
                                                    : "bg-secondary/60 backdrop-blur-xl text-foreground rounded-xl rounded-tl-sm border border-border shadow-lg",
                                                message.deleted && "italic opacity-50 bg-secondary/40 line-through grayscale border-border shadow-none"
                                            )}
                                        >
                                            <MarkdownRenderer
                                                content={message.content}
                                                mediaUrl={message.mediaUrl}
                                                mediaType={message.mediaType}
                                                isMe={isMe}
                                                isDeleted={message.deleted}
                                                fileName={message.fileName}
                                                isUploading={message.isUploading}
                                                transcript={message.transcript}
                                            />
                                        </div>
                                        <MessageReactions
                                            messageId={message._id}
                                            senderId={message.senderId}
                                            reactions={message.reactions}
                                        />
                                    </div>

                                    {!message.deleted && (
                                        <div className="flex items-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200">
                                            {!isMe && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button
                                                            className="p-2 hover:bg-secondary/80 rounded-full text-muted-foreground hover:text-accent-mint transition-colors cursor-pointer relative z-40"
                                                        >
                                                            <Smile className="h-[18px] w-[18px]" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        side="top"
                                                        align="center"
                                                        className="flex flex-wrap w-[180px] justify-center gap-1.5 bg-secondary/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl p-2.5 z-[70]"
                                                    >
                                                        {["👍", "❤️", "😂", "😮", "😢"].map((emoji) => (
                                                            <button
                                                                key={emoji}
                                                                onClick={() => addReaction({ messageId: message._id, emoji })}
                                                                className="hover:bg-background hover:scale-125 transition-all p-1.5 rounded-full w-9 h-9 flex items-center justify-center text-xl bg-blend-luminosity"
                                                            >
                                                                {emoji}
                                                            </button>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}

                                            <button
                                                onClick={() => useReplyStore.getState().setReplyTo(message)}
                                                className="p-2 ml-1 hover:bg-secondary/80 rounded-full text-muted-foreground hover:text-accent-mint transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7" /><path d="M20 18v-2a4 4 0 0 0-4-4H4" /></svg>
                                            </button>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="p-2 hover:bg-secondary/80 rounded-full text-muted-foreground hover:text-accent-rose transition-colors">
                                                        <Trash2 className="h-[18px] w-[18px]" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align={isMe ? "end" : "start"} className="w-48 bg-secondary/95 backdrop-blur-xl border-border rounded-xl shadow-2xl z-[70]">
                                                    {isMe && (
                                                        <DropdownMenuItem
                                                            onClick={async () => await deleteMessage({ messageId: message._id })}
                                                            className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg m-1 gap-2 font-medium"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span>Delete for everyone</span>
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem
                                                        onClick={async () => await deleteForMe({ messageId: message._id })}
                                                        className="cursor-pointer text-foreground hover:bg-secondary rounded-lg m-1 gap-2"
                                                    >
                                                        <Trash2 className="h-4 w-4 opacity-70" />
                                                        <span>Delete for me</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    )}
                                </div>
                                <div className={cn(
                                    "flex items-center gap-1.5 mt-1.5 px-1.5 transition-opacity duration-300 opacity-100 md:opacity-60 md:group-hover:opacity-100",
                                    isMe ? "justify-end" : "justify-start"
                                )}>
                                    <span className="text-[11px] font-medium text-text-secondary tracking-wide">
                                        {formatMessageTimestamp(message._creationTime)}
                                    </span>
                                    {isMe && (
                                        <span className="flex items-center">
                                            {message.receipt === "sent" && <Check className="w-[14px] h-[14px] text-text-muted" />}
                                            {message.receipt === "delivered" && <CheckCheck className="w-[14px] h-[14px] text-text-muted" />}
                                            {message.receipt === "read" && <CheckCheck className="w-[14px] h-[14px] text-accent-mint drop-shadow-[0_0_2px_rgba(201,248,229,0.5)]" />}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {showScrollButton && (
                <Button
                    variant="secondary"
                    className="absolute bottom-20 md:bottom-24 right-4 md:right-6 rounded-full shadow-2xl shadow-black/20 border border-border bg-secondary/90 backdrop-blur-md hover:bg-secondary px-4 md:px-5 h-10 md:h-11 flex items-center gap-2 transition-all hover:scale-105 group animate-in slide-in-from-bottom-2 z-30"
                    onClick={scrollToBottom}
                >
                    <ArrowDown className="h-4 w-4 text-accent-mint group-hover:animate-bounce" />
                    <span className="text-xs md:text-sm font-semibold text-text-primary">Recent messages</span>
                </Button>
            )}
        </div>
    );
};
