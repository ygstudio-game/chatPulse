import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./helpers";

export const startTyping = mutation({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const me = await getCurrentUser(ctx);
        if (!me) return;

        const existing = await ctx.db
            .query("typingIndicators")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
            .filter((q) => q.eq(q.field("userId"), me._id))
            .unique();

        const expiresAt = Date.now() + 3000; // 3 seconds

        if (existing) {
            await ctx.db.patch(existing._id, { expiresAt });
        } else {
            await ctx.db.insert("typingIndicators", {
                conversationId: args.conversationId,
                userId: me._id,
                expiresAt,
            });
        }
    },
});

export const getTyping = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const now = Date.now();
        const indicators = await ctx.db
            .query("typingIndicators")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
            .collect();

        const me = await getCurrentUser(ctx);
        const active = indicators.filter((i) => i.expiresAt > now && i.userId !== me?._id);

        return await Promise.all(
            active.map(async (i) => {
                const user = await ctx.db.get(i.userId);
                return user?.name;
            })
        );
    },
});

export const stopTyping = mutation({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const me = await getCurrentUser(ctx);
        if (!me) return;

        const existing = await ctx.db
            .query("typingIndicators")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
            .filter((q) => q.eq(q.field("userId"), me._id))
            .unique();

        if (existing) {
            await ctx.db.delete(existing._id);
        }
    },
});
