"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";
import { useEffect } from "react";

interface ImageLightboxProps {
    isOpen: boolean;
    onClose: () => void;
    mediaUrl: string;
    fileName?: string;
    mediaType?: "image" | "video";
}

export const ImageLightbox = ({ isOpen, onClose, mediaUrl, fileName, mediaType }: ImageLightboxProps) => {
    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && mediaUrl && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/98 backdrop-blur-3xl">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 cursor-zoom-out"
                    />

                    {/* High-contrast Controls Header */}
                    <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/80 to-transparent z-[102] flex items-center justify-between px-6 pt-safe pointer-events-none">
                        <div className="flex flex-col">
                            <span className="text-white text-sm font-bold truncate max-w-[200px] md:max-w-md">
                                {fileName || "Preview"}
                            </span>
                            <span className="text-white/60 text-[10px] uppercase tracking-widest font-medium">
                                {mediaType}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 pointer-events-auto">
                            <a
                                href={mediaUrl}
                                download={fileName || "download"}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2.5 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full text-white transition-all backdrop-blur-md border border-white/10 shadow-xl"
                                title="Download"
                            >
                                <Download className="h-5 w-5" />
                            </a>
                            <button
                                onClick={onClose}
                                className="p-2.5 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full text-white transition-all backdrop-blur-md border border-white/10 shadow-xl"
                                title="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="relative w-full h-full flex items-center justify-center p-0 md:p-0 z-[101] pointer-events-none"
                    >
                        {mediaType === "image" && (
                            <img
                                src={mediaUrl}
                                alt={fileName || "Preview"}
                                className="h-full w-full object-contain pointer-events-auto select-none"
                            />
                        )}
                        {mediaType === "video" && (
                            <div className="w-full h-full rounded-none overflow-hidden shadow-2xl pointer-events-auto relative bg-black">
                                <video
                                    src={mediaUrl}
                                    controls
                                    autoPlay
                                    className="w-full h-full"
                                />
                            </div>
                        )}
                    </motion.div>

                    {/* Bottom padding for mobile home indicator */}
                    <div className="h-safe-bottom" />
                </div>
            )}
        </AnimatePresence>
    );
};
