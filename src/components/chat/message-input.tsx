"use client";

import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Smile, Paperclip, Mic, X, FileText, Image as ImageIcon, Film, Loader2 } from "lucide-react";
import { VoiceRecorder } from "./voice-recorder";
import { motion, AnimatePresence } from "framer-motion";

import { useReplyStore } from "@/store/use-reply-store";

interface MessageInputProps {
    conversationId: Id<"conversations">;
}

export const MessageInput = ({ conversationId }: MessageInputProps) => {
    const [content, setContent] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedMedia, setSelectedMedia] = useState<{
        url: string;
        type: "image" | "video" | "pdf" | "audio";
        name?: string;
    } | null>(null);

    const { replyTo, clearReply } = useReplyStore();

    const sendMessage = useMutation(api.messages.send);
    const updateMedia = useMutation(api.messages.updateMedia);
    const generateUploadUrl = useMutation(api.messages.generateUploadUrl);
    const startTyping = useMutation(api.typing.startTyping);
    const stopTyping = useMutation(api.typing.stopTyping);

    const handleFocus = () => startTyping({ conversationId });
    const handleBlur = () => stopTyping({ conversationId });

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        let type: "image" | "video" | "pdf" | "audio" = "image";
        if (file.type.includes("video")) type = "video";
        else if (file.type.includes("pdf")) type = "pdf";
        else if (file.type.includes("audio")) type = "audio";

        setSelectedFile(file);

        // For preview only
        const reader = new FileReader();
        reader.onload = (event) => {
            setSelectedMedia({
                url: event.target?.result as string,
                type,
                name: file.name
            });
        };
        reader.readAsDataURL(file);
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!content.trim() && !selectedFile) return;

        const currentContent = content.trim();
        const currentFile = selectedFile;
        const currentMedia = selectedMedia;

        setContent("");
        setSelectedMedia(null);
        setSelectedFile(null);

        const currentReplyToId = replyTo?._id;
        clearReply();

        try {
            // 1. Send message immediately with isUploading flag
            const messageId = await sendMessage({
                content: currentContent || undefined,
                conversationId,
                mediaType: currentMedia?.type,
                fileName: currentFile?.name,
                isUploading: !!currentFile,
                replyToId: currentReplyToId,
            });

            // 2. If there's a file, perform upload in background
            if (currentFile && messageId) {
                // We don't technically need to "await" this for the user to send the next message
                // but we keep the logic here. The user can already type in the cleared input.
                (async () => {
                    try {
                        const postUrl = await generateUploadUrl();
                        const result = await fetch(postUrl, {
                            method: "POST",
                            headers: { "Content-Type": currentFile.type },
                            body: currentFile,
                        });
                        const { storageId } = await result.json();
                        await updateMedia({ messageId, storageId });
                    } catch (err) {
                        console.error("Background upload failed:", err);
                    }
                })();
            }
        } catch (error) {
            console.error("Failed to initiate message send:", error);
        }
    };

    const handleVoiceComplete = async (blob: Blob) => {
        setIsRecording(false);
        try {
            const fileName = `voice-note-${Date.now()}.webm`;
            const messageId = await sendMessage({
                conversationId,
                mediaType: "audio",
                fileName,
                isUploading: true,
            });

            if (messageId) {
                (async () => {
                    try {
                        const postUrl = await generateUploadUrl();
                        const result = await fetch(postUrl, {
                            method: "POST",
                            headers: { "Content-Type": blob.type },
                            body: blob,
                        });
                        const { storageId } = await result.json();
                        await updateMedia({ messageId, storageId });
                    } catch (err) {
                        console.error("Voice upload failed:", err);
                    }
                })();
            }
        } catch (error) {
            console.error("Failed to initiate voice note:", error);
        }
    };

    return (
        <div className="w-full transition-all duration-300">
            <div className="max-w-4xl mx-auto bg-secondary/80 dark:bg-black/40 backdrop-blur-2xl border border-border p-1.5 md:p-3 shadow-2xl rounded-2xl md:rounded-[2rem] flex flex-col gap-2">

                {/* Reply Context Block */}
                <AnimatePresence>
                    {replyTo && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, scale: 0.95 }}
                            animate={{ opacity: 1, height: "auto", scale: 1 }}
                            exit={{ opacity: 0, height: 0, scale: 0.95 }}
                            className="bg-background/80 px-4 py-2 rounded-2xl border-l-4 border-accent-mint flex items-center justify-between"
                        >
                            <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-xs font-semibold text-accent-emerald mb-0.5">Replying to</span>
                                <span className="text-sm text-muted-foreground truncate">{replyTo.content || "Media"}</span>
                            </div>
                            <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full hover:bg-destructive/10 text-destructive active:scale-95" onClick={clearReply}>
                                <X className="h-4 w-4" />
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {selectedMedia && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-accent/20 p-2 rounded-2xl flex items-center gap-3 border border-primary/10 relative group"
                        >
                            <div className="h-16 w-16 rounded-xl overflow-hidden bg-muted flex items-center justify-center border shadow-sm">
                                {selectedMedia.type === "image" && <img src={selectedMedia.url} className="h-full w-full object-cover" />}
                                {selectedMedia.type === "video" && <Film className="h-6 w-6 text-primary" />}
                                {selectedMedia.type === "pdf" && <FileText className="h-6 w-6 text-red-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">{selectedMedia.name || "Selected file"}</p>
                                <p className="text-[10px] text-muted-foreground uppercase">{selectedMedia.type}</p>
                            </div>
                            <Button
                                size="icon"
                                variant="destructive"
                                onClick={() => setSelectedMedia(null)}
                                className="h-8 w-8 rounded-full shadow-lg"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {isRecording ? (
                    <VoiceRecorder
                        onRecordingComplete={handleVoiceComplete}
                        onCancel={() => setIsRecording(false)}
                    />
                ) : (
                    <form onSubmit={handleSend} className="flex items-center gap-1 md:gap-2">
                        <div className="flex items-center gap-0.5">
                            <input
                                type="file"
                                id="media-upload"
                                className="hidden"
                                accept="image/*,video/*,application/pdf"
                                onChange={handleFileSelect}
                            />
                            <Button
                                size="icon"
                                variant="ghost"
                                type="button"
                                asChild
                                className="shrink-0 text-muted-foreground hover:bg-secondary hover:text-accent-mint rounded-2xl transition-all h-11 w-11 md:h-12 md:w-12 active:scale-95"
                            >
                                <label htmlFor="media-upload" className="cursor-pointer">
                                    <Paperclip className="h-5 w-5 md:h-[22px] md:w-[22px]" strokeWidth={1.5} />
                                </label>
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                type="button"
                                onClick={() => setIsRecording(true)}
                                className="shrink-0 text-muted-foreground hover:bg-secondary hover:text-accent-mint rounded-2xl transition-all h-11 w-11 md:h-12 md:w-12 active:scale-95"
                            >
                                <Mic className="h-5 w-5 md:h-[22px] md:w-[22px]" strokeWidth={1.5} />
                            </Button>
                        </div>

                        <div className="relative flex-1 group">
                            <Input
                                value={content}
                                onChange={(e) => {
                                    setContent(e.target.value);
                                    startTyping({ conversationId });
                                }}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                placeholder="Message..."
                                className="pr-12 bg-secondary/50 border-border focus-visible:ring-1 focus-visible:ring-accent-mint/50 focus-visible:border-accent-mint h-11 md:h-12 rounded-2xl text-foreground placeholder:text-muted-foreground/50 transition-all font-medium text-[15px] shadow-inner w-full"
                            />
                            <Button
                                size="icon"
                                variant="ghost"
                                type="button"
                                className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent-mint hover:bg-secondary transition-all h-9 w-9 md:h-10 md:w-10 rounded-xl"
                            >
                                <Smile className="h-[20px] w-[20px]" strokeWidth={1.5} />
                            </Button>
                        </div>
                        <Button
                            type="submit"
                            size="icon"
                            disabled={(!content.trim() && !selectedFile) || isUploading}
                            className="shrink-0 h-11 w-11 md:h-12 md:w-12 rounded-2xl bg-gradient-to-tr from-accent-emerald to-accent-hover text-white shadow-[0_4px_16px_rgba(15,111,84,0.4)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale disabled:hover:scale-100 disabled:cursor-not-allowed border border-transparent dark:border-white/10"
                        >
                            {isUploading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Send className="h-5 w-5 md:h-[22px] md:w-[22px]" strokeWidth={2} />
                            )}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
};

