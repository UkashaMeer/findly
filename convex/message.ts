import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const sendMessage = mutation({
    args: {
        conversationId: v.id("conversations"),
        sender: v.id("users"),
        text: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            sender: args.sender,
            text: args.text,
            createdAt: Date.now()
        })
    }
})

export const getMessages = query({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.query("messages")
        .filter((q) => q.eq(q.field("conversationId"), args.conversationId))
        .order("asc")
        .take(50)
    },
})