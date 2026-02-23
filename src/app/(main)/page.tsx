"use client";

import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function EmptyState() {
    return (
        <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="hidden md:flex flex-1 flex-col items-center justify-center p-8 text-center h-full relative"
        >
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,248,229,0.02)_0%,transparent_60%)] pointer-events-none" />

            <div className="max-w-md w-full space-y-6 flex flex-col items-center relative z-10">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
                    className="h-28 w-28 rounded-full bg-secondary/40 backdrop-blur-3xl flex items-center justify-center mx-auto mb-4 border border-border shadow-[0_0_40px_rgba(201,248,229,0.05)] shadow-inner group relative"
                >
                    <div className="absolute inset-0 rounded-full bg-accent-emerald/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl" />
                    <MessageSquare className="h-12 w-12 text-accent-mint opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 drop-shadow-[0_0_15px_rgba(201,248,229,0.3)]" strokeWidth={1.5} />
                </motion.div>

                <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="space-y-3"
                >
                    <h2 className="text-3xl font-extrabold tracking-tight text-foreground bg-clip-text">
                        Select a conversation
                    </h2>
                    <p className="text-muted-foreground text-lg font-medium max-w-[80%] mx-auto leading-relaxed">
                        Choose a friend from the directory to start chatting in real-time.
                    </p>
                </motion.div>
            </div>
        </motion.div>
    );
}
