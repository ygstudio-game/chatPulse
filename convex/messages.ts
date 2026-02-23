import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { getCurrentUser, requireUser } from "./helpers";
import { internal } from "./_generated/api";

export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        await requireUser(ctx);
        return await ctx.storage.generateUploadUrl();
    },
});

export const send = mutation({
    args: {
        content: v.optional(v.string()),
        conversationId: v.id("conversations"),
        type: v.optional(v.union(v.literal("text"), v.literal("image"))),
        mediaUrl: v.optional(v.string()),
        mediaType: v.optional(v.union(v.literal("image"), v.literal("video"), v.literal("pdf"), v.literal("audio"))),
        storageId: v.optional(v.string()),
        fileName: v.optional(v.string()),
        isUploading: v.optional(v.boolean()),
        replyToId: v.optional(v.id("messages")),
    },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);

        let finalMediaUrl = args.mediaUrl;
        if (args.storageId) {
            finalMediaUrl = await ctx.storage.getUrl(args.storageId as any) || undefined;
        }

        const messageId = await ctx.db.insert("messages", {
            content: args.content,
            conversationId: args.conversationId,
            senderId: user._id,
            type: args.type ?? "text",
            receipt: "sent",
            mediaUrl: finalMediaUrl,
            mediaType: args.mediaType,
            fileName: args.fileName,
            isUploading: args.isUploading,
            replyToId: args.replyToId,
        });

        // Batch update unreadCount for all other members
        const otherMembers = await ctx.db
            .query("members")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
            .filter((q) => q.neq(q.field("userId"), user._id))
            .collect();

        await Promise.all(
            otherMembers.map((member) =>
                ctx.db.patch(member._id, {
                    unreadCount: (member.unreadCount || 0) + 1,
                })
            )
        );

        await ctx.db.patch(args.conversationId, {
            lastMessageId: messageId,
        });

        return messageId;
    },
});

export const updateMedia = mutation({
    args: {
        messageId: v.id("messages"),
        storageId: v.string(),
    },
    handler: async (ctx, args) => {
        await requireUser(ctx);
        const mediaUrl = await ctx.storage.getUrl(args.storageId as any);
        if (!mediaUrl) throw new Error("Failed to get media URL");

        const message = await ctx.db.get(args.messageId);
        if (!message) throw new Error("Message not found");

        await ctx.db.patch(args.messageId, {
            mediaUrl,
            isUploading: false,
        });

        if (message.mediaType === "audio") {
            await ctx.scheduler.runAfter(0, internal.ai.transcribeAudio, {
                fileId: args.storageId as any,
                messageId: args.messageId,
            });
        }
    },
});

export const updateTranscript = internalMutation({
    args: {
        messageId: v.id("messages"),
        transcript: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.messageId, {
            transcript: args.transcript,
        });
    },
});

