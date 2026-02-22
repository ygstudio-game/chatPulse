import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireUser } from "./helpers";

export const getOrCreateConversation = mutation({
    args: {
        participantId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const me = await requireUser(ctx);

        // Optimized search using members table
        const myMemberships = await ctx.db
            .query("members")
            .withIndex("by_userId", (q) => q.eq("userId", me._id))
            .collect();

        for (const membership of myMemberships) {
            const conversation = await ctx.db.get(membership.conversationId);
            if (!conversation || conversation.isGroup) continue;

            const otherMember = await ctx.db
                .query("members")
                .withIndex("by_conversationId", (q) => q.eq("conversationId", conversation._id))
                .filter((q) => q.eq(q.field("userId"), args.participantId))
                .unique();

            if (otherMember) return conversation._id;
        }

        // Create new conversation
        const conversationId = await ctx.db.insert("conversations", {
            isGroup: false,
        });

        await ctx.db.insert("members", {
            userId: me._id,
            conversationId,
            unreadCount: 0,
        });

        await ctx.db.insert("members", {
            userId: args.participantId,
            conversationId,
            unreadCount: 0,
        });

        return conversationId;
    },
});

export const createGroup = mutation({
    args: {
        name: v.string(),
        memberIds: v.array(v.id("users")),
    },
    handler: async (ctx, args) => {
        const me = await requireUser(ctx);

        const conversationId = await ctx.db.insert("conversations", {
            isGroup: true,
            name: args.name,
        });

        // Ensure unique members including creator
        const allMemberIds = [...new Set([...args.memberIds, me._id])];

        await Promise.all(
            allMemberIds.map((userId) =>
                ctx.db.insert("members", {
                    userId,
                    conversationId,
                    unreadCount: 0,
                })
            )
        );

        return conversationId;
    },
});

export const listConversations = query({
    handler: async (ctx) => {
        const me = await getCurrentUser(ctx);
        if (!me) return [];

        const memberships = await ctx.db
            .query("members")
            .withIndex("by_userId", (q) => q.eq("userId", me._id))
            .collect();

        return await Promise.all(
            memberships.map(async (m) => {
                const conversation = await ctx.db.get(m.conversationId);
                if (!conversation) return null;

                let otherUser = null;
                let groupMembers: any[] = [];

                if (!conversation.isGroup) {
                    const otherMember = await ctx.db
                        .query("members")
                        .withIndex("by_conversationId", (q) => q.eq("conversationId", conversation._id))
                        .filter((q) => q.neq(q.field("userId"), me._id))
                        .first();
                    otherUser = otherMember ? await ctx.db.get(otherMember.userId) : null;
                } else {
                    const allMembers = await ctx.db
                        .query("members")
                        .withIndex("by_conversationId", (q) => q.eq("conversationId", conversation._id))
                        .collect();
                    const membersUsers = await Promise.all(
                        allMembers.map((m) => ctx.db.get(m.userId))
                    );
                    groupMembers = membersUsers.filter(u => u !== null);
                }

                const lastMessage = conversation.lastMessageId ? await ctx.db.get(conversation.lastMessageId) : null;

                // Check typing status
                const now = Date.now();
                const activeTypers = await ctx.db
                    .query("typingIndicators")
                    .withIndex("by_conversationId", (q) => q.eq("conversationId", conversation._id))
                    .filter((q) =>
                        q.and(
                            q.neq(q.field("userId"), me._id),
                            q.gt(q.field("expiresAt"), now)
                        )
                    )
                    .collect();

                return {
                    ...conversation,
                    otherUser,
                    lastMessage,
                    unreadCount: m.unreadCount ?? 0, // Use denormalized unreadCount with fallback
                    isTyping: activeTypers.length > 0
                };
            })
        ).then(convs => convs.filter(c => c !== null));
    },
});

export const markRead = mutation({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const me = await getCurrentUser(ctx);
        if (!me) return;

        const membership = await ctx.db
            .query("members")
            .withIndex("by_userId_conversationId", (q) =>
                q.eq("userId", me._id).eq("conversationId", args.conversationId)
            )
            .unique();

        if (!membership) return;

        // 1. ALWAYS update the High-Water Mark for the Sidebar Badge
        const conversation = await ctx.db.get(args.conversationId);
        let latestMessageId = conversation?.lastMessageId;

        // Fallback if lastMessageId wasn't cached on the conversation
        if (!latestMessageId) {
            const latestMessage = await ctx.db
                .query("messages")
                .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
                .order("desc")
                .first();
            latestMessageId = latestMessage?._id;
        }

        if (latestMessageId && membership.lastSeenMessageId !== latestMessageId) {
            await ctx.db.patch(membership._id, {
                lastSeenMessageId: latestMessageId,
                unreadCount: 0, // Reset unreadCount when marking as read
            });
        } else if ((membership.unreadCount ?? 0) > 0) {
            // Even if latestMessageId hasn't changed, ensure unreadCount is reset if it's > 0
            await ctx.db.patch(membership._id, { unreadCount: 0 });
        }

        // 2. Process the WhatsApp-style double-blue ticks on individual messages
        const unreadMessages = await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
            .filter((q) => q.and(
                q.neq(q.field("senderId"), me._id),
                q.neq(q.field("receipt"), "read")
            ))
            .collect();

        await Promise.all(
            unreadMessages.map((msg) =>
                ctx.db.patch(msg._id, { receipt: "read" })
            )
        );
    },
});

