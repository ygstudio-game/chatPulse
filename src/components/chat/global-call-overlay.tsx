"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, Video, Users, Loader2 } from "lucide-react";
import { useState } from "react";
import { useConversationStore } from "@/store/use-conversation-store";

export function GlobalCallOverlay() {
    const { setSelectedConversationId } = useConversationStore();
    const me = useQuery(api.users.getMe);
    const activeCallConv = useQuery(api.conversations.getOngoingCall);
    const acceptCall = useMutation(api.conversations.acceptCall);
    const declineCall = useMutation(api.conversations.declineCall);
    const [isDeclining, setIsDeclining] = useState(false);

    if (activeCallConv === undefined || me === undefined) return null;
    if (!activeCallConv || !activeCallConv.ongoingCall) return null;

    const call = activeCallConv.ongoingCall;
    const isCaller = call.callerId === me?._id;

    const handleAccept = async () => {
        await acceptCall({ conversationId: activeCallConv._id });
        setSelectedConversationId(activeCallConv._id);
    };

    // If accepted, it's handled by ChatArea's <VideoRoom> rendering. We only want to show Ringing globally.
    if (call.status === "accepted") return null;

    // Ringing state:
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
            >
                {isCaller ? (
                    // Outgoing Call (Ringing)
                    <div className="space-y-6 md:space-y-8 flex flex-col items-center max-w-sm w-full">
                        <h3 className="text-lg md:text-xl font-medium text-white/80">Calling {activeCallConv.otherUser?.name || "Group"}...</h3>

                        <div className="relative">
                            <div className="absolute inset-0 -m-8 border border-white/10 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                            <div className="absolute inset-0 -m-4 border border-white/20 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }} />
                            <Avatar className="h-28 w-28 md:h-32 md:w-32 border-4 border-accent-mint ring-4 ring-accent-mint/30 animate-pulse shadow-2xl relative z-10">
                                <AvatarImage src={activeCallConv.isGroup ? "" : activeCallConv.otherUser?.imageUrl} className="object-cover" />
                                <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-semibold">
                                    {activeCallConv.isGroup ? <Users className="h-12 w-12" /> : activeCallConv.otherUser?.name?.[0]}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        <Button
                            disabled={isDeclining}
                            onClick={async () => {
                                setIsDeclining(true);
                                try {
                                    await declineCall({ conversationId: activeCallConv._id });
                                } catch (err) {
                                    console.error("Failed to decline call:", err);
                                } finally {
                                    setIsDeclining(false);
                                }
                            }}
                            className="h-16 w-16 rounded-full bg-accent-rose hover:bg-accent-rose/80 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all mt-8"
                        >
                            {isDeclining ? <Loader2 className="h-8 w-8 animate-spin" /> : <Phone className="h-8 w-8 fill-current rotate-[135deg]" />}
                        </Button>
                    </div>
                ) : (
                    // Incoming Call (Ringing)
                    <div className="space-y-6 md:space-y-8 flex flex-col items-center max-w-sm w-full">
                        <div className="space-y-1 md:space-y-2">
                            <h3 className="text-xl md:text-2xl font-bold text-white">{activeCallConv.otherUser?.name || "Someone"}</h3>
                            <p className="text-white/70 text-base md:text-lg capitalize">Incoming {call.type} call...</p>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 -m-12 border-2 border-accent-emerald/40 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                            <div className="absolute inset-0 -m-6 border-2 border-accent-emerald/60 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
                            <Avatar className="h-28 w-28 md:h-32 md:w-32 border-4 border-background shadow-2xl relative z-10">
                                <AvatarImage src={activeCallConv.isGroup ? "" : activeCallConv.otherUser?.imageUrl} className="object-cover" />
                                <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-semibold">
                                    {activeCallConv.isGroup ? <Users className="h-12 w-12" /> : activeCallConv.otherUser?.name?.[0]}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        <div className="flex items-center justify-center gap-12 w-full mt-12 max-w-[280px]">
                            <div className="flex flex-col items-center gap-3">
                                <Button
                                    disabled={isDeclining}
                                    onClick={async () => {
                                        setIsDeclining(true);
                                        try {
                                            await declineCall({ conversationId: activeCallConv._id });
                                        } catch (err) {
                                            console.error("Failed to decline call:", err);
                                        } finally {
                                            setIsDeclining(false);
                                        }
                                    }}
                                    className="h-16 w-16 rounded-full bg-accent-rose hover:bg-accent-rose/90 text-white shadow-2xl hover:scale-105 active:scale-95 transition-transform border-2 border-white/10"
                                >
                                    {isDeclining ? <Loader2 className="h-7 w-7 animate-spin" /> : <Phone className="h-7 w-7 fill-current rotate-[135deg]" />}
                                </Button>
                                <span className="text-white/80 font-medium text-sm">Decline</span>
                            </div>
                            <div className="flex flex-col items-center gap-3">
                                <Button
                                    onClick={handleAccept}
                                    className="h-16 w-16 rounded-full bg-accent-emerald hover:bg-accent-emerald/90 text-white shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 transition-transform border-2 border-white/20 animate-pulse"
                                >
                                    {call.type === 'video' ? (
                                        <Video className="h-7 w-7 fill-current" />
                                    ) : (
                                        <Phone className="h-7 w-7 fill-current" />
                                    )}
                                </Button>
                                <span className="text-white font-medium text-sm">Accept</span>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
