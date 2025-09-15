import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { Textarea } from "../../ui/textarea"
import { useEffect, useState } from "react"
import LocationPicker from "../Map"
import { useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { toast } from "sonner"

export default function EditPost({ open, setOpen, postTitle, postCategory, postImageUrl, postLocation, postDescription, postStatus, postId }: any) {

    const editItem = useMutation(api.item.update)
    const generateUrl = useMutation(api.item.generateUrl)

    const [title, setTitle] = useState(postTitle)
    const [description, setDescription] = useState(postDescription)
    const [category, setCategory] = useState<"Phone" | "Wallet" | "Card" | "Other" | null>(postCategory)
    const [location, setLocation] = useState<any>(postLocation)
    const [status, setStatus] = useState<"Lost" | "Found" | null>(postStatus)
    const [file, setFile] = useState<File | null>(postImageUrl)

    const handleLocationSelect = (location: any) => {
        setLocation(location)
    }

    useEffect(() => {
        if (open) {
            setTitle(postTitle)
            setDescription(postDescription)
            setCategory(postCategory)
            setLocation(postLocation)
            setStatus(postStatus)
            setFile(postImageUrl)
        }
    }, [open, postTitle, postDescription, postCategory, postLocation, postStatus])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const url = await generateUrl()

        const result = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": file?.type as string },
            body: file,
        });

        const { storageId } = await result.json()
        console.log(storageId)

        try {
            await editItem({
                itemId: postId,
                title,
                description,
                category: category as "Phone" | "Wallet" | "Card" | "Other",
                location: location?.address ?? "",
                status: status as "Lost" | "Found",
                ...(file ? { imageId: storageId } : {}),
            })

            setOpen(false)
            toast.success("Post Updated Successfully.")

        }
        catch (err) {
            console.log(err)
        }
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Edit Item</SheetTitle>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="grid flex-1 auto-rows-min gap-6 px-4 overflow-y-auto pt-2 pb-6">
                    <div className="grid gap-3">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" placeholder="Enter Item Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="title">Category</Label>
                        <Select
                            value={category ?? ""}
                            onValueChange={(value) => setCategory(value as "Phone" | "Wallet" | "Card" | "Other")}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Item Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Phone">Phone</SelectItem>
                                <SelectItem value="Wallet">Wallet</SelectItem>
                                <SelectItem value="Card">Card</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    <div className="grid gap-3">
                        <Label htmlFor="title">Location</Label>
                        <LocationPicker onLocationSelect={handleLocationSelect} />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="title">Description</Label>
                        <Textarea id="title" placeholder="Enter Item Details" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="title">Status</Label>
                        <Select
                            value={status ?? ""}
                            onValueChange={(value) => setStatus(value as "Lost" | "Found")}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Item Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Lost">Lost</SelectItem>
                                <SelectItem value="Found">Found</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit">Save changes</Button>
                </form>
            </SheetContent>
        </Sheet>
    )
}