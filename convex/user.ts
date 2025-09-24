import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const isStorageId = (str: string): boolean => {
  return !str.startsWith('http') && (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str) ||
    str.length > 10 && !str.includes('.')
  );
};

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const id = await ctx.auth.getUserIdentity()
    if (id === null) {
      return null
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", id.subject))
      .first()

    if (user && user.image && isStorageId(user.image)) {
      try {
        const imageUrl = await ctx.storage.getUrl(user.image as any);
        return {
          ...user,
          image: imageUrl || user.image
        }
      } catch (error) {
        console.error("Failed to get storage URL:", error);
        return user;
      }
    }

    return user
  }
})

export const getUserById = query({
  args: {
    userId: v.id("users")
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) throw new Error("Unauthorized User.")

    const user = await ctx.db.query("users")
      .withIndex("by_id", (q) => q.eq("_id", args.userId))
      .unique()

    if (user && user.image && isStorageId(user.image)) {
      try {
        const imageUrl = await ctx.storage.getUrl(user.image as any);
        return {
          ...user,
          image: imageUrl || user.image
        }
      } catch (error) {
        console.error("Failed to get storage URL:", error);
        return user;
      }
    }

    return user
  }
})

export const getSomeUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized User.")

    const allUsers = await ctx.db.query("users").filter((q) => q.neq(q.field("clerkId"), identity.subject)).collect()

    const usersWithImages = await Promise.all(
      allUsers.map(async (user) => {
        if (user.image && isStorageId(user.image)) {
          try {
            const imageUrl = await ctx.storage.getUrl(user.image as any);
            return {
              ...user,
              image: imageUrl || user.image
            }
          } catch (error) {
            console.error("Failed to get storage URL:", error);
            return user;
          }
        }
        return user
      })
    )

    const shuffled = usersWithImages.sort(() => .5 - Math.random())
    const count = Math.floor((Math.random() * 2) + 3)
    return shuffled.slice(0, count)
  }
})

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  
  return await ctx.storage.generateUploadUrl();
});

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
    return { success: true }
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

export const editUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    dateOfBirth: v.optional(v.number()),
    tagline: v.optional(v.string()),
    address: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    about: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Unauthorized User")

    const user = await ctx.db.query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique()
    if (!user) throw new Error("User not Found")

    return await ctx.db.patch(user._id, {
      name: args.name,
      email: args.email,
      ...(args.image && { image: args.image }),
      dateOfBirth: args.dateOfBirth,
      tagline: args.tagline,
      address: args.address,
      phoneNumber: args.phoneNumber,
      about: args.about,
      updatedAt: Date.now()
    })
  }
})