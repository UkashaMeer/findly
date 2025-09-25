import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { sinceTime } from "@/lib/sinceTime";
import { useRouter } from "next/navigation";
import CreateConversation from "../chats/CreateConversation";

export default function ProfileHeaderFollowersDialog({ data, openFollowersDialog, setOpenFollowersDialog, title }: any) {

    const router = useRouter()

    const handleProfileLink = (userId: any) => {
        if (userId) {
            router.replace(`/user/profile?userId=${userId}`)
        }
    }


    return (
        <Dialog open={openFollowersDialog} onOpenChange={setOpenFollowersDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <div className='flex flex-col gap-4 mt-4'>
                        {
                            data?.map((user: any) => (
                                <div className='flex items-start justify-between w-full' key={user?._id}>
                                    <div
                                        className='flex items-center gap-2 cursor-pointer flex-1'
                                        onClick={() => handleProfileLink(user?._id)}
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
                                    <CreateConversation className="!flex-none" chatWithUserId={user?._id} />
                                </div>
                            ))
                        }
                    </div>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}
