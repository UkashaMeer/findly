import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";


export const getOrCreateConversations = mutation({
    args: { user2: v.string() },
    handler: async (ctx, args) => {

        const identity = await ctx.auth.getUserIdentity()

        if (!identity) throw new Error("Unauthorized User")

        const user = await ctx.db.query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique()

        if (!user) throw new Error("No user found.")

        const existing = await ctx.db.query("conversations")
            .filter((q) =>
                q.and(
                    q.eq(q.field("participants"), [user._id, args.user2].sort())
                )
            )
            .first()

        if (existing) return existing

        return await ctx.db.insert("conversations", {
            participants: [user._id, args.user2].sort(),
            createdAt: Date.now()
        })
    }
})

export const getUserAllConversations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized User")

    const user = await ctx.db.query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    if (!user) throw new Error("No user found.")

    const conversations = await ctx.db.query("conversations").collect()

    const filteredConverstions = conversations.filter((q) =>
      q.participants.includes(user._id)
    )

    return await Promise.all(
      filteredConverstions.map(async (conversation) => {
        const participants = await Promise.all(
          conversation.participants.map(async (userid) => {
            return await ctx.db.get(userid as Id<"users">)
          })
        )
        return {
          ...conversation,
          participants
        }
      })
    )
  }
})
