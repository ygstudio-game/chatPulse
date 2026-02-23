import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./helpers";

export const storeUser = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        imageUrl: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Called storeUser without authentication");
        }

        // Check if user already exists
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (user !== null) {
            // Update existing user if needed (e.g. name or image changed in Clerk)
            if (user.name !== args.name || user.imageUrl !== args.imageUrl) {
                await ctx.db.patch(user._id, {
                    name: args.name,
                    imageUrl: args.imageUrl,
                });
            }
            return user._id;
        }

        // Create new user
        const userId = await ctx.db.insert("users", {
            name: args.name,
            email: args.email,
            imageUrl: args.imageUrl,
            clerkId: identity.subject,
            isOnline: true,
            lastSeen: Date.now(),
        });

        return userId;
    },
});

export const getMe = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        return await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
    },
});

export const listUsers = query({
    args: { search: v.string() },
    handler: async (ctx, args) => {
        const me = await getCurrentUser(ctx);
        if (!me) return [];

        let users;

        if (args.search) {
            users = await ctx.db
                .query("users")
                .withSearchIndex("search_name", (q) => q.search("name", args.search))
                .collect();
        } else {
            users = await ctx.db
                .query("users")
                .collect();
        }

        return users.filter((user) => user.clerkId !== me.clerkId);
    },
});

export const updatePresence = mutation({
    args: { isOnline: v.boolean() },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);

        if (user) {
            await ctx.db.patch(user._id, {
                isOnline: args.isOnline,
                lastSeen: Date.now(),
            });
        }
    },
});
