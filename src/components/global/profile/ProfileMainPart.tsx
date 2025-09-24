import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MapPin, Pencil } from 'lucide-react'
import React, { useState } from 'react'
import ProfileContactInfoDialog from './ProfileContactInfoDialog'
import { Button } from '@/components/ui/button'
import CreateConversation from '../chats/CreateConversation'
import EditProfileDialog from './EditProfileDialog'
import { useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { toast } from 'sonner'

export default function ProfileMainPart({ user, userId, currentUser }: { user: any, userId: any, currentUser: any }) {
    
    const followUser = useMutation(api.user.followUser)
    console.log(userId)
    const [openContactInfo, setOpenContactInfo] = useState(false)
    const [openEditProfileDialog, setOpenEditProfileDialog] = useState(false)
    const [followed, setFollowed] = useState(false)
    const [reported, setReported] = useState(false)

    const handleFollowUser = async () => {
        try {
            await followUser({
                userId
            })
            setFollowed((prev) => !prev)
            toast.success("Followed Successfully")
        }catch (err) {
            alert(err)
        } 
    }

    return (
        <div className='bg-white shadow-xs w-full rounded-md border-border border-1 overflow-hidden relative'>
            <img src="/profile-bg.jpg" className='w-full h-40 object-cover' alt="" />
            <div className='w-full flex justify-between'>
                <div>
                    <Avatar className='w-28 h-28 border-5 border-white mt-[-60px] ml-6'>
                        <AvatarImage src={user?.image} />
                        <AvatarFallback className='text-xl'>{user?.name.split(' ')
                            .map((word: string) => word[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
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
                            <ProfileContactInfoDialog
                                openContactInfo={openContactInfo}
                                setOpenContactInfo={setOpenContactInfo}
                                user={user as any}
                                userId={userId}
                            />
                        </div>
                        <div className='flex items-center gap-2 text-sm text-foreground/70'>
                            <p><span className='font-medium text-foreground/90'>{user?.followers}</span> Followers</p>
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
                            <Button className='!p-2' onClick={() =>  setOpenEditProfileDialog(true)}>
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
