import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Badge } from "../ui/badge"
import { SignOutButton } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export default function UserButton() {
    const currentUser = useQuery(api.user.getCurrentUser)
    const router = useRouter()

    const handleProfileClick = () => {
        if(currentUser?._id){
            router.replace(`/user/profile?userId=${currentUser._id}`)
        }
    }

    return (
        <div className="z-50 relative">
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <Avatar className="cursor-pointer">
                        <AvatarImage src={currentUser?.image} />
                        <AvatarFallback className="text-sm">
                            {
                                currentUser?.name.split(' ')
                                    .map(word => word[0])
                                    .join('')
                                    .toUpperCase()
                                    .slice(0, 2)
                            }
                        </AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                        className="cursor-pointer flex items-center"
                        onClick={handleProfileClick}
                    >
                        <Avatar className="cursor-pointer">
                        <AvatarImage src={currentUser?.image} />
                        <AvatarFallback className="text-sm">
                            {
                                currentUser?.name.split(' ')
                                    .map(word => word[0])
                                    .join('')
                                    .toUpperCase()
                                    .slice(0, 2)
                            }
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-0 items-start">
                        <h3>{currentUser?.name}</h3>
                        <Badge className="!py-[1px] !px-1.5">View Profile</Badge>
                    </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer">Setting</DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                        <SignOutButton redirectUrl="/sign-in">
                            Sign Out
                        </SignOutButton>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
