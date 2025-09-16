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