export const getConversation = query({
    args: { id: v.id("conversations") },
    handler: async (ctx, args) => {
        const me = await getCurrentUser(ctx);
        if (!me) return null;

        const conversation = await ctx.db.get(args.id);
        if (!conversation) return null;

        let otherUser = null;
        let groupMembers: any[] = [];

        if (!conversation.isGroup) {
            const otherMember = await ctx.db
                .query("members")
                .withIndex("by_conversationId", (q) => q.eq("conversationId", conversation._id))
                .filter((q) => q.neq(q.field("userId"), me._id))
                .first();
            otherUser = otherMember ? await ctx.db.get(otherMember.userId) : null;
        } else {
            const allMembers = await ctx.db
                .query("members")
                .withIndex("by_conversationId", (q) => q.eq("conversationId", conversation._id))
                .collect();
            const membersUsers = await Promise.all(
                allMembers.map((m) => ctx.db.get(m.userId))
            );
            groupMembers = membersUsers.filter(u => u !== null);
        }

        return {
            ...conversation,
            otherUser,
            groupMembers,
        };
    },
});

export const leaveGroup = mutation({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const me = await requireUser(ctx);

        const membership = await ctx.db
            .query("members")
            .withIndex("by_userId_conversationId", (q) =>
                q.eq("userId", me._id).eq("conversationId", args.conversationId)
            )
            .unique();

        if (!membership) throw new Error("Not a member of this group");

        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation?.isGroup) {
            throw new Error("Cannot leave a 1-on-1 conversation. Use clear chat instead.");
        }

        // Remove the membership
        await ctx.db.delete(membership._id);
    },
});

export const clearChat = mutation({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const me = await requireUser(ctx);

        // Fetch all messages in the conversation
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
            .collect();

        // Mark all messages as deleted for this specific user
        await Promise.all(
            messages.map(async (msg) => {
                const currentDeletedBy = msg.deletedBy || [];
                if (!currentDeletedBy.includes(me._id)) {
                    await ctx.db.patch(msg._id, {
                        deletedBy: [...currentDeletedBy, me._id]
                    });
                }
            })
        );

        // Also clear out the unread count and latest message seen indicator for this user
        const membership = await ctx.db
            .query("members")
            .withIndex("by_userId_conversationId", (q) =>
                q.eq("userId", me._id).eq("conversationId", args.conversationId)
            )
            .unique();

        if (membership) {
            await ctx.db.patch(membership._id, {
                unreadCount: 0,
                lastSeenMessageId: undefined
            });
        }
    },
});

export const startCall = mutation({
    args: {
        conversationId: v.id("conversations"),
        type: v.union(v.literal("audio"), v.literal("video"))
    },
    handler: async (ctx, args) => {
        const me = await requireUser(ctx);
        await ctx.db.patch(args.conversationId, {
            ongoingCall: {
                callerId: me._id,
                type: args.type,
                status: "ringing"
            }
        });
    },
});

export const acceptCall = mutation({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        await requireUser(ctx);
        const conversation = await ctx.db.get(args.conversationId);

        if (conversation?.ongoingCall) {
            await ctx.db.patch(args.conversationId, {
                ongoingCall: {
                    ...conversation.ongoingCall,
                    status: "accepted"
                }
            });
        }
    },
});

export const declineCall = mutation({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const me = await requireUser(ctx);

        // 1. Check if user is a member
        const membership = await ctx.db
            .query("members")
            .withIndex("by_userId_conversationId", (q) =>
                q.eq("userId", me._id).eq("conversationId", args.conversationId)
            )
            .unique();

        if (!membership) {
            throw new Error("You are not a member of this conversation");
        }

        // 2. Remove the ongoing call
        await ctx.db.patch(args.conversationId, {
            ongoingCall: undefined,
        });
    },
});

export const getOngoingCall = query({
    handler: async (ctx) => {
        const me = await getCurrentUser(ctx);
        if (!me) return null;

        const memberships = await ctx.db
            .query("members")
            .withIndex("by_userId", (q) => q.eq("userId", me._id))
            .collect();

        for (const m of memberships) {
            const conversation = await ctx.db.get(m.conversationId);
            if (conversation?.ongoingCall) {
                let otherUser = null;
                if (!conversation.isGroup) {
                    const otherMember = await ctx.db
                        .query("members")
                        .withIndex("by_conversationId", (q) => q.eq("conversationId", conversation._id))
                        .filter((q) => q.neq(q.field("userId"), me._id))
                        .first();
                    otherUser = otherMember ? await ctx.db.get(otherMember.userId) : null;
                }

                return {
                    ...conversation,
                    otherUser,
                };
            }
        }
        return null;
    }
});
