import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
    users: defineTable({
        name: v.string(),
        email: v.string(),
        imageUrl: v.string(),
        clerkId: v.string(),
        lastSeen: v.optional(v.number()),
        isOnline: v.boolean(),
    })
        .index("by_clerkId", ["clerkId"])
        .index("by_name", ["name"])
        .searchIndex("search_name", { searchField: "name" }),

    conversations: defineTable({
        name: v.optional(v.string()),
        isGroup: v.boolean(),
        lastMessageId: v.optional(v.id("messages")),
        ongoingCall: v.optional(v.object({
            callerId: v.id("users"),
            type: v.union(v.literal("audio"), v.literal("video")),
            status: v.union(v.literal("ringing"), v.literal("accepted")),
        }))
    }),

    members: defineTable({
        userId: v.id("users"),
        conversationId: v.id("conversations"),
        lastSeenMessageId: v.optional(v.id("messages")),
        unreadCount: v.optional(v.number()),
    })
        .index("by_userId", ["userId"])
        .index("by_conversationId", ["conversationId"])
        .index("by_userId_conversationId", ["userId", "conversationId"]),

    messages: defineTable({
        conversationId: v.id("conversations"),
        senderId: v.id("users"),
        content: v.optional(v.string()),
        mediaUrl: v.optional(v.string()),
        mediaType: v.optional(v.union(
            v.literal("image"),
            v.literal("video"),
            v.literal("pdf"),
            v.literal("audio")
        )),
        receipt: v.union(v.literal("sent"), v.literal("delivered"), v.literal("read")),
        type: v.union(v.literal("text"), v.literal("image")),
        deleted: v.optional(v.boolean()),
        fileName: v.optional(v.string()),
        isUploading: v.optional(v.boolean()),
        replyToId: v.optional(v.id("messages")),
        transcript: v.optional(v.string()),
        deletedBy: v.optional(v.array(v.id("users"))),
    }).index("by_conversationId", ["conversationId"]),

    reactions: defineTable({
        messageId: v.id("messages"),
        userId: v.id("users"),
        emoji: v.string(),
    }).index("by_messageId", ["messageId"]),

    typingIndicators: defineTable({
        conversationId: v.id("conversations"),
        userId: v.id("users"),
        expiresAt: v.number(),
    }).index("by_conversationId", ["conversationId"]),
});

export default schema;
