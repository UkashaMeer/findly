import { Id } from './_generated/dataModel.d';
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";


export const create = mutation({
    args: {
        postId: v.id("items"),
        content: v.string(),
        likes: v.optional(v.array(v.id("users"))),
        parentId: v.optional(v.id("comments")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()

        if (!identity) throw new Error("Unauthorized User.")

        const user = await ctx.db.query("users").
            withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique()

        if (!user) throw new Error("User not found.")

        const items = await ctx.db.get(args.postId)

        if (!items) throw new Error("Item not found.")

        return await ctx.db.insert("comments", {
            postId: args.postId,
            userId: user._id,
            parentId: args.parentId,
            content: args.content,
            likes: args.likes,
            createdAt: Date.now()
        })
    },
})

export const getSomeComments = query({
    args: {
        postId: v.id("items"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) throw new Error("Unauthorized User")

        const currentUser = await ctx.db.query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique()

        const comments = await ctx.db.query("comments")
            .withIndex("by_postId", (q) => q.eq("postId", args.postId))
            .filter(q => q.eq(q.field("parentId"), undefined))
            .order("desc")
            .take(5)


        if (!comments) throw new Error("No Comment Found.")

        const commentsWithUser = Promise.all(
            comments.map(async (comment) => {
                const user = await ctx.db.get(comment.userId)
                return {
                    ...comment,
                    user: user ? {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        image: user.image,
                        role: user.role,
                    } : null,
                    likeCount: comment.likes?.length || 0,
                    likedByUser: currentUser ? comment.likes?.includes(currentUser._id) ?? false : false
                }
            })
        )

        return commentsWithUser
    }
})

export const likeComment = mutation({
    args: {
        commentId: v.id("comments")
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) throw new Error("Unauthorized User.")

        const user = await ctx.db.query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique()
        if (!user) throw new Error("User Not Found.")

        const comment = await ctx.db.get(args.commentId)
        if (!comment) throw new Error("Comment Not Found.")

        const likes = comment.likes ?? []

        let updatedLikes;
        if (likes.includes(user._id)) {
            updatedLikes = likes.filter((id) => id !== user._id)
        } else {
            updatedLikes = [...likes, user._id]
        }

        await ctx.db.patch(args.commentId, {
            likes: updatedLikes
        })

        return {
            likes: updatedLikes,
            likeCount: updatedLikes?.length,
            likedBy: updatedLikes?.includes(user._id)
        }
    }
})

export const replyComment = mutation({
    args: {
        postId: v.id("items"),
        content: v.string(),
        likes: v.optional(v.array(v.id("users"))),
        parentId: v.optional(v.id("comments")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) throw new Error("Unauthorized User.")

        const user = await ctx.db.query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique()
        if (!user) throw new Error("User Not Found.")

        const item = await ctx.db.get(args.postId)
        if (!item) throw new Error("Item Not Found.")

        await ctx.db.insert("comments", {
            postId: args.postId,
            userId: user._id,
            parentId: args.parentId,
            content: args.content,
            likes: args.likes,
            createdAt: Date.now()
        })
    }
})

export const getReplies = query({
    args: {
        parentId: v.id("comments")
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) throw new Error("Unauthorized User")

        const currentUser = await ctx.db.query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique()

        if (!currentUser) throw new Error("Current User Not Found")

        const replies = await ctx.db.query("comments")
        .withIndex("by_parentId", (q) => q.eq("parentId", args.parentId))
        .order("asc")
        .take(5)

        const repliesWithUser = Promise.all(
            replies.map(async (reply) => {
                const user = await ctx.db.get(reply.userId)
                return {
                    ...reply,
                    user: user ? {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        image: user.image,
                        role: user.role,
                    } : null,
                    likeCount: reply.likes?.length || 0,
                    likedByUser: currentUser ? reply.likes?.includes(currentUser._id) ?? false : false
                }
            })
        )

        return repliesWithUser

    }
})