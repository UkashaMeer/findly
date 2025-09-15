import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.string(),
    image: v.string(),
    clerkId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  items: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("Phone"),
      v.literal("Wallet"),
      v.literal("Card"),
      v.literal("Other")
    ),
    location: v.string(),
    status: v.union(
      v.literal("Lost"),
      v.literal("Found"),
    ),
    imageId: v.id("_storage"),
    userId: v.id("users"),
    createdAt: v.optional(v.float64()),
    updatedAt: v.optional(v.float64()),
  }).index("by_userId", ["userId"])

});

export default schema