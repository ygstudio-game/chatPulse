import { create } from 'zustand';

interface ReplyStore {
    replyTo: any | null;
    setReplyTo: (message: any | null) => void;
    clearReply: () => void;
}

export const useReplyStore = create<ReplyStore>((set) => ({
    replyTo: null,
    setReplyTo: (message) => set({ replyTo: message }),
    clearReply: () => set({ replyTo: null }),
}));
