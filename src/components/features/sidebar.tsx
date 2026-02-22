"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { UserMenu } from "@/components/auth/user-menu";
import { Input } from "@/components/ui/input";
import { Search, MessageSquare, Users, History } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn, formatMessageTimestamp } from "@/lib/utils";
import { Id } from "@convex/_generated/dataModel";
import { ModeToggle } from "./mode-toggle";
import { Plus } from "lucide-react";
import { CreateGroupModal } from "@/components/chat/create-group-modal";
import { motion, AnimatePresence } from "framer-motion";
import { useConversationStore } from "@/store/use-conversation-store";

export const Sidebar = () => {
    const { selectedConversationId, setSelectedConversationId } = useConversationStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<"chats" | "users">("chats");
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

    const conversations = useQuery(api.conversations.listConversations);
    const users = useQuery(api.users.listUsers, { search: searchTerm });
    const startConversation = useMutation(api.conversations.getOrCreateConversation);
    const markRead = useMutation(api.conversations.markRead);

    const handleSelectConversation = (id: Id<"conversations">) => {
        setSelectedConversationId(id);
        markRead({ conversationId: id });
    }

    const handleUserClick = async (userId: Id<"users">) => {
        const conversationId = await startConversation({ participantId: userId });
        handleSelectConversation(conversationId);
        setActiveTab("chats");
        setSearchTerm("");
    };

    return (
        <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} /* Spring-like ease out */
            className={cn(
                "flex flex-col h-full md:h-[calc(100vh-1rem)] md:m-2 bg-secondary/80 backdrop-blur-xl border-x-0 md:border border-border shadow-2xl shrink-0 transition-all z-10",
                // Mobile: Full width, Desktop: Fixed width with rounded corners
                "w-full md:w-[340px] md:rounded-3xl",
                selectedConversationId ? "hidden md:flex" : "flex"
            )}>
            <div className="p-5 space-y-5">
                <div className="flex items-center justify-between px-1">
                    <h1 className="text-2xl font-black bg-gradient-to-r from-accent-mint to-accent-emerald bg-clip-text text-transparent tracking-tighter">
                        Pulse
                    </h1>
                    <div className="flex items-center gap-2">
                        <ModeToggle />
                        <UserMenu />
                    </div>
                </div>

                <div className="flex p-1 bg-secondary/50 backdrop-blur-md rounded-xl border border-border shadow-inner">
                    <button
                        onClick={() => setActiveTab("chats")}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all duration-300",
                            activeTab === "chats" ? "bg-accent text-primary-foreground shadow-md shadow-accent/20" : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                        )}
                    >
                        <History className="h-4 w-4" />
                        Chats
                    </button>
                    <button
                        onClick={() => setActiveTab("users")}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all duration-300",
                            activeTab === "users" ? "bg-accent text-primary-foreground shadow-md shadow-accent/20" : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                        )}
                    >
                        <Users className="h-4 w-4" />
                        Directory
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative flex-1 group/search">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/search:text-accent-mint transition-colors" />
                        <Input
                            placeholder={activeTab === "chats" ? "Search conversations..." : "Find new connections..."}
                            className="pl-10 bg-secondary/50 border-border h-11 rounded-xl text-sm focus-visible:ring-accent-mint/40 focus-visible:border-accent-mint shadow-inner transition-all placeholder:text-muted-foreground"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {activeTab === "users" && (
                        <button
                            onClick={() => setIsGroupModalOpen(true)}
                            className="h-11 w-11 shrink-0 bg-accent/20 text-accent-emerald hover:bg-accent/30 hover:text-accent-mint border border-accent/20 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm"
                        >
                            <Plus className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>

            <ScrollArea className="flex-1 px-3">
                <div className="p-1 space-y-1.5 pb-20 md:pb-4">
                    {activeTab === "chats" ? (
                        <>
                            {!conversations ? (
                                Array(5).fill(0).map((_, i) => <UserSkeleton key={i} />)
                            ) : conversations.length === 0 ? (
                                <EmptyState
                                    title="Quiet here..."
                                    description={searchTerm ? `No chats matching "${searchTerm}".` : "Start a conversation from the directory tab."}
                                />
                            ) : (
                                conversations
                                    .filter((c: any) => !searchTerm || c.otherUser?.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map((conv: any, index: number) => (
                                        <motion.button
                                            key={conv._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2, delay: index * 0.04 }}
                                            onClick={() => handleSelectConversation(conv._id)}
                                            whileHover={{ scale: 1.02, filter: "brightness(1.05)" }}
                                            whileTap={{ scale: 0.98 }}
                                            className={cn(
                                                "w-full flex items-center gap-3.5 p-3 rounded-2xl transition-all duration-300 relative overflow-hidden text-left border border-transparent",
                                                selectedConversationId === conv._id
                                                    ? "bg-accent/15 border-accent/30 shadow-[0_0_15px_rgba(19,150,118,0.15)]"
                                                    : "hover:bg-secondary/60 hover:border-border"
                                            )}
                                        >
                                            <div className="relative shrink-0">
                                                <Avatar className={cn(
                                                    "h-12 w-12 border-2 shadow-sm transition-all duration-500",
                                                    selectedConversationId === conv._id ? "border-accent-mint" : "border-background/50",
                                                    !conv.isGroup && conv.otherUser?.isOnline && !selectedConversationId && "ring-2 ring-accent-mint/30 ring-offset-2 ring-offset-background"
                                                )}>
                                                    <AvatarImage src={conv.isGroup ? "" : conv.otherUser?.imageUrl} className="object-cover" />
                                                    <AvatarFallback className="bg-primary hover:bg-primary/80 text-primary-foreground font-bold text-sm">
                                                        {conv.isGroup ? <Users className="h-5 w-5 text-accent-mint" /> : conv.otherUser?.name[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {!conv.isGroup && conv.otherUser?.isOnline && (
                                                    <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-status-online ring-2 ring-background shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 pr-1">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <span className={cn(
                                                        "text-[15px] font-semibold truncate tracking-tight transition-colors",
                                                        selectedConversationId === conv._id ? "text-accent-mint shadow-accent-mint/20" : "text-text-primary"
                                                    )}>
                                                        {conv.isGroup ? conv.name : conv.otherUser?.name}
                                                    </span>
                                                    {conv.lastMessage && (
                                                        <span className={cn(
                                                            "text-xs shrink-0 transition-colors font-medium",
                                                            conv.unreadCount > 0 ? "text-accent-rose" : "text-text-secondary line-clamp-1"
                                                        )}>
                                                            {formatMessageTimestamp(conv.lastMessage._creationTime)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className={cn(
                                                        "text-sm truncate flex-1 transition-colors",
                                                        conv.unreadCount > 0 ? "text-text-primary font-medium" : "text-text-muted"
                                                    )}>
                                                        {conv.isTyping ? (
                                                            <span className="italic animate-pulse font-medium text-accent-mint">Typing...</span>
                                                        ) : (
                                                            conv.lastMessage?.content || "Tap to chat"
                                                        )}
                                                    </div>
                                                    {conv.unreadCount > 0 && (
                                                        <motion.div
                                                            initial={{ scale: 0.5, opacity: 0 }}
                                                            animate={{ scale: [1, 1.2, 1], opacity: 1 }}
                                                            transition={{ duration: 0.4 }}
                                                        >
                                                            <Badge className="h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full text-[10px] font-bold bg-[#D64545] text-white border-none shadow-[0_0_10px_rgba(214,69,69,0.4)] relative">
                                                                <span className="absolute inset-0 rounded-full animate-ping bg-[#D64545] opacity-20"></span>
                                                                <span className="relative z-10">{conv.unreadCount}</span>
                                                            </Badge>
                                                        </motion.div>
                                                    )}
                                                </div>
                                            </div>
                                            {selectedConversationId === conv._id && (
                                                <motion.div
                                                    layoutId="active-sidebar-indicator"
                                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1/2 bg-accent-emerald rounded-r-full shadow-[0_0_8px_rgba(15,111,84,0.8)]"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ duration: 0.2 }}
                                                />
                                            )}
                                        </motion.button>
                                    ))
                            )}
                        </>
                    ) : (
                        <>
                            {!users ? (
                                Array(5).fill(0).map((_, i) => <UserSkeleton key={i} />)
                            ) : users.length === 0 ? (
                                <EmptyState
                                    title="No one found"
                                    description={searchTerm ? `No users matching "${searchTerm}".` : "Open this app in an incognito window to create a second user."}
                                />
                            ) : (
                                <AnimatePresence>
                                    {users.map((user: any, index: number) => (
                                        <motion.button
                                            key={user._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2, delay: index * 0.04 }}
                                            onClick={() => handleUserClick(user._id)}
                                            whileHover={{ scale: 1.02, filter: "brightness(1.05)" }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full flex items-center gap-4 p-3.5 rounded-2xl hover:bg-secondary/60 border border-transparent hover:border-border transition-all text-left"
                                        >
                                            <div className="relative">
                                                <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                                                    <AvatarImage src={user.imageUrl} className="object-cover" />
                                                    <AvatarFallback className="bg-primary text-primary-foreground">{user.name[0]}</AvatarFallback>
                                                </Avatar>
                                                {user.isOnline && (
                                                    <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-status-online border-2 border-background shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                                )}
                                            </div>
                                            <div className="flex-1 truncate">
                                                <div className="font-semibold text-[15px] text-text-primary truncate">{user.name}</div>
                                                <div className={cn(
                                                    "text-xs mt-0.5 truncate font-medium",
                                                    user.isOnline ? "text-accent-emerald" : "text-text-muted"
                                                )}>
                                                    {user.isOnline ? "Online now" : "Offline"}
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))}
                                </AnimatePresence>
                            )}
                        </>
                    )}
                </div>
            </ScrollArea>

            <CreateGroupModal
                isOpen={isGroupModalOpen}
                onClose={() => setIsGroupModalOpen(false)}
                onGroupCreated={(id) => {
                    handleSelectConversation(id);
                    setActiveTab("chats");
                }}
            />
        </motion.div>
    );
};

const EmptyState = ({ title, description }: { title: string; description: string }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-8 text-center mt-10"
    >
        <div className="p-4 rounded-3xl bg-secondary/50 border border-border shadow-inner mb-4">
            <MessageSquare className="h-8 w-8 text-accent-emerald opacity-70" />
        </div>
        <h3 className="text-base font-semibold text-text-primary mb-1">{title}</h3>
        <p className="text-sm text-text-muted max-w-[200px] leading-relaxed">{description}</p>
    </motion.div>
);

const UserSkeleton = () => (
    <div className="flex items-center gap-4 p-3.5">
        <Skeleton className="h-12 w-12 rounded-full opacity-20" />
        <div className="flex-1 space-y-2.5">
            <Skeleton className="h-4 w-[60%] opacity-20" />
            <Skeleton className="h-3 w-[40%] opacity-20" />
        </div>
    </div>
);
