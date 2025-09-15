import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Ellipsis, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import EditPost from "./editPost"
import { useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { toast } from "sonner"

export default function PostCardSelect({title, category, imageUrl, location, description, status, id}: any) {
    const [open, setOpen] = useState(false)
    const deletePost = useMutation(api.item.deletePost)

    const handlePostDelete = async () => {
        try{
            await deletePost({
                itemId: id
            })
            toast.success("Post Deleted Successfully.")
        }catch(err){
            console.log(err)
        }
    } 
    
    return (
        <>
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Ellipsis size={20} className="cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mt-2" align="end">
                <DropdownMenuItem className="cursor-pointer" onClick={() => setOpen(true)}>
                    <Pencil size={20} />
                    Edit
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-primary" onClick={handlePostDelete}>
                    <Trash2 size={20} className="text-primary" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        <EditPost open={open} setOpen={setOpen} postTitle={title} postCategory={category} postImageUrl={imageUrl} postLocation={location} postDescription={description} postStatus={status} postId={id} />
    </>
    )
}
