"use client";

import { Sidebar } from "@/components/features/sidebar";
import { GlobalCallOverlay } from "@/components/chat/global-call-overlay";
import { motion, AnimatePresence } from "framer-motion";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <AnimatePresence mode="wait">
            <motion.main
                key="main-app"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex h-[100dvh] bg-background overflow-hidden font-sans selection:bg-accent/30 selection:text-foreground relative"
            >
                <Sidebar />

                <div className="flex-1 flex flex-col relative z-0">
                    {children}
                </div>

                <GlobalCallOverlay />
            </motion.main>
        </AnimatePresence>
    );
}
