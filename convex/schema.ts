import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("user"), v.literal("admin")),
    image: v.string(),
    clerkId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    dateOfBirth: v.optional(v.number()),
    tagline: v.optional(v.string()),
    address: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    followers: v.optional(v.array(v.id("users"))),
    following: v.optional(v.array(v.id("users"))),
    trustPoints: v.optional(v.array(v.id("users"))),
    reports: v.optional(v.array(v.id("users"))),
    about: v.optional(v.string())
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
    likes: v.optional(v.array(v.id("users"))),
    comments: v.optional(v.array(v.id("users"))),
    userId: v.id("users"),
    createdAt: v.optional(v.float64()),
    updatedAt: v.optional(v.float64()),
  }).index("by_userId", ["userId"])
    .index("by_category", ["category"])
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"]),
    
  comments: defineTable({
      postId: v.id("items"),
      userId: v.id("users"),
      content: v.string(),
      parentId: v.optional(v.id("comments")),
      likes: v.optional(v.array(v.id("users"))),
      createdAt: v.float64(),
      depth: v.optional(v.number())
  }).index("by_userId", ["userId"])
  .index("by_postId", ["postId"])
  .index("by_parentId", ["parentId"]),
  
  conversations: defineTable({
    participants: v.array(v.string()),
    createdAt: v.number()
  }),


  messages: defineTable({
    conversationId: v.id("conversations"),
    sender: v.id("users"),
    text: v.string(),
    createdAt: v.number()
  }),

});

export default schema