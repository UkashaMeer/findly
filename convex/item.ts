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
    imageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized User");
    }

    let user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

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

    const newItemId = await ctx.db.insert("items", {
      title: args.title,
      imageId: args.imageId,
      description: args.description,
      category: args.category,
      location: args.location,
      status: args.status,
      userId: user!._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return newItemId;
  },
});

export const generateUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const getAll = query({
  args: {
    category: v.optional(v.string()),
    status: v.optional(v.string()),
    createdAt: v.optional(v.string()),
    search: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized User");

    let items = await ctx.db.query("items").order("desc").collect();

    if (args.search && args.search.trim().length > 0) {
      const search = args.search.toLowerCase();
      items = items.filter((i) => {
        const title = i.title?.toLowerCase() || "";
        const description = i.description?.toLowerCase() || "";
        const location = i.location?.toLowerCase() || ""
        return title.includes(search) || description.includes(search) || location.includes(search);
      });
    }

    if (args.category && args.category !== "All Posts") {
      items = items.filter((i) => i.category === args.category);
    }

    if (args.status && args.status !== "all") {
      items = items.filter((i) => i.status === args.status);
    }

    if (args.createdAt && args.createdAt !== "all") {
      const now = Date.now();
      let fromTime = 0;

      switch (args.createdAt) {
        case "24h":
          fromTime = now - 24 * 60 * 60 * 1000;
          break;
        case "week":
          fromTime = now - 7 * 24 * 60 * 60 * 1000;
          break;
        case "30days":
          fromTime = now - 30 * 24 * 60 * 60 * 1000;
          break;
      }

      items = items.filter((i) => i._creationTime >= fromTime);
    }

    const itemsWithUsers = await Promise.all(
      items.map(async (item) => {
        const user = await ctx.db.get(item.userId);
        return {
          ...item,
          createdAt: item._creationTime,
          imageUrl: item.imageId
            ? await ctx.storage.getUrl(item.imageId)
            : null,
          user: user
            ? {
                id: user._id,
                name: user.name,
                email: user.email,
                image: user.image,
                role: user.role,
              }
            : null,
          isOwner: user?.clerkId === identity.subject,
        };
      })
    );

    return itemsWithUsers;
  },
});


export const getMine = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized User");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not Found")

    const items = await ctx.db.query("items")
      .withIndex("by_userId", (q) => q.eq("userId", user?._id))
      .order("desc")
      .collect()

    const itemsWithUsers = await Promise.all(
      items.map(async (item) => {
        return {
          ...item,
          createdAt: item._creationTime,
          imageUrl: item.imageId ? await ctx.storage.getUrl(item.imageId) : null,
          user: user ? {
            id: user._id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
          } : null,
          isOwner: true
        }
      })
    )

    return itemsWithUsers;

  }
})

export const update = mutation({
  args: {
    itemId: v.id("items"),
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
    imageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized User");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Item not found");

    if (item.userId !== user._id) {
      throw new Error("You are not allowed to update this post");
    }

    await ctx.db.patch(args.itemId, {
      title: args.title,
      description: args.description,
      category: args.category,
      location: args.location,
      status: args.status,
      ...(args.imageId ? { imageId: args.imageId } : {}),
      updatedAt: Date.now(),
    });

    return { success: true };
  }
});


export const deletePost = mutation({
  args: {
    itemId: v.id("items")
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) throw new Error("Unauthorized User.")

    const user = await ctx.db.query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()

    const item = await ctx.db.get(args.itemId)

    if (!item) throw new Error("Item Not Found")
    if (!user) throw new Error("User not Found")
    if (user._id !== item.userId) {
      throw new Error("You can't delete this post.")
    }

    await ctx.db.delete(args.itemId)
    if (item.imageId) {
      await ctx.storage.delete(item.imageId);
    }


    return { success: true }

  }
})