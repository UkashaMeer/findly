import { Id } from "../../convex/_generated/dataModel";

export type SignInFlow = "signIn" | "signUp"

export interface User {
  _id?: Id<"users">
  _creationTime?: number
  clerkId?: string
  createdAt?: number
  updatedAt?: number
  name?: string
  email?: string
  image?: string
  dateOfBirth?: number
  tagline?: string
  address?: string
  phoneNumber?: string
  about?: string
  followers?: Id<"users">[] 
  following?: Id<"users">[]   
  trustPoints?: Id<"users">[] 
  reports?: Id<"users">[]
  role?: "user" | "admin"
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
  numberOfComments: number
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
  content: string
  createdAt: number
  currentUser: {
    _id: Id<"users">
    _creationTime: number
    name: string
    email: string
    role: "user" | "admin"
    image: string
    clerkId: string
    createdAt: number
    updatedAt: number
  } | null
  depth?: number
  likeCount: number
  likedByUser: boolean
  likes?: Id<"users">[]
  postId: Id<"items">
  replyCount: number
  _id: Id<"comments">
  _creationTime: number
  userId: Id<"users">
  parentId?: Id<"comments">
  user: {
    id: Id<"users">
    name: string
    email: string
    image: string
    role: "user" | "admin"
  } | null
}

export type ProfileHeaderProps = {
  user: User | null | undefined
  userId: Id<"users">
  currentUser: User | null | undefined
}