export const list = query({
    args: {
        conversationId: v.id("conversations"),
        paginationOpts: paginationOptsValidator
    },
    handler: async (ctx, args) => {
        const me = await getCurrentUser(ctx);
        if (!me) return { page: [], isDone: true, continueCursor: "" };

        const messagesPage = await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
            .order("desc")
            .paginate(args.paginationOpts);

        // Filter out messages deleted specifically for this user
        const visibleMessages = messagesPage.page.filter(msg => !msg.deletedBy?.includes(me._id));

        const otherMembers = await ctx.db
            .query("members")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
            .filter((q) => q.neq(q.field("userId"), me._id))
            .collect();

        const otherUsers = await Promise.all(
            otherMembers.map((m) => ctx.db.get(m.userId))
        );

        const memberReadTimes = await Promise.all(
            otherMembers.map(async (m) => {
                if (!m.lastSeenMessageId) return 0;
                const msg = await ctx.db.get(m.lastSeenMessageId);
                return msg ? msg._creationTime : 0;
            })
        );

        const isAnyoneOnline = otherUsers.some((u) => u?.isOnline);

        // Map over filtered visibleMessages
        const enrichedMessages = await Promise.all(visibleMessages.map(async (msg) => {
            let receipt = "sent";

            if (msg.senderId === me._id && otherMembers.length > 0) {
                const allRead = memberReadTimes.every(time => time >= msg._creationTime);
                if (allRead) {
                    receipt = "read";
                } else if (isAnyoneOnline) {
                    receipt = "delivered";
                }
            }

            let replyToMessage = undefined;
            if (msg.replyToId) {
                replyToMessage = await ctx.db.get(msg.replyToId);
                // Sanitize deleted reply references
                if (replyToMessage?.deleted || replyToMessage?.deletedBy?.includes(me._id)) {
                    replyToMessage = { ...replyToMessage, content: "This message was deleted", mediaUrl: undefined };
                }
            }

            const reactions = await ctx.db
                .query("reactions")
                .withIndex("by_messageId", (q) => q.eq("messageId", msg._id))
                .collect();

            const groups: Record<string, { count: number; userIds: string[] }> = {};
            for (const reaction of reactions) {
                if (!groups[reaction.emoji]) groups[reaction.emoji] = { count: 0, userIds: [] };
                groups[reaction.emoji].count++;
                groups[reaction.emoji].userIds.push(reaction.userId);
            }
            const groupedReactions = Object.entries(groups).map(([emoji, data]) => ({ emoji, ...data }));


            return {
                ...msg,
                receipt,
                replyToMessage,
                reactions: groupedReactions
            };
        }));

        return {
            ...messagesPage,
            page: enrichedMessages,
        };
    },
});

export const deleteMessage = mutation({
    args: { messageId: v.id("messages") },
    handler: async (ctx, args) => {
        const me = await requireUser(ctx);

        const message = await ctx.db.get(args.messageId);
        if (!message) throw new Error("Message not found");

        if (message.senderId !== me._id) {
            throw new Error("Unauthorized to delete this message");
        }

        await ctx.db.patch(args.messageId, {
            deleted: true,
            content: "This message was deleted",
        });
    },
});

export const addReaction = mutation({
    args: { messageId: v.id("messages"), emoji: v.string() },
    handler: async (ctx, args) => {
        const me = await requireUser(ctx);

        const message = await ctx.db.get(args.messageId);
        if (!message) throw new Error("Message not found");

        if (message.senderId === me._id) {
            throw new Error("You cannot react to your own message");
        }

        const existing = await ctx.db
            .query("reactions")
            .withIndex("by_messageId", (q) => q.eq("messageId", args.messageId))
            .filter((q) => q.and(q.eq(q.field("userId"), me._id), q.eq(q.field("emoji"), args.emoji)))
            .unique();

        if (existing) {
            await ctx.db.delete(existing._id);
        } else {
            await ctx.db.insert("reactions", {
                messageId: args.messageId,
                userId: me._id,
                emoji: args.emoji,
            });
        }
    },
});

export const getReactions = query({
    args: { messageId: v.id("messages") },
    handler: async (ctx, args) => {
        const reactions = await ctx.db
            .query("reactions")
            .withIndex("by_messageId", (q) => q.eq("messageId", args.messageId))
            .collect();

        const groups: Record<string, { count: number; userIds: string[] }> = {};

        for (const reaction of reactions) {
            if (!groups[reaction.emoji]) {
                groups[reaction.emoji] = { count: 0, userIds: [] };
            }
            groups[reaction.emoji].count++;
            groups[reaction.emoji].userIds.push(reaction.userId);
        }

        return Object.entries(groups).map(([emoji, data]) => ({
            emoji,
            ...data,
        }));
    },
});

export const deleteForMe = mutation({
    args: { messageId: v.id("messages") },
    handler: async (ctx, args) => {
        const me = await requireUser(ctx);
        const message = await ctx.db.get(args.messageId);
        if (!message) throw new Error("Message not found");

        const currentDeletedBy = message.deletedBy || [];
        if (!currentDeletedBy.includes(me._id)) {
            await ctx.db.patch(args.messageId, {
                deletedBy: [...currentDeletedBy, me._id]
            });
        }
    }
});

