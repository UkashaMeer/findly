"use client"

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { useRouter, useSearchParams } from 'next/navigation'
import { Id } from '../../../../convex/_generated/dataModel'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { PostCards } from '@/components/global/Post/PostCards'
import { sinceTime } from '@/lib/sinceTime'
import ProfileHeader from '@/components/global/profile/ProfileHeader'

export default function page() {

  const router = useRouter()

  const { isSignedIn, isLoaded } = useUser()
  const searchParams = useSearchParams()
  const rawUserId = searchParams.get("userId")
  const userId = rawUserId?.replace(/\/$/, "") as Id<"users">
  const user = useQuery(api.user.getUserById, isSignedIn && isLoaded && userId ? { userId } : "skip")
  const currentUser = useQuery(api.user.getCurrentUser, isSignedIn && isLoaded && userId ? {} : "skip")
  const suggestUsers = useQuery(api.user.getSomeUser, isSignedIn && isLoaded && userId ? {} : "skip")
  const myPosts = useQuery(api.item.getPostByUserId, isSignedIn && isLoaded && userId ? {
    userId
  } : "skip")

  const handleProfileLink = (userId: any) => {
    if (userId){
      router.replace(`/user/profile?userId=${userId}`)
    }
  }

  if (!user) { 
    return <div>Loading...</div>
  }

  return (
    <div className="w-[calc(100%_-_20px)] mt-16 ml-2 mb-4 flex gap-2 items-start">

      <div className='w-2/3'>
        {/* Top Profile */}
        <ProfileHeader user={user} userId={userId} currentUser={currentUser} />

        {/* About User */}
        <div className='bg-white shadow-xs w-full rounded-md border-border border-1 overflow-hidden relative mt-2 p-4'>
          <div className='w-full flex items-start justify-between'>
            <h3 className='text-lg font-medium'>About</h3>
          </div>
          <p className='pt-2 text-sm text-foreground/70'>
            {user?.about}
          </p>
        </div>
        <div className='mt-2 w-full'>
          <PostCards items={myPosts} />
        </div>
      </div>
      <div className='w-1/3'>
        <div className='bg-white shadow-xs w-full rounded-md border-border border-1 overflow-hidden p-4'>
          <h3 className='text-lg font-medium'>People You May Know</h3>
          <div className='flex flex-col gap-4 mt-4'>
            {
              suggestUsers?.map((user: any) => (
                <div className='flex items-start justify-between w-full' key={user._id}>
                  <div 
                    className='flex items-center gap-2 cursor-pointer'
                    onClick={() => handleProfileLink(user._id)}
                  >
                    <Avatar className='w-10 h-10'>
                      <AvatarImage src={user?.image} />
                      <AvatarFallback className='text-xl'>{user?.name.split(' ')
                        .map((word: Array<number>) => word[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col gap-0'>
                      <h4 className='font-medium'>{user?.name}</h4>
                      <span className='text-sm text-foreground/70'>{sinceTime(user?.createdAt)}</span>
                    </div>
                  </div>
                  <Button variant={"outline"}>Follow</Button>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}
