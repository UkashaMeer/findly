import { Id } from './_generated/dataModel.d';
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";


export const create = mutation({
    args: {
        postId: v.id("items"),
        content: v.string(),
        likes: v.optional(v.array(v.id("users"))),
        parentId: v.optional(v.id("comments")),
        depth: v.optional(v.number())
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

        let depth = 0
        if (args.parentId) {
            const parentComment = await ctx.db.get(args.parentId)
            depth = (parentComment?.depth || 0) + 1
        }

        return await ctx.db.insert("comments", {
            postId: args.postId,
            userId: user._id,
            parentId: args.parentId,
            content: args.content,
            likes: args.likes,
            depth: depth,
            createdAt: Date.now()
        })
    },
})

export const getCommentsByParent = query({
    args: {
        parentId: v.optional(v.id("comments")),
        postId: v.id("items"),
        topLevel: v.optional(v.boolean())
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) throw new Error("Unauthorized User.")

        const currentUser = await ctx.db.query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique()

        let comments;
        if (args.topLevel) {
            comments = await ctx.db.query("comments")
                .withIndex("by_postId", (q) => q.eq("postId", args.postId!))
                .filter(q => q.eq(q.field("parentId"), undefined))
                .order("desc")
                .collect()
        } else {
            comments = await ctx.db.query("comments")
                .withIndex("by_parentId", (q) => q.eq("parentId", args.parentId!))
                .order("asc")
                .collect()
        }

        const commentsWithData = await Promise.all(
            comments.map(async (comment) => {
                const user = await ctx.db.get(comment.userId)
                const replyCount = await ctx.db.query("comments")
                    .withIndex("by_parentId", (q) => q.eq("parentId", comment._id))
                    .collect()

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
                    likedByUser: currentUser ? comment.likes?.includes(currentUser._id) ?? false : false,
                    replyCount: replyCount.length,
                    currentUser: currentUser,
                    depth: comment.depth ?? 0,
                    
                };
            })
        )

        return commentsWithData

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