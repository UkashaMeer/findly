"use client"

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { useRouter, useSearchParams } from 'next/navigation'
import { Id } from '../../../../convex/_generated/dataModel'
import { useUser } from '@clerk/nextjs'
import { MapPin, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import CreateConversation from '@/components/global/chats/CreateConversation'
import { PostCards } from '@/components/global/Post/PostCards'
import { useState } from 'react'
import ProfileContactInfoDialog from '@/components/global/profile/ProfileContactInfoDialog'
import { sinceTime } from '@/lib/sinceTime'

export default function page() {

  const router = useRouter()

  const { isSignedIn, isLoaded } = useUser()
  const searchParams = useSearchParams()
  const rawUserId = searchParams.get("userId")
  const userId = rawUserId?.replace(/\/$/, "") as Id<"users">
  const user = useQuery(api.user.getUserById, isSignedIn && isLoaded && userId ? { userId } : "skip")
  const currentUser = useQuery(api.user.getCurrentUser, isSignedIn && isLoaded && userId ? {} : "skip")
  const suggestUsers = useQuery(api.user.getSomeUser, isSignedIn && isLoaded && userId ? {} : "skip")
  const myPosts = useQuery(api.item.getPostByUserId, {
    userId
  })
  console.log(suggestUsers)

  const [followed, setFollowed] = useState(false)
  const [reported, setReported] = useState(false)
  const [openContactInfo, setOpenContactInfo] = useState(false)

  const handleProfileLink = (userId: any) => {
    if (userId){
      router.replace(`/user/profile?userId=${userId}`)
    }
  }

  return (
    <div className="w-[calc(100%_-_20px)] mt-16 ml-2 mb-4 flex gap-2 items-start">

      <div className='w-2/3'>
        {/* Top Profile */}
        <div className='bg-white shadow-xs w-full rounded-md border-border border-1 overflow-hidden relative'>
          <img src="/profile-bg.jpg" className='w-full h-40 object-cover' alt="" />
          <div className='w-full flex justify-between'>
            <div>
              <Avatar className='w-28 h-28 border-5 border-white mt-[-60px] ml-6'>
                <AvatarImage src={user?.image} />
                <AvatarFallback className='text-xl'>{user?.name.split(' ')
                  .map(word => word[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className='px-4 pb-4 mt-1 flex flex-col gap-2'>
                <h3 className='text-xl font-semibold'>{user?.name}</h3>
                <p className=''>I often find lost items near Central Park. Happy to help!</p>
                <div className='flex items-center gap-1'>
                  <MapPin strokeWidth={1} className='text-primary' size={16} />
                  <span className='text-sm text-foreground/70'>Karāchi, Sindh, Pakistan</span>
                  <span className='mt-[-9px]'>.</span>
                  <span className='text-sm text-primary cursor-pointer hover:underline' onClick={() => setOpenContactInfo(true)}>Contact info</span>
                  <ProfileContactInfoDialog
                    openContactInfo={openContactInfo}
                    setOpenContactInfo={setOpenContactInfo}
                    user={user as any}
                    userId={userId}
                  />
                </div>
                <div className='flex items-center gap-2 text-sm text-foreground/70'>
                  <p><span className='font-medium text-foreground/90'>12700+</span> Followers</p>
                  <span className='mt-[-9px]'>.</span>
                  <p><span className='font-medium text-foreground/90'>40+</span> Following</p>
                  <span className='mt-[-9px]'>.</span>
                  <p><span className='font-medium text-foreground/90'>9000</span> Trust Points</p>
                </div>
                {
                  user?._id !== currentUser?._id && (
                    <div className='flex items-center gap-2 mt-2'>
                      <Button
                        variant={followed ? "default" : "outline"}
                        onClick={() => setFollowed(prev => !prev)}
                        className='flex-1'
                      >
                        {followed ? "Followed" : "Follow"}
                      </Button>
                      <CreateConversation chatWithUserId={user?._id} />
                      <Button
                        variant={reported ? "default" : "outline"}
                        className={`${reported ? "!bg-[#DF4957] !border-[#DF4957]" : ""} flex-1`}
                        onClick={() => setReported(prev => !prev)}
                      >
                        {reported ? "Reported" : "Report"}
                      </Button>
                    </div>
                  )
                }

              </div>
            </div>
            <div className='!py-4 px-4'>
              {
                user?._id === currentUser?._id && (
                  <Button className='!p-2'>
                    <Pencil strokeWidth={2} size={16} />
                  </Button>
                )
              }
            </div>
          </div>
        </div>

        {/* About User */}
        <div className='bg-white shadow-xs w-full rounded-md border-border border-1 overflow-hidden relative mt-2 p-4'>
          <div className='w-full flex items-start justify-between'>
            <h3 className='text-lg font-medium'>About</h3>
            {
              user?._id === currentUser?._id && (
                <Button className='!p-2'>
                  <Pencil strokeWidth={2} size={16} />
                </Button>
              )
            }
          </div>
          <p className='pt-2 text-sm text-foreground/70'>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusantium est, voluptate perferendis temporibus quis inventore provident quos numquam libero ipsa!
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
