'use client'
import { PostCards } from "@/components/global/Post/PostCards"
import { useUser } from "@clerk/nextjs"
import { useMutation, useQuery } from "convex/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { api } from "../../../convex/_generated/api"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

function User() {

  const [openNamePopup, setOpenNamePopup] = useState<boolean>(false)
  const [userName, setUserName] = useState<string>("")

  const user = useQuery(api.user.getCurrentUser)
  const updateUser = useMutation(api.user.updateUserName)
  const items = useQuery(api.item.getAll)
  const { isSignedIn } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isSignedIn) {
      router.replace("/sign-in")
    }


    if (isSignedIn && user) {
      if (user.name === "") {
        setOpenNamePopup(true)
      }
    }

  }, [])

  const handleUpdateUserName = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await updateUser({
        name: userName,
      })
      toast.success("Name Added Successfully.")
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <main className="flex flex-col w-1/2 items-center gap-2 p-6">
      {
        user?.name === "" ? (
          <Dialog open={openNamePopup} onOpenChange={setOpenNamePopup}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>We don't have your name</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdateUserName} className="flex flex-col gap-4">
                <Input type="text" placeholder="Enter Your Name" value={userName} onChange={(e) => setUserName(e.target.value)} />
                <Button className="self-end w-auto" type="submit">Continue</Button>
              </form>
            </DialogContent>
          </Dialog>
        ) : (
          <PostCards items={items} />
        )
      }
    </main>
  )
}

export default User