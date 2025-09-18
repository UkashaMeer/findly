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
import { PostCardsSkeleton } from "@/components/global/Post/PostCardsSkeleton"
import { useSelector } from "react-redux"
import { RootState } from "../redux/store"
import { createdAt, filterCategories, filterStatus } from "@/lib/constants"



function User() {

  const search = useSelector((state: RootState) => state.search.value)

  const [openNamePopup, setOpenNamePopup] = useState<boolean>(false)
  const [userName, setUserName] = useState<string>("")
  const [category, setCategory] = useState<string>("All Posts")
  const [status, setStatus] = useState<string>("all")
  const [timeFilter, setTimeFilter] = useState<string>("all")


  const user = useQuery(api.user.getCurrentUser)
  const updateUser = useMutation(api.user.updateUserName)
  const items = useQuery(api.item.getAll, {
    category: category === "All Posts" ? "All Posts" : category,
    status: status === "all" ? "all" : status,
    createdAt: timeFilter === "all" ? undefined : timeFilter,
    search,
  })
  console.log(search)
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
      setOpenNamePopup(false)
    } catch (err) {
      console.log(err)
    }
  }

  const handleCategoryChange = (selectedCategory: string) => {
    setCategory(selectedCategory)
  }

  const handleStatusChange = (selectedStatus: string) => {
    setStatus(prev => (prev === selectedStatus ? "all" : selectedStatus))
  }

  const handleTimeFilterChange = (selectedTime: string) => {
    setTimeFilter(selectedTime)
  }

  return (
    <main className="">
      {
        user?.name === "" ? (
          <Dialog open={openNamePopup} onOpenChange={setOpenNamePopup}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>We don't have your name</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdateUserName} className="flex flex-col gap-4">
                <Input
                  type="text"
                  placeholder="Enter Your Name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
                <Button className="self-end w-auto" type="submit">Continue</Button>
              </form>
            </DialogContent>
          </Dialog>
        ) : (
          <div className="w-full">
            <div className="mb-4 flex items-center justify-between gap-4 bg-white fixed z-10 w-[calc(100%_-_250px)] top-13.5 p-3 border-b shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                {filterCategories.map((cat) => (
                  <Button
                    key={cat.value}
                    onClick={() => handleCategoryChange(cat.value)}
                    variant={category === cat.value ? "default" : "outline"}
                    className="text-sm cursor-pointer"
                    size="sm"
                  >
                    {cat.label}
                  </Button>
                ))}
                {
                  filterStatus.map((sat) => (
                    <Button
                      key={sat.value}
                      onClick={() => handleStatusChange(sat.value)}
                      variant={status === sat.value ? "default" : "outline"}
                      className="text-sm cursor-pointer"
                      size="sm"
                    >
                      {sat.label}
                    </Button>
                  ))
                }
              </div>

              <div className="flex items-center gap-2">
                {createdAt.map((time) => (
                  <Button
                    key={time.value}
                    onClick={() => handleTimeFilterChange(time.value)}
                    variant={timeFilter === time.value ? "default" : "outline"}
                    size="sm"
                    className="text-sm cursor-pointer"
                  >
                    {time.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className={`flex gap-2 p-4 mt-28 w-full`}>
              {items === undefined ? (
                <div className="w-2/4">
                  <PostCardsSkeleton count={3} />
                </div>
              ) : items.length > 0 ? (
                <div className="w-2/4">
                  <PostCards items={items} />
                </div>
              ) : (
                <div className="w-full text-center py-12">
                  <h3 className="text-lg font-medium text-foreground mb-2">No items found</h3>
                  <p className="text-muted-foreground">
                    {category === "All Posts" && timeFilter === "all"
                      ? "No items have been posted yet."
                      : `No items found with current filters.`}
                  </p>
                </div>
              )}
            </div>

          </div>
        )
      }
    </main>
  )
}

export default User