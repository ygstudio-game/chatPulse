"use client";

import { motion } from "framer-motion";

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="h-full w-full"
        >
            {children}
        </motion.div>
    );
}
