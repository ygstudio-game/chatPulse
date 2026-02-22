import { create } from 'zustand';
import { Id } from '@convex/_generated/dataModel';

interface ConversationStore {
    selectedConversationId: Id<"conversations"> | undefined;
    setSelectedConversationId: (id: Id<"conversations"> | undefined) => void;
}

export const useConversationStore = create<ConversationStore>((set) => ({
    selectedConversationId: undefined,
    setSelectedConversationId: (id) => set({ selectedConversationId: id }),
}));
