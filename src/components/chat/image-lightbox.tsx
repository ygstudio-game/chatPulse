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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 xl:p-10 pb-env(safe-area-inset-bottom)">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/90 backdrop-blur-xl"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="relative max-w-6xl w-full max-h-[90vh] flex flex-col items-center justify-center pointer-events-none z-[101]"
                    >
                        <div className="absolute top-0 right-0 md:-right-4 md:-top-4 p-4 flex gap-3 pointer-events-auto">
                            <a
                                href={mediaUrl}
                                download={fileName || "download"}
                                target="_blank"
                                rel="noreferrer"
                                className="p-3 bg-secondary/80 hover:bg-secondary rounded-full text-foreground transition-all backdrop-blur-md border border-border shadow-xl hover:scale-105 active:scale-95"
                            >
                                <Download className="h-5 w-5" />
                            </a>
                            <button
                                onClick={onClose}
                                className="p-3 bg-secondary/80 hover:bg-secondary rounded-full text-foreground transition-all backdrop-blur-md border border-border shadow-xl hover:scale-105 active:scale-95"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {mediaType === "image" && (
                            <img
                                src={mediaUrl}
                                alt={fileName || "Preview"}
                                className="max-h-[85vh] max-w-full rounded-[2xl] object-contain shadow-2xl pointer-events-auto ring-1 ring-border bg-black/5 dark:bg-white/5"
                            />
                        )}
                        {mediaType === "video" && (
                            <video
                                src={mediaUrl}
                                controls
                                autoPlay
                                className="max-h-[85vh] max-w-full rounded-[2xl] object-contain shadow-2xl pointer-events-auto ring-1 ring-border bg-black/5 dark:bg-white/5"
                            />
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
