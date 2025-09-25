import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MapPin, Pencil } from 'lucide-react'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import CreateConversation from '../chats/CreateConversation'
import EditProfileDialog from './EditProfileDialog'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { toast } from 'sonner'
import { useUser } from '@clerk/nextjs'
import ProfileHeaderFollowersDialog from './ProfileHeaderFollowersDialog'
import ProfileHeaderContactInfoDialog from './ProfileHeaderContactInfoDialog'
import { ProfileHeaderProps } from '@/lib/types'

export default function ProfileHeader({ user, userId, currentUser }: ProfileHeaderProps) {

    const [openContactInfo, setOpenContactInfo] = useState(false)
    const [openEditProfileDialog, setOpenEditProfileDialog] = useState(false)
    const [openFollowersDialog, setOpenFollowersDialog] = useState(false)
    const [DialogTitle, setDialogTile] = useState("")
    const [followed, setFollowed] = useState(false)
    const [reported, setReported] = useState(false)
    const [data, setData] = useState<Array<object> | undefined>([])

    const { isLoaded, isSignedIn } = useUser()

    const followUser = useMutation(api.user.followUser)
    const followers = useQuery(api.user.getAllFollowers, isLoaded && isSignedIn ? {
        userId
    } : "skip")
    const following = useQuery(api.user.getAllFollowing, isLoaded && isSignedIn ? {
        userId
    } : "skip")

    const handleFollowUser = async () => {
        try {
            await followUser({
                userId
            })
            setFollowed((prev) => !prev)
            toast.success(followed ? "Followed successfully" : "Unfollowed successfully")
        } catch (err) {
            toast.error("Something went wrong")
        }
    }

    const handleDialogData = (userData: any, type: "Followers" | "Following") => {
        setDialogTile(type)
        setData(userData)
        setOpenFollowersDialog(true)
    }

    return (
        <div className='bg-white shadow-xs w-full rounded-md border-border border-1 overflow-hidden relative'>
            <img src="/profile-bg.jpg" className='w-full h-40 object-cover' alt="" />
            <div className='w-full flex justify-between'>
                <div>
                    <Avatar className='w-28 h-28 border-5 border-white mt-[-60px] ml-6'>
                        <AvatarImage src={user?.image} />
                        <AvatarFallback className='text-xl'>{user?.name!.split(' ')
                            .map((word: string) => word[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2) ?? ""}
                        </AvatarFallback>
                    </Avatar>
                    <div className='px-4 pb-4 mt-1 flex flex-col gap-2'>
                        <h3 className='text-xl font-semibold'>{user?.name}</h3>
                        <p className=''>{user?.tagline}</p>
                        <div className='flex items-center gap-1'>
                            <MapPin strokeWidth={1} className='text-primary' size={16} />
                            <span className='text-sm text-foreground/70'>{user?.address}</span>
                            <span className='mt-[-9px]'>.</span>
                            <span className='text-sm text-primary cursor-pointer hover:underline' onClick={() => setOpenContactInfo(true)}>Contact info</span>
                            <ProfileHeaderContactInfoDialog
                                openContactInfo={openContactInfo}
                                setOpenContactInfo={setOpenContactInfo}
                                user={user as any}
                                userId={userId}
                            />
                        </div>
                        <div className='flex items-center gap-2 text-sm text-foreground/70'>
                            <p className='flex items-center gap-1'>
                                <span className='font-medium text-foreground/90'>
                                    {user?.followers ? user.followers.length : 0}
                                </span>
                                <span
                                    className='hover:text-primary cursor-pointer'
                                    onClick={() => handleDialogData(followers, "Followers")}
                                >
                                    Followers
                                </span>
                            </p>
                            <span className='mt-[-9px]'>.</span>
                            <p className='flex items-center gap-1'>
                                <span
                                    className='font-medium text-foreground/90'
                                >
                                    {user?.following ? user.following.length : 0}
                                </span>
                                <span
                                    className='hover:text-primary cursor-pointer'
                                    onClick={() => handleDialogData(following, "Following")}
                                >
                                    Followings
                                </span>
                            </p>
                            <ProfileHeaderFollowersDialog
                                title={DialogTitle}
                                data={data}
                                openFollowersDialog={openFollowersDialog}
                                setOpenFollowersDialog={setOpenFollowersDialog}
                            />
                        </div>
                        {
                            user?._id !== currentUser?._id && (
                                <div className='flex items-center gap-2 mt-2'>
                                    <Button
                                        variant={followed ? "default" : "outline"}
                                        onClick={handleFollowUser}
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
                            <Button className='!p-2' onClick={() => setOpenEditProfileDialog(true)}>
                                <Pencil strokeWidth={2} size={16} />
                            </Button>
                        )
                    }
                </div>
                <EditProfileDialog openEditProfileDialog={openEditProfileDialog} setOpenEditProfileDialog={setOpenEditProfileDialog} currentUser={currentUser} />
            </div>
        </div>
    )
}
