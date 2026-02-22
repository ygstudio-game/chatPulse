import { QueryCtx, MutationCtx } from "./_generated/server";

/**
 * Retrieves the currently authenticated user based on the Clerk identity.
 */
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
        .unique();
}

/**
 * Ensures the user is authenticated and returns the user object.
 * Throws an error if authentication fails.
 */
export async function requireUser(ctx: QueryCtx | MutationCtx) {
    const user = await getCurrentUser(ctx);
    if (!user) {
        throw new Error("Unauthorized: User not found or not authenticated");
    }
    return user;
}
