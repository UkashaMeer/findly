import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("Phone"),
      v.literal("Wallet"),
      v.literal("Card"),
      v.literal("Other")
    ),
    location: v.string(),
    status: v.union(v.literal("Lost"), v.literal("Found")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized User");
    }

    // Clerk ka user find karo
    let user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    // Agar user DB me nahi mila, to create kar do
    if (!user) {
      const userId = await ctx.db.insert("users", {
        name: identity.name ?? "Anonymous",
        email: identity.email ?? "",
        role: "user",
        image: identity.pictureUrl ?? "",
        clerkId: identity.subject,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      user = await ctx.db.get(userId);
    }

    // Ab user guaranteed hai
    const newItemId = await ctx.db.insert("items", {
      title: args.title,
      description: args.description,
      category: args.category,
      location: args.location,
      status: args.status,
      userId: user!._id,
    });

    return newItemId;
  },
});
