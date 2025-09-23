import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const id = await ctx.auth.getUserIdentity()
    if (id === null) {
      return null
    }

    return ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", id.subject))
      .first()
  }
})

export const getUserById = query({
  args: {
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) throw new Error("Unauthorized User.")
    
    return ctx.db.query("users")
    .withIndex("by_id", (q) => q.eq("_id", args.userId))
    .unique()
  }
})

export const getSomeUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized User.")
      
    const allUsers = await ctx.db.query("users").filter((q) => q.neq(q.field("clerkId"), identity.subject)).collect()

    const shuffled = allUsers.sort(() => .5 - Math.random())

    const count = Math.floor((Math.random() * 2) + 3)
    return shuffled.slice(0, count)
  }
})

export const updateUserName = mutation({
  args: {
    name: v.string()
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (identity === null) {
      return null
    }

    const user = await ctx.db.query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first()

    if (!user) throw new Error("Unauthorized User")

    await ctx.db.patch(user?._id, {
      name: args.name,
      updatedAt: Date.now(),
    })
    return {success: true}
  },
})

export const saveUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    image: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existingUser = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("email"), args.email))
      .first();

    if (!existingUser) {
      await ctx.db.insert("users", {
        name: args.name,
        email: args.email,
        role: "user",
        image: args.image,
        clerkId: identity.subject,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

