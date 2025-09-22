import { Id } from "../../convex/_generated/dataModel";

export type SignInFlow = "signIn" | "signUp"

export interface User {
  _id: Id<"users">
  _creationTime: number
  clerkId: string
  createdAt: number
  updatedAt: number
  name: string
  email: string
  image: string
  role: "user" | "admin" | (string & {})
}

export interface Item {
  _id: Id<"items">
  _creationTime: number
  imageUrl: string
  title: string
  description: string
  category: "Phone" | "Wallet" | "Card" | "Other" | null
  location: string
  status: "Lost" | "Found" | null
  imageId: Id<"_storage">
  userId: Id<"users">
  createdAt: number
  updatedAt: number
  isOwner: boolean
  likeCount: number
  likedByUser: boolean
  likes: []
  user: {
    id: Id<"users">
    name: string
    email: string
    image: string
    role: "user" | "admin"
  }
}

export interface Comment {
  _id: Id<"comments">
  _creationTime: number
  content: string
  userId: Id<"users">
  createdAt: number
  parentId: string | null
  likes: []
  likeCount: number
  likedByUser: boolean
  user: {
    id: Id<"users">
    name: string
    email: string
    image: string
    role: "user" | "admin"
  }
}