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
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-2xl">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 cursor-zoom-out"
                    />

                    {/* High-contrast Controls Header */}
                    <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/60 to-transparent z-[102] flex items-center justify-between px-6 pt-safe">
                        <div className="flex flex-col">
                            <span className="text-white text-sm font-bold truncate max-w-[200px] md:max-w-md">
                                {fileName || "Preview"}
                            </span>
                            <span className="text-white/60 text-[10px] uppercase tracking-widest font-medium">
                                {mediaType}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
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
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 260, damping: 26 }}
                        className="relative w-full h-full flex items-center justify-center p-4 md:p-12 z-[101] pointer-events-none"
                    >
                        {mediaType === "image" && (
                            <img
                                src={mediaUrl}
                                alt={fileName || "Preview"}
                                className="max-h-full max-w-full rounded-[1rem] object-contain shadow-[0_0_50px_rgba(0,0,0,0.5)] pointer-events-auto transition-transform duration-300"
                            />
                        )}
                        {mediaType === "video" && (
                            <div className="w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl pointer-events-auto relative bg-black">
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
