"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Users, Check, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface CreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGroupCreated: (id: Id<"conversations">) => void;
}

export const CreateGroupModal = ({ isOpen, onClose, onGroupCreated }: CreateGroupModalProps) => {
    const [name, setName] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<Id<"users">[]>([]);

    const users = useQuery(api.users.listUsers, { search: searchTerm });
    const createGroup = useMutation(api.conversations.createGroup);

    const toggleUser = (userId: Id<"users">) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleCreate = async () => {
        if (!name.trim() || selectedUsers.length === 0) return;

        try {
            const conversationId = await createGroup({
                name: name.trim(),
                memberIds: selectedUsers,
            });
            onGroupCreated(conversationId);
            onClose();
        } catch (error) {
            console.error("Failed to create group:", error);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="relative w-full max-w-md bg-secondary/95 backdrop-blur-xl border border-border rounded-3xl md:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh]"
                    >
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-secondary/30">
                            <h2 className="font-bold text-xl text-text-primary flex items-center gap-3">
                                <div className="p-2 bg-accent/20 rounded-xl text-accent-emerald">
                                    <Users className="h-5 w-5" />
                                </div>
                                Create Group
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-secondary/80 rounded-full transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Input Area */}
                        <div className="p-4 md:p-6 space-y-4 md:space-y-5 bg-secondary/30">
                            <div className="space-y-1.5 md:space-y-2">
                                <label className="text-[10px] md:text-xs font-bold text-accent-emerald uppercase tracking-wider ml-1">
                                    Group Name
                                </label>
                                <Input
                                    placeholder="e.g. Dream Team 🚀"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-background border-border h-11 md:h-12 rounded-xl md:rounded-2xl text-sm md:text-base px-4 focus-visible:ring-accent-mint/40 focus-visible:border-accent-mint transition-all placeholder:text-muted-foreground/50 shadow-inner"
                                />
                            </div>

                            <div className="space-y-1.5 md:space-y-2">
                                <label className="text-[10px] md:text-xs font-bold text-accent-emerald uppercase tracking-wider ml-1">
                                    Add Members
                                </label>
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted group-focus-within:text-accent-mint transition-colors" />
                                    <Input
                                        placeholder="Search people..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-11 bg-background border-border h-11 md:h-12 rounded-xl md:rounded-2xl text-sm md:text-base focus-visible:ring-accent-mint/40 focus-visible:border-accent-mint transition-all placeholder:text-muted-foreground/50 shadow-inner"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* User List */}
                        <ScrollArea className="flex-1 px-4 py-2 min-h-0">
                            {users?.map((user: any, index: number) => {
                                const isSelected = selectedUsers.includes(user._id);
                                return (
                                    <motion.button
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        key={user._id}
                                        onClick={() => toggleUser(user._id)}
                                        className={cn(
                                            "w-full flex items-center gap-4 p-3 rounded-2xl transition-all text-left mb-1.5 border border-transparent hover:bg-secondary/60",
                                            isSelected && "bg-accent/10 hover:bg-accent/15 border-accent/20"
                                        )}
                                    >
                                        <div className="relative">
                                            <Avatar className="h-11 w-11 border-2 border-background shadow-sm">
                                                <AvatarImage src={user.imageUrl} className="object-cover" />
                                                <AvatarFallback className="bg-primary/80 text-primary-foreground">
                                                    {user.name[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            {isSelected && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="absolute -bottom-1 -right-1 h-5 w-5 bg-accent text-white rounded-full border-2 border-secondary flex items-center justify-center shadow-lg"
                                                >
                                                    <Check className="h-3 w-3" strokeWidth={3} />
                                                </motion.div>
                                            )}
                                        </div>
                                        <div className="flex-1 truncate">
                                            <div className="font-semibold text-[15px] text-text-primary">
                                                {user.name}
                                            </div>
                                            <div className="text-xs text-text-muted truncate">
                                                {user.email || "Pulse Member"}
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </ScrollArea>

                        {/* Footer */}
                        <div className="p-5 border-t border-border bg-secondary/50 flex justify-between items-center backdrop-blur-md">
                            <div className="text-sm text-muted-foreground font-medium bg-background px-3 py-1.5 rounded-full border border-border">
                                <span className={cn("font-bold", selectedUsers.length > 0 ? "text-accent-mint" : "text-text-secondary")}>
                                    {selectedUsers.length}
                                </span> selected
                            </div>
                            <Button
                                onClick={handleCreate}
                                disabled={!name.trim() || selectedUsers.length === 0}
                                className={cn(
                                    "rounded-xl px-6 h-11 font-semibold transition-all shadow-lg",
                                    !name.trim() || selectedUsers.length === 0
                                        ? "opacity-50 cursor-not-allowed bg-secondary/50 text-muted-foreground hover:bg-secondary/50"
                                        : "bg-accent hover:bg-accent-hover text-white hover:shadow-accent-mint/20 hover:-translate-y-0.5"
                                )}
                            >
                                Create Group
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
